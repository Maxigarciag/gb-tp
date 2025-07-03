import React, { Suspense, lazy } from 'react';
import LoadingSpinnerOptimized from './LoadingSpinnerOptimized';

/**
 * Componente wrapper para lazy loading con fallback optimizado
 */
const LazyComponent = ({ component: Component, fallback, ...props }) => {
  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback={fallback || <LoadingSpinnerOptimized variant="dots" />}>
      <Component {...props} />
    </Suspense>
  );
};

/**
 * Función helper para crear componentes lazy con configuración optimizada
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    fallback = null,
    loadingMessage = "Cargando...",
    size = "medium"
  } = options;

  const LazyComponentInstance = lazy(importFunc);

  return (props) => (
    <LazyComponent
      component={LazyComponentInstance}
      fallback={fallback}
      loadingMessage={loadingMessage}
      size={size}
      {...props}
    />
  );
};

/**
 * Componentes lazy predefinidos para la aplicación
 */
export const LazyHome = createLazyComponent(
  () => import('../pages/home.jsx'),
  { loadingMessage: "Cargando página principal..." }
);

export const LazyAbout = createLazyComponent(
  () => import('../pages/about.jsx'),
  { loadingMessage: "Cargando información..." }
);

export const LazyContact = createLazyComponent(
  () => import('../pages/contact.jsx'),
  { loadingMessage: "Cargando contacto..." }
);

export const LazyProfile = createLazyComponent(
  () => import('../pages/profile.jsx'),
  { loadingMessage: "Cargando perfil..." }
);

export const LazyCalendarioRutina = createLazyComponent(
  () => import('./CalendarioRutina.jsx'),
  { loadingMessage: "Cargando rutina..." }
);

export const LazyFormulario = createLazyComponent(
  () => import('./FormularioOptimized.jsx'),
  { loadingMessage: "Cargando formulario..." }
);

export default LazyComponent; 