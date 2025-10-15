import React from 'react'
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SpinnerSimple } from './LoadingSpinnerOptimized'

/**
 * Componente que protege rutas requiriendo autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si está autenticado
 * @param {string} props.redirectTo - Ruta a la que redirigir si no está autenticado
 */
function AuthOnly ({ children, redirectTo = '/' }) {
  const { user, sessionInitialized, loading } = useAuth()

  if (!sessionInitialized || loading) {
    return <SpinnerSimple size="small" ariaLabel="Cargando..." />
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

AuthOnly.propTypes = {
	children: PropTypes.node.isRequired,
	redirectTo: PropTypes.string
}

export default AuthOnly


