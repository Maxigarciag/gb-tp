import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/**
 * Hook personalizado para gestionar el estado de las cards de progreso
 * Centraliza la lógica de navegación y estado para mejor reutilización
 */
export const useProgressCards = (initialTab = null, onUrlUpdate = null, navigationKey = null) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedCard, setExpandedCard] = useState(initialTab);
  const lastNavigationKey = useRef(navigationKey);
  const isUserInteracting = useRef(false);

  // Resetear estado cuando hay una nueva navegación (clic en navbar)
  useEffect(() => {
    // Solo resetear si es navegación externa (navbar), no interacción del usuario
    if (navigationKey && navigationKey !== lastNavigationKey.current && !isUserInteracting.current) {
      lastNavigationKey.current = navigationKey;
      setActiveTab(initialTab);
      setExpandedCard(initialTab);
    }
    isUserInteracting.current = false;
  }, [navigationKey, initialTab]);

  // Callbacks memoizados para evitar re-renders
  const handleCardExpand = useCallback((cardId) => {
    isUserInteracting.current = true;
    setExpandedCard(cardId);
    setActiveTab(cardId);
    if (onUrlUpdate) onUrlUpdate(cardId);
  }, [onUrlUpdate]);

  const handleCardClose = useCallback(() => {
    setExpandedCard(null);
    setActiveTab(null);
    if (onUrlUpdate) onUrlUpdate(null);
  }, [onUrlUpdate]);

  const handleCardToggle = useCallback((cardId) => {
    isUserInteracting.current = true;
    setActiveTab(prevActiveTab => {
      const newTab = prevActiveTab === cardId ? null : cardId;
      if (onUrlUpdate) onUrlUpdate(newTab);
      return newTab;
    });
  }, [onUrlUpdate]);

  // Props comunes para todas las cards
  const commonCardProps = useMemo(() => ({
    onClose: handleCardClose,
  }), [handleCardClose]);

  // Handlers específicos para cada card (evitar funciones anónimas)
  const handleProgresoToggle = useCallback(() => {
    handleCardToggle('progreso');
  }, [handleCardToggle]);
  
  const handleEjerciciosToggle = useCallback(() => {
    handleCardToggle('ejercicios');
  }, [handleCardToggle]);
  
  const handleComposicionToggle = useCallback(() => {
    handleCardToggle('composicion');
  }, [handleCardToggle]);

  const handleProgresoExpand = useCallback(() => {
    handleCardExpand('progreso');
  }, [handleCardExpand]);
  
  const handleEjerciciosExpand = useCallback(() => {
    handleCardExpand('ejercicios');
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
    // Handlers específicos
    handleProgresoToggle,
    handleEjerciciosToggle,
    handleComposicionToggle,
    handleProgresoExpand,
    handleEjerciciosExpand,
    handleComposicionExpand,
  };
};

export default useProgressCards;
