import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./contexts/AuthContext";
import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionOptimization, useAuthOptimization } from "./utils/useSessionOptimization";
import { 
  LazyHome, 
  LazyAbout, 
  LazyContact, 
  LazyProfile, 
  LazyCalendarioRutina, 
  LazyFormulario 
} from "./components/LazyComponent";

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

  // Usar optimización de sesión
  useSessionOptimization();
  
  // Usar optimización de autenticación
  const authState = useAuthOptimization(authContext);

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
      <LoadingSpinner 
        message="Iniciando sesión..." 
        size="large" 
        className="loading-fullscreen"
        showLogo={true}
      />
    );
  }

  // Si no hay usuario y la sesión está inicializada, mostrar página de autenticación
  if (shouldShowAuth) {
    return <ProtectedRoute />;
  }

  // Mostrar estructura completa con rutas lazy
  return (
    <>
      <Navbar />
      <Layout>
        <Routes>
          <Route path="/" element={<LazyHome />} />
          <Route path="/formulario" element={<LazyFormulario />} />
          <Route path="/about" element={<LazyAbout />} />
          <Route path="/contact" element={<LazyContact />} />
          <Route path="/rutina" element={<LazyCalendarioRutina />} />
          <Route path="/profile" element={<LazyProfile />} />
          {/* Redirigir rutas no encontradas a home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Footer />
    </>
  );
};

export default App;