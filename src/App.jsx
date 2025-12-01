import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LogoutProvider } from "./contexts/LogoutContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoadingSpinnerOptimized, { SpinnerSimple } from "./components/common/LoadingSpinnerOptimized";
import NavbarOptimized from "./components/layout/NavbarOptimized";
import FooterOptimized from "./components/layout/FooterOptimized";
import NotificationSystemOptimized from "./components/common/NotificationSystemOptimized";

import ErrorBoundaryOptimized from "./components/common/ErrorBoundaryOptimized";
import { useAuth } from "./contexts/AuthContext";
import { useUIStore } from "./stores";
import { useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionOptimization, useAuthOptimization } from "./hooks/useSessionOptimization";
import { usePWA } from "./hooks/usePWA";
import { 
  LazyHome, 
  LazyAbout, 
  LazyContact, 
  LazyProfile, 
  LazyCalendarioRutina, 
  LazyFormulario,
  LazyRoutineSelector,
  LazyCustomRoutineBuilder,
  LazyRoutinesManager,
  LazyCustomExercisesManager
} from "./components/common/LazyComponent";

const LazyProgreso = lazy(() => import("./pages/progreso"));
const LazyRegistrarPage = lazy(() => import("./pages/progreso/RegistrarPage"));
const LazyGraficosPage = lazy(() => import("./pages/progreso/GraficosPage"));
const LazyHistorialPage = lazy(() => import("./pages/progreso/HistorialPage"));
const LazyRutinaHoyPage = lazy(() => import("./pages/progreso/RutinaHoyPage"));
const LazyGraficosEjerciciosPage = lazy(() => import("./pages/progreso/GraficosEjerciciosPage"));
const LazyComposicionPage = lazy(() => import("./pages/progreso/ComposicionPage"));

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

  // Script PWA: logs solo si VITE_DEBUG_PWA === 'true'


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
        message={null}
        ariaLabel="Iniciando sesión..." 
        size="large" 
        className="loading-fullscreen"
        showLogo={true}
        variant="simple"
        icon="activity"
      />
    );
  }

  // Si no hay usuario y la sesión está inicializada, mostrar página de autenticación
  // Nota: no retornamos aquí para no desmontar el provider y evitar rutas que usen useAuth sin provider

  // Mostrar estructura completa con rutas lazy
  return (
    <LogoutProvider>
      <div className="main-container">
        <ErrorBoundaryOptimized>
          <Suspense fallback={<SpinnerSimple size="small" ariaLabel="Cargando sección..." />}>

            <NavbarOptimized />
            <Layout>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LazyHome />} />
                <Route path="/formulario" element={<LazyRoutineSelector />} />
                <Route path="/rutina-personalizada" element={<LazyCustomRoutineBuilder />} />
                <Route path="/about" element={<LazyAbout />} />
                <Route path="/contact" element={<LazyContact />} />
                <Route path="/rutina" element={<LazyCalendarioRutina />} />
                <Route path="/rutinas" element={<LazyRoutinesManager />} />
                <Route path="/ejercicios-personalizados" element={<LazyCustomExercisesManager />} />
                <Route path="/profile" element={<LazyProfile />} />
                <Route path="/progreso" element={<LazyProgreso />} />
                <Route path="/progreso/registrar" element={<LazyRegistrarPage />} />
                <Route path="/progreso/graficos" element={<LazyGraficosPage />} />
                <Route path="/progreso/historial" element={<LazyHistorialPage />} />
                <Route path="/progreso/rutina-hoy" element={<LazyRutinaHoyPage />} />
                <Route path="/progreso/graficos-ejercicios" element={<LazyGraficosEjerciciosPage />} />
                <Route path="/progreso/composicion" element={<LazyComposicionPage />} />
                {/* Redirigir rutas no encontradas a home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
            {!memoizedAuthState.isAuthenticated && <FooterOptimized />}
            <NotificationSystemOptimized />
          </Suspense>
        </ErrorBoundaryOptimized>
      </div>
    </LogoutProvider>
  );
};

export default App;