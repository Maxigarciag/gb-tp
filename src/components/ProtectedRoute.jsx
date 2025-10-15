import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthPage from './auth/AuthPage'

/**
 * Componente para proteger rutas que requieren autenticación
 * Muestra página de autenticación si no hay usuario
 */
const ProtectedRoute = () => {
	const { user } = useAuth()

	// Si no hay usuario, mostrar página de autenticación
	if (!user) {
		return <AuthPage />
	}

	// Este componente no debería renderizarse si hay usuario
	return null
}

export default ProtectedRoute