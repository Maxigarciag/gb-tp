import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import ButtonOptimized from './ButtonOptimized';
import '../styles/PWAInstallBanner.css';

const PWAInstallBanner = () => {
  const { showInstallPrompt, installPWA, isInstalled, isOnline, dismissBanner } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  // Silenciar logs en desarrollo salvo que VITE_DEBUG_PWA === 'true'
  useEffect(() => {
    if (!import.meta.env.PROD && import.meta.env.VITE_DEBUG_PWA === 'true') {
      // eslint-disable-next-line no-console
      console.log('🔧 PWA Banner: Estado del banner:', {
        showInstallPrompt,
        isVisible,
        isInstalled,
        bodyClass: document.body.classList.contains('has-pwa-banner'),
        containerClass: document.querySelector('.main-container')?.classList.contains('has-pwa-banner')
      });
    }
  }, [showInstallPrompt, isVisible, isInstalled]);

  // Eliminar botón de debug en producción (y en general ya no es necesario)

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error durante la instalación:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissBanner();
  };

  // No mostrar si ya está instalada o no hay prompt
  if (isInstalled || !showInstallPrompt || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="pwa-install-banner"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="banner-content">
          <div className="banner-icon">
            <Smartphone size={24} />
          </div>
          
          <div className="banner-text">
            <h3>¡Instala GetBig!</h3>
            <p>Accede más rápido y disfruta de la experiencia completa</p>
            
            <div className="banner-features">
              <div className="feature">
                <Wifi size={16} />
                <span>Funciona offline</span>
              </div>
              <div className="feature">
                <Smartphone size={16} />
                <span>Como app nativa</span>
              </div>
            </div>
          </div>

          <div className="banner-actions">
            <div className="install-btn-wrapper">
              <ButtonOptimized
                onClick={handleInstall}
                disabled={isInstalling}
                loading={isInstalling}
                variant="primary"
                size="small"
                className="install-btn"
                title="Instalar GetBig como aplicación"
              >
                <Download size={16} />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </ButtonOptimized>
              <div className="install-tooltip">
                Instalar GetBig como aplicación en tu dispositivo
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="dismiss-btn"
              aria-label="Cerrar banner"
            >
              <X size={20} />
            </button>
            
          </div>
        </div>

        {!isOnline && (
          <div className="offline-indicator">
            <WifiOff size={16} />
            <span>Modo offline activado</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
