import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AuthOnly from '../components/AuthOnly';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useProgressCards from '../hooks/useProgressCards';
import { forceProgressRefresh, markProgressRefresh } from '../utils/cacheUtils';

// Importar las nuevas cards
import ProgresoCorporalCard from '../components/progreso/ProgresoCorporalCard';
import RutinaEjerciciosCard from '../components/progreso/RutinaEjerciciosCard';
import ComposicionCorporalCard from '../components/progreso/ComposicionCorporalCard';
import ProgressDashboard from '../components/progreso/ProgressDashboard';

// Importar estilos
import '../styles/ProgresoCards.css';
import '../styles/ProgressDashboard.css';

// Constantes para tabs válidos
const VALID_TABS = ['progreso', 'rutina', 'composicion'];
// Tabs de navegación interna que no deben resetear el estado principal
const INTERNAL_TABS = ['evolucion', 'logros', 'graficos', 'peso', 'grasa', 'musculo'];

const ProgresoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado optimizado con useMemo para evitar re-renders innecesarios
  const urlTab = useMemo(() => {
    const tab = searchParams.get('tab');
    
    // Si es un tab interno, mantener el tab principal anterior o null
    if (INTERNAL_TABS.includes(tab)) {
      return null;
    }
    
    // Solo considerar tabs principales
    return VALID_TABS.includes(tab) ? tab : null;
  }, [searchParams]);
  
  // Función para limpiar la URL
  const handleUrlCleanup = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Usar el hook personalizado para gestión de estado
  const {
    activeTab,
    expandedCard,
    commonCardProps,
    handleBodyFatMeasurement,
    // Handlers específicos
    handleProgresoToggle,
    handleRutinaToggle,
    handleComposicionToggle,
    handleProgresoExpand,
    handleRutinaExpand,
    handleComposicionExpand,
  } = useProgressCards(urlTab, handleUrlCleanup);

	// Inicializar después de que se determine el estado inicial
	useEffect(() => {
		if (userProfile?.id) {
			setIsInitialized(true);
		}
	}, [userProfile?.id]);

  // Forzar refresh de datos al entrar a la página de progreso
  useEffect(() => {
    if (userProfile?.id) {
      // Limpiar caché y forzar refresh usando utilidades
      forceProgressRefresh(userProfile.id, 'navigation');
      
      // Marcar el refresh para tracking
      markProgressRefresh(userProfile.id);
    }
  }, [userProfile?.id]);

  // Sincronización de URL cuando cambia activeTab
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    
    // Solo sincronizar si no estamos en navegación interna
    const isInternalNavigation = INTERNAL_TABS.includes(currentTab);
    
    // Si activeTab es null (card cerrada), limpiar URL
    if (activeTab === null && currentTab !== null && !isInternalNavigation) {
      setSearchParams({}, { replace: true });
    }
    // Si activeTab cambió y no es navegación interna, actualizar URL
    else if (activeTab !== currentTab && !isInternalNavigation && VALID_TABS.includes(activeTab)) {
      const newParams = new URLSearchParams();
      newParams.set('tab', activeTab);
      setSearchParams(newParams, { replace: true });
    }
  }, [activeTab, setSearchParams, searchParams]);

  // No renderizar nada hasta que esté inicializado para evitar parpadeos
  if (!isInitialized) {
    return <AuthOnly><div className="progreso-container" /></AuthOnly>;
  }


  return (
    <AuthOnly>
      <div className="progreso-container">
        {/* Dashboard de Resumen Inteligente - Solo visible en la página principal de progreso (sin tab en URL) */}
        <ProgressDashboard isVisible={!searchParams.get('tab')} />
        
        <ProgresoCorporalCard
          {...commonCardProps}
          isActive={activeTab === 'progreso'}
          isVisible={!activeTab || activeTab === 'progreso'}
          isExpanded={expandedCard === 'progreso'}
          onToggle={handleProgresoToggle}
          onExpand={handleProgresoExpand}
        />
        
        <RutinaEjerciciosCard 
          {...commonCardProps}
          isActive={activeTab === 'rutina'}
          isVisible={!activeTab || activeTab === 'rutina'}
          isExpanded={expandedCard === 'rutina'}
          onToggle={handleRutinaToggle} 
          onExpand={handleRutinaExpand}
        />
        
        <ComposicionCorporalCard 
          {...commonCardProps}
          isActive={activeTab === 'composicion'}
          isVisible={!activeTab || activeTab === 'composicion'}
          isExpanded={expandedCard === 'composicion'}
          onToggle={handleComposicionToggle}
          onExpand={handleComposicionExpand}
          onSaveMeasurement={handleBodyFatMeasurement}
        />
      </div>
    </AuthOnly>
  );
};

export default ProgresoPage; 