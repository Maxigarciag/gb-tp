import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente wrapper para lazy loading con fallback optimizado
 */
const LazyComponent = ({ component: Component, fallback, ...props }) => {
  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback={fallback || <LoadingSpinner variant="dots" />}>
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
  () => import('../pages/home'),
  { loadingMessage: "Cargando página principal..." }
);

export const LazyAbout = createLazyComponent(
  () => import('../pages/About'),
  { loadingMessage: "Cargando información..." }
);

export const LazyContact = createLazyComponent(
  () => import('../pages/Contact'),
  { loadingMessage: "Cargando contacto..." }
);

export const LazyProfile = createLazyComponent(
  () => import('../pages/profile'),
  { loadingMessage: "Cargando perfil..." }
);

export const LazyCalendarioRutina = createLazyComponent(
  () => import('./CalendarioRutina'),
  { loadingMessage: "Cargando rutina..." }
);

export const LazyFormulario = createLazyComponent(
  () => import('./Formulario'),
  { loadingMessage: "Cargando formulario..." }
);

export default LazyComponent; 