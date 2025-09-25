import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para gestionar el estado de las cards de progreso
 * Centraliza la lógica de navegación y estado para mejor reutilización
 */
export const useProgressCards = (initialTab = null) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedCard, setExpandedCard] = useState(null);

  // Callbacks memoizados para evitar re-renders
  const handleCardExpand = useCallback((cardId) => {
    setExpandedCard(cardId);
    setActiveTab(cardId);
  }, []);

  const handleCardClose = useCallback(() => {
    setExpandedCard(null);
    setActiveTab(null);
  }, []);

  const handleCardToggle = useCallback((cardId) => {
    setActiveTab(activeTab === cardId ? null : cardId);
  }, [activeTab]);

  // Props comunes para todas las cards
  const commonCardProps = useMemo(() => ({
    isVisible: !activeTab,
    onClose: handleCardClose,
  }), [activeTab, handleCardClose]);

  // Función para manejar mediciones de grasa corporal
  const handleBodyFatMeasurement = useCallback((data) => {
    console.log('Nueva medición de grasa corporal:', data);
  }, []);

  return {
    activeTab,
    expandedCard,
    commonCardProps,
    handleCardExpand,
    handleCardClose,
    handleCardToggle,
    handleBodyFatMeasurement,
  };
};

export default useProgressCards;
