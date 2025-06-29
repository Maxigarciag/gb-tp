import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import '../styles/Toast.css';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose, 
  isVisible 
}) => {
  useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getToastClass = () => {
    return `toast toast-${type}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={getToastClass()}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <div className="toast-content">
            <div className="toast-icon">
              {getIcon()}
            </div>
            <div className="toast-message">
              {message}
            </div>
            <button 
              className="toast-close" 
              onClick={onClose}
              aria-label="Cerrar notificación"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 