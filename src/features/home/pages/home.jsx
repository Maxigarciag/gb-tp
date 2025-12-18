/**
 * Página principal de la aplicación
 * Muestra landing para no autenticados o dashboard para autenticados
 */

import React from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useUIStore } from '@/stores'
import ProtectedRoute from '@/features/layout/components/ProtectedRoute'
import FormularioOptimized from '@/features/rutinas/components/FormularioOptimized'
import AuthPage from '@/features/auth/components/AuthPage'
import HomeDashboardOptimized from '@/features/home/components/HomeDashboardOptimized'
import LoadingSpinnerOptimized from '@/features/common/components/LoadingSpinnerOptimized'
import { Zap, Target, Calendar, Heart, Star, Smartphone } from 'lucide-react'
import LandingHero from '@/features/home/components/LandingHero'
import '@/styles/components/home/Home.css'

function Home () {
  const { user, userProfile, loading, sessionInitialized } = useAuth();
  const [showAuth, setShowAuth] = React.useState(false)
  const [authMode, setAuthMode] = React.useState('login')
  const shouldReduceMotion = useReducedMotion()
  const modalRef = React.useRef(null)
  const resetHomeUi = useUIStore(state => state.resetHomeUi)

  // Normalizar el estado visual al entrar al Home
  React.useEffect(() => {
    resetHomeUi()
  }, [resetHomeUi])

  // Cerrar modal de auth cuando el usuario se logee
  React.useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false)
    }
  }, [user, showAuth])

  // Bloquear scroll y enfocar el modal cuando se abre
  React.useEffect(() => {
    if (typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow

    if (showAuth) {
      document.body.style.overflow = 'hidden'
      if (modalRef.current) {
        modalRef.current.focus({ preventScroll: true })
      }
    } else {
      document.body.style.overflow = previousOverflow
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showAuth])

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

  // Si hay sesión pero no perfil, mostrar directamente el formulario inicial
  if (user) {
    return (
      <div className="home-container">
        <motion.div 
          className="home-content"
          variants={containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.div className="form-section" variants={cardVariants}>
            <FormularioOptimized />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Si no hay sesión, mostrar la pantalla de bienvenida
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
            <motion.div
              className="benefit-item"
              variants={featureVariants}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className="benefit-icon-container">
                <Target className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Calendario semanal claro</h3>
                <p>Ves tus próximos 7 días con estados de hoy, completado, pendiente o descanso. Todo sincronizado con tu rutina activa.</p>
                <div className="benefit-tags">
                  <span className="benefit-tag">Hoy</span>
                  <span className="benefit-tag">Completado</span>
                  <span className="benefit-tag">Descanso</span>
                </div>
                <div className="benefit-meta">
                  <span>Actualiza con tu rutina</span>
                  <span>Datos desde Supabase</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="benefit-item"
              variants={featureVariants}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className="benefit-icon-container">
                <Calendar className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Rutinas y ejercicios a tu medida</h3>
                <p>Arma tu rutina y agrega tus propios ejercicios con nombre, grupo muscular e instrucciones guardados en la app.</p>
                <div className="benefit-tags">
                  <span className="benefit-tag">Rutina activa</span>
                  <span className="benefit-tag">Ejercicios propios</span>
                  <span className="benefit-tag">Validación en Supabase</span>
                </div>
                <div className="benefit-meta">
                  <span>Crear/editar/borrar</span>
                  <span>Se usan directo en la rutina</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="benefit-item"
              variants={featureVariants}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className="benefit-icon-container">
                <Heart className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Progreso con métricas reales</h3>
                <p>Registra pesos, repeticiones, medidas y fotos. Gráficos por músculo y resúmenes semanales para ver avances.</p>
                <div className="benefit-tags">
                  <span className="benefit-tag">Peso y medidas</span>
                  <span className="benefit-tag">PRs</span>
                  <span className="benefit-tag">Fotos</span>
                </div>
                <div className="benefit-meta">
                  <span>Gráficos y comparativas</span>
                  <span>Resumen semanal</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="benefit-item"
              variants={featureVariants}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className="benefit-icon-container">
                <Star className="benefit-icon" />
              </div>
              <div className="benefit-content">
                <h3>Modo app e instalación</h3>
                <p>Podes instalarla en el celu o desktop. Incluye service worker y cache para usar lo básico aun con conexión inestable.</p>
                <div className="benefit-tags">
                  <span className="benefit-tag">PWA</span>
                  <span className="benefit-tag">Offline básico</span>
                  <span className="benefit-tag">Instalable</span>
                </div>
                <div className="benefit-meta">
                  <span>Iconos múltiples tamaños</span>
                  <span>Cache first + fallback</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="about-section">
          <motion.div className="about-card" variants={cardVariants}>
            <div className="about-header">
              <p className="about-eyebrow">Sobre nosotros</p>
              <h2>Dos amigos construyendo la app que usamos para entrenar</h2>
              <p>
                Nacimos de la necesidad real de organizar rutinas, ver progreso y no perder tiempo.
                Probamos cada cambio en nuestros propios entrenamientos antes de publicarlo.
              </p>
            </div>
            <div className="about-grid">
              <div className="about-item">
                <div className="about-icon about-icon-primary">
                  <Heart size={18} />
                </div>
                <div>
                  <h3>Hecha con lo que usamos</h3>
                  <p>Rutinas activas, sesiones marcadas y registros se guardan en Supabase.</p>
                </div>
              </div>
              <div className="about-item">
                <div className="about-icon about-icon-accent">
                  <Star size={18} />
                </div>
                <div>
                  <h3>Feedback semanal</h3>
                  <p>Ajustamos calendario y copys con base en lo que vemos que funciona al entrenar.</p>
                </div>
              </div>
              <div className="about-item">
                <div className="about-icon about-icon-neutral">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3>Lista para instalar</h3>
                  <p>PWA con service worker y cache: funciona estable en móvil aunque la conexión sea inestable.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Si no hay usuario aún, ofrecemos login/registro */}
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
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              ref={modalRef}
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
