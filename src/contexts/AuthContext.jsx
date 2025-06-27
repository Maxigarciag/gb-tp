import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  useEffect(() => {
    // Timeout de seguridad para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          
          // Intentar cargar perfil con timeout más corto
          try {
            const profilePromise = userProfiles.getCurrent();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout cargando perfil')), 3000)
            );
            
            const { data } = await Promise.race([profilePromise, timeoutPromise]);
            setUserProfile(data);
          } catch (profileError) {
            setUserProfile(null);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ AuthContext: Error getting initial session:', error);
        setError(error.message);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          // Cargar perfil para SIGNED_IN y TOKEN_REFRESHED
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setLoading(true);
            try {
              // Agregar timeout para evitar loading infinito
              const profilePromise = userProfiles.getCurrent();
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout cargando perfil')), 3000)
              );
              
              const { data } = await Promise.race([profilePromise, timeoutPromise]);
              setUserProfile(data);
            } catch (error) {
              setUserProfile(null);
            } finally {
              setLoading(false);
            }
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const signUp = async (email, password, userData = {}) => {
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
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      // No establecer loading aquí, lo maneja onAuthStateChange
      
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      // Limpiar estado primero
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      
      // Hacer el signOut en Supabase
      const { error } = await auth.signOut();
      if (error) throw error;
      
      // Forzar recarga completa
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ AuthContext: Error en signOut:', error);
      setError(error.message);
      
      // Aún así, limpiar el estado y recargar
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      window.location.href = '/';
    }
  };

  const createUserProfile = async (profileData) => {
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
  };

  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      const { data, error } = await userProfiles.update(updates);
      
      if (error) throw error;
      
      setUserProfile(data[0]);
      
      // Forzar recarga del perfil para asegurar sincronización
      const { data: reloadedData } = await userProfiles.forceReload();
      if (reloadedData) {
        setUserProfile(reloadedData);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ AuthContext: Error actualizando perfil:', error);
      setError(error.message);
      return { data: null, error: error.message };
    }
  };

  // Cargar perfil del usuario
  const loadUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const { data, error } = await userProfiles.getCurrent();
      
      if (error) {
        console.error('Error loading user profile:', error);
        setError(error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setError(error.message);
    }
  }, [user]);

  // Cargar perfil cuando cambie el usuario
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const value = {
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
    isAuthenticated: !!user,
    hasProfile: !!userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};