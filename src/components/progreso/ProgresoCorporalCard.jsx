import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaChartLine, FaWeight, FaChartBar, FaHistory } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'

/**
 * Card de progreso corporal - navega a rutas específicas
 * @param {Object} props - Props del componente
 */
const ProgresoCorporalCard = memo(({ isActive, isVisible = true, isExpanded = false, onToggle, onExpand, onClose }) => {
  // Stats para el preview
  const previewStats = [
    { icon: FaWeight, label: 'Registrar peso' },
    { icon: FaChartBar, label: 'Gráficos' },
    { icon: FaHistory, label: 'Historial' }
  ]

  // Navegar siempre a la ruta cuando se hace clic
  const handleExpand = useCallback(() => {
    window.location.href = '/progreso/registrar'
  }, [])

  const handleToggle = useCallback(() => {
    window.location.href = '/progreso/registrar'
  }, [])

  return (
    <BaseProgressCard
      cardId="progreso"
      cardType="progreso-corporal"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Progreso Corporal"
      description="Registra tu peso, grasa y músculo. Visualiza tu evolución y gestiona tu historial."
      icon={FaChartLine}
      previewStats={previewStats}
      onToggle={handleToggle}
      onExpand={handleExpand}
      onClose={onClose}
    />
  )
})

ProgresoCorporalCard.displayName = 'ProgresoCorporalCard'

ProgresoCorporalCard.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isVisible: PropTypes.bool,
	isExpanded: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	onExpand: PropTypes.func,
	onClose: PropTypes.func
}

export default ProgresoCorporalCard
