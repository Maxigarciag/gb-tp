import React, { memo } from 'react';
import LoadingSpinnerOptimized from '../LoadingSpinnerOptimized';

/**
 * Componente de carga optimizado para las cards de progreso
 * Proporciona diferentes tipos de carga según el contexto
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
  );
});

CardLoadingFallback.displayName = 'CardLoadingFallback';

export default CardLoadingFallback;
