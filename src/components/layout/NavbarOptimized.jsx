import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUIStore } from '../../stores'
import UserProfileOptimized from '../usuario/UserProfileOptimized'
import ThemeToggleOptimized from '../theme/ThemeToggleOptimized'
import { motion } from 'framer-motion'
import logoBlanco from '../../assets/images/GB-LOGOBLANCO.png'
import logoAzulClaro from '../../assets/images/GB-LOGOAZULCLARO.png'
import { Home, Dumbbell, Mail, BarChart2 } from 'lucide-react'
import '../../styles/components/layout/Navbar.css'

/**
 * Navbar optimizado con bottom navigation para móviles y perfil de usuario
 */
function NavbarOptimized () {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { theme } = useUIStore();
  
  const [scrolled, setScrolled] = useState(false);

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

  // Función para determinar si una ruta está activa
  const normalizePath = (p) => (p === '/' ? '/' : p.replace(/\/+$/, ''));
  const isActive = (path) => {
    const current = normalizePath(location.pathname);
    const target = normalizePath(path);
    if (target === '/') return current === '/';
    return current === target || current.startsWith(target + '/');
  };

  return (
    <>
      {/* Top Navbar - Desktop y Mobile */}
      <motion.nav 
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo + Nombre */}
        <div className="logo-section">
          <motion.img
            src={theme === 'dark' ? logoBlanco : logoAzulClaro}
            alt="Get Big"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          <span>Get Big</span>
        </div>
        
        {/* Navegación principal - Solo Desktop */}
        <div className="nav-main">
          <Link 
            to="/"
            className={isActive("/") ? "active" : ""}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <Home size={16} />
            Home
          </Link>
          {!isAuthenticated && (
            <Link 
              to="/contact"
              className={isActive("/contact") ? "active" : ""}
              aria-current={isActive("/contact") ? "page" : undefined}
            >
              <Mail size={16} />
              Contact
            </Link>
          )}
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
                onMouseEnter={() => import('../../pages/progreso.jsx')}
              >
                <BarChart2 size={16} />
                Progreso
              </Link>
            </>
          )}
        </div>
        
        {/* Controles - Desktop y Mobile */}
        <div className="nav-controls">
          {/* Desktop: Theme + Profile */}
          <div className="desktop-controls">
            <ThemeToggleOptimized variant="icon" size="medium" showLabel={false} />
            {isAuthenticated && <UserProfileOptimized />}
          </div>
          
          {/* Mobile: Theme + Profile */}
          <div className="mobile-controls-top">
            <ThemeToggleOptimized variant="icon" size="medium" showLabel={false} />
            {isAuthenticated && <UserProfileOptimized />}
          </div>
        </div>
      </motion.nav>

      {/* Bottom Navigation - Solo Mobile cuando está autenticado */}
      {isAuthenticated && (
        <motion.nav 
          className="bottom-nav"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.3 }
          }}
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="bottom-nav-container">
            <Link 
              to="/rutina"
              className={`bottom-nav-item ${isActive("/rutina") ? "active" : ""}`}
              aria-label="Rutina"
              aria-current={isActive("/rutina") ? "page" : undefined}
            >
              <motion.div
                className="bottom-nav-icon-wrapper"
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="bottom-nav-icon">
                  <Dumbbell size={22} strokeWidth={isActive("/rutina") ? 2.5 : 2} />
                </div>
              </motion.div>
              <motion.span 
                className="bottom-nav-label"
                animate={{ 
                  opacity: isActive("/rutina") ? 1 : 0.7,
                  scale: isActive("/rutina") ? 1 : 0.95
                }}
                transition={{ duration: 0.2 }}
              >
                Rutina
              </motion.span>
            </Link>

            <Link 
              to="/"
              className={`bottom-nav-item ${isActive("/") ? "active" : ""}`}
              aria-label="Home"
              aria-current={isActive("/") ? "page" : undefined}
            >
              <motion.div
                className="bottom-nav-icon-wrapper"
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="bottom-nav-icon">
                  <Home size={22} strokeWidth={isActive("/") ? 2.5 : 2} />
                </div>
              </motion.div>
              <motion.span 
                className="bottom-nav-label"
                animate={{ 
                  opacity: isActive("/") ? 1 : 0.7,
                  scale: isActive("/") ? 1 : 0.95
                }}
                transition={{ duration: 0.2 }}
              >
                Home
              </motion.span>
            </Link>

            <Link 
              to="/progreso"
              className={`bottom-nav-item ${isActive("/progreso") ? "active" : ""}`}
              aria-label="Progreso"
              aria-current={isActive("/progreso") ? "page" : undefined}
            >
              <motion.div
                className="bottom-nav-icon-wrapper"
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="bottom-nav-icon">
                  <BarChart2 size={22} strokeWidth={isActive("/progreso") ? 2.5 : 2} />
                </div>
              </motion.div>
              <motion.span 
                className="bottom-nav-label"
                animate={{ 
                  opacity: isActive("/progreso") ? 1 : 0.7,
                  scale: isActive("/progreso") ? 1 : 0.95
                }}
                transition={{ duration: 0.2 }}
              >
                Progreso
              </motion.span>
            </Link>
          </div>
        </motion.nav>
      )}
    </>
  )
}

export default NavbarOptimized 