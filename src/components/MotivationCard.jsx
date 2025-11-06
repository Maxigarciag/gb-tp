/**
 * Componente de tarjeta de motivación con progreso semanal real
 * Muestra el progreso del usuario basado en sesiones completadas
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWeeklyProgress } from '../hooks/useWeeklyProgress'
import '../styles/HomeDashboard.css'

const MotivationCard = () => {
	const { 
		percentage, 
		message, 
		completed, 
		scheduled, 
		loading, 
		error 
	} = useWeeklyProgress()

	// Mensajes motivacionales dinámicos
	const getMotivationalMessage = () => {
		if (loading) return 'Cargando tu progreso...'
		if (error) return 'Mantén tu rutina y verás resultados increíbles.'
		
		if (percentage === 0) {
			return '¡Cada entrenamiento te acerca a tu objetivo!'
		} else if (percentage < 25) {
			return '¡Buen comienzo! Mantén la constancia.'
		} else if (percentage < 50) {
			return '¡Vas por buen camino! Sigue así.'
		} else if (percentage < 75) {
			return '¡Excelente progreso! Ya estás en la recta final.'
		} else if (percentage < 100) {
			return '¡Casi terminas la semana! ¡Último esfuerzo!'
		} else {
			return '¡Semana completada! ¡Eres un/a campeón/a!'
		}
	}

	// Colores dinámicos para la barra de progreso
	const getProgressColors = () => {
		if (percentage < 25) return 'from-red-500 to-orange-500'
		if (percentage < 50) return 'from-orange-500 to-yellow-500'
		if (percentage < 75) return 'from-yellow-500 to-green-500'
		return 'from-green-500 to-blue-500'
	}

	return (
		<motion.div 
			className="motivation-card"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="motivation-content">
				<div className="motivation-icon">
					<Heart size={24} />
				</div>
				<div className="motivation-text">
					<p>{getMotivationalMessage()}</p>
				</div>
			</div>
			<div className="motivation-progress">
				<div className="progress-bar">
					<motion.div 
						className={`progress-fill bg-gradient-to-r ${getProgressColors()}`}
						initial={{ width: 0 }}
						animate={{ width: `${percentage}%` }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
					/>
				</div>
				<span className="progress-text">
					{loading ? 'Calculando progreso...' : message}
				</span>
			</div>
		</motion.div>
	)
}

export default MotivationCard
