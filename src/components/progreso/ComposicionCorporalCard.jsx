import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaCalculator, FaRuler, FaPercentage, FaUtensils } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'

const PREVIEW_STATS = [
  { icon: FaRuler, label: 'Medidas' },
  { icon: FaPercentage, label: 'Grasa' },
  { icon: FaUtensils, label: 'Macros' }
]

const ComposicionCorporalCard = memo(function ComposicionCorporalCard({ 
  isActive, 
  isVisible = true, 
  isExpanded = false, 
  onToggle, 
  onExpand, 
  onClose
}) {
  // Navegar siempre a la ruta cuando se hace clic
  const handleExpand = useCallback(() => {
    window.location.href = '/progreso/composicion'
  }, [])

  const handleToggle = useCallback(() => {
    window.location.href = '/progreso/composicion'
  }, [])

  return (
    <BaseProgressCard
      cardId="composicion"
      cardType="composicion-corporal"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Composición Corporal"
      description="Calcula tu porcentaje de grasa corporal y distribución de macronutrientes."
      icon={FaCalculator}
      previewStats={PREVIEW_STATS}
      onToggle={handleToggle}
      onExpand={handleExpand}
      onClose={onClose}
    />
  )
})

ComposicionCorporalCard.propTypes = {
  isActive: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool,
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  onClose: PropTypes.func
}

export default ComposicionCorporalCard
