import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook personalizado para gestionar el estado de las cards de progreso
 * Centraliza la lógica de navegación y estado para mejor reutilización
 */
export const useProgressCards = (initialTab = null, onUrlCleanup = null) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedCard, setExpandedCard] = useState(initialTab);


  // Sincronizar estado cuando cambia initialTab (navegación directa por URL)
  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
      setExpandedCard(initialTab);
    }
  }, [initialTab]);

  // Callbacks memoizados para evitar re-renders
  const handleCardExpand = useCallback((cardId) => {
    setExpandedCard(cardId);
    setActiveTab(cardId);
  }, []);

  const handleCardClose = useCallback(() => {
    setExpandedCard(null);
    setActiveTab(null);
    // Limpiar URL si se proporciona la función
    if (onUrlCleanup) {
      onUrlCleanup();
    }
  }, [onUrlCleanup]);

  const handleCardToggle = useCallback((cardId) => {
    setActiveTab(prevActiveTab => {
      return prevActiveTab === cardId ? null : cardId;
    });
  }, []);

  // Props comunes para todas las cards
  const commonCardProps = useMemo(() => ({
    onClose: handleCardClose,
  }), [handleCardClose]);

  // Función para manejar mediciones de grasa corporal
  const handleBodyFatMeasurement = useCallback((data) => {
    // Aquí se puede implementar la lógica para guardar la medición
  }, []);

  // Handlers específicos para cada card (evitar funciones anónimas)
  const handleProgresoToggle = useCallback(() => {
    handleCardToggle('progreso');
  }, [handleCardToggle]);
  
  const handleRutinaToggle = useCallback(() => {
    handleCardToggle('rutina');
  }, [handleCardToggle]);
  
  const handleComposicionToggle = useCallback(() => {
    handleCardToggle('composicion');
  }, [handleCardToggle]);

  const handleProgresoExpand = useCallback(() => {
    handleCardExpand('progreso');
  }, [handleCardExpand]);
  
  const handleRutinaExpand = useCallback(() => {
    handleCardExpand('rutina');
  }, [handleCardExpand]);
  
  const handleComposicionExpand = useCallback(() => {
    handleCardExpand('composicion');
  }, [handleCardExpand]);

  return {
    activeTab,
    expandedCard,
    commonCardProps,
    handleCardExpand,
    handleCardClose,
    handleCardToggle,
    handleBodyFatMeasurement,
    // Handlers específicos
    handleProgresoToggle,
    handleRutinaToggle,
    handleComposicionToggle,
    handleProgresoExpand,
    handleRutinaExpand,
    handleComposicionExpand,
  };
};

export default useProgressCards;
