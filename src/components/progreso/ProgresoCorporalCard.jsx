import React, { Suspense, lazy, memo } from 'react';
import { FaChartLine, FaWeight, FaChartBar, FaHistory } from 'react-icons/fa';
import BaseProgressCard from './BaseProgressCard';
import CardLoadingFallback from './CardLoadingFallback';

// Lazy loading del componente Evolution original
const Evolution = lazy(() => import('./Evolution'));

const ProgresoCorporalCard = memo(({ isActive, isVisible = true, isExpanded = false, onToggle, onExpand, onClose }) => {
  // Configuración de tabs del submenú
  const navigationTabs = [
    {
      id: 'registrar',
      label: 'Registrar peso',
      description: 'Peso, % grasa y % músculo',
      icon: <FaWeight />
    },
    {
      id: 'graficos',
      label: 'Gráficos corporales',
      description: 'Visualización de evolución',
      icon: <FaChartBar />
    },
    {
      id: 'historial',
      label: 'Historial',
      description: 'Registros editables y filtros',
      icon: <FaHistory />
    }
  ];

  // Stats para el preview
  const previewStats = [
    { icon: FaWeight, label: 'Registrar peso' },
    { icon: FaChartBar, label: 'Gráficos' },
    { icon: FaHistory, label: 'Historial' }
  ];

  // Función para renderizar contenido
  const renderContent = ({ activeSubTab, onShowNavigation }) => {
    if (!activeSubTab) return null;

    // Mapear los tabs de la card a las secciones de Evolution
    const sectionMap = {
      'registrar': 'weight',
      'graficos': 'charts',
      'historial': 'historial'
    };
    
    const evolutionSection = sectionMap[activeSubTab] || 'weight';
    
    return (
      <Suspense fallback={<CardLoadingFallback type="evolution" />}>
        <Evolution 
          defaultSection={evolutionSection} 
          hideGuide={true} 
          onShowNavigation={onShowNavigation}
        />
      </Suspense>
    );
  };

  return (
    <BaseProgressCard
      cardId="progreso"
      cardType="progreso-corporal"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Progreso Corporal"
      description="Registra tu peso, grasa y músculo. Visualiza tu evolución y gestiona tu historial."
      icon={FaChartLine}
      previewStats={previewStats}
      navigationTabs={navigationTabs}
      defaultSubTab="registrar"
      renderContent={renderContent}
      onToggle={onToggle}
      onExpand={onExpand}
      onClose={onClose}
    />
  );
});

ProgresoCorporalCard.displayName = 'ProgresoCorporalCard';

export default ProgresoCorporalCard;
