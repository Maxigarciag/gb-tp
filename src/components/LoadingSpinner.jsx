import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  message = "Cargando...", 
  size = "medium", 
  className = "",
  showLogo = false 
}) => {
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${size}`}>
        {showLogo && (
          <div className="loading-logo">
            <img
              src="/src/assets/logo-azul-osc.png"
              alt="Get Big"
              className="logo-image"
            />
            <h2 className="logo-text">Get Big</h2>
          </div>
        )}
        
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 