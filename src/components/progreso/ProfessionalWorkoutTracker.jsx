/**
 * Componente principal de tracking profesional de entrenamientos
 * Integra todos los componentes profesionales en una experiencia guiada
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDumbbell, FaFire, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { useRoutineStore } from '../../stores/routineStore'
import { useProfessionalTracking } from '../../hooks/useProfessionalTracking'
import { useUIStore } from '../../stores/uiStore'
import { workoutSessions } from '../../lib/supabase'
import ProfessionalSessionHeader from './ProfessionalSessionHeader'
import ProfessionalExerciseCard from './ProfessionalExerciseCard'
import SessionFinishModal from './SessionFinishModal'
import '../../styles/ExerciseLog.css'
import '../../styles/ProfessionalTracking.css'

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const ProfessionalWorkoutTracker = () => {
	const { userProfile } = useAuth()
	const { userRoutine, selectedDayIndex, getCurrentDayExercises } = useRoutineStore()
	const { showSuccess, showError } = useUIStore()
	
	// Estados principales
	const [sessionId, setSessionId] = useState(null)
	const [sessionLoading, setSessionLoading] = useState(false)
	const [showFinishModal, setShowFinishModal] = useState(false)
	const [autoExpandNext, setAutoExpandNext] = useState(true)

	// Obtener ejercicios del día actual
	const exercises = getCurrentDayExercises()
	
	// Hook de tracking profesional
	const {
		trackingState,
		exerciseStates,
		sessionStats,
		sessionProgress,
		canFinishSession,
		isLoading,
		getExerciseProgress,
		getNextRecommendedExercise,
		validateSessionCompletion,
		refreshSessionData,
		finishSession,
		TRACKING_STATES
	} = useProfessionalTracking(sessionId, exercises)

	// Crear o cargar sesión de entrenamiento
	const initializeSession = useCallback(async () => {
		if (!userProfile || !userRoutine || selectedDayIndex === null) return

		setSessionLoading(true)
		try {
			const diaSemana = diasSemana[selectedDayIndex]
			const routineDay = userRoutine.routine_days.find(day => day.dia_semana === diaSemana)
			
			if (!routineDay) {
				throw new Error(`No se encontró el día de rutina para ${diaSemana}`)
			}

			const fechaHoy = new Date().toISOString().split('T')[0]
			
			// Verificar si ya existe una sesión para hoy
			const { data: sesiones, error } = await workoutSessions.getUserSessions(20)
			if (error) throw error

			const sesionHoy = sesiones?.find(s =>
				s.user_id === userProfile.id &&
				s.routine_id === userRoutine.id &&
				s.routine_day_id === routineDay.id &&
				s.fecha === fechaHoy
			)

			if (sesionHoy) {
				setSessionId(sesionHoy.id)
			} else {
				// Crear nueva sesión
				const { data, error: createError } = await workoutSessions.create({
					user_id: userProfile.id,
					routine_id: userRoutine.id,
					routine_day_id: routineDay.id,
					fecha: fechaHoy,
					completada: false
				})
				
				if (createError) throw createError
				if (!data || data.length === 0) throw new Error('No se pudo crear la sesión')
				
				setSessionId(data[0].id)
				showSuccess('Sesión de entrenamiento iniciada')
			}
		} catch (err) {
			showError(`Error al inicializar sesión: ${err.message}`)
		} finally {
			setSessionLoading(false)
		}
	}, [userProfile, userRoutine, selectedDayIndex, showSuccess, showError])

	// Inicializar sesión cuando se cargan los datos
	useEffect(() => {
		if (userProfile && userRoutine && selectedDayIndex !== null && !sessionId) {
			initializeSession()
		}
	}, [userProfile, userRoutine, selectedDayIndex, sessionId, initializeSession])

	// Auto-expandir siguiente ejercicio recomendado (sin notificación)
	useEffect(() => {
		if (autoExpandNext && trackingState === TRACKING_STATES.ACTIVE) {
			const nextExercise = getNextRecommendedExercise()
			if (nextExercise) {
				// Aquí se podría implementar la lógica para auto-expandir
				// Sin mostrar notificación para evitar spam
			}
		}
	}, [autoExpandNext, trackingState, getNextRecommendedExercise])

	// Manejar guardado de series
	const handleSeriesSaved = useCallback(async (exerciseId) => {
		await refreshSessionData()
		
		// Auto-expandir siguiente ejercicio si está habilitado
		if (autoExpandNext) {
			const nextExercise = getNextRecommendedExercise()
			if (nextExercise && nextExercise.id !== exerciseId) {
				// Lógica para expandir siguiente ejercicio
			}
		}
	}, [refreshSessionData, autoExpandNext, getNextRecommendedExercise])

	// Manejar finalización de sesión
	const handleFinishSession = useCallback(() => {
		const validation = validateSessionCompletion()
		if (!validation.canFinish) {
			showError('No se puede finalizar la sesión. Completa al menos el 30% de los ejercicios.')
			return
		}
		setShowFinishModal(true)
	}, [validateSessionCompletion, showError])

	// Finalizar sesión con datos del modal
	const handleFinishSessionConfirm = useCallback(async (notes, rating) => {
		const success = await finishSession(notes, rating)
		if (success) {
			setShowFinishModal(false)
		}
	}, [finishSession])

	// Mostrar loading mientras se inicializa
	if (sessionLoading || trackingState === TRACKING_STATES.LOADING) {
		return (
			<div className="professional-workout-tracker loading">
				<div className="loading-container">
					<h3>Inicializando sesión de entrenamiento...</h3>
					<p>Preparando tu rutina personalizada</p>
				</div>
			</div>
		)
	}

	// Mostrar error si no hay datos
	if (!userRoutine || selectedDayIndex === null) {
		return (
			<div className="professional-workout-tracker error">
				<div className="error-container">
					<FaExclamationTriangle />
					<h3>No se pudo cargar la rutina</h3>
					<p>Verifica que tengas una rutina activa configurada</p>
				</div>
			</div>
		)
	}

	// Obtener información del día
	const diaSemana = diasSemana[selectedDayIndex]
	const routineName = userRoutine.nombre || 'Rutina Personalizada'
	const gruposMusculares = Array.from(new Set(
		exercises.flatMap(ej => ej.grupo_muscular ? [ej.grupo_muscular] : [])
	))

	return (
		<div className="professional-workout-tracker">
			{/* Header de la sesión */}
			<ProfessionalSessionHeader
				sessionStats={sessionStats}
				sessionProgress={sessionProgress}
				canFinishSession={canFinishSession}
				trackingState={trackingState}
				onFinishSession={handleFinishSession}
				isLoading={isLoading}
			/>

			{/* Información de la rutina - UNIDO VISUALMENTE CON EL HEADER */}
			<motion.div 
				className="routine-name-section"
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.2 }}
			>
				<div className="routine-name-content">
					<div className="routine-icon">
						<FaDumbbell />
					</div>
					<div className="routine-info">
						<h3>{routineName}</h3>
						<p>
							{diaSemana} • {gruposMusculares.length > 0 ? gruposMusculares.join(', ') : 'General'} • {exercises.length} ejercicios
						</p>
					</div>
				</div>
			</motion.div>

			{/* Grid de ejercicios */}
			<div className="exercises-grid">
				{exercises.map((exercise, index) => {
					const exerciseProgress = getExerciseProgress(exercise.id)
					const nextExercise = getNextRecommendedExercise()
					const isRecommended = nextExercise?.id === exercise.id
					
					return (
						<ProfessionalExerciseCard
							key={exercise.id || exercise.routine_exercise_id}
							exercise={exercise}
							sessionId={sessionId}
							exerciseProgress={exerciseProgress}
							onSeriesSaved={() => handleSeriesSaved(exercise.id)}
							isRecommended={isRecommended}
							index={index}
						/>
					)
				})}
			</div>

			{/* Modal de finalización */}
			<SessionFinishModal
				isOpen={showFinishModal}
				onClose={() => setShowFinishModal(false)}
				onConfirm={handleFinishSessionConfirm}
				sessionStats={sessionStats}
				sessionProgress={sessionProgress}
				validation={validateSessionCompletion()}
			/>
		</div>
	)
}

export default ProfessionalWorkoutTracker
