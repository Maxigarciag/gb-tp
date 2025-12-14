/**
 * Página principal de progreso con cards expandibles y dashboard
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import { useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import useProgressCards from '@/hooks/useProgressCards'
import { forceProgressRefresh, markProgressRefresh } from '@/utils/cacheUtils'

// Importar las nuevas cards
import ProgresoCorporalCard from '@/features/progreso/components/ProgresoCorporalCard'
import RutinaEjerciciosCard from '@/features/progreso/components/RutinaEjerciciosCard'
import ComposicionCorporalCard from '@/features/progreso/components/ComposicionCorporalCard'
import ProgressDashboard from '@/features/progreso/components/ProgressDashboard'

// Importar estilos
import '@/styles/components/progreso/ProgresoCards.css'
import '@/styles/components/progreso/ProgressDashboard.css'

// Constantes para tabs válidos
const VALID_TABS = ['progreso', 'rutina', 'composicion'];

const ProgresoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  // Estado optimizado con useMemo para evitar re-renders innecesarios
  const urlTab = useMemo(() => {
    const tab = searchParams.get('tab');
    // Solo considerar tabs principales
    return VALID_TABS.includes(tab) ? tab : null;
  }, [searchParams]);
  
  // Función para actualizar la URL según el tab activo
  const handleUrlUpdate = useCallback((tab) => {
    if (tab) {
      setSearchParams({ tab }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);

  // Usar el hook personalizado para gestión de estado
  const {
    activeTab,
    expandedCard,
    commonCardProps,
    // Handlers específicos
    handleProgresoToggle,
    handleRutinaToggle,
    handleComposicionToggle,
    handleProgresoExpand,
    handleRutinaExpand,
    handleComposicionExpand,
  } = useProgressCards(urlTab, handleUrlUpdate, location.key);

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


  // No renderizar nada hasta que esté inicializado para evitar parpadeos
  if (!isInitialized) {
    return <AuthOnly><div className="progreso-container" /></AuthOnly>;
  }


  return (
    <AuthOnly>
      <div className="progreso-container">
        {/* Dashboard de Resumen Inteligente - Solo visible cuando ninguna card está activa */}
        <ProgressDashboard isVisible={activeTab === null} />
        
        <ProgresoCorporalCard
          {...commonCardProps}
          isActive={activeTab === 'progreso'}
          isVisible={activeTab === null || activeTab === 'progreso'}
          isExpanded={expandedCard === 'progreso'}
          onToggle={handleProgresoToggle}
          onExpand={handleProgresoExpand}
        />
        
        <RutinaEjerciciosCard 
          {...commonCardProps}
          isActive={activeTab === 'rutina'}
          isVisible={activeTab === null || activeTab === 'rutina'}
          isExpanded={expandedCard === 'rutina'}
          onToggle={handleRutinaToggle} 
          onExpand={handleRutinaExpand}
        />
        
        <ComposicionCorporalCard 
          {...commonCardProps}
          isActive={activeTab === 'composicion'}
          isVisible={activeTab === null || activeTab === 'composicion'}
          isExpanded={expandedCard === 'composicion'}
          onToggle={handleComposicionToggle}
          onExpand={handleComposicionExpand}
        />
      </div>
    </AuthOnly>
  );
};

export default ProgresoPage; 