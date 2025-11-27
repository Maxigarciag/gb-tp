import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRoutineStore } from '../../stores'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight,
  Calendar,
  Dumbbell,
  Trophy,
  TrendingUp,
  CheckCircle,
  Settings,
  Edit,
  Plus
} from 'lucide-react'
import MotivationCard from './MotivationCard'
import WeeklyCalendar from './WeeklyCalendar'
import { forceProgressRefresh } from '../../utils/cacheUtils'
import { useWeeklyProgress } from '../../hooks/useWeeklyProgress'
import '../../styles/HomeDashboard.css'

/**
 * Dashboard principal para usuarios autenticados
 * Muestra saludo personalizado, próximo entrenamiento, y progreso semanal
 */
const HomeDashboardOptimized = () => {
  const { userProfile, user } = useAuth();
  const { 
    userRoutine,
    getCurrentRoutine,
    getNextWorkout,
    loadUserRoutine,
    loading: routineLoading
  } = useRoutineStore();
  const navigate = useNavigate();
  
  // Hook para obtener progreso semanal
  const weeklyProgress = useWeeklyProgress();

  // Cargar rutina actual cuando haya perfil
  useEffect(() => {
    if (userProfile) {
      loadUserRoutine();
    }
  }, [userProfile, loadUserRoutine]);

  // Derivar datos desde el store para reaccionar a cambios
  const currentRoutine = useMemo(() => getCurrentRoutine(), [userRoutine]);
  const nextWorkout = useMemo(() => getNextWorkout(), [userRoutine]);

  // Calcular racha de días consecutivos usando sesiones históricas
  const streak = useMemo(() => {
    if (!weeklyProgress?.historicalSessions || weeklyProgress.historicalSessions.length === 0) return 0;
    
    // Ordenar sesiones por fecha (más reciente primero)
    const sortedSessions = [...weeklyProgress.historicalSessions]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar si hay sesión hoy o ayer (para mantener racha activa)
    const lastSessionDate = new Date(sortedSessions[0].fecha);
    lastSessionDate.setHours(0, 0, 0, 0);
    
    const daysSinceLastSession = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));
    
    // Si la última sesión fue hace más de 1 día, la racha se rompió
    if (daysSinceLastSession > 1) return 0;
    
    // Agrupar sesiones por fecha (puede haber múltiples sesiones en un día)
    const sessionsByDate = new Map();
    sortedSessions.forEach(session => {
      const dateKey = session.fecha.split('T')[0]; // Solo la fecha, sin hora
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, session);
      }
    });
    
    const uniqueDates = Array.from(sessionsByDate.keys())
      .sort((a, b) => new Date(b) - new Date(a));
    
    // Contar días consecutivos
    let currentStreak = 0;
    let expectedDate = new Date(uniqueDates[0]);
    expectedDate.setHours(0, 0, 0, 0);
    
    for (const dateStr of uniqueDates) {
      const sessionDate = new Date(dateStr);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((expectedDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  }, [weeklyProgress?.historicalSessions]);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };



  // Si está cargando, mostrar contenido básico sin loading
  if (routineLoading && !userRoutine) {
    return (
      <div className="home-dashboard-outer">
        <motion.div 
          className="home-dashboard-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="dashboard-header">
            <h2>¡Bienvenido a GetBig!</h2>
            <p className="dashboard-mensaje">
              Preparando tu experiencia personalizada...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="home-dashboard-outer">
        <motion.div 
          className="home-dashboard-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="dashboard-header">
            <h2>¡Bienvenido a GetBig!</h2>
            <p className="dashboard-mensaje">
              Completa tu perfil para comenzar tu transformación
            </p>
          </div>
          <button
            onClick={() => navigate('/formulario')}
            className="comenzar-ahora-btn"
          >
            <ArrowRight size={16} />
            <span>Comenzar Ahora</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="home-dashboard-outer"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="home-dashboard-card">
        {/* Card unificada: Saludo + Motivación + Progreso Semanal */}
        <motion.div className="welcome-motivation-card" variants={cardVariants}>
          {/* Header con saludo y badge */}
          <div className="welcome-header">
            <div className="user-greeting">
              <h2>¡Hola, {userProfile.nombre || user?.email?.split('@')[0] || 'Atleta'}! 💪</h2>
              <p className="welcome-subtitle">
                Tu rutina personalizada está lista para hoy
              </p>
            </div>
            <div className="motivation-badge">
              <Trophy size={16} />
              <span>¡Sigue así!</span>
            </div>
          </div>

          {/* Contenido de motivación con icono y progreso */}
          <MotivationCard />
        </motion.div>

        {/* Card Unificada: Calendario + Próximo Entrenamiento */}
        <motion.div className="weekly-training-card" variants={cardVariants}>
          <div className="weekly-training-header">
            <Calendar size={24} />
            <h3>Tu Semana de Entrenamiento</h3>
          </div>

          {/* Calendario Semanal */}
          <WeeklyCalendar 
            onDayClick={(day) => {
              // Navegar a la rutina del día específico que el usuario seleccionó
              if (day.status === 'today' || day.status === 'pending') {
                loadUserRoutine();
                forceProgressRefresh(userProfile?.id, 'weekly-calendar');
                navigate(`/rutina?day=${day.dayName}`);
              }
            }}
          />

          {/* Información del próximo entrenamiento */}
          {nextWorkout && (
            <div className="next-workout-highlight">
              <div className="highlight-header">
                <Dumbbell size={20} />
                <span className="highlight-title">Próximo Entrenamiento</span>
              </div>
              <div className="highlight-details">
                <div className="highlight-item">
                  <span className="highlight-label">Día:</span>
                  <span className="highlight-value">{nextWorkout.day}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Enfoque:</span>
                  <span className="highlight-value">{nextWorkout.focus}</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Ejercicios:</span>
                  <span className="highlight-value">{nextWorkout.exercises}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  loadUserRoutine();
                  forceProgressRefresh(userProfile?.id, 'home-dashboard');
                  navigate('/progreso?tab=rutina');
                }}
                className="start-workout-btn"
              >
                <Dumbbell size={16} />
                <span>Comenzar Entrenamiento</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Card Unificada: Gestión de Rutinas */}
        <motion.div 
          className={`routine-management-card ${currentRoutine ? 'has-routine' : 'no-routine'}`}
          variants={cardVariants}
        >
          {currentRoutine ? (
            <>
              {/* Header con información de rutina activa */}
              <div className="routine-management-header">
                <div className="routine-badge">
                  <CheckCircle size={16} />
                  <span>Rutina Activa</span>
                </div>
                <div className="routine-title-section">
                  <h3>{currentRoutine.name || 'Mi Rutina'}</h3>
                  <p className="routine-type">{userRoutine?.tipo_rutina || 'Personalizada'}</p>
                </div>
              </div>

              {/* Stats visuales */}
              <div className="routine-stats-grid">
                <div className="routine-stat-card">
                  <div className="stat-icon-wrapper">
                    <Calendar size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{weeklyProgress?.completed || 0}/{weeklyProgress?.scheduled || 0}</span>
                    <span className="stat-label">Esta semana</span>
                  </div>
                </div>

                <div className="routine-stat-card">
                  <div className="stat-icon-wrapper">
                    <TrendingUp size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{streak || 0}</span>
                    <span className="stat-label">Racha de días</span>
                  </div>
                </div>

                <div className="routine-stat-card">
                  <div className="stat-icon-wrapper">
                    <Dumbbell size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{currentRoutine.exercisesToday || 0}</span>
                    <span className="stat-label">Ejercicios hoy</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="routine-actions">
                <button
                  onClick={() => {
                    loadUserRoutine();
                    forceProgressRefresh(userProfile?.id, 'home-dashboard');
                    navigate('/rutina');
                  }}
                  className="routine-action-primary"
                >
                  <Dumbbell size={18} />
                  <span>Ver Mi Rutina</span>
                </button>
                <button
                  onClick={() => navigate('/rutinas')}
                  className="routine-action-secondary"
                >
                  <Settings size={18} />
                  <span>Gestionar</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Modo sin rutina - Enfoque en crear */}
              <div className="no-routine-content">
                <div className="no-routine-icon">
                  <Dumbbell size={48} />
                </div>
                <div className="no-routine-text">
                  <h3>Comienza Tu Transformación</h3>
                  <p>Crea tu primera rutina personalizada o elige una de nuestras plantillas</p>
                </div>
                <div className="no-routine-actions">
                  <button
                    onClick={() => navigate('/rutinas')}
                    className="create-routine-btn"
                  >
                    <Plus size={18} />
                    <span>Crear Rutina</span>
                  </button>
                  <button
                    onClick={() => navigate('/formulario')}
                    className="explore-templates-btn"
                  >
                    <ArrowRight size={18} />
                    <span>Ver Plantillas</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>


      </div>
    </motion.div>
  )
}

export default HomeDashboardOptimized 