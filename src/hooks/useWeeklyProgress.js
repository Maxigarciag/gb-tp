/**
 * Hook personalizado para calcular el progreso semanal del usuario
 * Basado en las sesiones de entrenamiento completadas vs programadas
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRoutineStore } from '../stores/routineStore'
import { workoutSessions } from '../lib/supabase'

export const useWeeklyProgress = () => {
	const { userProfile } = useAuth()
	const { userRoutine } = useRoutineStore()
	const [sessions, setSessions] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Helper para parsear fechas YYYY-MM-DD como local (evita desfase UTC)
	const parseLocalDate = (isoDate) => {
		if (!isoDate) return null
		const [y, m, d] = isoDate.split('-').map(Number)
		return new Date(y, (m || 1) - 1, d || 1)
	}

	// Obtener fechas de inicio y fin de la semana actual
	const getWeekDates = () => {
		const now = new Date()
		const dayOfWeek = now.getDay()
		const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Lunes como inicio de semana
		
		const startOfWeek = new Date(now)
		startOfWeek.setDate(now.getDate() + diff)
		startOfWeek.setHours(0, 0, 0, 0)
		
		const endOfWeek = new Date(startOfWeek)
		endOfWeek.setDate(startOfWeek.getDate() + 6)
		endOfWeek.setHours(23, 59, 59, 999)
		
		return { startOfWeek, endOfWeek }
	}

	// Obtener días de entrenamiento programados para esta semana
	const getScheduledTrainingDays = useMemo(() => {
		if (!userRoutine?.routine_days) return []
		
		const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
		const { startOfWeek } = getWeekDates()
		
		return userRoutine.routine_days
			.filter(day => !day.es_descanso && day.routine_exercises?.length > 0)
			.map(day => {
				const dayIndex = diasSemana.indexOf(day.dia_semana)
				const dayDate = new Date(startOfWeek)
				dayDate.setDate(startOfWeek.getDate() + dayIndex)
				
				return {
					dayName: day.dia_semana,
					date: dayDate.toISOString().split('T')[0],
					routineDayId: day.id
				}
			})
	}, [userRoutine])

	// Cargar sesiones de entrenamiento de la semana actual
	const loadWeeklySessions = useCallback(async () => {
		if (!userProfile?.id || !userRoutine) {
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			setError(null)

			const { startOfWeek, endOfWeek } = getWeekDates()
			
			// Obtener sesiones de los últimos 30 días para cálculo de racha
			const { data: allSessions, error: sessionsError } = await workoutSessions.getUserSessions(100)
			
			if (sessionsError) {
				throw new Error('Error al cargar sesiones de entrenamiento')
			}

			// Filtrar sesiones completadas de los últimos 30 días
			const thirtyDaysAgo = new Date()
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
			
			const recentSessions = (allSessions || [])
					.filter(session => {
						const sessionDate = parseLocalDate(session.fecha)
						return sessionDate && sessionDate >= thirtyDaysAgo && 
							   session.completada === true
					})
			
			// Sesiones de la semana actual (para el progreso semanal)
			const weeklySessions = recentSessions.filter(session => {
				const sessionDate = parseLocalDate(session.fecha)
				return sessionDate && sessionDate >= startOfWeek && 
					   sessionDate <= endOfWeek &&
					   session.routine_id === userRoutine.id
			})

			// Deduplicar por fecha para no contar múltiples sesiones del mismo día
			const uniqueByDate = {}
			weeklySessions.forEach(s => {
				if (!s?.fecha) return
				uniqueByDate[s.fecha] = s
			})
			setSessions(Object.values(uniqueByDate))
		} catch (err) {
			setError(err.message)
			setSessions([])
		} finally {
			setLoading(false)
		}
	}, [userProfile?.id, userRoutine])

	useEffect(() => {
		loadWeeklySessions()
	}, [loadWeeklySessions])

	// Escuchar refresh externo (ej. al completar sesión)
	useEffect(() => {
		const handler = (event) => {
			const targetUser = event?.detail?.userId
			if (!userProfile?.id || (targetUser && targetUser !== userProfile.id)) return
			loadWeeklySessions()
		}
		window.addEventListener('progreso-page-refresh', handler)
		return () => window.removeEventListener('progreso-page-refresh', handler)
	}, [loadWeeklySessions, userProfile?.id])

	// Calcular progreso semanal
	const progressData = useMemo(() => {
		if (!getScheduledTrainingDays.length) {
			return {
				completed: 0,
				scheduled: 0,
				percentage: 0,
				message: 'Sin rutina programada',
				completedSessions: [],
				scheduledDays: []
			}
		}

		const completedDays = sessions.length
		const scheduledDays = getScheduledTrainingDays.length
		const percentage = Math.round((completedDays / scheduledDays) * 100)

		let message = ''
		if (percentage === 0) {
			message = '¡Comienza tu semana de entrenamiento!'
		} else if (percentage < 50) {
			message = `${percentage}% de tu semana completada`
		} else if (percentage < 100) {
			message = `${percentage}% de tu semana completada`
		} else {
			message = '¡Semana completada! ¡Excelente trabajo!'
		}

		const result = {
			completed: completedDays,
			scheduled: scheduledDays,
			percentage,
			message,
			completedSessions: sessions,
			scheduledDays: getScheduledTrainingDays
		}

		return result
	}, [sessions, getScheduledTrainingDays])

	return {
		...progressData,
		loading,
		error,
		refetch: () => {
			// Función para recargar datos si es necesario
			if (userProfile?.id && userRoutine) {
				setLoading(true)
				// El useEffect se ejecutará automáticamente
			}
		}
	}
}
