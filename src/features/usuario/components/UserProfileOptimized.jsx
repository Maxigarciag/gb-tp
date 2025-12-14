import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUIStore, useUserStore } from '@/stores'
import { useLogoutDialog } from '@/contexts/LogoutContext'
import { useNavigate } from 'react-router-dom'
import { User, Dumbbell, LogOut, Settings, Activity, Target } from 'lucide-react'
import '@/styles/components/usuario/UserProfile.css'

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

  return (
    <>
      <div className="user-profile" ref={dropdownRef}>
        <button
          className={`profile-trigger ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Perfil de usuario"
          aria-expanded={isOpen}
          aria-haspopup="true"
          disabled={profileLoading}
        >
          <div 
            className="profile-avatar"
          >
            {userInitials}
          </div>
          <span className="profile-name">{userDisplayName}</span>
          <span
            className="profile-arrow"
          >
            ▼
          </span>
        </button>

        <div
          className={`profile-dropdown ${isOpen ? 'is-open' : ''}`}
          aria-hidden={!isOpen}
        >
          <div className="dropdown-header">
            <div 
              className="dropdown-avatar"
            >
              {userInitials}
            </div>
            <div className="dropdown-info">
              <div className="dropdown-name">{userDisplayName}</div>
              <div className="dropdown-email">{user?.email}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div 
            className="dropdown-menu"
          >
            <button 
              className="dropdown-item" 
              onClick={handleProfileClick}
            >
              <User size={16} />
              <span>Mi Perfil Completo</span>
            </button>

            <button 
              className="dropdown-item" 
              onClick={handleRutinaClick}
            >
              <Dumbbell size={16} />
              <span>Ver Mi Rutina</span>
            </button>

            <div className="dropdown-divider"></div>

            <button 
              className="dropdown-item logout-item" 
              onClick={handleLogoutClick}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserProfileOptimized 