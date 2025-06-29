import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  message = "Cargando...", 
  size = "medium",
  showMessage = true,
  className = "",
  variant = "dots" // dots, default, pulse, bars
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loading-small';
      case 'large':
        return 'loading-large';
      default:
        return 'loading-medium';
    }
  };

  const renderSpinner = () => {
    const spinnerSize = size === 'small' ? 20 : size === 'large' ? 40 : 30;
    
    switch (variant) {
      case 'default':
        return (
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ color: '#0047ab' }}
          >
            <Loader2 size={spinnerSize} />
          </motion.div>
        );
      
      case 'pulse':
        return (
          <motion.div
            className="spinner-pulse"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        );
      
      case 'bars':
        return (
          <div className="spinner-bars">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bar"
                animate={{ height: [20, 40, 20] }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              />
            ))}
          </div>
        );
      
      default: // dots
        return (
          <div className="spinner-dots">
            <motion.div
              className="dot"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="dot"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="dot"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        );
    }
  };

  return (
    <motion.div 
      className={`loading-spinner-container ${getSizeClass()} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-spinner-wrapper">
        {renderSpinner()}
        
        {showMessage && (
          <motion.p 
            className="loading-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingSpinner; 