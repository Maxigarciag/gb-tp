import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUIStore, useUserStore } from '../../stores'
import { useLogoutDialog } from '../../contexts/LogoutContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Dumbbell, LogOut, Settings, Activity, Target } from 'lucide-react'
import '../../styles/components/usuario/UserProfile.css'

/**
 * Menú desplegable del perfil de usuario con opciones de navegación y logout
 */
const UserProfileOptimized = () => {
  const { user, userProfile } = useAuth();
  const { showSuccess } = useUIStore();
  const { updateUserProfile, loading: profileLoading } = useUserStore();
  const { showLogoutDialog } = useLogoutDialog();
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

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Memoizar el nombre de usuario para evitar recálculos
  const userDisplayName = useMemo(() => {
    if (userProfile?.nombre && userProfile.nombre.trim() !== '') return userProfile.nombre;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  }, [userProfile?.nombre, user?.user_metadata?.full_name, user?.email]);

  // Memoizar las iniciales del usuario
  const userInitials = useMemo(() => {
    return userDisplayName.charAt(0).toUpperCase();
  }, [userDisplayName]);

  // Memoizar el nivel de experiencia del usuario
  const experienceLevel = useMemo(() => {
    if (!userProfile?.nivel_experiencia) return 'Principiante';
    
    const levels = {
      'principiante': 'Principiante',
      'intermedio': 'Intermedio',
      'avanzado': 'Avanzado'
    };
    
    return levels[userProfile.nivel_experiencia] || 'Principiante';
  }, [userProfile?.nivel_experiencia]);

  // Memoizar los días de entrenamiento
  const trainingDays = useMemo(() => {
    if (!userProfile?.dias_semana) return '3 días';
    
    const daysMap = {
      '3_dias': '3 días',
      '4_dias': '4 días',
      '5_dias': '5 días',
      '6_dias': '6 días'
    };
    
    return daysMap[userProfile.dias_semana] || '3 días';
  }, [userProfile?.dias_semana]);

  // Navegar al perfil
  const handleProfileClick = useCallback(() => {
    navigate('/profile');
    setIsOpen(false);
  }, [navigate]);

  // Navegar a la rutina
  const handleRutinaClick = useCallback(() => {
    navigate('/rutina');
    setIsOpen(false);
  }, [navigate]);

  // Manejar clic en logout
  const handleLogoutClick = useCallback(() => {
    showLogoutDialog();
    setIsOpen(false);
  }, [showLogoutDialog]);

  // Animaciones
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transformOrigin: 'top right'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <>
      <div className="user-profile" ref={dropdownRef}>
        <button
          className="profile-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Perfil de usuario"
          aria-expanded={isOpen}
          aria-haspopup="true"
          disabled={profileLoading}
        >
          <motion.div 
            className="profile-avatar"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {userInitials}
          </motion.div>
          <span className="profile-name">{userDisplayName}</span>
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
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="dropdown-header">
                <motion.div 
                  className="dropdown-avatar"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  {userInitials}
                </motion.div>
                <div className="dropdown-info">
                  <div className="dropdown-name">{userDisplayName}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <motion.div 
                className="dropdown-menu"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button 
                  className="dropdown-item" 
                  onClick={handleProfileClick}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User size={16} />
                  <span>Mi Perfil Completo</span>
                </motion.button>

                <motion.button 
                  className="dropdown-item" 
                  onClick={handleRutinaClick}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Dumbbell size={16} />
                  <span>Ver Mi Rutina</span>
                </motion.button>

                <div className="dropdown-divider"></div>

                <motion.button 
                  className="dropdown-item logout-item" 
                  onClick={handleLogoutClick}
                  whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default UserProfileOptimized 