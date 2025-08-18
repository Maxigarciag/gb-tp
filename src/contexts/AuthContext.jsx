import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase, auth, userProfiles } from '../lib/supabase';

// Hacer el contexto resiliente a HMR para evitar múltiples providers
const getGlobal = () => (typeof window !== 'undefined' ? window : globalThis)
const globalRef = getGlobal()

const AuthContext = globalRef.__getbig_auth_ctx__ || createContext(null);
if (!globalRef.__getbig_auth_ctx__) {
  globalRef.__getbig_auth_ctx__ = AuthContext
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  

  
  // Refs para evitar múltiples eventos
  const lastEventRef = useRef(null);
  const lastEventTimeRef = useRef(0);
  const isProcessingEventRef = useRef(false);

  // Memoizar valores para evitar re-renders innecesarios
  const isAuthenticated = useMemo(() => !!user, [user]);
  const hasProfile = useMemo(() => !!userProfile, [userProfile]);

  // Función optimizada para cargar el perfil del usuario
  const loadUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }

    try {
      // Usar la función de debug para verificar el perfil
      const { exists, isComplete, error: checkError, data: profileData } = await userProfiles.checkExists(userId);
      
      if (checkError) {
        console.error('❌ AuthContext: Error verificando perfil:', checkError);
      }
      
      if (!exists) {
        console.log('ℹ️ AuthContext: El perfil no existe en la base de datos (normal para usuarios nuevos)');
        setUserProfile(null);
        return;
      }
      
      // Si el perfil existe pero está incompleto, manejarlo apropiadamente
      if (exists && !isComplete) {
        console.log('⚠️ AuthContext: Perfil incompleto, necesita configuración');
        setUserProfile(profileData);
        return;
      }
      
      // Si encontramos el perfil completo con checkExists, usarlo directamente
      if (profileData && isComplete) {
        setUserProfile(profileData);
        return;
      }
      
      // Como respaldo, intentar con getCurrent
      const { data, error } = await userProfiles.getCurrent();
      
      if (error) {
        console.error('❌ AuthContext: Error cargando perfil:', error);
        setUserProfile(null);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('❌ AuthContext: Excepción cargando perfil:', error);
      setUserProfile(null);
    }
  }, []);

  // Función optimizada para obtener la sesión inicial
  const getInitialSession = useCallback(async () => {
    try {
      // Intentar obtener la sesión de forma más rápida
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AuthContext: Error obteniendo sesión:', error);
        throw error;
      }
      
      if (session?.user) {
        setUser(session.user);
        
        // Cargar perfil en paralelo sin bloquear la inicialización
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en getInitialSession:', error);
      setError(error.message);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
      setSessionInitialized(true);
    }
  }, [loadUserProfile]);

  // Efecto principal para inicializar la sesión
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      if (!mounted) return;
      
      // Timeout de seguridad más corto para una experiencia más rápida
      const safetyTimeout = setTimeout(() => {
        if (mounted) {
          console.warn('⚠️ AuthContext: Timeout de seguridad alcanzado');
          setLoading(false);
          setSessionInitialized(true);
        }
      }, 3000); // Reducido de 5000 a 3000ms
      
      try {
        await getInitialSession();
      } finally {
        if (mounted) {
          clearTimeout(safetyTimeout);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [getInitialSession]);

  // Función optimizada para manejar eventos de autenticación
  const handleAuthStateChange = useCallback(async (event, session) => {
    const now = Date.now();
    
    // Evitar eventos duplicados en un corto período de tiempo
    if (lastEventRef.current === event && (now - lastEventTimeRef.current) < 1000) {
      return;
    }
    
    // Evitar procesamiento simultáneo de eventos
    if (isProcessingEventRef.current) {
      return;
    }
    
    lastEventRef.current = event;
    lastEventTimeRef.current = now;
    isProcessingEventRef.current = true;
    
    try {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        // Solo actualizar si el usuario cambió
        if (!user || user.id !== session.user.id) {
          setUser(session.user);
        }
        
        // Solo cargar perfil para eventos específicos y si no está cargado
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && !userProfile) {
          setLoading(true);
          try {
            await loadUserProfile(session.user.id);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    } finally {
      isProcessingEventRef.current = false;
    }
  }, [user, userProfile, loadUserProfile]);

  // Escuchar cambios de autenticación con manejo optimizado
  useEffect(() => {
    if (!sessionInitialized) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionInitialized, handleAuthStateChange]);

  // Escuchar eventos de actualización de perfil
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('🔄 AuthContext: Perfil actualizado desde evento', event.detail);
      if (event.detail) {
        setUserProfile(event.detail);
      }
    };

    const handleProfileReload = async () => {
      // Pequeño retraso para asegurar que la base de datos esté sincronizada
      setTimeout(async () => {
        try {
          // Primero verificar si el usuario está autenticado
          const { user: currentUser } = await auth.getCurrentUser();
          if (!currentUser) {
            console.error('❌ AuthContext: No hay usuario autenticado');
            return;
          }
          
          // Verificar si el perfil existe
          const { exists, isComplete, error: checkError, data: profileData } = await userProfiles.checkExists(currentUser.id);
          
          if (checkError) {
            console.error('❌ AuthContext: Error verificando perfil:', checkError);
          }
          
          if (!exists) {
            console.log('ℹ️ AuthContext: El perfil no existe en la base de datos (normal para usuarios nuevos)');
            return;
          }
          
          // Si el perfil existe pero está incompleto, manejarlo apropiadamente
          if (exists && !isComplete) {
            console.log('⚠️ AuthContext: Perfil incompleto, necesita configuración');
            setUserProfile(profileData);
            return;
          }
          
          // Si encontramos el perfil completo con checkExists, usarlo directamente
          if (profileData && isComplete) {
            setUserProfile(profileData);
            return;
          }
          
          const { data, error } = await userProfiles.getCurrent();
          if (!error && data) {
            console.log('✅ AuthContext: Perfil recargado exitosamente');
            setUserProfile(data);
          } else {
            console.error('❌ AuthContext: Error recargando perfil:', error);
            // Intentar con forceReload como respaldo
            const { data: forceData, error: forceError } = await userProfiles.forceReload();
            if (!forceError && forceData) {
              console.log('✅ AuthContext: Perfil recargado exitosamente con forceReload');
              setUserProfile(forceData);
            } else {
              console.error('❌ AuthContext: Error con forceReload también:', forceError);
            }
          }
        } catch (error) {
          console.error('❌ AuthContext: Excepción recargando perfil:', error);
        }
      }, 500);
    };

    console.log('🎧 AuthContext: Registrando listeners para eventos de perfil');
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('profileReload', handleProfileReload);

    return () => {
      console.log('🎧 AuthContext: Removiendo listeners para eventos de perfil');
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('profileReload', handleProfileReload);
    };
  }, []);

  // Función optimizada para registro
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await auth.signUp(email, password, userData);
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función optimizada para inicio de sesión
  const signIn = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Normalizar email
      const normalizedEmail = (email || '').trim().toLowerCase()
      const { data, error } = await auth.signIn(normalizedEmail, password);
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      // Mensaje genérico para no filtrar información sensible
      const generic = 'No se pudo iniciar sesión. Verificá tus datos.'
      setError(generic);
      return { data: null, error: generic };
    } finally {
      setLoading(false);
    }
  }, []);

  // OAuth
  const signInWithProvider = useCallback(async (provider) => {
    try {
      setError(null)
      setLoading(true)
      const { data, error } = await auth.signInWithProvider(provider)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      const generic = 'No se pudo iniciar sesión con el proveedor.'
      setError(generic)
      return { data: null, error: generic }
    } finally {
      setLoading(false)
    }
  }, [])

  // Magic link
  const requestMagicLink = useCallback(async (email) => {
    try {
      setError(null)
      setLoading(true)
      const normalizedEmail = (email || '').trim().toLowerCase()
      const { data, error } = await auth.signInWithMagicLink(normalizedEmail)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      const generic = 'No se pudo enviar el enlace. Intentalo más tarde.'
      setError(generic)
      return { data: null, error: generic }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setError(null)
      setLoading(true)
      const normalizedEmail = (email || '').trim().toLowerCase()
      const { data, error } = await auth.requestPasswordReset(normalizedEmail)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      const generic = 'No se pudo enviar el correo de recuperación.'
      setError(generic)
      return { data: null, error: generic }
    } finally {
      setLoading(false)
    }
  }, [])

  // Función optimizada para cerrar sesión
  const signOut = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      setShouldRedirect(true);
    } catch (error) {
      console.error('❌ AuthContext: Error en signOut:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [setShouldRedirect]);

  // Función optimizada para crear perfil
  const createUserProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      const { data, error } = await userProfiles.create({
        id: user.id,
        ...profileData
      });
      
      if (error) throw error;
      
      setUserProfile(data[0]);
      return { data, error: null };
    } catch (error) {
      console.error('❌ AuthContext: Error creando perfil:', error);
      setError(error.message);
      return { data: null, error: error.message };
    }
  }, [user]);

  // Función optimizada para actualizar perfil
  const updateUserProfile = useCallback(async (updates) => {
    try {
      setError(null);
      const { data, error } = await userProfiles.update(updates);
      
      if (error) throw error;
      
      setUserProfile(data[0]);
      return { data, error: null };
    } catch (error) {
      console.error('❌ AuthContext: Error actualizando perfil:', error);
      setError(error.message);
      return { data: null, error: error.message };
    }
  }, []);



  // Exponer perfil al objeto global para debug (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.userProfile = userProfile;
      window.currentUser = user;
      
      // Función temporal para limpiar y recrear rutina
      window.limpiarYRecrearRutina = async () => {
        if (!userProfile) {
          console.error('❌ No hay perfil de usuario disponible');
          return;
        }
        
        try {
          console.log('🚀 Iniciando limpieza y recreación de rutina...');
          
          // Importar dinámicamente el módulo
          const debugModule = await import('../utils/debugRoutines.js');
          const result = await debugModule.limpiarYRecrearRutina(userProfile);
          
          if (result.success) {
            console.log('✅ Rutina limpiada y recreada exitosamente');
            // Recargar la página para ver los cambios
            window.location.reload();
          } else {
            console.error('❌ Error:', result.error);
          }
        } catch (error) {
          console.error('❌ Error ejecutando limpieza:', error);
        }
      };

      // Función para verificar y corregir ejercicios duplicados
      window.verificarYCorregirRutina = async () => {
        try {
          console.log('🔍 Verificando rutina actual...');
          
          // Importar el store de rutinas
          const { useRoutineStore } = await import('../stores/routineStore.js');
          const routineStore = useRoutineStore.getState();
          
          // Obtener rutina actual
          const { data: routine, error } = await routineStore.loadUserRoutine();
          
          if (error) {
            console.error('❌ Error cargando rutina:', error);
            return;
          }
          
          if (!routine) {
            console.log('ℹ️ No hay rutina activa');
            return;
          }
          
          // Verificar y corregir duplicados
          const needsCorrection = await routineStore.checkAndFixDuplicateExercises(routine);
          
          if (needsCorrection) {
            console.log('✅ Rutina corregida automáticamente');
            // Recargar la página para ver los cambios
            window.location.reload();
          } else {
            console.log('✅ Rutina está correcta, no hay duplicados');
          }
        } catch (error) {
          console.error('❌ Error verificando rutina:', error);
        }
      };
      

    }
  }, [userProfile, user]);

  // Valor del contexto memoizado
  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signInWithProvider,
    requestMagicLink,
    requestPasswordReset,
    signOut,
    shouldRedirect,
    setShouldRedirect,
    createUserProfile,
    updateUserProfile,
    isAuthenticated,
    hasProfile,
    sessionInitialized
  }), [
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    shouldRedirect,
    createUserProfile,
    updateUserProfile,
    isAuthenticated,
    hasProfile,
    sessionInitialized
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};