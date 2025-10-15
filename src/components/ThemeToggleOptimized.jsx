import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore } from '../stores'
import '../styles/ThemeToggle.css'

/**
 * Toggle para cambiar el tema de la aplicación (claro/oscuro/sistema)
 * @param {Object} props
 * @param {string} props.className - Clases CSS adicionales
 * @param {'small'|'medium'|'large'} props.size - Tamaño del toggle
 * @param {'icon'|'button'|'switch'} props.variant - Variante visual del toggle
 * @param {boolean} props.showLabel - Si mostrar label de texto
 */
const ThemeToggleOptimized = ({ 
  className = '',
  size = 'medium',
  variant = 'icon',
  showLabel = false,
  ...props 
}) => {
  const { theme, setTheme, toggleTheme } = useUIStore();

  // Memoizar el estado del tema
  const isDark = useMemo(() => theme === 'dark', [theme]);
  const isSystem = useMemo(() => theme === 'system', [theme]);

  // Memoizar las clases CSS
  const toggleClasses = useMemo(() => {
    const classes = ['theme-toggle'];
    
    classes.push(`theme-toggle-${size}`);
    classes.push(`theme-toggle-${variant}`);
    
    if (showLabel) classes.push('show-label');
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [size, variant, showLabel, className]);

  // Manejar cambio de tema con callback optimizado
  const handleToggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  // Manejar teclas con callback optimizado
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  // Memoizar el icono actual
  const currentIcon = useMemo(() => {
    if (isSystem) return <Monitor size={16} />;
    return isDark ? <Sun size={16} /> : <Moon size={16} />;
  }, [isDark, isSystem]);

  // Memoizar el texto del tema
  const themeText = useMemo(() => {
    if (isSystem) return 'Sistema';
    return isDark ? 'Claro' : 'Oscuro';
  }, [isDark, isSystem]);

  // Animaciones optimizadas
  const containerVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { 
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      transition: { 
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  const labelVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  // Renderizar según la variante
  const renderToggle = () => {
    switch (variant) {
      case 'button':
        return (
          <motion.button
            className={toggleClasses}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            variants={containerVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            aria-label={`Cambiar a tema ${themeText.toLowerCase()}`}
            title={`Cambiar a tema ${themeText.toLowerCase()}`}
            {...props}
          >
            <motion.div
              className="theme-icon-container"
              variants={iconVariants}
              animate="animate"
            >
              {currentIcon}
            </motion.div>
            {showLabel && (
              <motion.span 
                className="theme-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
              >
                {themeText}
              </motion.span>
            )}
          </motion.button>
        );

      case 'switch':
        return (
          <motion.div
            className={toggleClasses}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            role="switch"
            aria-checked={isDark}
            aria-label={`Cambiar a tema ${themeText.toLowerCase()}`}
            title={`Cambiar a tema ${themeText.toLowerCase()}`}
            {...props}
          >
            <motion.div
              className="switch-track"
              variants={containerVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              <motion.div
                className="switch-thumb"
                animate={{
                  x: isDark ? 20 : 0,
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6'
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className="switch-icon"
                  >
                    {currentIcon}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
            {showLabel && (
              <motion.span 
                className="switch-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
              >
                {themeText}
              </motion.span>
            )}
          </motion.div>
        );

      default: // icon
        return (
          <motion.div
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={toggleClasses}
            role="button"
            tabIndex={0}
            variants={containerVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            aria-label={`Cambiar a tema ${themeText.toLowerCase()}`}
            title={`Cambiar a tema ${themeText.toLowerCase()}`}
            {...props}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'dark' : 'light'}
                className="theme-icon-container"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                {currentIcon}
              </motion.div>
            </AnimatePresence>
            {showLabel && (
              <motion.span 
                className="theme-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
              >
                {themeText}
              </motion.span>
            )}
          </motion.div>
        );
    }
  };

  return renderToggle()
}

ThemeToggleOptimized.propTypes = {
	className: PropTypes.string,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	variant: PropTypes.oneOf(['icon', 'button', 'switch']),
	showLabel: PropTypes.bool
}

export default ThemeToggleOptimized 