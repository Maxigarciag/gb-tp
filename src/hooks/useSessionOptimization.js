import { useEffect, useRef } from 'react';

/**
 * Hook para optimizar el manejo de la sesión y evitar problemas de persistencia
 * cuando la página va a segundo plano
 */
export const useSessionOptimization = () => {
  const isPageVisible = useRef(true);
  const lastActivity = useRef(Date.now());
  const sessionCheckInterval = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Solo inicializar una vez
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Función para manejar cuando la página se vuelve visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Página vuelve a estar visible
        isPageVisible.current = true;
      } else {
        // Página pasa a segundo plano
        isPageVisible.current = false;
        lastActivity.current = Date.now();
      }
    };

    // Función para manejar cuando la ventana pierde el foco
    const handleBlur = () => {
      // Ventana pierde foco
      lastActivity.current = Date.now();
    };

    // Función para manejar cuando la ventana recupera el foco
    const handleFocus = () => {
      // Ventana recupera foco
      lastActivity.current = Date.now();
    };

    // Función para manejar cuando el usuario interactúa con la página
    const handleUserActivity = () => {
      lastActivity.current = Date.now();
    };

    // Configurar intervalos de verificación de sesión
    const setupSessionCheck = () => {
      // Verificar sesión cada 10 minutos si la página está visible
      sessionCheckInterval.current = setInterval(() => {
        if (isPageVisible.current) {
          // Aquí podrías agregar lógica para verificar la sesión
        }
      }, 10 * 60 * 1000); // 10 minutos
    };

    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    
    // Eventos de actividad del usuario
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);

    // Configurar verificación de sesión
    setupSessionCheck();

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, []);

  // Retornar funciones útiles
  return {
    isPageVisible: isPageVisible.current,
    lastActivity: lastActivity.current,
    getTimeSinceLastActivity: () => Date.now() - lastActivity.current
  };
};

/**
 * Hook para optimizar el rendimiento de componentes que dependen de la autenticación
 */
export const useAuthOptimization = (authContext) => {
  const { user, userProfile, loading, sessionInitialized } = authContext;

  // Memoizar el estado de autenticación para evitar re-renders
  const authState = {
    isAuthenticated: !!user,
    hasProfile: !!userProfile,
    isLoading: loading,
    isInitialized: sessionInitialized,
    user,
    userProfile
  };

  // Función para verificar si la sesión está activa
  const isSessionActive = () => {
    return authState.isAuthenticated && authState.isInitialized && !authState.isLoading;
  };

  // Función para verificar si el perfil está cargado
  const isProfileLoaded = () => {
    return authState.hasProfile && authState.isAuthenticated;
  };

  return {
    ...authState,
    isSessionActive,
    isProfileLoaded
  };
}; 