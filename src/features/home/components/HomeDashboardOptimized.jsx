import { useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRoutineStore } from '@/stores'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight,
  Calendar,
  Dumbbell,
  CheckCircle,
  Settings,
  Edit,
  Plus,
  Target
} from 'lucide-react'
import MotivationCard from './MotivationCard'
import WeeklyCalendar from './WeeklyCalendar'
import { forceProgressRefresh } from '@/utils/cacheUtils'
import { useWeeklyProgress } from '@/hooks/useWeeklyProgress'
import { useStreak } from '@/features/streaks/useStreak'
import { getStreakLevel } from '@/features/streaks/streak.levels'
import '@/styles/components/home/HomeDashboard.css'
import '@/styles/components/common/Button.css'

/**
 * Dashboard principal para usuarios autenticados
 * Muestra saludo personalizado, próximo entrenamiento, y progreso semanal
 */
const HomeDashboardOptimized = () => {
  const { userProfile, user } = useAuth();
  const { 
    userRoutine,
    getCurrentRoutine,
    loadUserRoutine,
    loading: routineLoading
  } = useRoutineStore();
  const navigate = useNavigate();
  
  // Hook para obtener progreso semanal
  const weeklyProgress = useWeeklyProgress();
  const { streak, loading: streakLoading, error: streakError } = useStreak();
  const streakLevel = useMemo(() => {
    if (streakLoading || !streak) return null;
    return getStreakLevel(streak.current_streak ?? 0);
  }, [streak, streakLoading]);

  // Cargar rutina actual cuando haya perfil
  useEffect(() => {
    if (userProfile) {
      loadUserRoutine();
    }
  }, [userProfile, loadUserRoutine]);

  // Derivar datos desde el store para reaccionar a cambios
  const currentRoutine = useMemo(() => getCurrentRoutine(), [userRoutine]);

  const nextWorkout = useMemo(() => {
    if (!userRoutine?.routine_days?.length) return null;

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const today = new Date();
    const todayIndex = (today.getDay() === 0 ? 6 : today.getDay() - 1);
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const completedToday = (weeklyProgress?.completedSessions || []).some(
      session => session?.fecha === todayIso && session?.completada
    );

    const trainingDays = userRoutine.routine_days.filter(
      day => !day.es_descanso && (day.routine_exercises?.length || 0) > 0
    );
    if (!trainingDays.length) return null;

    const startOffset = completedToday ? 1 : 0;

    for (let i = 0; i < 7; i++) {
      const checkIndex = (todayIndex + startOffset + i) % 7;
      const diaSemana = diasSemana[checkIndex];
      const dayData = trainingDays.find(day => day.dia_semana === diaSemana);

      if (dayData) {
        const focusList = (dayData.routine_exercises || [])
          .map(re => re.exercises?.grupo_muscular)
          .filter(Boolean);
        const uniqueFocus = [...new Set(focusList)].join(', ') || 'General';

        return {
          day: diaSemana,
          focus: uniqueFocus,
          exercises: dayData.routine_exercises?.length || 0
        };
      }
    }

    return null;
  }, [userRoutine, weeklyProgress?.completedSessions]);

  const goalLabel = useMemo(() => {
    const goal = userProfile?.objetivo;
    if (goal === 'perder_grasa') return 'Perder grasa';
    if (goal === 'ganar_musculo') return 'Ganar músculo';
    if (goal === 'mantener') return 'Mantener';
    return 'Define tu objetivo';
  }, [userProfile?.objetivo]);

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
              {streakLoading ? (
                  <span>Racha cargando...</span>
                ) : (
                  <>
                    <span className="badge-emoji">{streakLevel?.level.emoji ?? '🔥'}</span>
                    <div className="badge-text">
                      <span className="badge-title">
                        {(streak?.current_streak ?? 0)} {(streak?.current_streak ?? 0) === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                  </>
                )}
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
                  navigate('/entrenamiento');
                }}
                className="btn btn-primary btn-large start-workout-btn"
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
                    <Target size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Objetivo</span>
                    <span className="stat-value">{goalLabel}</span>
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