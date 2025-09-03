import React, { useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  X, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUIStore } from '../stores';
import ButtonOptimized from './ButtonOptimized';
import '../styles/ConfirmDialog.css';

const ConfirmDialogOptimized = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning",
  onConfirm, 
  onCancel,
  onClose,
  loading = false,
  disabled = false,
  size = "medium",
  showIcon = true,
  persistent = false,
  autoFocus = true,
  ...props 
}) => {
  const { showError } = useUIStore();

  const dialogIcon = useMemo(() => {
    if (!showIcon) return null;

    const iconMap = {
      danger: <AlertCircle size={24} className="confirm-icon confirm-icon-danger" />,
      warning: <AlertTriangle size={24} className="confirm-icon confirm-icon-warning" />,
      info: <Info size={24} className="confirm-icon confirm-icon-info" />,
      success: <CheckCircle size={24} className="confirm-icon confirm-icon-success" />
    };

    return iconMap[type] || iconMap.warning;
  }, [type, showIcon]);

  const confirmVariant = useMemo(() => {
    const variantMap = {
      danger: 'danger',
      warning: 'primary',
      info: 'info',
      success: 'success'
    };

    return variantMap[type] || 'primary';
  }, [type]);

  const dialogClasses = useMemo(() => {
    const classes = ['confirm-dialog'];
    
    classes.push(`confirm-dialog-${size}`);
    classes.push(`confirm-dialog-${type}`);
    
    if (loading) classes.push('confirm-dialog-loading');
    if (disabled) classes.push('confirm-dialog-disabled');
    
    return classes.join(' ');
  }, [size, type, loading, disabled]);

  const handleConfirm = useCallback(async () => {
    if (loading || disabled) return;

    try {
      if (onConfirm) {
        await onConfirm();
      }
      onClose?.();
    } catch (error) {
      showError("Error al procesar la acción");
      console.error('ConfirmDialog error:', error);
    }
  }, [loading, disabled, onConfirm, onClose, showError]);

  const handleCancel = useCallback(() => {
    if (loading) return;
    
    onCancel?.();
    onClose?.();
  }, [loading, onCancel, onClose]);

  const handleClose = useCallback(() => {
    if (loading || persistent) return;
    
    onClose?.();
  }, [loading, persistent, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !persistent) {
      handleClose();
    }
  }, [persistent, handleClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !persistent) {
      handleClose();
    } else if (e.key === 'Enter' && !loading && !disabled) {
      handleConfirm();
    }
  }, [persistent, loading, disabled, handleClose, handleConfirm]);

  useEffect(() => {
    if (isOpen && autoFocus) {
      const confirmButton = document.querySelector('.confirm-dialog .btn-primary');
      if (confirmButton) {
        confirmButton.focus();
      }
    }
  }, [isOpen, autoFocus]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const dialogVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transformOrigin: 'center'
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: 0.1
      }
    }
  };

  const actionsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="confirm-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          />
          
          <motion.div
            className={dialogClasses}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
            {...props}
          >
            <motion.div 
              className="confirm-header"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {dialogIcon && (
                <motion.div 
                  className="confirm-icon-container"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.1
                  }}
                >
                  {dialogIcon}
                </motion.div>
              )}
              
              {!persistent && (
                <motion.button 
                  className="confirm-close"
                  onClick={handleClose}
                  aria-label="Cerrar diálogo"
                  disabled={loading}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <X size={20} />
                </motion.button>
              )}
            </motion.div>
            
            <motion.div 
              className="confirm-content"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h3 
                id="dialog-title"
                className="confirm-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {title}
              </motion.h3>
              
              <motion.div 
                id="dialog-message"
                className="confirm-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="confirm-actions"
              variants={actionsVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={buttonVariants}>
                <ButtonOptimized 
                  variant="ghost" 
                  onClick={handleCancel}
                  size={size}
                  disabled={loading}
                  fullWidth={size === 'small'}
                >
                  {cancelText}
                </ButtonOptimized>
              </motion.div>
              
              <motion.div variants={buttonVariants}>
                <ButtonOptimized 
                  variant={confirmVariant} 
                  onClick={handleConfirm}
                  size={size}
                  loading={loading}
                  disabled={disabled}
                  fullWidth={size === 'small'}
                  icon={loading ? <Loader2 size={16} /> : null}
                >
                  {loading ? "Procesando..." : confirmText}
                </ButtonOptimized>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialogOptimized; 