import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRoutineStore } from '../stores';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Zap,
  Heart,
  Star,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Dumbbell,
  Trophy,
  Activity,
  User,
  Settings
} from 'lucide-react';
import ButtonOptimized from './ButtonOptimized';
import LoadingSpinnerOptimized from './LoadingSpinnerOptimized';
import '../styles/HomeDashboard.css';

const HomeDashboardOptimized = () => {
  const { userProfile, user } = useAuth();
  const { getCurrentRoutine, getNextWorkout } = useRoutineStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [nextWorkout, setNextWorkout] = useState(null);

  // Memoizar datos del usuario
  const userStats = useMemo(() => {
    if (!userProfile) return null;

    const imc = userProfile.altura && userProfile.peso 
      ? (userProfile.peso / Math.pow(userProfile.altura / 100, 2)).toFixed(1)
      : null;

    const trainingDays = userProfile.dias_entrenamiento || 3;
    const experienceLevel = userProfile.experiencia || 'Principiante';
    const objective = userProfile.objetivo || 'General';

    return {
      imc,
      trainingDays,
      experienceLevel,
      objective,
      age: userProfile.edad,
      height: userProfile.altura,
      weight: userProfile.peso
    };
  }, [userProfile]);

  // Cargar rutina actual
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setIsLoading(true);
        const routine = await getCurrentRoutine();
        const next = await getNextWorkout();
        
        setCurrentRoutine(routine);
        setNextWorkout(next);
      } catch (error) {
        console.error('Error loading routine:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userProfile) {
      loadRoutine();
    }
  }, [userProfile, getCurrentRoutine, getNextWorkout]);

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

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="home-dashboard-outer">
        <LoadingSpinnerOptimized 
          message="Cargando dashboard..." 
          size="large"
          variant="simple"
        />
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
          <ButtonOptimized
            onClick={() => navigate('/formulario')}
            variant="primary"
            size="large"
            icon={<ArrowRight />}
          >
            Comenzar Ahora
          </ButtonOptimized>
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
        {/* Header con saludo personalizado */}
        <motion.div className="dashboard-header" variants={cardVariants}>
          <div className="header-content">
            <div className="user-greeting">
              <h2>¡Hola, {userProfile.nombre || user?.email?.split('@')[0] || 'Atleta'}! 💪</h2>
              <p className="dashboard-mensaje">
                Tu rutina personalizada está lista para hoy
              </p>
            </div>
            <div className="motivation-badge">
              <Trophy size={16} />
              <span>¡Sigue así!</span>
            </div>
          </div>
        </motion.div>

        {/* Próximo entrenamiento */}
        {nextWorkout && (
          <motion.div className="dashboard-today-block" variants={cardVariants}>
            <div className="next-workout-header">
              <Calendar size={24} />
              <h3>Próximo Entrenamiento</h3>
            </div>
            <div className="next-workout-content">
              <div className="workout-day">
                <span className="day-label">Día</span>
                <span className="day-value">{nextWorkout.day}</span>
              </div>
              <div className="workout-focus">
                <span className="focus-label">Enfoque</span>
                <span className="focus-value">{nextWorkout.focus}</span>
              </div>
              <div className="workout-exercises">
                <span className="exercises-label">Ejercicios</span>
                <span className="exercises-value">{nextWorkout.exercises}</span>
              </div>
            </div>
            <ButtonOptimized
              onClick={() => navigate('/rutina')}
              variant="secondary"
              size="medium"
              className="start-workout-btn"
              icon={<Dumbbell size={16} />}
            >
              Comenzar Entrenamiento
            </ButtonOptimized>
          </motion.div>
        )}

        {/* Estadísticas del usuario */}
        <motion.div className="dashboard-stats" variants={cardVariants}>
          <div className="stats-header">
            <Target size={24} />
            <h3>Tu Perfil</h3>
            <p>Resumen de tu configuración</p>
          </div>
          
          <div className="stats-grid">
            <motion.div className="stat-item primary-stat" variants={statVariants}>
              <div className="stat-icon-container">
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{userStats?.trainingDays}</div>
                <div className="stat-label">Días/semana</div>
              </div>
            </motion.div>
            
            <motion.div className="stat-item secondary-stat" variants={statVariants}>
              <div className="stat-icon-container">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{userStats?.experienceLevel}</div>
                <div className="stat-label">Nivel</div>
              </div>
            </motion.div>
            
            <motion.div className="stat-item accent-stat" variants={statVariants}>
              <div className="stat-icon-container">
                <Target size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{userStats?.objective}</div>
                <div className="stat-label">Objetivo</div>
              </div>
            </motion.div>
            
            {userStats?.imc && (
              <motion.div className="stat-item info-stat" variants={statVariants}>
                <div className="stat-icon-container">
                  <Activity size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{userStats.imc}</div>
                  <div className="stat-label">IMC</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Información de la rutina */}
        {currentRoutine && (
          <motion.div className="dashboard-routine-info" variants={cardVariants}>
            <div className="routine-header">
              <Dumbbell size={24} />
              <h3>Tu Rutina</h3>
            </div>
            <div className="routine-details">
              <div className="routine-item">
                <span className="routine-label">Tipo</span>
                <span className="routine-value">{currentRoutine.type || 'Personalizada'}</span>
              </div>
              <div className="routine-item">
                <span className="routine-label">Duración</span>
                <span className="routine-value">{userProfile.tiempo_entrenamiento || '45 min'}</span>
              </div>
              <div className="routine-item">
                <span className="routine-label">Ejercicios/día</span>
                <span className="routine-value">{Math.round(currentRoutine.exercisesPerDay) || '6-8'}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Acciones principales */}
        <motion.div className="dashboard-actions-block" variants={cardVariants}>
          <ButtonOptimized
            onClick={() => navigate('/rutina')}
            variant="primary"
            size="large"
            fullWidth
            className="primary-action"
            icon={<Dumbbell size={20} />}
          >
            Ver Mi Rutina Completa
          </ButtonOptimized>
          
          <div className="secondary-actions">
            <ButtonOptimized
              onClick={() => navigate('/profile')}
              variant="secondary"
              size="medium"
              className="secondary-action"
              icon={<User size={16} />}
            >
              Mi Perfil
            </ButtonOptimized>
            
            <ButtonOptimized
              onClick={() => navigate('/profile?tab=settings')}
              variant="outline"
              size="medium"
              className="secondary-action"
              icon={<Settings size={16} />}
            >
              Configuración
            </ButtonOptimized>
          </div>
        </motion.div>

        {/* Motivación */}
        <motion.div className="motivation-card" variants={cardVariants}>
          <div className="motivation-content">
            <div className="motivation-icon">
              <Heart size={24} />
            </div>
            <div className="motivation-text">
              <h4>¡Consistencia es la clave!</h4>
              <p>Mantén tu rutina y verás resultados increíbles. Cada entrenamiento te acerca a tu objetivo.</p>
            </div>
          </div>
          <div className="motivation-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>
            <span className="progress-text">75% de tu semana completada</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomeDashboardOptimized; 