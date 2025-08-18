import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Activity, Target, Dumbbell } from 'lucide-react';
import { useUIStore } from '../stores';
import '../styles/LoadingSpinner.css';

const LoadingSpinnerOptimized = ({ 
  message = 'Cargando...', 
  size = 'medium', 
  className = '',
  showLogo = false,
  variant = 'spinner', // spinner, dots, pulse, bars, simple
  color = 'primary',
  fullScreen = false,
  overlay = false,
  progress = null, // 0-100
  showProgress = false,
  icon = null,
  ariaLabel = null,
  role = 'status',
  ariaLive = 'polite',
  ...props 
}) => {
  const { theme } = useUIStore();

  // Memoizar las clases CSS
  const containerClasses = useMemo(() => {
    const classes = ['loading-spinner-container']
    
    if (fullScreen) classes.push('loading-fullscreen')
    if (overlay) classes.push('loading-overlay')
    // Para el spinner 'simple', el tamaño se aplica en el contenedor
    if (variant === 'simple' && (size === 'small' || size === 'large')) {
      classes.push(`loading-${size}`)
    }
    if (className) classes.push(className)
    
    return classes.join(' ')
  }, [fullScreen, overlay, className, variant, size])

  // Memoizar las clases del spinner
  const spinnerClasses = useMemo(() => {
    if (variant === 'simple') {
      return 'simple-spinner'
    }
    const classes = ['loading-spinner']
    // Tamaños válidos para variantes no simples (afectan a hijos .spinner, .dot, .bar)
    if (size === 'small') classes.push('spinner-small')
    if (size === 'large') classes.push('spinner-large')
    return classes.join(' ')
  }, [size, variant])

  // Memoizar el icono personalizado
  const customIcon = useMemo(() => {
    if (icon) return icon;
    
    const iconMap = {
      activity: <Activity size={24} />,
      target: <Target size={24} />,
      dumbbell: <Dumbbell size={24} />,
      default: <Loader2 size={24} />
    };
    
    return iconMap[icon] || iconMap.default
  }, [icon])

  // Animaciones optimizadas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const spinnerVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  const logoVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.2
      }
    }
  }

  const messageVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        delay: 0.3
      }
    }
  }

  const progressVariants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  // Renderizar el spinner según la variante
  const renderSpinner = () => {
    switch (variant) {
      case 'simple':
        return (
          <div className="simple-spinner">
            <motion.div
              className="simple-spinner-ring"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        );

      case 'dots':
        return (
          <div className="spinner-dots">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="dot"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className="spinner-pulse"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {customIcon}
          </motion.div>
        );

      case 'bars':
        return (
          <div className="spinner-wave">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bar"
                animate={{
                  height: ["20%", "100%", "20%"]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        );

      default: // spinner
        return (
          <div className="spinner">
            <motion.div
              className="spinner-ring"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <motion.div
              className="spinner-ring"
              animate={{ rotate: -360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <motion.div
              className="spinner-ring"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={containerClasses}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        role={role}
        aria-live={ariaLive}
        aria-busy='true'
        aria-label={ariaLabel || message}
        {...props}
      >
        <motion.div
          className={spinnerClasses}
          variants={spinnerVariants}
          initial='hidden'
          animate='visible'
        >
          {showLogo && variant !== 'simple' && (
            <motion.div 
              className="loading-logo"
              variants={logoVariants}
              initial='hidden'
              animate='visible'
            >
              <motion.img
                src={"/src/assets/GB-LOGOAZULCLARO.png"}
                alt="Get Big"
                className="logo-image"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              <motion.h2 
                className="logo-text"
                animate={{ 
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Get Big
              </motion.h2>
            </motion.div>
          )}
          {renderSpinner()}
          
          {message && (
            <motion.p 
              className="loading-message"
              variants={messageVariants}
              initial='hidden'
              animate='visible'
            >
              {message}
            </motion.p>
          )}

          {showProgress && progress !== null && (
            <motion.div 
              className="loading-progress"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="progress-text">{Math.round(progress)}%</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const SpinnerSimple = ({ size = 'small', ariaLabel = 'Cargando...' }) => (
  <div
    className={`loading-spinner-container ${size === 'small' ? 'loading-small' : ''} ${size === 'large' ? 'loading-large' : ''}`.trim()}
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label={ariaLabel}
  >
    <div className="simple-spinner">
      <div className="simple-spinner-ring" />
    </div>
  </div>
)

export default LoadingSpinnerOptimized; 