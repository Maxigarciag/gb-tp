import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user, userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error en logout:', error);
    }
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const getUserDisplayName = () => {
    if (userProfile?.nombre) return userProfile.nombre;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getDiasPorSemana = () => {
    if (!userProfile?.dias_semana) return 0;
    return parseInt(userProfile.dias_semana.split('_')[0]);
  };

  return (
    <div className="user-profile" ref={dropdownRef}>
      <button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Perfil de usuario"
      >
        <div className="profile-avatar">
          {getUserInitials()}
        </div>
        <span className="profile-name">
          {getUserDisplayName()}
        </span>
        <motion.div
          className="profile-arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="profile-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="dropdown-header">
              <div className="dropdown-avatar">
                {getUserInitials()}
              </div>
              <div className="dropdown-info">
                <div className="dropdown-name">{getUserDisplayName()}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleProfileClick}>
                <i className="fas fa-user"></i>
                Mi Perfil Completo
              </button>
              
              <button className="dropdown-item" onClick={() => { navigate('/rutina'); setIsOpen(false); }}>
                <i className="fas fa-dumbbell"></i>
                Ver Mi Rutina
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button
                className="dropdown-item logout-item"
                onClick={handleSignOut}
              >
                <i className="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;