import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase, auth, userProfiles } from '../lib/supabase';

const AuthContext = createContext(null);

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
      
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Valor del contexto memoizado
  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
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