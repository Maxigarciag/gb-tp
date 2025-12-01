import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../stores'
import ToastOptimized from './ToastOptimized'
import '../../styles/components/common/NotificationSystem.css'

/**
 * Sistema de notificaciones que gestiona y muestra toasts
 * @param {Object} props
 * @param {string} props.position - Posición de las notificaciones
 * @param {number} props.maxNotifications - Máximo de notificaciones simultáneas
 * @param {boolean} props.autoRemove - Si auto-remover notificaciones
 * @param {number} props.autoRemoveDelay - Delay para auto-remoción
 * @param {boolean} props.showProgress - Si mostrar barra de progreso
 */
const NotificationSystemOptimized = ({ 
  position = 'top-right',
  maxNotifications = 5,
  autoRemove = true,
  autoRemoveDelay = 5000,
  showProgress = true,
  ...props 
}) => {
  const { notifications, removeNotification, clearNotifications } = useUIStore();

  // Memoizar las notificaciones ordenadas por timestamp y sin duplicados
  const sortedNotifications = useMemo(() => {
    const uniqueNotifications = notifications.reduce((acc, notification) => {
      // Solo agregar si no existe ya una notificación con el mismo ID
      if (!acc.find(n => n.id === notification.id)) {
        acc.push(notification);
      }
      return acc;
    }, []);
    
    return [...uniqueNotifications]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxNotifications);
  }, [notifications, maxNotifications]);

  // Manejar cierre de notificación con callback optimizado
  const handleRemoveNotification = useCallback((id) => {
    removeNotification(id);
  }, [removeNotification]);

  // Manejar cierre de todas las notificaciones
  const handleClearAll = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);

  // Animaciones optimizadas para el contenedor
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const notificationVariants = {
    hidden: { 
      opacity: 0, 
      x: position.includes('right') ? 100 : -100,
      y: position.includes('top') ? -50 : 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
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
      x: position.includes('right') ? 100 : -100,
      y: position.includes('top') ? -50 : 50,
      scale: 0.8,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // Renderizar notificación individual
  const renderNotification = (notification) => {
    const {
      id,
      type,
      title,
      message,
      timestamp,
      action,
      persistent = false,
      duration = autoRemoveDelay
    } = notification;

    return (
      <motion.div
        key={id}
        variants={notificationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className="notification-wrapper"
      >
        <ToastOptimized
          id={id}
          type={type}
          title={title}
          message={message}
          duration={persistent ? null : duration}
          onClose={handleRemoveNotification}
          isVisible={true}
          action={action}
          dismissible={!persistent}
          pauseOnHover={true}
          showProgress={showProgress && !persistent}
          position={position}
          {...props}
        />
      </motion.div>
    );
  };

  // Si no hay notificaciones, no renderizar nada
  if (sortedNotifications.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={`notification-container notification-container-${position}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {/* Header con botón para limpiar todas */}
      {sortedNotifications.length > 1 && (
        <motion.div 
          className="notification-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="notification-count">
            {sortedNotifications.length} notificación{sortedNotifications.length !== 1 ? 'es' : ''}
          </span>
          <button
            className="notification-clear-all"
            onClick={handleClearAll}
            aria-label="Limpiar todas las notificaciones"
          >
            Limpiar todas
          </button>
        </motion.div>
      )}

      {/* Lista de notificaciones */}
      <AnimatePresence mode="popLayout">
        {sortedNotifications.map(renderNotification)}
      </AnimatePresence>
    </motion.div>
  )
}

NotificationSystemOptimized.propTypes = {
	position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
	maxNotifications: PropTypes.number,
	autoRemove: PropTypes.bool,
	autoRemoveDelay: PropTypes.number,
	showProgress: PropTypes.bool
}

export default NotificationSystemOptimized 