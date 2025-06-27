import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import ResumenStats from "./ResumenStats.jsx";
import ListaDias from "./ListaDias.jsx";
import EjercicioGrupo from "./EjercicioGrupo.jsx";
import InfoEjercicioCard from "./InfoEjercicioCard.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { useEjerciciosDelDiaDB } from "../utils/useEjerciciosDelDiaDB.js";
import { useEjerciciosAgrupados } from "../utils/useEjerciciosAgrupados.js";
import { traducciones } from "../utils/traducciones.js";
import { workoutRoutines, routineDays, exercises, routineExercises } from "../lib/supabase.js";
import { seedExercises } from "../utils/seedExercises.js";
import "../styles/CalendarioRutina.css";

function RutinaGlobal() {
  const { userProfile } = useAuth();
  const [userRoutine, setUserRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [gruposExpandidos, setGruposExpandidos] = useState({});
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
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
  }, []); // Solo se ejecuta una vez al montar el componente

  // Cargar rutina del usuario desde la base de datos
  useEffect(() => {
    const loadUserRoutine = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await workoutRoutines.getActive();
        
        if (error) {
          setError('Error al cargar tu rutina');
          return;
        }

        if (data) {
          setUserRoutine(data);
        } else {
          // No crear rutina automáticamente, solo mostrar mensaje
          setUserRoutine(null);
        }
      } catch (error) {
        setError('Error al cargar tu rutina');
      } finally {
        setLoading(false);
      }
    };

    loadUserRoutine();
  }, [userProfile?.id]); // Solo depende del ID del perfil, no del objeto completo

  // Crear rutina basada en el perfil del usuario
  const createRoutineFromProfile = useCallback(async () => {
    if (!userProfile) {
      return;
    }

    try {
      // Determinar tipo de rutina basado en los días por semana
      let tipoRutina = "FULL BODY";
      if (userProfile.dias_semana === "4_dias") {
        tipoRutina = "UPPER LOWER";
      } else if (userProfile.dias_semana === "6_dias") {
        tipoRutina = "PUSH PULL LEGS";
      }

      // Crear la rutina en la base de datos
      const routineData = {
        user_id: userProfile.id,
        nombre: `Mi Rutina Personalizada`,
        tipo_rutina: tipoRutina,
        dias_por_semana: parseInt(userProfile.dias_semana.split('_')[0]),
        es_activa: true
      };

      const { data, error } = await workoutRoutines.create(routineData);
      
      if (error) {
        setError('Error al crear tu rutina personalizada');
        return;
      }

      setUserRoutine(data[0]);
      
      // Crear días de rutina y ejercicios básicos
      await createRoutineDays(data[0].id, tipoRutina);
      
    } catch (error) {
      setError('Error al crear tu rutina personalizada');
    }
  }, [userProfile]);

  // Crear días de rutina y ejercicios básicos
  const createRoutineDays = async (routineId, tipoRutina) => {
    try {
      // Obtener ejercicios básicos
      const { data: ejerciciosBasicos, error: ejerciciosError } = await exercises.getBasicExercises();
      if (ejerciciosError) {
        return;
      }

      // Definir días según el tipo de rutina
      let diasConfig = [];
      
      if (tipoRutina === "FULL BODY") {
        diasConfig = [
          { nombre: "Día 1 - Full Body", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Espalda', 'Piernas'] },
          { nombre: "Descanso", dia_semana: "Martes", es_descanso: true, orden: 2, grupos: [] },
          { nombre: "Día 2 - Full Body", dia_semana: "Miércoles", es_descanso: false, orden: 3, grupos: ['Hombros', 'Brazos', 'Piernas'] },
          { nombre: "Descanso", dia_semana: "Jueves", es_descanso: true, orden: 4, grupos: [] },
          { nombre: "Día 3 - Full Body", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Pecho', 'Espalda', 'Hombros'] }
        ];
      } else if (tipoRutina === "UPPER LOWER") {
        diasConfig = [
          { nombre: "Día 1 - Upper Body", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Espalda', 'Hombros', 'Brazos'] },
          { nombre: "Día 2 - Lower Body", dia_semana: "Martes", es_descanso: false, orden: 2, grupos: ['Piernas'] },
          { nombre: "Descanso", dia_semana: "Miércoles", es_descanso: true, orden: 3, grupos: [] },
          { nombre: "Día 3 - Upper Body", dia_semana: "Jueves", es_descanso: false, orden: 4, grupos: ['Pecho', 'Espalda', 'Hombros', 'Brazos'] },
          { nombre: "Día 4 - Lower Body", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Piernas'] }
        ];
      } else if (tipoRutina === "PUSH PULL LEGS") {
        diasConfig = [
          { nombre: "Día 1 - Push", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Hombros', 'Brazos'] },
          { nombre: "Día 2 - Pull", dia_semana: "Martes", es_descanso: false, orden: 2, grupos: ['Espalda', 'Brazos'] },
          { nombre: "Día 3 - Legs", dia_semana: "Miércoles", es_descanso: false, orden: 3, grupos: ['Piernas'] },
          { nombre: "Descanso", dia_semana: "Jueves", es_descanso: true, orden: 4, grupos: [] },
          { nombre: "Día 4 - Push", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Pecho', 'Hombros', 'Brazos'] },
          { nombre: "Día 5 - Pull", dia_semana: "Sábado", es_descanso: false, orden: 6, grupos: ['Espalda', 'Brazos'] },
          { nombre: "Día 6 - Legs", dia_semana: "Domingo", es_descanso: false, orden: 7, grupos: ['Piernas'] }
        ];
      }

      // Crear días de rutina
      for (const diaConfig of diasConfig) {
        const { data: dayData, error: dayError } = await routineDays.create({
          routine_id: routineId,
          nombre_dia: diaConfig.nombre,
          dia_semana: diaConfig.dia_semana,
          es_descanso: diaConfig.es_descanso,
          orden: diaConfig.orden
        });

        if (dayError) {
          continue;
        }

        // Si no es día de descanso, asignar ejercicios
        if (!diaConfig.es_descanso && dayData && ejerciciosBasicos) {
          await assignExercisesToDay(dayData[0].id, diaConfig.grupos, ejerciciosBasicos);
        }
      }

      // Recargar la rutina para obtener los días creados
      const { data: updatedRoutine, error: reloadError } = await workoutRoutines.getActive();
      if (!reloadError && updatedRoutine) {
        setUserRoutine(updatedRoutine);
      }
      
    } catch (error) {
    }
  };

  // Asignar ejercicios a un día de rutina
  const assignExercisesToDay = async (dayId, gruposMusculares, ejerciciosBasicos) => {
    try {
      // Filtrar ejercicios por grupos musculares del día
      const ejerciciosDelDia = ejerciciosBasicos.filter(ej => 
        gruposMusculares.includes(ej.grupo_muscular)
      ).slice(0, 6); // Máximo 6 ejercicios por día

      // Crear ejercicios de rutina
      for (let i = 0; i < ejerciciosDelDia.length; i++) {
        const ejercicio = ejerciciosDelDia[i];
        const { error: exerciseError } = await routineExercises.create({
          routine_day_id: dayId,
          exercise_id: ejercicio.id,
          series: 3,
          repeticiones_min: 8,
          repeticiones_max: 12,
          peso_sugerido: null,
          tiempo_descanso: 90,
          orden: i + 1
        });

        if (exerciseError) {
        }
      }
    } catch (error) {
    }
  };

  // Procesar datos de la rutina para el componente
  const processedRoutine = useMemo(() => {
    if (!userRoutine || !userRoutine.routine_days) return null;

    // Usar directamente los días de la rutina sin duplicar
    const result = userRoutine.routine_days.map((day, index) => [
      `Día ${index + 1}`,
      day.nombre_dia || `Día ${index + 1}`
    ]);
    
    return result;
  }, [userRoutine]);

  const diasEntrenamiento = useMemo(() => {
    if (!processedRoutine) return [];
    
    return processedRoutine
      .map(([dia, descripcion], index) => ({ dia, descripcion, index }))
      .filter(({ descripcion }) => !descripcion.toLowerCase().includes(t.descanso.toLowerCase()));
  }, [processedRoutine, t.descanso]);

  // Usar el nuevo hook para obtener ejercicios desde la base de datos
  const { ejercicios: ejerciciosActuales, loading: ejerciciosLoading } = useEjerciciosDelDiaDB(diaSeleccionado, userRoutine);
  const ejerciciosAgrupados = useEjerciciosAgrupados(ejerciciosActuales);

  useEffect(() => {
    if (diasEntrenamiento.length > 0 && diaSeleccionado === null) {
      setDiaSeleccionado(diasEntrenamiento[0].index);
    }
  }, [diasEntrenamiento, diaSeleccionado]);

  useEffect(() => {
    if (Object.keys(ejerciciosAgrupados).length > 0 && Object.keys(gruposExpandidos).length === 0) {
      const primerGrupo = Object.keys(ejerciciosAgrupados)[0];
      setGruposExpandidos({ [primerGrupo]: true });
    }
  }, [ejerciciosAgrupados]);

  const handleClickDia = useCallback((index) => {
    setDiaSeleccionado(index);
  }, []);

  const toggleGrupo = useCallback((grupo) => {
    setGruposExpandidos(prev => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  }, []);

  if (loading) {
    return (
      <div className="calendario-rutina">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando tu rutina personalizada...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendario-rutina">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="calendario-rutina">
        <p className="info-message">
          Completa tu perfil para ver tu rutina personalizada.
        </p>
      </div>
    );
  }

  if (!processedRoutine || processedRoutine.length === 0) {
    return (
      <div className="calendario-rutina">
        <div className="no-routine-message">
          <h3>No hay rutina generada</h3>
          <p>Para ver tu rutina personalizada, necesitas generar una desde el formulario en la página principal.</p>
          <p>Ve a la página de inicio y haz clic en "Editar Perfil y Generar Nueva Rutina".</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="calendario-rutina">
        <ResumenStats formData={userProfile} t={t} diasEntrenamiento={diasEntrenamiento.length} />
        <h4 className="seccion-titulo">Tu Rutina Personalizada</h4>
        <ListaDias
          diasRutina={processedRoutine}
          t={t}
          diaSeleccionado={diaSeleccionado}
          handleClickDia={handleClickDia}
        />

        {diaSeleccionado !== null && (
          <motion.div className="rutina-detalle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {ejerciciosLoading ? (
              <div className="loading-container">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Cargando ejercicios...</p>
                </div>
              </div>
            ) : (
              <EjercicioGrupo
                ejerciciosAgrupados={ejerciciosAgrupados}
                gruposExpandidos={gruposExpandidos}
                toggleGrupo={toggleGrupo}
                setEjercicioSeleccionado={setEjercicioSeleccionado}
                t={t}
              />
            )}
          </motion.div>
        )}

        {ejercicioSeleccionado && (
          <InfoEjercicioCard
            ejercicio={ejercicioSeleccionado}
            onClose={() => setEjercicioSeleccionado(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default RutinaGlobal; 