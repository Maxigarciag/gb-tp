/**
 * Componente principal de tracking profesional de entrenamientos
 * Integra todos los componentes profesionales en una experiencia guiada
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaDumbbell, FaCheckCircle } from 'react-icons/fa'
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
	const { userRoutine, selectedDayIndex, getCurrentDayExercises, loadUserRoutine, setSelectedDay } = useRoutineStore()
	const { showSuccess, showError } = useUIStore()
	
	// Estados principales
	const [sessionId, setSessionId] = useState(null)
	const [sessionLoading, setSessionLoading] = useState(false)
	const [showFinishModal, setShowFinishModal] = useState(false)
	const [autoExpandNext, setAutoExpandNext] = useState(true)
	const [isEditingCompletedSession, setIsEditingCompletedSession] = useState(false)

	// Cargar rutina del usuario cuando se monta el componente
	useEffect(() => {
		if (userProfile && !userRoutine) {
			loadUserRoutine()
		}
	}, [userProfile, userRoutine, loadUserRoutine])

	// Establecer día actual si no está seleccionado
	useEffect(() => {
		if (selectedDayIndex === null) {
			const today = new Date().getDay() // 0 = Domingo, 1 = Lunes, etc.
			const dayIndex = today === 0 ? 6 : today - 1 // Convertir a índice 0-6 (Lunes-Domingo)
			setSelectedDay(dayIndex)
		}
	}, [selectedDayIndex, setSelectedDay])

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

	// Resetear modo de edición cuando cambia el trackingState a COMPLETED
	useEffect(() => {
		if (trackingState === TRACKING_STATES.COMPLETED) {
			setIsEditingCompletedSession(false)
		}
	}, [trackingState, TRACKING_STATES.COMPLETED])

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

	// Manejar edición de sesión completada
	const handleEditSession = useCallback(() => {
		setIsEditingCompletedSession(true)
		showSuccess('Modo de edición activado. Puedes modificar los ejercicios.')
	}, [showSuccess])

	// Mostrar loading mientras se carga la rutina o se inicializa
	if (!userRoutine || sessionLoading || trackingState === TRACKING_STATES.LOADING) {
		return (
			<div className="professional-workout-tracker loading">
				<div className="loading-container">
					<h3>Cargando tu rutina...</h3>
					<p>Preparando tu entrenamiento de hoy</p>
				</div>
			</div>
		)
	}

	// Mostrar error si no hay día seleccionado (raro caso)
	if (selectedDayIndex === null) {
		return (
			<div className="professional-workout-tracker error">
				<div className="loading-container">
					<h3>Cargando día de entrenamiento...</h3>
					<p>Un momento...</p>
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
				onEditSession={handleEditSession}
				isEditingCompleted={isEditingCompletedSession}
				isLoading={isLoading}
			/>

			{/* Información de la rutina - Solo visible si no está completada */}
			{trackingState !== TRACKING_STATES.COMPLETED && (
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
			)}

			{/* Mensaje cuando sesión completada y no editando */}
			{trackingState === TRACKING_STATES.COMPLETED && !isEditingCompletedSession && (
				<motion.div 
					className="session-completed-summary"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="completed-icon">
						<FaCheckCircle />
					</div>
					<h3>¡Sesión de Entrenamiento Completada!</h3>
					<p>Has finalizado exitosamente tu rutina de hoy.</p>
					<div className="completed-stats">
						<div className="stat">
							<strong>{sessionStats.completedExercises}</strong>
							<span>Ejercicios Completados</span>
						</div>
						<div className="stat">
							<strong>{sessionStats.completedSeries}</strong>
							<span>Series Totales</span>
						</div>
					</div>
					<p className="edit-hint">Usa el botón "Editar Sesión" si necesitas hacer cambios.</p>
				</motion.div>
			)}

			{/* Grid de ejercicios - Solo visible si está activa o editando */}
			{(trackingState === TRACKING_STATES.ACTIVE || isEditingCompletedSession) && (
				<div className="exercises-grid">
					{exercises.map((exercise, index) => {
						const exerciseProgress = getExerciseProgress(exercise.id)
						const nextExercise = getNextRecommendedExercise()
						const isRecommended = nextExercise?.id === exercise.id
						const isSessionCompleted = trackingState === TRACKING_STATES.COMPLETED && !isEditingCompletedSession
						
						return (
							<ProfessionalExerciseCard
								key={exercise.id || exercise.routine_exercise_id}
								exercise={exercise}
								sessionId={sessionId}
								exerciseProgress={exerciseProgress}
								onSeriesSaved={() => handleSeriesSaved(exercise.id)}
								isRecommended={isRecommended}
								isSessionCompleted={isSessionCompleted}
								index={index}
							/>
						)
					})}
				</div>
			)}

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
