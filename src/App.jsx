import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/profile";
import CalendarioRutina from "./components/CalendarioRutina";
import Formulario from "./components/Formulario";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Componente wrapper para manejar la estructura de la app
const AppContent = () => {
  const { user, userProfile, loading, shouldRedirect, setShouldRedirect } = useAuth();
  const navigate = useNavigate();

  // Manejar redirección después del logout
  useEffect(() => {
    if (shouldRedirect) {
      console.log('🔄 AppContent: Redirigiendo después del logout...');
      setShouldRedirect(false);
      // Forzar recarga completa para limpiar todo el estado
      window.location.href = '/';
    }
  }, [shouldRedirect, setShouldRedirect]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar página de autenticación
  if (!user) {
    return <ProtectedRoute />;
  }

  // Mostrar estructura completa con rutas
  return (
    <>
      <Navbar />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/rutina" element={<CalendarioRutina />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;