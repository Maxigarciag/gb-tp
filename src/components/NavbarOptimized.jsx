import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUIStore } from "../stores";
import UserProfileOptimized from "./UserProfileOptimized";
import ThemeToggleOptimized from "./ThemeToggleOptimized";
import PWAStatusIndicator from "./PWAStatusIndicator";
import { motion, AnimatePresence } from "framer-motion";
import logoAzul from "../assets/logo-azul-osc.png";
import { debugLog } from "../utils/debug";
import { Home, Info, Dumbbell, Mail, Menu, X, BarChart2 } from "lucide-react";
import "../styles/Navbar.css";

function NavbarOptimized({ hasPWABanner = false }) {
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

  // Debug: verificar estado del banner PWA
  useEffect(() => {
    debugLog('🔧 Navbar: Estado del banner PWA:', {
      hasPWABanner,
      bodyClass: document.body.classList.contains('has-pwa-banner'),
      containerClass: document.querySelector('.main-container')?.classList.contains('has-pwa-banner')
    });
  }, [hasPWABanner]);

  // Navegación optimizada
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/about", label: "About", icon: Info },
    { path: "/rutina", label: "Rutina", icon: Dumbbell },
    { path: "/progreso", label: "Progreso", icon: BarChart2 },
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
      className={`navbar ${scrolled ? "scrolled" : ""} ${hasPWABanner ? "has-pwa-banner" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="logo-and-text">
        <motion.img
          src={logoAzul}
          alt="Get Big logo"
          className="app-logo"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        <span className="app-name">Get Big</span>
      </div>
      
      <div className="navbar-content">
        {/* Desktop Navigation */}
        <ul className="navbar-links desktop-nav">
          {navItems.map((item) => (
            <motion.li key={item.path} whileHover={{ scale: 1.05 }}>
              <Link 
                to={item.path}
                onMouseEnter={() => {
                  if (item.path === '/progreso') {
                    import('../pages/progreso.jsx');
                  }
                }} 
                className={isActive(item.path) ? "active" : ""}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            </motion.li>
          ))}
          <li className="theme-toggle-item">
            <ThemeToggleOptimized variant="icon" size="medium" showLabel={false} />
          </li>
          <li className="pwa-status-item">
            <PWAStatusIndicator />
          </li>
        </ul>

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
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="navbar-actions">
          {isAuthenticated && (
            <div className="navbar-profile">
              <UserProfileOptimized />
            </div>
          )}
        </div>
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
            <motion.ul
              id="mobile-nav-menu"
              className="mobile-nav-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={item.path} 
                    className={isActive(item.path) ? "active" : ""}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    onClick={closeMobileMenu}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="mobile-theme-toggle"
              >
                <ThemeToggleOptimized variant="icon" size="large" showLabel={false} />
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default NavbarOptimized; 