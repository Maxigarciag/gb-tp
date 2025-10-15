import React, { Suspense, lazy, memo } from 'react'
import PropTypes from 'prop-types'
import { FaCalculator, FaRuler, FaPercentage } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'
import CardLoadingFallback from './CardLoadingFallback'

// Lazy loading de componentes
const BodyFatCalculator = lazy(() => import('./BodyFatCalculator'))

/**
 * Card de composición corporal con calculadora US Navy
 * @param {Object} props - Props del componente
 */
const ComposicionCorporalCard = memo(({ isActive, isVisible = true, isExpanded = false, onToggle, onExpand, onClose, onSaveMeasurement }) => {
  // Stats para el preview
  const previewStats = [
    { icon: FaRuler, label: 'Medidas' },
    { icon: FaPercentage, label: 'Cálculo' },
    { icon: FaCalculator, label: 'US Navy' }
  ];

  // Función para renderizar contenido
  const renderContent = ({ onSaveMeasurement }) => {
    return (
      <Suspense fallback={<CardLoadingFallback type="calculator" />}>
        <BodyFatCalculator onSaveMeasurement={onSaveMeasurement} />
      </Suspense>
    );
  };

  return (
    <BaseProgressCard
      cardId="composicion"
      cardType="composicion-corporal"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Composición Corporal"
      description="Calcula tu porcentaje de grasa corporal usando el método US Navy y gestiona los resultados."
      icon={FaCalculator}
      previewStats={previewStats}
      renderContent={renderContent}
      onToggle={onToggle}
      onExpand={onExpand}
      onClose={onClose}
      onSaveMeasurement={onSaveMeasurement}
    />
  )
})

ComposicionCorporalCard.displayName = 'ComposicionCorporalCard'

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
