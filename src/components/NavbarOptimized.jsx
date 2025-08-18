import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUIStore } from "../stores";
import UserProfileOptimized from "./UserProfileOptimized";
import ThemeToggleOptimized from "./ThemeToggleOptimized";
import { motion, AnimatePresence } from "framer-motion";
import logoAzul from "../assets/logo-azul-osc.png";
import { debugLog } from "../utils/debug";
import { Home, Info, Dumbbell, Mail, Menu, X, BarChart2 } from "lucide-react";
import "../styles/Navbar.css";

function NavbarOptimized() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  
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

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);



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
        <motion.img
          src={logoAzul}
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
        <ThemeToggleOptimized variant="icon" size="medium" showLabel={false} />
        {isAuthenticated && <UserProfileOptimized />}
        
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
              className="mobile-nav-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
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
              <div className="mobile-theme-toggle">
                <ThemeToggleOptimized variant="icon" size="large" showLabel={false} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default NavbarOptimized; 