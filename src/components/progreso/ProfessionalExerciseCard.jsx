/**
 * Componente profesional de tarjeta de ejercicio con tracking avanzado
 * Incluye progreso visual, estados y validaciones
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
	FaDumbbell, 
	FaCheckCircle, 
	FaPlay, 
	FaPause, 
	FaClock, 
	FaWeightHanging,
	FaChartLine,
	FaExclamationTriangle
} from 'react-icons/fa'
import { EXERCISE_STATES } from '../../hooks/useProfessionalTracking'
import ExerciseLogCard from './ExerciseLogCard'
import '../../styles/ExerciseLog.css'

const ProfessionalExerciseCard = ({ 
	exercise, 
	sessionId, 
	exerciseProgress, 
	onSeriesSaved,
	onStateChange,
	isRecommended = false,
	index = 0 
}) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// Determinar estado visual basado en progreso
	const getVisualState = () => {
		const { state, completedSeries, totalSeries } = exerciseProgress
		
		switch (state) {
			case EXERCISE_STATES.COMPLETED:
				return 'completed'
			case EXERCISE_STATES.IN_PROGRESS:
				return 'in-progress'
			case EXERCISE_STATES.SKIPPED:
				return 'skipped'
			default:
				return 'pending'
		}
	}

	// Calcular progreso porcentual
	const progressPercentage = exerciseProgress.totalSeries > 0 
		? Math.round((exerciseProgress.completedSeries / exerciseProgress.totalSeries) * 100)
		: 0

	// Obtener color del estado
	const getStateColor = () => {
		const visualState = getVisualState()
		switch (visualState) {
			case 'completed':
				return 'var(--color-success)'
			case 'in-progress':
				return 'var(--color-primary)'
			case 'skipped':
				return 'var(--color-warning)'
			default:
				return 'var(--text-secondary)'
		}
	}

	// Obtener icono del estado
	const getStateIcon = () => {
		const visualState = getVisualState()
		switch (visualState) {
			case 'completed':
				return <FaCheckCircle />
			case 'in-progress':
				return <FaPlay />
			case 'skipped':
				return <FaPause />
			default:
				return <FaDumbbell />
		}
	}

	// Obtener texto del estado
	const getStateText = () => {
		const { state, completedSeries, totalSeries } = exerciseProgress
		
		switch (state) {
			case EXERCISE_STATES.COMPLETED:
				return `Completado (${completedSeries}/${totalSeries} series)`
			case EXERCISE_STATES.IN_PROGRESS:
				return `En progreso (${completedSeries}/${totalSeries} series)`
			case EXERCISE_STATES.SKIPPED:
				return 'Saltado'
			default:
				return 'Pendiente'
		}
	}

	// Manejar guardado de series
	const handleSeriesSaved = async () => {
		setIsLoading(true)
		try {
			if (onSeriesSaved) {
				await onSeriesSaved()
			}
		} finally {
			setIsLoading(false)
		}
	}

	// Animaciones
	const cardVariants = {
		hidden: { opacity: 0, y: 20, scale: 0.95 },
		visible: { 
			opacity: 1, 
			y: 0, 
			scale: 1,
			transition: { 
				duration: 0.4,
				delay: index * 0.1,
				ease: 'easeOut'
			}
		},
		hover: { 
			y: -2, 
			scale: 1.02,
			transition: { duration: 0.2 }
		}
	}

	const progressBarVariants = {
		hidden: { width: 0 },
		visible: { 
			width: `${progressPercentage}%`,
			transition: { duration: 0.8, ease: 'easeOut' }
		}
	}

	return (
		<motion.div
			className={`professional-exercise-card ${getVisualState()} ${isRecommended ? 'recommended' : ''}`}
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			whileHover="hover"
			style={{
				'--state-color': getStateColor(),
				'--progress-percentage': progressPercentage
			}}
		>
			{/* Indicador de ejercicio recomendado */}
			{isRecommended && (
				<div className="recommended-badge">
					<FaPlay size={12} />
					<span>Siguiente</span>
				</div>
			)}

			{/* Header del ejercicio */}
			<button
				className="exercise-header"
				onClick={() => setIsExpanded(!isExpanded)}
				disabled={isLoading}
			>
				<div className="exercise-header-content">
					<div className="exercise-icon">
						{getStateIcon()}
					</div>
					
					<div className="exercise-info">
						<h3 className="exercise-name">{exercise.nombre}</h3>
						<div className="exercise-meta">
							<span className="muscle-group">{exercise.grupo_muscular}</span>
							<span className="series-info">
								{exerciseProgress.completedSeries}/{exerciseProgress.totalSeries} series
							</span>
						</div>
					</div>

					<div className="exercise-status">
						<div className="status-text">{getStateText()}</div>
						<div className="progress-indicator">
							<div className="progress-bar">
								<motion.div
									className="progress-fill"
									variants={progressBarVariants}
									initial="hidden"
									animate="visible"
								/>
							</div>
							<span className="progress-percentage">{progressPercentage}%</span>
						</div>
					</div>

					<div className="expand-icon">
						<motion.span
							animate={{ rotate: isExpanded ? 180 : 0 }}
							transition={{ duration: 0.3 }}
						>
							▼
						</motion.span>
					</div>
				</div>

				{/* Estadísticas del ejercicio */}
				{exerciseProgress.volume > 0 && (
					<div className="exercise-stats">
						<div className="stat-item">
							<FaWeightHanging />
							<span>{exerciseProgress.volume}kg volumen</span>
						</div>
						{exerciseProgress.lastUpdate && (
							<div className="stat-item">
								<FaClock />
								<span>Actualizado</span>
							</div>
						)}
					</div>
				)}
			</button>

			{/* Contenido expandible */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						className="exercise-content"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<div className="exercise-content-inner">
							{/* Información del ejercicio */}
							<div className="exercise-details">
								<div className="detail-item">
									<strong>Series programadas:</strong> {exercise.series || 3}
								</div>
								<div className="detail-item">
									<strong>Repeticiones:</strong> {exercise.repeticiones_min}-{exercise.repeticiones_max}
								</div>
								<div className="detail-item">
									<strong>Peso sugerido:</strong> {exercise.peso_sugerido ? `${exercise.peso_sugerido}kg` : 'No especificado'}
								</div>
								<div className="detail-item">
									<strong>Descanso:</strong> {exercise.tiempo_descanso || 60}s
								</div>
							</div>

							{/* Componente de tracking */}
							<ExerciseLogCard
								ejercicio={exercise}
								sessionId={sessionId}
								onSaved={handleSeriesSaved}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

export default ProfessionalExerciseCard
