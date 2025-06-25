import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, auth, userProfiles } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await userProfiles.getCurrent();
      if (error && error !== 'No authenticated user') {
        console.error('Error loading user profile:', error);
        return;
      }
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

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
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      setError(error.message);
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
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
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