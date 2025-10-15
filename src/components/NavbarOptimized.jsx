import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUIStore } from '../stores'
import UserProfileOptimized from './UserProfileOptimized'
import ThemeToggleOptimized from './ThemeToggleOptimized'
import { motion, AnimatePresence } from 'framer-motion'
import logoBlanco from '../assets/GB-LOGOBLANCO.png'
import logoAzulClaro from '../assets/GB-LOGOAZULCLARO.png'
import { debugLog } from '../utils/debug'
import { Home, Info, Dumbbell, Mail, Menu, X, BarChart2, User, LogOut } from 'lucide-react'
import '../styles/Navbar.css'

/**
 * Navbar optimizado con menú responsive, perfil de usuario y toggle de tema
 */
function NavbarOptimized () {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, theme } = useUIStore();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuMode, setMobileMenuMode] = useState('navigation'); // 'navigation' o 'profile'

  // Optimizar el manejo del scroll con useCallback
  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > 20;
    if (isScrolled !== scrolled) {
      setScrolled(isScrolled);
    }
  }, [scrolled]);

  // Add scroll effect with optimized listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileMenu();
    setMobileMenuMode('navigation'); // Resetear al modo navegación
  }, [location.pathname, closeMobileMenu]);

  // Funciones para cambiar el modo del menú
  const handleShowProfile = useCallback(() => {
    setMobileMenuMode('profile');
  }, []);

  const handleBackToNavigation = useCallback(() => {
    setMobileMenuMode('navigation');
  }, []);


  // Funciones de navegación del perfil
  const handleNavigateToProfile = useCallback(() => {
    closeMobileMenu();
    window.location.href = '/profile';
  }, [closeMobileMenu]);

  const handleNavigateToRoutine = useCallback(() => {
    closeMobileMenu();
    window.location.href = '/rutina';
  }, [closeMobileMenu]);

  const handleLogout = useCallback(async () => {
    closeMobileMenu()
    try {
      const { signOut } = await import('../lib/supabase')
      await signOut()
      window.location.href = '/'
    } catch (error) {
      // Error silencioso, el usuario verá que no se cerró la sesión
    }
  }, [closeMobileMenu])



  // Navegación optimizada
  const navItems = isAuthenticated ? [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/rutina", label: "Rutina", icon: Dumbbell },
    { path: "/progreso", label: "Progreso", icon: BarChart2 },
    { path: "/contact", label: "Contact", icon: Mail },
  ] : [
    { path: "/", label: "Home", icon: Home },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const normalizePath = (p) => (p === '/' ? '/' : p.replace(/\/+$/, ''));
  const isActive = (path) => {
    const current = normalizePath(location.pathname);
    const target = normalizePath(path);
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target + '/');
  };

  return (
    <motion.nav 
      className={`navbar ${scrolled ? "scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo + Nombre */}
      <div className="logo-section">
        {/** Selección de logo según tema */}
        {/** Blanco para tema oscuro, azul claro para tema claro */}
        <motion.img
          src={theme === 'dark' ? logoBlanco : logoAzulClaro}
          alt="Get Big"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        <span>Get Big</span>
      </div>
      
      {/* Navegación principal (solo esenciales) */}
      <div className="nav-main">
        <Link 
          to="/"
          className={isActive("/") ? "active" : ""}
          aria-current={isActive("/") ? "page" : undefined}
        >
          <Home size={16} />
          Home
        </Link>
        <Link 
          to="/contact"
          className={isActive("/contact") ? "active" : ""}
          aria-current={isActive("/contact") ? "page" : undefined}
        >
          <Mail size={16} />
          Contact
        </Link>
        {isAuthenticated && (
          <>
            <Link 
              to="/rutina"
              className={isActive("/rutina") ? "active" : ""}
              aria-current={isActive("/rutina") ? "page" : undefined}
            >
              <Dumbbell size={16} />
              Rutina
            </Link>
            <Link 
              to="/progreso"
              className={isActive("/progreso") ? "active" : ""}
              aria-current={isActive("/progreso") ? "page" : undefined}
              onMouseEnter={() => import('../pages/progreso.jsx')}
            >
              <BarChart2 size={16} />
              Progreso
            </Link>
          </>
        )}
      </div>
      
      {/* Controles secundarios */}
      <div className="nav-controls">
        <div className="desktop-controls">
          <ThemeToggleOptimized variant="icon" size="medium" showLabel={false} />
          {isAuthenticated && <UserProfileOptimized />}
        </div>
        
        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          whileTap={{ scale: 0.95 }}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeMobileMenu}
          >
            <motion.div
              id="mobile-nav-menu"
              className={`mobile-nav-menu ${mobileMenuMode === 'profile' ? 'profile-mode' : ''}`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {mobileMenuMode === 'navigation' ? (
                <>
                  {/* Header del menú de navegación */}
                  <div className="mobile-nav-header">
                    <div className="mobile-nav-title">Menú</div>
                    <div className="mobile-nav-spacer"></div>
                  </div>

                  {/* Enlaces de navegación */}
                  <div className="mobile-nav-links">
                    <Link 
                      to="/"
                      className={isActive("/") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <Home size={20} />
                      Home
                    </Link>
                    <Link 
                      to="/contact"
                      className={isActive("/contact") ? "active" : ""}
                      onClick={closeMobileMenu}
                    >
                      <Mail size={20} />
                      Contact
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link 
                          to="/rutina"
                          className={isActive("/rutina") ? "active" : ""}
                          onClick={closeMobileMenu}
                        >
                          <Dumbbell size={20} />
                          Rutina
                        </Link>
                        <Link 
                          to="/progreso"
                          className={isActive("/progreso") ? "active" : ""}
                          onClick={closeMobileMenu}
                        >
                          <BarChart2 size={20} />
                          Progreso
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Controles del menú de navegación */}
                  <div className="mobile-controls">
                    <div className="mobile-theme-toggle">
                      <ThemeToggleOptimized variant="icon" size="large" showLabel={false} />
                    </div>
                    {isAuthenticated && (
                      <div className="mobile-user-profile">
                            <motion.button 
                              className="mobile-profile-trigger"
                              onClick={handleShowProfile}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Abrir perfil"
                            >
                              <div className="profile-avatar-mobile">
                                {user?.user_metadata?.nombre?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <User size={16} />
                            </motion.button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Header del menú de perfil */}
                  <div className="mobile-nav-header">
                    <motion.button
                      className="mobile-nav-back"
                      onClick={handleBackToNavigation}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Volver"
                    >
                      ←
                    </motion.button>
                    <div className="mobile-nav-title">Mi Perfil</div>
                    <div className="mobile-nav-spacer"></div>
                  </div>

                  {/* Información del usuario */}
                  <div className="mobile-nav-user-info">
                    <div className="mobile-nav-avatar">
                      {user?.user_metadata?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="mobile-nav-user-details">
                      <div className="mobile-nav-user-name">
                        {user?.user_metadata?.nombre || 'Usuario'}
                      </div>
                      <div className="mobile-nav-user-email">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  {/* Opciones del perfil */}
                  <div className="mobile-nav-links">
                    <motion.button 
                      className="mobile-nav-link"
                      onClick={handleNavigateToProfile}
                      whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User size={20} />
                      <span>Mi Perfil Completo</span>
                    </motion.button>

                    <motion.button 
                      className="mobile-nav-link"
                      onClick={handleNavigateToRoutine}
                      whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Dumbbell size={20} />
                      <span>Ver Mi Rutina</span>
                    </motion.button>

                    <motion.button 
                      className="mobile-nav-link logout-link"
                      onClick={handleLogout}
                      whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={20} />
                      <span>Cerrar Sesión</span>
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default NavbarOptimized 