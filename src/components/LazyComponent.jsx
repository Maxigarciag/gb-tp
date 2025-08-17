import React, { Suspense, lazy } from 'react';
import { SpinnerSimple } from './LoadingSpinnerOptimized';

/**
 * Componente wrapper para lazy loading con fallback optimizado
 */
const LazyComponent = ({ component: Component, fallback, ...props }) => {
  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback={fallback || <SpinnerSimple />}>
      <Component {...props} />
    </Suspense>
  );
};

/**
 * Función helper para crear componentes lazy con configuración optimizada
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    fallback = null
  } = options;

  const LazyComponentInstance = lazy(importFunc);

  return (props) => (
    <LazyComponent
      component={LazyComponentInstance}
      fallback={fallback}
      {...props}
    />
  );
};

/**
 * Componentes lazy predefinidos para la aplicación
 */
export const LazyHome = createLazyComponent(() => import('../pages/home.jsx'));
export const LazyAbout = createLazyComponent(() => import('../pages/about.jsx'));
export const LazyContact = createLazyComponent(() => import('../pages/contact.jsx'));
export const LazyProfile = createLazyComponent(() => import('../pages/profile.jsx'));
export const LazyCalendarioRutina = createLazyComponent(() => import('./CalendarioRutina.jsx'));
export const LazyFormulario = createLazyComponent(() => import('./FormularioOptimized.jsx'));
export const LazyRoutineSelector = createLazyComponent(() => import('./RoutineSelector.jsx'));
export const LazyCustomRoutineBuilder = createLazyComponent(() => import('./CustomRoutineBuilder.jsx'));
export const LazyRoutinesManager = createLazyComponent(() => import('../pages/rutinas.jsx'));

export default LazyComponent; 