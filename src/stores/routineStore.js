import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { workoutRoutines, routineDays, routineExercises } from '../lib/supabase';

export const useRoutineStore = create(
  devtools(
    (set, get) => ({
      // Estado
      userRoutine: null,
      currentDay: null,
      selectedDayIndex: null,
      loading: false,
      error: null,
      routineDays: [],
      exercisesByDay: {},

      // Acciones
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Cargar rutina del usuario
      loadUserRoutine: async (userId) => {
        try {
          set({ loading: true, error: null });
          
          let { data, error } = await workoutRoutines.getActive();
          
          if (error) {
            console.error('❌ RoutineStore: Error al cargar rutina:', error);
            set({ error: 'Error al cargar tu rutina', loading: false });
            return;
          }

          if (data) {
            // Verificar si la rutina tiene ejercicios duplicados y corregir automáticamente
            const needsCorrection = await get().checkAndFixDuplicateExercises(data);
            
            if (needsCorrection) {
              // Si se corrigió, recargar la rutina
              const { data: correctedData, error: correctedError } = await workoutRoutines.getActive();
              if (!correctedError && correctedData) {
                data = correctedData;
              }
            }
            
            // Limpiar el cache de ejercicios antes de cargar nueva rutina
            set({ 
              userRoutine: data, 
              routineDays: data.routine_days || [],
              exercisesByDay: {},
              loading: false 
            });
            
            // Seleccionar el primer día de entrenamiento por defecto
            const firstTrainingDay = data.routine_days?.find(day => !day.es_descanso);
            if (firstTrainingDay) {
              const dayIndex = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
                .indexOf(firstTrainingDay.dia_semana);
              get().setSelectedDay(dayIndex);
            } else if (data.routine_days && data.routine_days.length > 0) {
              // Si no hay días de entrenamiento, seleccionar el primer día disponible
              const firstDay = data.routine_days[0];
              const dayIndex = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
                .indexOf(firstDay.dia_semana);
              if (dayIndex !== -1) {
                get().setSelectedDay(dayIndex);
              }
            }
          } else {
            set({ userRoutine: null, loading: false });
          }
        } catch (error) {
          set({ error: 'Error al cargar tu rutina', loading: false });
        }
      },

      // Verificar y corregir ejercicios duplicados automáticamente
      checkAndFixDuplicateExercises: async (routine) => {
        try {
          if (!routine || !routine.routine_days) return false;
          
          let needsCorrection = false;
          
          for (const day of routine.routine_days) {
            if (day.es_descanso || !day.routine_exercises) continue;
            
            // Agrupar ejercicios por grupo muscular
            const exercisesByGroup = {};
            const duplicates = [];
            
            day.routine_exercises.forEach((re, index) => {
              if (!re.exercises) return;
              
              const grupo = re.exercises.grupo_muscular;
              if (!exercisesByGroup[grupo]) {
                exercisesByGroup[grupo] = [];
              }
              exercisesByGroup[grupo].push({ ...re, originalIndex: index });
            });
            
            // Verificar duplicados
            Object.keys(exercisesByGroup).forEach(grupo => {
              if (exercisesByGroup[grupo].length > 1) {
                // Mantener solo el primer ejercicio de cada grupo
                const toRemove = exercisesByGroup[grupo].slice(1);
                duplicates.push(...toRemove);
                needsCorrection = true;
              }
            });
            
            // Eliminar duplicados si los hay
            if (duplicates.length > 0) {
              console.log(`🔧 Corrigiendo ${duplicates.length} ejercicios duplicados en ${day.dia_semana}`);
              
              for (const duplicate of duplicates) {
                await routineExercises.delete(duplicate.id);
              }
            }
          }
          
          if (needsCorrection) {
            console.log('✅ Rutina corregida automáticamente');
          }
          
          return needsCorrection;
        } catch (error) {
          console.error('❌ Error corrigiendo rutina:', error);
          return false;
        }
      },

      // Crear nueva rutina
      createRoutine: async (routineData) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await workoutRoutines.create(routineData);
          
          if (error) {
            set({ error: 'Error al crear la rutina', loading: false });
            return null;
          }

          set({ 
            userRoutine: data[0], 
            routineDays: data[0].routine_days || [],
            loading: false 
          });
          
          return data[0];
        } catch (error) {
          set({ error: 'Error al crear la rutina', loading: false });
          return null;
        }
      },

      // Actualizar rutina
      updateRoutine: async (routineId, updates) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await workoutRoutines.update({
            id: routineId,
            ...updates
          });
          
          if (error) {
            set({ error: 'Error al actualizar la rutina', loading: false });
            return false;
          }

          // Recargar la rutina actualizada
          await get().loadUserRoutine();
          return true;
        } catch (error) {
          set({ error: 'Error al actualizar la rutina', loading: false });
          return false;
        }
      },

      // Seleccionar día
      setSelectedDay: (dayIndex) => {
        const { selectedDayIndex } = get();
        set({ selectedDayIndex: dayIndex });
        // Siempre cargar ejercicios del día seleccionado
        get().loadExercisesForDay(dayIndex);
      },

      // Cargar ejercicios para un día específico
      loadExercisesForDay: async (dayIndex) => {
        const { userRoutine } = get();
        if (!userRoutine || !userRoutine.routine_days) return;

        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaSemana = diasSemana[dayIndex];
        
        const dayData = userRoutine.routine_days.find(day => day.dia_semana === diaSemana);
        
        if (dayData && dayData.routine_exercises && dayData.routine_exercises.length > 0) {
          const exercises = dayData.routine_exercises
            .filter(re => re.exercises) // Filtrar ejercicios que existan
            .map(re => ({
              ...re.exercises,
              series: re.series,
              repeticiones_min: re.repeticiones_min,
              repeticiones_max: re.repeticiones_max,
              peso_sugerido: re.peso_sugerido,
              tiempo_descanso: re.tiempo_descanso,
              orden: re.orden,
              routine_exercise_id: re.id
            }))
            .sort((a, b) => a.orden - b.orden); // Ordenar por orden

          set(state => ({
            exercisesByDay: {
              ...state.exercisesByDay,
              [dayIndex]: exercises
            }
          }));
        } else {
          set(state => ({
            exercisesByDay: {
              ...state.exercisesByDay,
              [dayIndex]: []
            }
          }));
        }
      },

      // Agregar ejercicio a un día
      addExerciseToDay: async (dayId, exerciseData) => {
        try {
          const { error } = await routineExercises.create(exerciseData);
          
          if (error) {
            set({ error: 'Error al agregar ejercicio' });
            return false;
          }

          // Recargar ejercicios del día
          await get().loadExercisesForDay(get().selectedDayIndex);
          return true;
        } catch (error) {
          set({ error: 'Error al agregar ejercicio' });
          return false;
        }
      },

      // Actualizar ejercicio
      updateExercise: async (exerciseId, updates) => {
        try {
          const { error } = await routineExercises.update(exerciseId, updates);
          
          if (error) {
            set({ error: 'Error al actualizar ejercicio' });
            return false;
          }

          // Recargar ejercicios del día
          await get().loadExercisesForDay(get().selectedDayIndex);
          return true;
        } catch (error) {
          set({ error: 'Error al actualizar ejercicio' });
          return false;
        }
      },

      // Cambiar ejercicio por otro del mismo grupo muscular
      changeExercise: async (oldExercise, newExercise) => {
        try {
          set({ loading: true, error: null });
          
          // Obtener la rutina actual
          const { userRoutine } = get();
          if (!userRoutine || !userRoutine.routine_days) {
            throw new Error('No se encontró la rutina del usuario');
          }

          // Encontrar el día actual
          const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          const currentDayIndex = get().selectedDayIndex;
          const diaSemana = diasSemana[currentDayIndex];
          const currentDay = userRoutine.routine_days.find(day => day.dia_semana === diaSemana);
          
          if (!currentDay || !currentDay.routine_exercises) {
            throw new Error('No se encontró el día de rutina');
          }

          // Encontrar el ejercicio actual en la rutina
          let currentRoutineExercise = null;
          
          if (oldExercise.routine_exercise_id) {
            currentRoutineExercise = currentDay.routine_exercises.find(re => 
              re.id === oldExercise.routine_exercise_id
            );
          }
          
          if (!currentRoutineExercise) {
            currentRoutineExercise = currentDay.routine_exercises.find(re => 
              re.exercises?.nombre === oldExercise.nombre || re.exercises?.id === oldExercise.id
            );
          }

          if (!currentRoutineExercise) {
            throw new Error('No se encontró el ejercicio en la rutina');
          }

          // Actualizar el ejercicio en la base de datos
          const { error } = await routineExercises.update(currentRoutineExercise.id, {
            exercise_id: newExercise.id
          });

          if (error) {
            throw error;
          }

          // Recargar la rutina completa para mostrar los cambios
          await get().loadUserRoutine();
          
          // Forzar actualización del estado local
          set(state => ({
            ...state,
            loading: false,
            // Limpiar el cache de ejercicios para forzar recarga
            exercisesByDay: {
              ...state.exercisesByDay,
              [currentDayIndex]: undefined // Esto forzará una recarga
            }
          }));
          
          // Recargar ejercicios del día actual
          await get().loadExercisesForDay(currentDayIndex);
          
          return true;
        } catch (error) {
          set({ error: `Error al cambiar ejercicio: ${error.message}`, loading: false });
          return false;
        }
      },

      // Eliminar ejercicio
      removeExercise: async (exerciseId) => {
        try {
          const { error } = await routineExercises.delete(exerciseId);
          
          if (error) {
            set({ error: 'Error al eliminar ejercicio' });
            return false;
          }

          // Recargar ejercicios del día
          await get().loadExercisesForDay(get().selectedDayIndex);
          return true;
        } catch (error) {
          set({ error: 'Error al eliminar ejercicio' });
          return false;
        }
      },

      // Obtener ejercicios del día seleccionado
      getCurrentDayExercises: () => {
        const { selectedDayIndex, exercisesByDay } = get();
        return exercisesByDay[selectedDayIndex] || [];
      },

      // Obtener día seleccionado
      getSelectedDay: () => {
        const { selectedDayIndex, routineDays } = get();
        if (selectedDayIndex === null || !routineDays.length) return null;
        
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diaSemana = diasSemana[selectedDayIndex];
        
        return routineDays.find(day => day.dia_semana === diaSemana);
      },

      // Obtener rutina actual
      getCurrentRoutine: () => {
        const { userRoutine } = get();
        if (!userRoutine) return null;
        
        return {
          type: userRoutine.tipo_rutina || 'Personalizada',
          exercisesPerDay: userRoutine.routine_days?.reduce((total, day) => {
            return total + (day.routine_exercises?.length || 0);
          }, 0) / (userRoutine.routine_days?.length || 1),
          totalDays: userRoutine.routine_days?.length || 0,
          trainingDays: userRoutine.routine_days?.filter(day => !day.es_descanso).length || 0
        };
      },

      // Obtener próximo entrenamiento
      getNextWorkout: () => {
        const { userRoutine } = get();
        if (!userRoutine?.routine_days) return null;
        
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
        const todayIndex = today === 0 ? 6 : today - 1; // Convertir a índice 0-6 (Lunes-Domingo)
        
        // Buscar el próximo día de entrenamiento
        for (let i = 0; i < 7; i++) {
          const checkIndex = (todayIndex + i) % 7;
          const diaSemana = diasSemana[checkIndex];
          const dayData = userRoutine.routine_days.find(day => day.dia_semana === diaSemana);
          
          if (dayData && !dayData.es_descanso) {
            return {
              day: diaSemana,
              focus: dayData.routine_exercises?.map(re => re.exercises?.grupo_muscular).filter(Boolean).join(', ') || 'General',
              exercises: dayData.routine_exercises?.length || 0
            };
          }
        }
        
        return null;
      },



      // Resetear estado
      reset: () => {
        set({
          userRoutine: null,
          currentDay: null,
          selectedDayIndex: null,
          loading: false,
          error: null,
          routineDays: [],
          exercisesByDay: {}
        });
      }
    }),
    {
      name: 'routine-store',
      enabled: import.meta.env.DEV
    }
  )
); 