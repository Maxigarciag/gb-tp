import React, { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  X,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useUIStore } from '../stores';
import '../styles/Toast.css';

const ToastOptimized = ({ 
  id,
  message, 
  type = 'info', 
  duration = 4000, 
  onClose, 
  isVisible,
  title = null,
  action = null,
  dismissible = true,
  pauseOnHover = true,
  showProgress = true,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  ...props 
}) => {
  const { theme } = useUIStore();

  // Memoizar el icono según el tipo
  const toastIcon = useMemo(() => {
    const iconMap = {
      success: <CheckCircle size={20} />,
      error: <XCircle size={20} />,
      warning: <AlertTriangle size={20} />,
      info: <Info size={20} />
    };

    return iconMap[type] || iconMap.info;
  }, [type]);

  // Memoizar las clases CSS
  const toastClasses = useMemo(() => {
    const classes = ['toast'];
    
    classes.push(`toast-${type}`);
    classes.push(`toast-${position}`);
    
    if (!dismissible) classes.push('toast-persistent');
    if (showProgress) classes.push('toast-with-progress');
    
    return classes.join(' ');
  }, [type, position, dismissible, showProgress]);

  // Memoizar el color del progreso
  const progressColor = useMemo(() => {
    const colorMap = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    return colorMap[type] || colorMap.info;
  }, [type]);

  // Manejar cierre con callback optimizado
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose(id);
    }
  }, [onClose, id]);

  // Manejar acción con callback optimizado
  const handleAction = useCallback(() => {
    if (action && action.onClick) {
      action.onClick();
      handleClose();
    }
  }, [action, handleClose]);

  // Auto-cerrar con timer
  useEffect(() => {
    if (duration && isVisible && !pauseOnHover) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, pauseOnHover, handleClose]);

  // Animaciones optimizadas
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: position.includes('top') ? -50 : 50,
      x: position.includes('right') ? 50 : position.includes('left') ? -50 : 0,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      y: position.includes('top') ? -50 : 50,
      x: position.includes('right') ? 50 : position.includes('left') ? -50 : 0,
      scale: 0.9,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const progressVariants = {
    hidden: { scaleX: 1 },
    visible: { 
      scaleX: 0,
      transition: { 
        duration: duration / 1000,
        ease: "linear"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        delay: 0.1
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={toastClasses}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
          {...props}
        >
          {/* Barra de progreso */}
          {showProgress && duration && (
            <motion.div
              className="toast-progress"
              variants={progressVariants}
              initial="hidden"
              animate="visible"
              style={{ backgroundColor: progressColor }}
            />
          )}

          {/* Contenido principal */}
          <motion.div 
            className="toast-content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Icono */}
            <motion.div 
              className="toast-icon"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
            >
              {toastIcon}
            </motion.div>

            {/* Mensaje */}
            <div className="toast-message">
              {title && (
                <div className="toast-title">{title}</div>
              )}
              <div className="toast-text">{message}</div>
            </div>

            {/* Acción */}
            {action && (
              <motion.button
                className="toast-action"
                onClick={handleAction}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {action.label}
              </motion.button>
            )}

            {/* Botón de cerrar */}
            {dismissible && (
              <motion.button 
                className="toast-close" 
                onClick={handleClose}
                aria-label="Cerrar notificación"
                whileHover={{ 
                  scale: 1.1, 
                  backgroundColor: "rgba(255, 255, 255, 0.1)" 
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
              >
                <X size={16} />
              </motion.button>
            )}
          </motion.div>

          {/* Indicador de duración */}
          {duration && (
            <motion.div 
              className="toast-duration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Clock size={12} />
              <span>{Math.round(duration / 1000)}s</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastOptimized; 