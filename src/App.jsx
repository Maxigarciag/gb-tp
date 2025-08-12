import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoadingSpinnerOptimized, { SpinnerSimple } from "./components/LoadingSpinnerOptimized";
import NavbarOptimized from "./components/NavbarOptimized";
import FooterOptimized from "./components/FooterOptimized";
import NotificationSystemOptimized from "./components/NotificationSystemOptimized";
import PWAInstallBanner from "./components/PWAInstallBanner";
import ErrorBoundaryOptimized from "./components/ErrorBoundaryOptimized";
import { useAuth } from "./contexts/AuthContext";
import { useUIStore } from "./stores";
import { useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionOptimization, useAuthOptimization } from "./utils/useSessionOptimization";
import { usePWA } from "./hooks/usePWA";
import { 
  LazyHome, 
  LazyAbout, 
  LazyContact, 
  LazyProfile, 
  LazyCalendarioRutina, 
  LazyFormulario 
} from "./components/LazyComponent";

const LazyProgreso = lazy(() => import("./pages/progreso.jsx"));

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

// Componente wrapper para manejar la estructura de la app
const AppContent = () => {
  const authContext = useAuth();
  const { user, userProfile, loading, shouldRedirect, setShouldRedirect, sessionInitialized } = authContext;
  const navigate = useNavigate();
  const location = useLocation();
  const { initializeTheme } = useUIStore();

  // Usar optimización de sesión
  useSessionOptimization();
  
  // Usar optimización de autenticación
  const authState = useAuthOptimization(authContext);

  // Inicializar PWA
  const { registerServiceWorker, showInstallPrompt } = usePWA();

  // Registrar service worker solo en producción
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerServiceWorker();
    }
  }, [registerServiceWorker]);

  // Script de debug para PWA desde React
  useEffect(() => {
    // Silenciar en producción
    if (!import.meta.env.PROD) {
      // eslint-disable-next-line no-console
      console.log('🔧 PWA React App: Componente montado');
      // eslint-disable-next-line no-console
      console.log('🔧 PWA React App: showInstallPrompt:', showInstallPrompt);
      // eslint-disable-next-line no-console
      console.log('🔧 PWA React App: localStorage pwa-show-banner:', localStorage.getItem('pwa-show-banner'));
    }
    
    // Verificar si se deben aplicar clases CSS
    const shouldShowBanner = localStorage.getItem('pwa-show-banner') === 'true';
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    console.log('🔧 PWA React App: Estado del banner:', { shouldShowBanner, isInstalled });
    
    if (shouldShowBanner && !isInstalled) {
      // Aplicar clases CSS desde React
      document.body.classList.add('has-pwa-banner');
      const container = document.querySelector('.main-container');
      if (container) {
        container.classList.add('has-pwa-banner');
        if (!import.meta.env.PROD) {
          // eslint-disable-next-line no-console
          console.log('🔧 PWA React App: Clases CSS aplicadas desde React');
        }
      } else {
        if (!import.meta.env.PROD) {
          // eslint-disable-next-line no-console
          console.log('🔧 PWA React App: Contenedor .main-container no encontrado');
        }
      }
    } else {
      // Remover clases si no se debe mostrar
      document.body.classList.remove('has-pwa-banner');
      const container = document.querySelector('.main-container');
      if (container) {
        container.classList.remove('has-pwa-banner');
        if (!import.meta.env.PROD) {
          // eslint-disable-next-line no-console
          console.log('🔧 PWA React App: Clases CSS removidas desde React');
        }
      }
    }
  }, [showInstallPrompt]);

  // Inicializar tema al cargar la app
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Memoizar el estado de autenticación para evitar re-renders
  const memoizedAuthState = useMemo(() => ({
    isAuthenticated: !!user,
    hasProfile: !!userProfile,
    isLoading: loading,
    isInitialized: sessionInitialized
  }), [user, userProfile, loading, sessionInitialized]);

  // Manejar redirección después del logout
  useEffect(() => {
    if (shouldRedirect) {
      setShouldRedirect(false);
      
      // Redirigir a la página de inicio sin recargar
      navigate('/', { replace: true });
    }
  }, [shouldRedirect, setShouldRedirect, navigate]);

  // Mostrar loading durante la inicialización inicial
  // Solo mostrar el formulario de auth cuando estemos seguros de que no hay sesión
  const shouldShowLoading = !memoizedAuthState.isInitialized || 
    (memoizedAuthState.isLoading && !memoizedAuthState.isAuthenticated);

  // Solo mostrar formulario de auth cuando la sesión esté inicializada Y no haya usuario
  const shouldShowAuth = memoizedAuthState.isInitialized && 
    !memoizedAuthState.isLoading && 
    !memoizedAuthState.isAuthenticated;

  if (shouldShowLoading) {
    return (
      <LoadingSpinnerOptimized 
        message="Iniciando sesión..." 
        size="large" 
        className="loading-fullscreen"
        showLogo={true}
        variant="simple"
        icon="activity"
      />
    );
  }

  // Si no hay usuario y la sesión está inicializada, mostrar página de autenticación
  if (shouldShowAuth) {
    return <ProtectedRoute />;
  }

  // Mostrar estructura completa con rutas lazy
  return (
    <div className="main-container">
      <ErrorBoundaryOptimized>
        <Suspense fallback={<SpinnerSimple />}>
          <PWAInstallBanner />
          <NavbarOptimized hasPWABanner={showInstallPrompt} />
          <Layout>
            <Routes>
              <Route path="/" element={<LazyHome />} />
              <Route path="/formulario" element={<LazyFormulario />} />
              <Route path="/about" element={<LazyAbout />} />
              <Route path="/contact" element={<LazyContact />} />
              <Route path="/rutina" element={<LazyCalendarioRutina />} />
              <Route path="/profile" element={<LazyProfile />} />
              <Route path="/progreso" element={<LazyProgreso />} />
              {/* Redirigir rutas no encontradas a home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <FooterOptimized />
          <NotificationSystemOptimized />
        </Suspense>
      </ErrorBoundaryOptimized>
    </div>
  );
};

export default App;