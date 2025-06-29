import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';
import '../styles/ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning",
  onConfirm, 
  onCancel,
  onClose 
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={24} className="confirm-icon confirm-icon-danger" />;
      case 'warning':
        return <AlertTriangle size={24} className="confirm-icon confirm-icon-warning" />;
      case 'info':
        return <AlertTriangle size={24} className="confirm-icon confirm-icon-info" />;
      default:
        return <AlertTriangle size={24} className="confirm-icon confirm-icon-warning" />;
    }
  };

  const getConfirmVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            className="confirm-dialog"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            <div className="confirm-header">
              <div className="confirm-icon-container">
                {getIcon()}
              </div>
              <button 
                className="confirm-close"
                onClick={onClose}
                aria-label="Cerrar diálogo"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="confirm-content">
              <h3 className="confirm-title">{title}</h3>
              <p className="confirm-message">{message}</p>
            </div>
            
            <div className="confirm-actions">
              <Button 
                variant="ghost" 
                onClick={handleCancel}
                size="medium"
              >
                {cancelText}
              </Button>
              <Button 
                variant={getConfirmVariant()} 
                onClick={handleConfirm}
                size="medium"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog; 