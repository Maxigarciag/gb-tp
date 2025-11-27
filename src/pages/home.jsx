/**
 * Página principal de la aplicación
 * Muestra landing para no autenticados o dashboard para autenticados
 */

import React from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import FormularioOptimized from '../components/FormularioOptimized'
import AuthPage from '../components/auth/AuthPage'
import HomeDashboardOptimized from '../components/home/HomeDashboardOptimized'
import LoadingSpinnerOptimized from '../components/common/LoadingSpinnerOptimized'
import { Zap, Target, Calendar, Heart, Star, Smartphone } from 'lucide-react'
import LandingHero from '../components/home/LandingHero'
import '../styles/Home.css'

function Home () {
  const { user, userProfile, loading, sessionInitialized } = useAuth();
  const [showAuth, setShowAuth] = React.useState(false)
  const [authMode, setAuthMode] = React.useState('login')
  const shouldReduceMotion = useReducedMotion()

  // Cerrar modal de auth cuando el usuario se logee
  React.useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false)
    }
  }, [user, showAuth])

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

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
          message={null}
          ariaLabel="Cargando..."
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
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
      >
        <motion.div variants={cardVariants}>
          <LandingHero onOpenAuth={handleOpenAuth} />
        </motion.div>

        <section className="benefits-section">
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
        </section>

        {/* Si no hay usuario aún, ofrecemos login/registro; si hay usuario sin perfil, mostramos el formulario */}
        <motion.div className="form-section" variants={cardVariants}>
          {user ? <FormularioOptimized /> : null}
        </motion.div>
      </motion.div>
      {/* Modal de autenticación para visitantes */}
      <AnimatePresence>
        {!user && showAuth && (
          <motion.div 
            className="auth-modal-overlay active" 
            onClick={() => setShowAuth(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="auth-modal-content" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className="dismiss-btn" 
                onClick={() => setShowAuth(false)} 
                aria-label="Cerrar"
              >
                ×
              </button>
              <AuthPage initialMode={authMode} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
