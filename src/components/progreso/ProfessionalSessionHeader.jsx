/**
 * Header profesional de sesión de entrenamiento
 * Muestra progreso general y estadísticas simplificadas
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
	FaDumbbell, 
	FaFire, 
	FaChartLine,
	FaCheckCircle,
	FaPlay,
	FaEdit
} from 'react-icons/fa'

const ProfessionalSessionHeader = ({
	sessionStats,
	sessionProgress,
	canFinishSession,
	trackingState,
	onFinishSession,
	onStartSession,
	onEditSession,
	isEditingCompleted = false,
	isLoading = false
}) => {
	// Obtener mensaje motivacional
	const getMotivationalMessage = () => {
		const progress = sessionProgress
		
		if (progress === 0) {
			return '¡Comienza tu entrenamiento! Cada repetición te acerca a tu objetivo.'
		} else if (progress < 25) {
			return '¡Buen comienzo! Mantén el ritmo y la concentración.'
		} else if (progress < 50) {
			return '¡Vas por buen camino! Ya estás en la primera mitad.'
		} else if (progress < 75) {
			return '¡Excelente! Estás en la recta final del entrenamiento.'
		} else if (progress < 100) {
			return '¡Casi terminas! Último esfuerzo para completar la sesión.'
		} else {
			return '¡Entrenamiento completado! ¡Excelente trabajo!'
		}
	}

	// Obtener color del progreso
	const getProgressColor = () => {
		if (sessionProgress < 25) return 'var(--color-warning)'
		if (sessionProgress < 75) return 'var(--color-primary)'
		return 'var(--color-success)'
	}

	return (
		<motion.div 
			className="professional-session-header"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			{/* Header principal */}
			<div className="session-header-main">
				<div className="session-title">
					<FaDumbbell />
					<h2>Sesión de Entrenamiento</h2>
					{trackingState === 'completed' && (
						<div className="completed-badge">
							<FaCheckCircle />
							<span>Completada</span>
						</div>
					)}
				</div>

				{/* Progreso general */}
				<div className="session-progress">
					<div className="progress-header">
						<span className="progress-label">Progreso General</span>
						<span className="progress-percentage">{sessionProgress}%</span>
					</div>
					<div className="progress-bar-container">
						<motion.div
							className="progress-bar"
							initial={{ width: 0 }}
							animate={{ width: `${sessionProgress}%` }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
							style={{ 
								'--progress-color': getProgressColor(),
								background: `linear-gradient(90deg, ${getProgressColor()}, ${getProgressColor()}80)` 
							}}
						/>
					</div>
				</div>

				{/* Mensaje motivacional */}
				<div className="motivational-message">
					<FaFire />
					<p>{getMotivationalMessage()}</p>
				</div>
			</div>

			{/* Estadísticas de la sesión */}
			<div className="session-stats">
				<div className="stats-grid">
					<div className="stat-card">
						<div className="stat-icon">
							<FaDumbbell />
						</div>
						<div className="stat-content">
							<div className="stat-value">
								{sessionStats.completedExercises}/{sessionStats.totalExercises}
							</div>
							<div className="stat-label">Ejercicios</div>
						</div>
					</div>

					<div className="stat-card">
						<div className="stat-icon">
							<FaChartLine />
						</div>
						<div className="stat-content">
							<div className="stat-value">
								{sessionStats.completedSeries}/{sessionStats.totalSeries}
							</div>
							<div className="stat-label">Series</div>
						</div>
					</div>
				</div>
			</div>

			{/* Controles de sesión */}
			<div className="session-controls">
				{/* Botón Finalizar - Sesión activa o editando sesión completada */}
				{(trackingState === 'active' || (trackingState === 'completed' && isEditingCompleted)) && canFinishSession && (
					<motion.button
						className="finish-session-btn"
						onClick={onFinishSession}
						disabled={isLoading}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
					{isLoading ? (
						<span>Finalizando...</span>
					) : (
						<>
							<FaCheckCircle />
							<span>Finalizar Sesión</span>
						</>
					)}
					</motion.button>
				)}

				{/* Botón Editar - Solo cuando está completada y NO editando */}
				{trackingState === 'completed' && !isEditingCompleted && (
					<motion.button
						className="edit-session-btn"
						onClick={onEditSession}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<FaEdit />
						<span>Editar Sesión</span>
					</motion.button>
				)}

				{/* Botón Iniciar - Sesión idle */}
				{trackingState === 'idle' && (
					<motion.button
						className="start-session-btn"
						onClick={onStartSession}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<FaPlay />
						<span>Iniciar Sesión</span>
					</motion.button>
				)}
			</div>
		</motion.div>
	)
}

export default ProfessionalSessionHeader
