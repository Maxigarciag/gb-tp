import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SpinnerSimple } from './LoadingSpinnerOptimized'

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

export default AuthOnly


