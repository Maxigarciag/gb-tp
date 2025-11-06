import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUIStore } from '../stores'
import UserProfileOptimized from './UserProfileOptimized'
import ThemeToggleOptimized from './ThemeToggleOptimized'
import { motion } from 'framer-motion'
import logoBlanco from '../assets/GB-LOGOBLANCO.png'
import logoAzulClaro from '../assets/GB-LOGOAZULCLARO.png'
import { Home, Dumbbell, Mail, BarChart2 } from 'lucide-react'
import '../styles/Navbar.css'

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
                onMouseEnter={() => import('../pages/progreso.jsx')}
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
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            to="/rutina"
            className={`bottom-nav-item ${isActive("/rutina") ? "active" : ""}`}
            aria-label="Rutina"
          >
            <motion.div
              className="bottom-nav-icon"
              whileTap={{ scale: 0.9 }}
            >
              <Dumbbell size={24} />
            </motion.div>
            <span className="bottom-nav-label">Rutina</span>
          </Link>

          <Link 
            to="/"
            className={`bottom-nav-item ${isActive("/") ? "active" : ""}`}
            aria-label="Home"
          >
            <motion.div
              className="bottom-nav-icon"
              whileTap={{ scale: 0.9 }}
            >
              <Home size={24} />
            </motion.div>
            <span className="bottom-nav-label">Home</span>
          </Link>

          <Link 
            to="/progreso"
            className={`bottom-nav-item ${isActive("/progreso") ? "active" : ""}`}
            aria-label="Progreso"
          >
            <motion.div
              className="bottom-nav-icon"
              whileTap={{ scale: 0.9 }}
            >
              <BarChart2 size={24} />
            </motion.div>
            <span className="bottom-nav-label">Progreso</span>
          </Link>
        </motion.nav>
      )}
    </>
  )
}

export default NavbarOptimized 