import { useState, useEffect, useCallback, useRef } from 'react';

// Flag de módulo para evitar logs iniciales duplicados en desarrollo (StrictMode)
let hasLoggedInitial = false;

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const debugRef = useRef({
    get enabled() {
      return import.meta.env.DEV && localStorage.getItem('DEBUG_PWA') === 'true';
    }
  });

  // Debug: mostrar estado inicial (solo una vez y solo si DEBUG_PWA)
  if (debugRef.current.enabled && !hasLoggedInitial) {
    hasLoggedInitial = true;
    console.log('🔧 PWA Hook: Estado inicial:', {
      isInstalled,
      showInstallPrompt,
      localStorage: localStorage.getItem('pwa-show-banner')
    });
  }

  // Verificar si la app está instalada
  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        localStorage.removeItem('pwa-show-banner');
      } else if (window.navigator.standalone) {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        localStorage.removeItem('pwa-show-banner');
      }
    };

    checkIfInstalled();
  }, []);

  // Manejar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Capturar el prompt de instalación y persistir el estado
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      // Persistir en localStorage
      localStorage.setItem('pwa-show-banner', 'true');
      // Notificar a todos los consumidores del hook en esta misma pestaña
      window.dispatchEvent(new CustomEvent('pwa-banner-changed', { detail: true }));
      console.log('🔧 PWA: beforeinstallprompt capturado, banner activado');
    };

    // Verificar si ya se mostró el banner en esta sesión
    const shouldShowBanner = localStorage.getItem('pwa-show-banner') === 'true';
      if (debugRef.current.enabled) {
        console.log('🔧 PWA: Verificando estado del banner:', { shouldShowBanner, isInstalled });
      }
    
    if (shouldShowBanner && !isInstalled) {
      setShowInstallPrompt(true);
      if (debugRef.current.enabled) {
        console.log('🔧 PWA: Banner restaurado desde localStorage');
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  // Sincronizar estado del banner entre múltiples instancias del hook
  useEffect(() => {
    const handleBannerChanged = (e) => {
      const next = Boolean(e.detail);
      setShowInstallPrompt(next);
    };
    window.addEventListener('pwa-banner-changed', handleBannerChanged);
    return () => window.removeEventListener('pwa-banner-changed', handleBannerChanged);
  }, []);

  // Instalar la PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      if (debugRef.current.enabled) {
        console.log('❌ PWA: No hay prompt de instalación disponible');
      }
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        if (debugRef.current.enabled) {
          console.log('✅ PWA: Usuario aceptó la instalación');
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        setIsInstalled(true);
        // Limpiar localStorage
        localStorage.removeItem('pwa-show-banner');
        // Notificar
        window.dispatchEvent(new CustomEvent('pwa-banner-changed', { detail: false }));
        return true;
      } else {
        if (debugRef.current.enabled) {
          console.log('❌ PWA: Usuario rechazó la instalación');
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        // Limpiar localStorage
        localStorage.removeItem('pwa-show-banner');
        // Notificar
        window.dispatchEvent(new CustomEvent('pwa-banner-changed', { detail: false }));
        return false;
      }
    } catch (error) {
    if (debugRef.current.enabled) {
      console.error('❌ PWA: Error durante la instalación:', error);
    }
      return false;
    }
  }, [deferredPrompt]);

  // Función para descartar el banner manualmente
  const dismissBanner = useCallback(() => {
    setShowInstallPrompt(false);
    // Persistir que se descartó
    localStorage.setItem('pwa-show-banner', 'false');
    // Notificar a todos los consumidores del hook
    window.dispatchEvent(new CustomEvent('pwa-banner-changed', { detail: false }));
  }, []);

  // Función para resetear el banner (útil para testing)
  const resetBanner = useCallback(() => {
    localStorage.removeItem('pwa-show-banner');
    setShowInstallPrompt(false);
    window.dispatchEvent(new CustomEvent('pwa-banner-changed', { detail: false }));
  }, []);

  // Función para forzar la aplicación de clases CSS
  const forceApplyCSSClasses = useCallback(() => {
    if (showInstallPrompt && !isInstalled) {
      document.body.classList.add('has-pwa-banner');
      document.querySelector('.main-container')?.classList.add('has-pwa-banner');
      if (debugRef.current.enabled) {
        console.log('🔧 PWA: Forzando aplicación de clases CSS');
      }
    } else {
      document.body.classList.remove('has-pwa-banner');
      document.querySelector('.main-container')?.classList.remove('has-pwa-banner');
      if (debugRef.current.enabled) {
        console.log('🔧 PWA: Removiendo clases CSS');
      }
    }
  }, [showInstallPrompt, isInstalled]);

  // Aplicar clases CSS cuando cambie el estado
  useEffect(() => {
    forceApplyCSSClasses();
  }, [forceApplyCSSClasses]);

  // Registrar el service worker
  const registerServiceWorker = useCallback(async () => {
    // Evitar registrar el SW en desarrollo para no romper HMR/WebSocket de Vite
    if (!import.meta.env.PROD) {
      if (debugRef.current.enabled) {
        console.log('ℹ️ PWA: SW no se registra en desarrollo');
      }
      return null;
    }

    if ('serviceWorker' in navigator) {
      try {
        // Evitar registros duplicados (React StrictMode en dev o reinicios)
        const existingRegs = await navigator.serviceWorker.getRegistrations()
        const existing = existingRegs.find((r) => (
          r.active?.scriptURL?.includes('/sw.js') ||
          r.installing?.scriptURL?.includes('/sw.js') ||
          r.waiting?.scriptURL?.includes('/sw.js')
        ))
        if (existing) {
          if (debugRef.current.enabled) {
            console.log('ℹ️ PWA: Service Worker ya registrado:', existing);
          }
          return existing;
        }

        // Versión para bustear el caché del SW en CDNs/browsers
        // Intentar con sw.js versionado. Si falla, fallback a sw.js base
        const SW_VERSION = 'v1.0.4'
        let registration = null
        try {
          registration = await navigator.serviceWorker.register(`/sw-${SW_VERSION}.js`)
        } catch (e) {
          registration = await navigator.serviceWorker.register(`/sw.js?v=${SW_VERSION}`)
        }
        if (debugRef.current.enabled) {
          console.log('✅ PWA: Service Worker registrado:', registration);
        }

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (debugRef.current.enabled) {
                console.log('🔄 PWA: Nueva versión disponible');
              }
              // Aquí podrías disparar UI de actualización
            }
          });
        });

        return registration;
      } catch (error) {
        if (debugRef.current.enabled) {
          console.error('❌ PWA: Error registrando Service Worker:', error);
        }
        return null;
      }
    } else {
      if (debugRef.current.enabled) {
        console.log('ℹ️ PWA: Service Worker no soportado');
      }
      return null;
    }
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      if (debugRef.current.enabled) {
        console.log('ℹ️ PWA: Notificaciones no soportadas');
      }
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      if (debugRef.current.enabled) {
        console.log('❌ PWA: Permisos de notificación denegados');
      }
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      if (debugRef.current.enabled) {
        console.error('❌ PWA: Error solicitando permisos:', error);
      }
      return false;
    }
  }, []);

  // Enviar notificación
  const sendNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      if (debugRef.current.enabled) {
        console.log('ℹ️ PWA: No se pueden enviar notificaciones');
      }
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icono-blanco.ico',
        badge: '/icono-blanco.ico',
        ...options
      });

      return notification;
    } catch (error) {
      if (debugRef.current.enabled) {
        console.error('❌ PWA: Error enviando notificación:', error);
      }
      return false;
    }
  }, []);

  return {
    isInstalled,
    isOnline,
    showInstallPrompt,
    installPWA,
    dismissBanner,
    resetBanner,
    forceApplyCSSClasses,
    registerServiceWorker,
    requestNotificationPermission,
    sendNotification
  };
};
