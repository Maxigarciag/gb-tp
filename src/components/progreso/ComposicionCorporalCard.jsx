import React, { Suspense, lazy, memo, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaCalculator, FaRuler, FaPercentage, FaUtensils } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'
import CardLoadingFallback from './CardLoadingFallback'
import '../../styles/ComposicionTabs.css'

const BodyFatCalculator = lazy(() => import('./BodyFatCalculator'))
const MacroCalculator = lazy(() => import('./MacroCalculator/MacroCalculator'))

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
  onClose, 
  onSaveMeasurement 
}) {
  const [activeCalculator, setActiveCalculator] = useState('bodyfat')

  const handleTabChange = useCallback((tab) => {
    setActiveCalculator(tab)
  }, [])

  const renderContent = useCallback(({ onSaveMeasurement }) => (
    <div className="composicion-content">
      <div className="composicion-tabs">
        <button
          type="button"
          className={`composicion-tab ${activeCalculator === 'bodyfat' ? 'active' : ''}`}
          onClick={() => handleTabChange('bodyfat')}
        >
          <FaPercentage className="tab-icon" />
          <span>Grasa Corporal</span>
        </button>
        <button
          type="button"
          className={`composicion-tab ${activeCalculator === 'macros' ? 'active' : ''}`}
          onClick={() => handleTabChange('macros')}
        >
          <FaUtensils className="tab-icon" />
          <span>Macronutrientes</span>
        </button>
      </div>

      <div className="composicion-tab-content">
        <Suspense fallback={<CardLoadingFallback type="calculator" />}>
          {activeCalculator === 'bodyfat' ? (
            <BodyFatCalculator onSaveMeasurement={onSaveMeasurement} />
          ) : (
            <MacroCalculator />
          )}
        </Suspense>
      </div>
    </div>
  ), [activeCalculator, handleTabChange])

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
      renderContent={renderContent}
      onToggle={onToggle}
      onExpand={onExpand}
      onClose={onClose}
      onSaveMeasurement={onSaveMeasurement}
    />
  )
})

ComposicionCorporalCard.propTypes = {
  isActive: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool,
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onExpand: PropTypes.func,
  onClose: PropTypes.func,
  onSaveMeasurement: PropTypes.func
}

export default ComposicionCorporalCard
