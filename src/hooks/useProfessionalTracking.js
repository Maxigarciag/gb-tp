/**
 * Hook profesional para tracking de entrenamientos
 * Maneja estados en tiempo real, validaciones y sincronización
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { exerciseLogs, workoutSessions } from '../lib/supabase'
import { useUIStore } from '../stores/uiStore'

// Estados de tracking profesional
export const TRACKING_STATES = {
	IDLE: 'idle',                    // Sin sesión activa
	LOADING: 'loading',              // Cargando datos
	ACTIVE: 'active',                // Sesión activa
	PAUSED: 'paused',                // Sesión pausada
	COMPLETED: 'completed',          // Sesión completada
	ERROR: 'error'                   // Error en el sistema
}

// Estados de ejercicios
export const EXERCISE_STATES = {
	PENDING: 'pending',              // No iniciado
	IN_PROGRESS: 'in_progress',      // En progreso
	COMPLETED: 'completed',          // Completado
	SKIPPED: 'skipped'               // Saltado
}

export const useProfessionalTracking = (sessionId, exercises = []) => {
	const { showSuccess, showError } = useUIStore()
	
	// Estados principales
	const [trackingState, setTrackingState] = useState(TRACKING_STATES.IDLE)
	const [exerciseStates, setExerciseStates] = useState({})
	const [sessionLogs, setSessionLogs] = useState([])
	const [sessionStats, setSessionStats] = useState({
		totalExercises: 0,
		completedExercises: 0,
		totalSeries: 0,
		completedSeries: 0
	})
	
	// Estados de UI
	const [isLoading, setIsLoading] = useState(false)
	const [lastUpdate, setLastUpdate] = useState(null)
	const [errors, setErrors] = useState({})

	// Inicializar estados de ejercicios
	useEffect(() => {
		if (exercises.length > 0) {
			const initialStates = exercises.reduce((acc, exercise) => {
				acc[exercise.id] = {
					state: EXERCISE_STATES.PENDING,
					completedSeries: 0,
					totalSeries: exercise.series || 3,
					lastUpdate: null
				}
				return acc
			}, {})
			setExerciseStates(initialStates)
		}
	}, [exercises])

	// Cargar logs de la sesión
	const loadSessionLogs = useCallback(async () => {
		if (!sessionId) return
		
		setIsLoading(true)
		try {
			const { data, error } = await exerciseLogs.getBySession(sessionId)
			if (error) throw error
			
			setSessionLogs(data || [])
			updateExerciseStates(data || [])
			setLastUpdate(new Date())
		} catch (err) {
			setErrors(prev => ({ ...prev, loadLogs: err.message }))
			// Error silencioso para evitar spam de notificaciones
		} finally {
			setIsLoading(false)
		}
	}, [sessionId])

	// Actualizar estados de ejercicios basado en logs
	const updateExerciseStates = useCallback((logs) => {
		const logsByExercise = logs.reduce((acc, log) => {
			if (!acc[log.exercise_id]) {
				acc[log.exercise_id] = []
			}
			acc[log.exercise_id].push(log)
			return acc
		}, {})

		const newExerciseStates = exercises.reduce((acc, exercise) => {
			const exerciseLogs = logsByExercise[exercise.id] || []
			const completedSeries = exerciseLogs.length
			const totalSeries = exercise.series || 3
			
			let state = EXERCISE_STATES.PENDING
			if (completedSeries > 0 && completedSeries < totalSeries) {
				state = EXERCISE_STATES.IN_PROGRESS
			} else if (completedSeries >= totalSeries) {
				state = EXERCISE_STATES.COMPLETED
			}

			acc[exercise.id] = {
				state,
				completedSeries,
				totalSeries,
				lastUpdate: exerciseLogs.length > 0 ? exerciseLogs[exerciseLogs.length - 1].created_at : null
			}
			return acc
		}, {})

		setExerciseStates(newExerciseStates)
		updateSessionStats(newExerciseStates)
	}, [exercises])

	// Actualizar estadísticas de la sesión
	const updateSessionStats = useCallback((exerciseStates) => {
		const stats = Object.values(exerciseStates).reduce((acc, exercise) => {
			acc.totalExercises++
			if (exercise.state === EXERCISE_STATES.COMPLETED) {
				acc.completedExercises++
			}
			acc.totalSeries += exercise.totalSeries
			acc.completedSeries += exercise.completedSeries
			return acc
		}, {
			totalExercises: 0,
			completedExercises: 0,
			totalSeries: 0,
			completedSeries: 0
		})

		setSessionStats(stats)
	}, [])

	// Cargar logs iniciales
	useEffect(() => {
		if (sessionId && exercises.length > 0) {
			setTrackingState(TRACKING_STATES.LOADING)
			loadSessionLogs().then(() => {
				setTrackingState(TRACKING_STATES.ACTIVE)
			})
		}
	}, [sessionId, exercises.length, loadSessionLogs])

	// Refrescar datos cuando se agregan nuevos logs
	const refreshSessionData = useCallback(async () => {
		if (sessionId) {
			await loadSessionLogs()
		}
	}, [sessionId, loadSessionLogs])

	// Obtener progreso de un ejercicio específico
	const getExerciseProgress = useCallback((exerciseId) => {
		return exerciseStates[exerciseId] || {
			state: EXERCISE_STATES.PENDING,
			completedSeries: 0,
			totalSeries: 0,
			lastUpdate: null
		}
	}, [exerciseStates])

	// Verificar si la sesión puede finalizarse
	const canFinishSession = useMemo(() => {
		const hasCompletedExercises = sessionStats.completedExercises > 0
		const hasMinimumProgress = sessionStats.completedSeries >= Math.ceil(sessionStats.totalSeries * 0.3) // 30% mínimo
		return hasCompletedExercises && hasMinimumProgress
	}, [sessionStats])

	// Obtener progreso general de la sesión
	const sessionProgress = useMemo(() => {
		if (sessionStats.totalExercises === 0) return 0
		return Math.round((sessionStats.completedExercises / sessionStats.totalExercises) * 100)
	}, [sessionStats])

	// Obtener próximo ejercicio recomendado
	const getNextRecommendedExercise = useCallback(() => {
		const pendingExercises = exercises.filter(ex => 
			exerciseStates[ex.id]?.state === EXERCISE_STATES.PENDING
		)
		const inProgressExercises = exercises.filter(ex => 
			exerciseStates[ex.id]?.state === EXERCISE_STATES.IN_PROGRESS
		)
		
		// Priorizar ejercicios en progreso
		if (inProgressExercises.length > 0) {
			return inProgressExercises[0]
		}
		
		// Luego ejercicios pendientes
		if (pendingExercises.length > 0) {
			return pendingExercises[0]
		}
		
		return null
	}, [exercises, exerciseStates])

	// Validar completitud de la sesión
	const validateSessionCompletion = useCallback(() => {
		const allExercisesCompleted = exercises.every(ex => 
			exerciseStates[ex.id]?.state === EXERCISE_STATES.COMPLETED
		)
		
		return {
			isComplete: allExercisesCompleted,
			canFinish: canFinishSession,
			recommendations: allExercisesCompleted ? [] : [
				'Completa todos los ejercicios programados',
				'Asegúrate de registrar al menos una serie por ejercicio'
			]
		}
	}, [exercises, exerciseStates, canFinishSession])

	// Finalizar sesión profesionalmente
	const finishSession = useCallback(async (notes = '', rating = null) => {
		if (!sessionId) {
			showError('No hay sesión activa para finalizar')
			return false
		}

		setIsLoading(true)
		try {
			const { error } = await workoutSessions.finish(sessionId, notes, rating)
			if (error) throw error
			
			setTrackingState(TRACKING_STATES.COMPLETED)
			showSuccess('¡Sesión finalizada exitosamente!')
			return true
		} catch (err) {
			setErrors(prev => ({ ...prev, finishSession: err.message }))
			showError('Error al finalizar la sesión')
			return false
		} finally {
			setIsLoading(false)
		}
	}, [sessionId, showSuccess, showError])

	return {
		// Estados principales
		trackingState,
		exerciseStates,
		sessionLogs,
		sessionStats,
		isLoading,
		lastUpdate,
		errors,
		
		// Métodos de control
		refreshSessionData,
		finishSession,
		
		// Métodos de consulta
		getExerciseProgress,
		getNextRecommendedExercise,
		validateSessionCompletion,
		
		// Estados computados
		canFinishSession,
		sessionProgress,
		
		// Constantes
		TRACKING_STATES,
		EXERCISE_STATES
	}
}
