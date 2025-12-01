import React, { Suspense, lazy } from 'react'
import PropTypes from 'prop-types'
import { SpinnerSimple } from './LoadingSpinnerOptimized'

/**
 * Componente wrapper para lazy loading con fallback optimizado
 * @param {Object} props
 * @param {React.ComponentType} props.component - Componente lazy a renderizar
 * @param {React.ReactNode} props.fallback - Fallback mientras carga
 */
const LazyComponent = ({ component: Component, fallback, ...props }) => {
  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback={fallback || <SpinnerSimple />}>
      <Component {...props} />
    </Suspense>
  )
}

LazyComponent.propTypes = {
	component: PropTypes.elementType,
	fallback: PropTypes.node
}

/**
 * Función helper para crear componentes lazy con configuración optimizada
 * @param {Function} importFunc - Función que retorna la promesa de import
 * @param {Object} options - Opciones de configuración
 * @param {React.ReactNode} options.fallback - Fallback personalizado
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
export const LazyHome = createLazyComponent(() => import('../../pages/home'));
export const LazyAbout = createLazyComponent(() => import('../../pages/about'));
export const LazyContact = createLazyComponent(() => import('../../pages/contact'));
export const LazyProfile = createLazyComponent(() => import('../../pages/profile'));
export const LazyCalendarioRutina = createLazyComponent(() => import('../rutinas/CalendarioRutina'));
export const LazyFormulario = createLazyComponent(() => import('../rutinas/FormularioOptimized'));
export const LazyRoutineSelector = createLazyComponent(() => import('../rutinas/RoutineSelector'));
export const LazyCustomRoutineBuilder = createLazyComponent(() => import('../rutinas/CustomRoutineBuilder'));
export const LazyRoutinesManager = createLazyComponent(() => import('../../pages/rutinas'));
export const LazyCustomExercisesManager = createLazyComponent(() => import('../../pages/ejercicios-personalizados'))

export default LazyComponent 