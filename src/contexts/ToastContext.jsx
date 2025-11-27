import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastOptimized from '../components/common/ToastOptimized';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, isVisible: true };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    );
    
    // Remover el toast después de la animación
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Métodos de conveniencia
  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ 
      showToast, 
      hideToast, 
      removeToast, 
      success, 
      error, 
      warning, 
      info 
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastOptimized
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            isVisible={toast.isVisible}
            onClose={() => hideToast(toast.id)}
            position="top-right"
            dismissible={true}
            showProgress={true}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 