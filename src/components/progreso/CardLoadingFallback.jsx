import React, { memo } from 'react'
import PropTypes from 'prop-types'
import LoadingSpinnerOptimized from '../common/LoadingSpinnerOptimized'

/**
 * Componente de carga optimizado para las cards de progreso
 * Proporciona diferentes tipos de carga según el contexto
 * @param {Object} props
 * @param {string} props.message - Mensaje de carga
 * @param {'evolution'|'routine'|'calculator'|'charts'|'card'} props.type - Tipo de contenido
 * @param {'small'|'medium'|'large'} props.size - Tamaño del spinner
 */
const CardLoadingFallback = memo(({ 
  message = 'Cargando...', 
  type = 'card',
  size = 'medium' 
}) => {
  const getLoadingMessage = () => {
    switch (type) {
      case 'evolution':
        return 'Cargando análisis de progreso...';
      case 'routine':
        return 'Cargando rutina de entrenamiento...';
      case 'calculator':
        return 'Cargando calculadora...';
      case 'charts':
        return 'Cargando gráficos...';
      default:
        return message;
    }
  };

  return (
    <div className="card-loading-container">
      <LoadingSpinnerOptimized 
        message={getLoadingMessage()} 
        size={size}
        variant="dots"
      />
    </div>
  )
})

CardLoadingFallback.displayName = 'CardLoadingFallback'

CardLoadingFallback.propTypes = {
	message: PropTypes.string,
	type: PropTypes.oneOf(['evolution', 'routine', 'calculator', 'charts', 'card']),
	size: PropTypes.oneOf(['small', 'medium', 'large'])
}

export default CardLoadingFallback
