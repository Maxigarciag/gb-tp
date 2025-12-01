import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaDumbbell, FaPlay, FaChartLine, FaFire } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'

/**
 * Card de rutina y ejercicios - navega a rutas específicas
 * @param {Object} props - Props del componente
 */
const RutinaEjerciciosCard = memo(({ isActive, isVisible = true, isExpanded = false, onToggle, onExpand, onClose }) => {
  // Stats para el preview
  const previewStats = [
    { icon: FaPlay, label: 'Rutina de hoy' },
    { icon: FaChartLine, label: 'Progreso' },
    { icon: FaFire, label: 'Ejercicios' }
  ]

  // Navegar siempre a la ruta cuando se hace clic
  const handleExpand = useCallback(() => {
    window.location.href = '/progreso/rutina-hoy'
  }, [])

  const handleToggle = useCallback(() => {
    window.location.href = '/progreso/rutina-hoy'
  }, [])

  return (
    <BaseProgressCard
      cardId="rutina"
      cardType="rutina-ejercicios"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Rutina y Ejercicios"
      description="Gestiona tu rutina diaria, visualiza el progreso de ejercicios y revisa tu historial de sesiones."
      icon={FaDumbbell}
      previewStats={previewStats}
      onToggle={handleToggle}
      onExpand={handleExpand}
      onClose={onClose}
    />
  )
})

RutinaEjerciciosCard.displayName = 'RutinaEjerciciosCard'

RutinaEjerciciosCard.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isVisible: PropTypes.bool,
	isExpanded: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	onExpand: PropTypes.func,
	onClose: PropTypes.func
}

export default RutinaEjerciciosCard
