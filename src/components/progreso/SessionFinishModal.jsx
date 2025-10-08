/**
 * Modal profesional de finalización de sesión
 * Versión simplificada sin estadísticas innecesarias
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
	FaTimes, 
	FaCheckCircle, 
	FaChartLine, 
	FaStar,
	FaEdit,
	FaSave,
	FaExclamationTriangle
} from 'react-icons/fa'

const SessionFinishModal = ({
	isOpen,
	onClose,
	onConfirm,
	sessionStats,
	sessionProgress,
	validation
}) => {
	const [notes, setNotes] = useState('')
	const [rating, setRating] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Manejar confirmación
	const handleConfirm = async () => {
		if (!validation.canFinish) return

		setIsSubmitting(true)
		try {
			await onConfirm(notes, rating)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Obtener mensaje de finalización
	const getCompletionMessage = () => {
		if (sessionProgress === 100) {
			return '¡Sesión completada al 100%! ¡Excelente trabajo!'
		} else if (sessionProgress >= 80) {
			return '¡Excelente sesión! Has completado la mayor parte del entrenamiento.'
		} else if (sessionProgress >= 60) {
			return '¡Buena sesión! Has hecho un progreso significativo.'
		} else if (sessionProgress >= 30) {
			return '¡Buen comienzo! Cada entrenamiento cuenta.'
		} else {
			return 'Sesión iniciada. Recuerda que la consistencia es clave.'
		}
	}

	// Obtener color del progreso
	const getProgressColor = () => {
		if (sessionProgress >= 80) return 'var(--color-success)'
		if (sessionProgress >= 60) return 'var(--color-primary)'
		if (sessionProgress >= 30) return 'var(--color-warning)'
		return 'var(--color-error)'
	}

	const modalVariants = {
		hidden: { opacity: 0, scale: 0.9, y: 20 },
		visible: { 
			opacity: 1, 
			scale: 1, 
			y: 0,
			transition: { duration: 0.3, ease: 'easeOut' }
		},
		exit: { 
			opacity: 0, 
			scale: 0.9, 
			y: 20,
			transition: { duration: 0.2 }
		}
	}

	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 }
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="session-finish-modal-backdrop"
					variants={backdropVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					onClick={onClose}
				>
					<motion.div
						className="session-finish-modal"
						variants={modalVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header del modal */}
						<div className="modal-header">
							<div className="header-content">
								<FaCheckCircle className="header-icon" />
								<h2>Finalizar Sesión de Entrenamiento</h2>
							</div>
							<button className="close-btn" onClick={onClose}>
								<FaTimes />
							</button>
						</div>

						{/* Contenido del modal */}
						<div className="modal-content">
							{/* Resumen de la sesión */}
							<div className="session-summary">
								<div className="summary-header">
									<h3>Resumen de la Sesión</h3>
									<div className="completion-badge" style={{ '--progress-color': getProgressColor() }}>
										{sessionProgress}% Completado
									</div>
								</div>

								<div className="completion-message">
									<p>{getCompletionMessage()}</p>
								</div>

								{/* Estadísticas principales */}
								<div className="stats-grid">
									<div className="stat-item">
										<div className="stat-icon">
											<FaChartLine />
										</div>
										<div className="stat-content">
											<div className="stat-value">
												{sessionStats.completedExercises}/{sessionStats.totalExercises}
											</div>
											<div className="stat-label">Ejercicios Completados</div>
										</div>
									</div>

									<div className="stat-item">
										<div className="stat-icon">
											<FaChartLine />
										</div>
										<div className="stat-content">
											<div className="stat-value">
												{sessionStats.completedSeries}/{sessionStats.totalSeries}
											</div>
											<div className="stat-label">Series Completadas</div>
										</div>
									</div>
								</div>
							</div>

							{/* Validaciones y recomendaciones */}
							{!validation.isComplete && validation.recommendations.length > 0 && (
								<div className="validation-section">
									<div className="validation-header">
										<FaExclamationTriangle />
										<h4>Recomendaciones</h4>
									</div>
									<div className="validation-content">
										{validation.recommendations.map((rec, index) => (
											<div key={index} className="recommendation-item">
												<span className="recommendation-text">{rec}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Calificación de la sesión */}
							<div className="session-rating">
								<h4>¿Cómo te sentiste en esta sesión?</h4>
								<div className="rating-options">
									{[1, 2, 3, 4, 5].map((star) => (
										<button
											key={star}
											className={`rating-btn ${rating === star ? 'selected' : ''}`}
											onClick={() => setRating(rating === star ? null : star)}
											type="button"
										>
											<FaStar />
										</button>
									))}
								</div>
							</div>

							{/* Notas de la sesión */}
							<div className="session-notes">
								<label htmlFor="session-notes">
									<FaEdit />
									<span>Notas de la sesión (opcional)</span>
								</label>
								<textarea
									id="session-notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Comparte tus pensamientos sobre esta sesión, cómo te sentiste, qué fue bien, qué mejorar..."
									rows={4}
								/>
							</div>
						</div>

						{/* Footer del modal */}
						<div className="modal-footer">
							<button 
								className="cancel-btn"
								onClick={onClose}
								disabled={isSubmitting}
								type="button"
							>
								Continuar Entrenando
							</button>
							<button 
								className="confirm-btn"
								onClick={handleConfirm}
								disabled={!validation.canFinish || isSubmitting}
								type="button"
							>
							{isSubmitting ? (
								<span>Finalizando...</span>
							) : (
								<>
									<FaSave />
									<span>Finalizar Sesión</span>
								</>
							)}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default SessionFinishModal
