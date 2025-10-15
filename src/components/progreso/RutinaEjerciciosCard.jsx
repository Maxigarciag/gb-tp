import React, { Suspense, lazy, memo } from 'react'
import PropTypes from 'prop-types'
import { FaDumbbell, FaPlay, FaChartLine, FaFire } from 'react-icons/fa'
import BaseProgressCard from './BaseProgressCard'
import CardLoadingFallback from './CardLoadingFallback'

// Lazy loading de componentes
const ProfessionalWorkoutTracker = lazy(() => import('./ProfessionalWorkoutTracker'))
const Evolution = lazy(() => import('./Evolution'))

/**
 * Card de rutina y ejercicios con navegación interna
 * @param {Object} props - Props del componente
 */
const RutinaEjerciciosCard = memo(({ isActive, isVisible = true, isExpanded = false, onToggle, onExpand, onClose }) => {
  // Configuración de tabs del submenú
  const navigationTabs = [
    {
      id: 'rutina-hoy',
      label: 'Rutina de hoy',
      description: 'Gestiona tu sesión diaria',
      icon: FaPlay
    },
    {
      id: 'graficos-ejercicios',
      label: 'Gráficos de ejercicios',
      description: 'Progreso por ejercicio',
      icon: FaChartLine
    }
  ];

  // Stats para el preview
  const previewStats = [
    { icon: FaPlay, label: 'Rutina de hoy' },
    { icon: FaChartLine, label: 'Progreso' },
    { icon: FaFire, label: 'Ejercicios' }
  ];

  // Función para renderizar contenido
  const renderContent = ({ activeSubTab, onShowNavigation }) => {
    if (!activeSubTab) return null;

    switch (activeSubTab) {
      case 'rutina-hoy':
        return (
          <Suspense fallback={<CardLoadingFallback type="routine" />}>
            <ProfessionalWorkoutTracker />
          </Suspense>
        );
      case 'graficos-ejercicios':
        return (
          <Suspense fallback={<CardLoadingFallback type="charts" />}>
            <Evolution 
              defaultSection="exerciseCharts" 
              hideGuide={true} 
              onShowNavigation={onShowNavigation}
              isInternalNavigation={true}
            />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<CardLoadingFallback type="routine" />}>
            <ProfessionalWorkoutTracker />
          </Suspense>
        );
    }
  };

  return (
    <BaseProgressCard
      cardId="rutina"
      cardType="rutina-ejercicios"
      isActive={isActive}
      isVisible={isVisible}
      isExpanded={isExpanded}
      title="Rutina y Ejercicios"
      description="Gestiona tu rutina diaria, visualiza el progreso de ejercicios y revisa tu historial de sesiones."
      icon={FaDumbbell}
      previewStats={previewStats}
      navigationTabs={navigationTabs}
      defaultSubTab="rutina-hoy"
      renderContent={renderContent}
      onToggle={onToggle}
      onExpand={onExpand}
      onClose={onClose}
    />
  )
})

RutinaEjerciciosCard.displayName = 'RutinaEjerciciosCard'

RutinaEjerciciosCard.propTypes = {
	isActive: PropTypes.bool.isRequired,
	isVisible: PropTypes.bool,
	isExpanded: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	onExpand: PropTypes.func,
	onClose: PropTypes.func
}

export default RutinaEjerciciosCard
