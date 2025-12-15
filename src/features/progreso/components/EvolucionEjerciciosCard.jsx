import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaChartLine, FaBolt, FaDumbbell } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'

/**
 * Card de Evolución de Ejercicios: acceso directo a los gráficos y tendencias.
 */
const EvolucionEjerciciosCard = memo(({ isActive, isVisible = true, isExpanded = false, onToggle, onExpand, onClose }) => {
  const previewStats = [
    { icon: FaChartLine, label: 'Tendencias' },
    { icon: FaDumbbell, label: 'PRs' },
    { icon: FaBolt, label: 'Cargas' }
  ]

  const handleExpand = useCallback(() => {
    window.location.href = '/progreso/graficos-ejercicios'
  }, [])

  const handleToggle = useCallback(() => {
    window.location.href = '/progreso/graficos-ejercicios'
  }, [])

  return (
    <BaseProgressCard
      cardId="ejercicios"
      cardType="rutina-ejercicios"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Evolución de Ejercicios"
      description="Visualiza cargas, repeticiones, PRs y tendencias por ejercicio."
      icon={FaChartLine}
      previewStats={previewStats}
      onToggle={handleToggle}
      onExpand={handleExpand}
      onClose={onClose}
    />
  )
})

EvolucionEjerciciosCard.displayName = 'EvolucionEjerciciosCard'

EvolucionEjerciciosCard.propTypes = {
  isActive: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool,
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  onClose: PropTypes.func
}

export default EvolucionEjerciciosCard

