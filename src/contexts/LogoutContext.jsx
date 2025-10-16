import React, { createContext, useContext, useState, useCallback } from 'react'
import LogoutConfirmDialog from '../components/LogoutConfirmDialog'

const LogoutContext = createContext()

export const useLogoutDialog = () => {
  const context = useContext(LogoutContext)
  if (!context) {
    throw new Error('useLogoutDialog debe ser usado dentro de LogoutProvider')
  }
  return context
}

export const LogoutProvider = ({ children }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const showLogoutDialog = useCallback(() => {
    setShowLogoutConfirm(true)
  }, [])

  const hideLogoutDialog = useCallback(() => {
    setShowLogoutConfirm(false)
    setIsLoggingOut(false)
  }, [])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      const { auth } = await import('../lib/supabase')
      await auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }, [])

  return (
    <LogoutContext.Provider value={{
      showLogoutDialog,
      hideLogoutDialog,
      handleLogout
    }}>
      {children}
      
      {/* Diálogo renderizado a nivel de aplicación */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={hideLogoutDialog}
        isLoading={isLoggingOut}
      />
    </LogoutContext.Provider>
  )
}
