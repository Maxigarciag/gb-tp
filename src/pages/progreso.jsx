import React, { useEffect, useMemo } from 'react';
import AuthOnly from '../components/AuthOnly';
import { useSearchParams } from 'react-router-dom';
import useProgressCards from '../hooks/useProgressCards';

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

const ProgresoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado optimizado con useMemo para evitar re-renders innecesarios
  const urlTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return VALID_TABS.includes(tab) ? tab : null;
  }, [searchParams]);
  
  // Usar el hook personalizado para gestión de estado
  const {
    activeTab,
    expandedCard,
    commonCardProps,
    handleCardExpand,
    handleCardClose,
    handleCardToggle,
    handleBodyFatMeasurement,
  } = useProgressCards(urlTab);

  // Sincronización optimizada de URL
  useEffect(() => {
    if (activeTab && searchParams.get('tab') !== activeTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', activeTab);
      setSearchParams(newParams, { replace: true });
    } else if (!activeTab && searchParams.get('tab')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  return (
    <AuthOnly>
      <div className="progreso-container">
        {/* Dashboard de Resumen Inteligente - Solo visible cuando no hay tarjeta activa */}
        <ProgressDashboard isVisible={!activeTab} />
        
        <ProgresoCorporalCard
          {...commonCardProps}
          isActive={activeTab === 'progreso'}
          isVisible={!activeTab || activeTab === 'progreso'}
          isExpanded={expandedCard === 'progreso'}
          onToggle={() => handleCardToggle('progreso')}
          onExpand={() => handleCardExpand('progreso')}
        />
        
        <RutinaEjerciciosCard 
          {...commonCardProps}
          isActive={activeTab === 'rutina'}
          isVisible={!activeTab || activeTab === 'rutina'}
          isExpanded={expandedCard === 'rutina'}
          onToggle={() => handleCardToggle('rutina')} 
          onExpand={() => handleCardExpand('rutina')}
        />
        
        <ComposicionCorporalCard 
          {...commonCardProps}
          isActive={activeTab === 'composicion'}
          isVisible={!activeTab || activeTab === 'composicion'}
          isExpanded={expandedCard === 'composicion'}
          onToggle={() => handleCardToggle('composicion')}
          onExpand={() => handleCardExpand('composicion')}
          onSaveMeasurement={handleBodyFatMeasurement}
        />
      </div>
    </AuthOnly>
  );
};

export default ProgresoPage; 