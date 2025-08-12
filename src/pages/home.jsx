import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import FormularioOptimized from "../components/FormularioOptimized";
import HomeDashboardOptimized from "../components/HomeDashboardOptimized";
import LoadingSpinnerOptimized from "../components/LoadingSpinnerOptimized";
import { Zap, Target, Calendar, Heart, ArrowRight, Star, Smartphone } from "lucide-react";
import "../styles/Home.css";

function Home() {
  const { userProfile, loading, sessionInitialized } = useAuth();

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  // Mostrar spinner si aún no se ha inicializado la sesión
  if (!sessionInitialized) {
    return (
      <div className="loading-container">
        <LoadingSpinnerOptimized 
          message="Cargando..." 
          size="large"
          variant="simple"
        />
      </div>
    );
  }

  // Si el usuario tiene perfil, mostrar el dashboard
  if (userProfile) {
    return <HomeDashboardOptimized />;
  }

  // Si no tiene perfil, mostrar la pantalla de bienvenida
  return (
    <div className="home-container">
      <motion.div 
        className="home-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="welcome-section" variants={cardVariants}>
          <div className="welcome-header">
            <div className="welcome-icon-container">
              <Zap className="welcome-icon" />
            </div>
            <h1 className="welcome-title">
              ¡Comienza tu <span className="highlight">transformación</span>!
            </h1>
            <p className="welcome-subtitle">
              Obtén tu rutina personalizada de entrenamiento diseñada específicamente para ti
            </p>
          </div>

          <motion.div className="benefits-grid" variants={cardVariants}>
            <motion.div className="benefit-item" variants={featureVariants}>
              <div className="benefit-icon-container">
                <Target className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Rutina Adaptada</h3>
                <p>Ejercicios específicos para tu objetivo y nivel de experiencia</p>
              </div>
            </motion.div>

            <motion.div className="benefit-item" variants={featureVariants}>
              <div className="benefit-icon-container">
                <Calendar className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Planificación Semanal</h3>
                <p>Organización inteligente de tus días de entrenamiento</p>
              </div>
            </motion.div>

            <motion.div className="benefit-item" variants={featureVariants}>
              <div className="benefit-icon-container">
                <Heart className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Salud Integral</h3>
                <p>Enfoque en tu bienestar físico y mental</p>
              </div>
            </motion.div>

            <motion.div className="benefit-item" variants={featureVariants}>
              <div className="benefit-icon-container">
                <Star className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Resultados Garantizados</h3>
                <p>Progreso constante con seguimiento personalizado</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="cta-section" variants={cardVariants}>
            <div className="cta-content">
              <h2>¿Listo para comenzar?</h2>
              <p>Completa el formulario y obtén tu rutina personalizada en minutos</p>
            </div>
          </motion.div>
          
          {/* Botón de test PWA */}
          <motion.div className="pwa-test-section" variants={cardVariants}>
            <div className="pwa-test-content">
              <Smartphone size={24} />
              <h3>Test PWA</h3>
              <p>Prueba la funcionalidad de Progressive Web App</p>
              <button
                onClick={() => {
                  // Forzar activación del banner PWA
                  localStorage.setItem('pwa-show-banner', 'true');
                  window.location.reload();
                }}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Activar Banner PWA
              </button>
              <button
                onClick={() => {
                  // Limpiar estado PWA
                  localStorage.removeItem('pwa-show-banner');
                  window.location.reload();
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginLeft: '10px'
                }}
              >
                Limpiar PWA
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="form-section" variants={cardVariants}>
          <FormularioOptimized />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;
