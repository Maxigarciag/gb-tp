import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRoutineStore } from '../stores';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Heart,
  Calendar,
  Dumbbell,
  Trophy
} from 'lucide-react';
import ButtonOptimized from './ButtonOptimized';
import LoadingSpinnerOptimized from './LoadingSpinnerOptimized';
import '../styles/HomeDashboard.css';

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



  // Cargar rutina actual cuando haya perfil
  useEffect(() => {
    if (userProfile) {
      loadUserRoutine();
    }
  }, [userProfile, loadUserRoutine]);

  // Derivar datos desde el store para reaccionar a cambios
  const currentRoutine = useMemo(() => getCurrentRoutine(), [userRoutine]);
  const nextWorkout = useMemo(() => getNextWorkout(), [userRoutine]);

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



  if (routineLoading) {
    return (
      <div className="home-dashboard-outer">
        <LoadingSpinnerOptimized 
          message={null}
          ariaLabel="Cargando dashboard..." 
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
            className="comenzar-ahora-btn"
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
               onClick={() => navigate('/progreso?tab=rutina')}
               variant="secondary"
               size="medium"
               className="start-workout-btn"
               icon={<Dumbbell size={16} />}
             >
               Comenzar Entrenamiento
             </ButtonOptimized>
          </motion.div>
        )}

        {/* Información de la rutina */}
        {currentRoutine && (
          <motion.div className="dashboard-routine-info" variants={cardVariants}>
            <div className="routine-header">
              <Dumbbell size={24} />
              <h3>Tu Rutina</h3>
            </div>
            <div className="routine-details">
              <div className="routine-item">
                <span className="routine-label">Nombre</span>
                <span className="routine-value">{currentRoutine.name || 'Mi rutina'}</span>
              </div>
              <div className="routine-item">
                <span className="routine-label">Duración</span>
                <span className="routine-value">{currentRoutine.duration || 'Indefinida'}</span>
              </div>
              <div className="routine-item">
                <span className="routine-label">Ejercicios por día</span>
                <span className="routine-value">{currentRoutine.exercisesPerDay || 'Variable'}</span>
              </div>
            </div>
            <ButtonOptimized
              onClick={() => navigate('/rutina')}
              variant="secondary"
              size="medium"
              className="start-workout-btn"
              icon={<Dumbbell size={16} />}
            >
              Ver Mi Rutina Completa
            </ButtonOptimized>
          </motion.div>
        )}

        {/* Sección "Ver mis rutinas" - siempre visible */}
        <motion.div className="dashboard-routines-section" variants={cardVariants}>
          <div className="routines-header">
            <Calendar size={24} />
            <h3>Gestionar Rutinas</h3>
          </div>
          <div className="routines-content">
            <p className="routines-description">
              Accede a todas tus rutinas, crea nuevas o edita las existentes
            </p>
            <ButtonOptimized
              onClick={() => navigate('/rutinas')}
              variant="outline"
              size="medium"
              className="routines-manage-btn"
              icon={<ArrowRight size={16} />}
            >
              Ver Mis Rutinas
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