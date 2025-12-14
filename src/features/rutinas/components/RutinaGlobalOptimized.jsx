import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRoutineStore, useExerciseStore, useUIStore } from '@/stores'
import { userProfiles, workoutRoutines } from '@/lib/supabase'
import ResumenStats from '@/features/home/components/ResumenStats.jsx'
import ListaDias from './ListaDias.jsx'
import EjercicioGrupo from './EjercicioGrupo.jsx'
import InfoEjercicioCardOptimized from './InfoEjercicioCardOptimized.jsx'
import ErrorBoundaryOptimized from '@/features/common/components/ErrorBoundaryOptimized.jsx'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEjerciciosAgrupados } from '@/hooks/useEjerciciosAgrupados.js'
import { seedExercises } from '@/data/seedExercises.js'
import '@/styles/components/rutinas/CalendarioRutina.css'

/**
 * Componente principal de visualización de rutinas
 * Muestra calendario semanal, estadísticas y ejercicios por día
 */
function RutinaGlobalOptimized () {
  const { userProfile } = useAuth();
  const { expandGroup, collapseAllGroups, expandedGroups } = useUIStore();
  const routineStore = useRoutineStore();
  const exerciseStore = useExerciseStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRoutines, setUserRoutines] = useState([]);
  const [showChooseBanner, setShowChooseBanner] = useState(false);
  
  // Estados locales
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [reloadAttempted, setReloadAttempted] = useState(false);
  
  // Usar el día seleccionado del store
  const selectedDayIndex = routineStore.selectedDayIndex;
  
  // Ref para controlar inicialización
  const isInitialized = useRef(false);
  const isProcessingDaySelection = useRef(false);
  
  const language = "es";
  
  // Obtener día desde URL si existe
  const urlParams = new URLSearchParams(location.search);
  const dayFromUrl = urlParams.get('day');

  // Verificación temprana - si no hay perfil, intentar recargarlo
  useEffect(() => {
    if (!userProfile && !reloadAttempted) {
      setReloadAttempted(true);
      window.dispatchEvent(new CustomEvent('profileReload'));
    }
  }, [userProfile, reloadAttempted]);

  // Permitir vista sin perfil: se mostrarán campos "No especificado" en el resumen

  // Ejecutar seed de ejercicios al cargar el componente (solo una vez)
  useEffect(() => {
    const initializeExercises = async () => {
      await seedExercises();
    };
    
    initializeExercises();
  }, []);

  // Cargar rutina del usuario y ejercicios
  useEffect(() => {
    if (userProfile?.id) {
      routineStore.loadUserRoutine();
      exerciseStore.loadAllExercises();
      // cargar lista de rutinas del usuario para permitir múltiples
      (async () => {
        const { data } = await workoutRoutines.getUserRoutines();
        setUserRoutines(data || []);
        setShowChooseBanner((data || []).length > 1);
      })();
      
      // Marcar como inicializado solo después de cargar
      if (!isInitialized.current) {
        isInitialized.current = true;
      }
    }
  }, [userProfile?.id]);

  // Crear rutina basada en el perfil del usuario
  const createRoutineFromProfile = useCallback(async () => {
    if (!userProfile) {
      return;
    }

    try {
      setIsCreatingRoutine(true);
      // Removed notification: showInfo("Creando tu rutina personalizada...");

      // Determinar tipo de rutina basado en los días por semana
      let tipoRutina = "FULL BODY";
      if (userProfile.dias_semana === "4_dias") {
        tipoRutina = "UPPER LOWER";
      } else if (userProfile.dias_semana === "6_dias") {
        tipoRutina = "PUSH PULL LEGS";
      }

      // Crear la rutina usando el store
      const routineData = {
        user_id: userProfile.id,
        nombre: `Mi Rutina Personalizada`,
        tipo_rutina: tipoRutina,
        dias_por_semana: parseInt(userProfile.dias_semana.split('_')[0]),
        es_activa: true
      };

      const newRoutine = await routineStore.createRoutine(routineData);
      
      if (newRoutine) {
        // Removed notification: showSuccess("¡Rutina creada exitosamente!");
        // Recargar la rutina para obtener los días creados
        await routineStore.loadUserRoutine();
      } else {
        console.error("Error al crear la rutina personalizada");
      }
    } catch (error) {
      console.error("Error al crear la rutina personalizada");
    } finally {
      setIsCreatingRoutine(false);
    }
  }, [userProfile?.id, userProfile?.dias_semana]);

  // Procesar datos de la rutina para el componente
  const processedRoutine = useMemo(() => {
    const userRoutine = routineStore.userRoutine;
    if (!userRoutine || !userRoutine.routine_days) {
      // Si no hay rutina, crear una semana básica
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      return diasSemana.map((dia, index) => [dia, 'Descanso', true, index]);
    }

    // Crear una semana completa con todos los días
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const result = [];

    diasSemana.forEach((diaSemana, index) => {
      // Buscar si existe un día de rutina para este día de la semana
      const rutinaDay = userRoutine.routine_days.find(day => day.dia_semana === diaSemana);
      
      if (rutinaDay) {
        // Si existe un día de rutina, usar su información
        result.push([
          diaSemana,
          rutinaDay.nombre_dia,
          rutinaDay.es_descanso || false,
          index
        ]);
      } else {
        // Si no existe, crear un día de descanso
        result.push([
          diaSemana,
          'Descanso',
          true,
          index
        ]);
      }
    });
    
    return result;
  }, [routineStore.userRoutine]);

  const diasEntrenamiento = useMemo(() => {
    if (!processedRoutine) return [];
    
    return processedRoutine
      .map(([dia, descripcion, esDescanso, index]) => ({ 
        dia, 
        descripcion, 
        esDescanso, 
        index 
      }))
      .filter(({ esDescanso }) => !esDescanso);
  }, [processedRoutine]);

  // Seleccionar día desde URL si existe
  useEffect(() => {
    if (!routineStore.userRoutine?.routine_days || routineStore.userRoutine.routine_days.length === 0) {
      return;
    }
    
    if (isProcessingDaySelection.current) {
      return;
    }
    
    // Si hay un día en la URL, usarlo
    if (dayFromUrl) {
      isProcessingDaySelection.current = true;
      
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const dayIndex = diasSemana.indexOf(dayFromUrl);
      
      if (dayIndex !== -1) {
        const diaExiste = routineStore.userRoutine.routine_days.some(day => day.dia_semana === dayFromUrl);
        
        if (diaExiste) {
          routineStore.setSelectedDay(dayIndex);
          
          // Limpiar el parámetro de la URL después de seleccionar
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
      
      setTimeout(() => {
        isProcessingDaySelection.current = false;
      }, 100);
      
      return;
    }
    
    // Si ya hay un día seleccionado, respetarlo
    if (selectedDayIndex !== null) {
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const diaSeleccionado = diasSemana[selectedDayIndex];
      const diaExiste = routineStore.userRoutine.routine_days.some(day => day.dia_semana === diaSeleccionado);
      
      if (diaExiste) {
        return;
      }
    }
    
    // Si no hay día seleccionado ni en URL, seleccionar el primer día de entrenamiento disponible
    if (selectedDayIndex === null) {
      isProcessingDaySelection.current = true;
      
      const firstTrainingDay = routineStore.userRoutine.routine_days.find(day => 
        day.routine_exercises && day.routine_exercises.length > 0
      );
      if (firstTrainingDay) {
        const dayIndex = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          .indexOf(firstTrainingDay.dia_semana);
        if (dayIndex !== -1) {
          routineStore.setSelectedDay(dayIndex);
        }
      } else {
        // Si no hay días de entrenamiento, seleccionar el primer día disponible
        const firstDay = routineStore.userRoutine.routine_days[0];
        const dayIndex = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          .indexOf(firstDay.dia_semana);
        if (dayIndex !== -1) {
          routineStore.setSelectedDay(dayIndex);
        }
      }
      
      // Resetear el flag después de un breve delay
      setTimeout(() => {
        isProcessingDaySelection.current = false;
      }, 100);
    }
  }, [routineStore.userRoutine?.routine_days?.length, routineStore, dayFromUrl, selectedDayIndex]);

  // Resetear grupos expandidos cuando cambia el día seleccionado
  useEffect(() => {
    if (selectedDayIndex !== null) {
      collapseAllGroups();
    }
  }, [selectedDayIndex]);

  // Manejar selección de ejercicio
  const handleEjercicioClick = useCallback((ejercicio) => {
    setEjercicioSeleccionado(ejercicio);
  }, []);

  // Manejar cierre de información de ejercicio
  const handleCloseEjercicioInfo = useCallback(() => {
    setEjercicioSeleccionado(null);
  }, []);

  // Manejar cambio de ejercicio
  const handleExerciseChange = useCallback(async (oldExercise, newExercise) => {
    try {
      // Usar la función del store para cambiar el ejercicio
      const success = await routineStore.changeExercise(oldExercise, newExercise);
      
      if (success) {
        // Removed notification: showSuccess(`Ejercicio cambiado exitosamente: ${oldExercise.nombre} → ${newExercise.nombre}`);
        
        // Forzar actualización del estado local
        setTimeout(() => {
          if (selectedDayIndex !== null) {
            routineStore.loadExercisesForDay(selectedDayIndex);
          }
        }, 100);
      } else {
        console.error('Error al cambiar el ejercicio. Inténtalo de nuevo.');
      }
      
    } catch (error) {
      console.error('Error cambiando ejercicio:', error);
      console.error(`Error al cambiar el ejercicio: ${error.message}`);
    }
  }, [routineStore, selectedDayIndex]);

  // Manejar toggle de grupo
  const handleToggleGrupo = useCallback((grupoId) => {
    const { toggleGroup } = useUIStore.getState();
    toggleGroup(grupoId);
  }, []);

  // Manejar cambio de día seleccionado
  const handleDiaClick = useCallback((index) => {
    routineStore.setSelectedDay(index);
  }, [routineStore]);

  // Obtener ejercicios del día actual
  const currentDayExercises = useMemo(() => {
    if (selectedDayIndex === null) return [];
    const exercises = routineStore.getCurrentDayExercises() || [];
    return exercises;
  }, [selectedDayIndex, routineStore.exercisesByDay, routineStore.userRoutine]);

  // Obtener día seleccionado
  const selectedDay = useMemo(() => {
    if (selectedDayIndex === null) return null;
    return routineStore.getSelectedDay();
  }, [selectedDayIndex]);

  // Usar el hook optimizado para ejercicios agrupados
  const ejerciciosAgrupados = useEjerciciosAgrupados(currentDayExercises);

  // Si está creando rutina, mostrar mensaje específico
  if (isCreatingRoutine) {
    return (
      <div className="calendario-rutina">
        <div className="no-routine-message">
          <h3>Creando tu rutina personalizada...</h3>
          <p>Estamos configurando tu rutina basada en tu perfil y objetivos</p>
          <div className="routine-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🏋️‍♂️</div>
              <div className="placeholder-text">
                <div className="placeholder-line"></div>
                <div className="placeholder-line short"></div>
                <div className="placeholder-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (routineStore.error) {
    return (
      <div className="calendario-rutina">
        <div className="error-message">
          <p>{routineStore.error}</p>
          <button onClick={() => routineStore.loadUserRoutine()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay rutina, mostrar opción para crear
  if (!routineStore.userRoutine) {
    return (
      <div className="calendario-rutina">
        <div className="no-routine-message">
          <h3>No tienes una rutina configurada</h3>
          <p>Haz clic en el botón para crear tu rutina personalizada basada en tu perfil.</p>
          <button 
            onClick={createRoutineFromProfile}
            disabled={isCreatingRoutine}
            className="create-routine-btn"
          >
            {isCreatingRoutine ? "Creando..." : "Crear Rutina Personalizada"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryOptimized>
      <div className="calendario-rutina">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rutina-container"
          layout={false}
        >
          {/* Card Unificada: Rutina Actual + Stats */}
          <div className="routine-summary-card">
            {/* Header de la card con nombre de rutina y selector */}
            <div className="routine-card-header">
              <div className="routine-info">
                <h2 className="routine-name">
                  {routineStore.userRoutine?.nombre || 'Mi Rutina'}
                </h2>
                <p className="routine-type">
                  {routineStore.userRoutine?.tipo_rutina || 'Personalizada'}
                </p>
              </div>
              {showChooseBanner && (
                <button 
                  className="btn-change-routine" 
                  onClick={() => navigate('/rutinas')}
                  title="Cambiar rutina"
                >
                  <span className="change-icon">↻</span>
                  <span className="change-text">Cambiar</span>
                </button>
              )}
            </div>

            {/* Stats integradas en la misma card */}
            <div className="routine-stats-grid" style={{ width: '100%', display: 'block' }}>
              <ResumenStats 
                key={`resumen-${location.pathname}-${routineStore.userRoutine?.id || 'no-routine'}`}
                formData={userProfile || {}} 
                diasEntrenamiento={diasEntrenamiento.length}
                routineData={routineStore.userRoutine}
              />
            </div>
          </div>



          {/* Lista de días */}
          <ListaDias
            diasRutina={processedRoutine || []}
            diaSeleccionado={selectedDayIndex}
            handleClickDia={handleDiaClick}
          />
          
          {/* Ejercicios del día seleccionado */}
          {selectedDayIndex !== null && (
            <motion.div
              key={selectedDayIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="ejercicios-container"
            >
              <h3>
                {selectedDay?.dia_semana || `Día ${selectedDayIndex + 1}`}
              </h3>
              
              {(currentDayExercises || []).length === 0 ? (
                <p className="no-exercises">
                  {selectedDay?.es_descanso 
                    ? "Día de descanso - ¡Recupera energía!" 
                    : "No hay ejercicios asignados para este día."
                  }
                </p>
              ) : (
                <div className="ejercicios-grupos">
                  <EjercicioGrupo
                    ejerciciosAgrupados={ejerciciosAgrupados || {}}
                    gruposExpandidos={expandedGroups}
                    toggleGrupo={handleToggleGrupo}
                    setEjercicioSeleccionado={handleEjercicioClick}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Información detallada del ejercicio */}
          {ejercicioSeleccionado && (
            <InfoEjercicioCardOptimized
              ejercicio={ejercicioSeleccionado}
              onClose={handleCloseEjercicioInfo}
              onExerciseChange={handleExerciseChange}
            />
          )}
        </motion.div>
      </div>
    </ErrorBoundaryOptimized>
  )
}

export default RutinaGlobalOptimized 