import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useRoutineStore, useExerciseStore, useUIStore } from "../stores";
import ResumenStats from "./ResumenStats.jsx";
import ListaDias from "./ListaDias.jsx";
import EjercicioGrupo from "./EjercicioGrupo.jsx";
import InfoEjercicioCardOptimized from "./InfoEjercicioCardOptimized.jsx";
import ErrorBoundaryOptimized from "./ErrorBoundaryOptimized.jsx";
import LoadingSpinnerOptimized from "./LoadingSpinnerOptimized.jsx";
import { useEjerciciosAgrupados } from "../utils/useEjerciciosAgrupados.js";
import { traducciones } from "../utils/traducciones.js";
import { seedExercises } from "../utils/seedExercises.js";
import "../styles/CalendarioRutina.css";

function RutinaGlobalOptimized() {
  const { userProfile } = useAuth();
  const { showSuccess, showError, showInfo, expandGroup, collapseAllGroups, expandedGroups } = useUIStore();
  const routineStore = useRoutineStore();
  const exerciseStore = useExerciseStore();
  
  // Estados locales
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  
  // Usar el día seleccionado del store
  const selectedDayIndex = routineStore.selectedDayIndex;
  
  // Ref para controlar inicialización
  const isInitialized = useRef(false);
  
  const language = "es";
  const t = traducciones[language];

  // Verificación temprana - si no hay perfil, no hacer nada
  if (!userProfile) {
    return (
      <div className="calendario-rutina">
        <p className="info-message">
          No se puede cargar la rutina sin perfil de usuario.
        </p>
      </div>
    );
  }

  // Ejecutar seed de ejercicios al cargar el componente (solo una vez)
  useEffect(() => {
    const initializeExercises = async () => {
      await seedExercises();
    };
    
    initializeExercises();
  }, []);

  // Cargar rutina del usuario y ejercicios
  useEffect(() => {
    if (userProfile?.id && !isInitialized.current) {
      isInitialized.current = true;
      routineStore.loadUserRoutine();
      exerciseStore.loadAllExercises();
    }
  }, [userProfile?.id]);

  // Crear rutina basada en el perfil del usuario
  const createRoutineFromProfile = useCallback(async () => {
    if (!userProfile) {
      return;
    }

    try {
      setIsCreatingRoutine(true);
      showInfo("Creando tu rutina personalizada...");

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
        showSuccess("¡Rutina creada exitosamente!");
        // Recargar la rutina para obtener los días creados
        await routineStore.loadUserRoutine();
      } else {
        showError("Error al crear la rutina personalizada");
      }
    } catch (error) {
      showError("Error al crear la rutina personalizada");
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

  // Auto-seleccionar primer día de entrenamiento cuando se carga la rutina (solo una vez)
  useEffect(() => {
    if (routineStore.userRoutine?.routine_days && selectedDayIndex === null && routineStore.userRoutine.routine_days.length > 0) {
      const firstTrainingDay = routineStore.userRoutine.routine_days.find(day => !day.es_descanso);
      if (firstTrainingDay) {
        const dayIndex = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
          .indexOf(firstTrainingDay.dia_semana);
        if (dayIndex !== -1) {
          routineStore.setSelectedDay(dayIndex);
        }
      }
    }
  }, [routineStore.userRoutine?.routine_days?.length, selectedDayIndex]);

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
      console.log('Cambiando ejercicio:', oldExercise.nombre, 'por:', newExercise.nombre);
      
      // Usar la función del store para cambiar el ejercicio
      const success = await routineStore.changeExercise(oldExercise, newExercise);
      
      if (success) {
        showSuccess(`Ejercicio cambiado exitosamente: ${oldExercise.nombre} → ${newExercise.nombre}`);
        
        // Forzar actualización del estado local
        setTimeout(() => {
          if (selectedDayIndex !== null) {
            routineStore.loadExercisesForDay(selectedDayIndex);
          }
        }, 100);
      } else {
        showError('Error al cambiar el ejercicio. Inténtalo de nuevo.');
      }
      
    } catch (error) {
      console.error('Error cambiando ejercicio:', error);
      showError(`Error al cambiar el ejercicio: ${error.message}`);
    }
  }, [routineStore, showSuccess, showError, selectedDayIndex]);

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
    return routineStore.getCurrentDayExercises() || [];
  }, [selectedDayIndex, routineStore.exercisesByDay, routineStore.userRoutine]);

  // Obtener día seleccionado
  const selectedDay = useMemo(() => {
    if (selectedDayIndex === null) return null;
    return routineStore.getSelectedDay();
  }, [selectedDayIndex]);

  // Usar el hook optimizado para ejercicios agrupados
  const ejerciciosAgrupados = useEjerciciosAgrupados(currentDayExercises);

  // Mostrar loading
  if (routineStore.loading || isCreatingRoutine) {
    return (
      <div className="calendario-rutina">
        <LoadingSpinnerOptimized 
          message={isCreatingRoutine ? "Creando tu rutina..." : "Cargando tu rutina..."} 
          size="large"
          variant="simple"
        />
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
        >
          {/* Resumen de estadísticas */}
          <ResumenStats 
            formData={userProfile} 
            t={t}
            diasEntrenamiento={diasEntrenamiento.length}
          />

          {/* Lista de días */}
          <ListaDias
            diasRutina={processedRoutine || []}
            t={t}
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
                    t={t}
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
  );
}

export default RutinaGlobalOptimized; 