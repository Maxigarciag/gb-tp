/**
 * Hook personalizado para calcular el progreso semanal del usuario
 * Basado en las sesiones de entrenamiento completadas vs programadas
 */

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRoutineStore } from '../stores/routineStore'
import { workoutSessions } from '../lib/supabase'

export const useWeeklyProgress = () => {
	const { userProfile } = useAuth()
	const { userRoutine } = useRoutineStore()
	const [sessions, setSessions] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

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
	useEffect(() => {
		const loadWeeklySessions = async () => {
			if (!userProfile?.id || !userRoutine) {
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				setError(null)

				const { startOfWeek, endOfWeek } = getWeekDates()
				
				// Obtener todas las sesiones del usuario
				const { data: allSessions, error: sessionsError } = await workoutSessions.getUserSessions(50)
				
				if (sessionsError) {
					throw new Error('Error al cargar sesiones de entrenamiento')
				}

				// Filtrar sesiones de la semana actual que estén completadas
				const weeklySessions = (allSessions || [])
					.filter(session => {
						const sessionDate = new Date(session.fecha)
						return sessionDate >= startOfWeek && 
							   sessionDate <= endOfWeek && 
							   session.completada === true &&
							   session.routine_id === userRoutine.id
					})

				setSessions(weeklySessions)
			} catch (err) {
				setError(err.message)
				setSessions([])
			} finally {
				setLoading(false)
			}
		}

		loadWeeklySessions()
	}, [userProfile?.id, userRoutine])

	// Calcular progreso semanal
	const progressData = useMemo(() => {
		if (!getScheduledTrainingDays.length) {
			return {
				completed: 0,
				scheduled: 0,
				percentage: 0,
				message: 'Sin rutina programada'
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

		return {
			completed: completedDays,
			scheduled: scheduledDays,
			percentage,
			message,
			completedSessions: sessions,
			scheduledDays: getScheduledTrainingDays
		}
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
