import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { exercises } from '../lib/supabase';

export const useExerciseStore = create(
  devtools(
    (set, get) => ({
      // Estado
      allExercises: [],
      exercisesByMuscleGroup: {},
      loading: false,
      error: null,
      filters: {
        muscleGroup: null,
        difficulty: null,
        equipment: null,
        isCompound: null
      },

      // Acciones
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Cargar todos los ejercicios
      loadAllExercises: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await exercises.getAll();
          
          if (error) {
            set({ error: 'Error al cargar ejercicios', loading: false });
            return;
          }

          // Organizar ejercicios por grupo muscular
          const exercisesByGroup = data.reduce((acc, exercise) => {
            const group = exercise.grupo_muscular;
            if (!acc[group]) {
              acc[group] = [];
            }
            acc[group].push(exercise);
            return acc;
          }, {});

          set({ 
            allExercises: data, 
            exercisesByMuscleGroup: exercisesByGroup,
            loading: false 
          });
        } catch (error) {
          set({ error: 'Error al cargar ejercicios', loading: false });
        }
      },

      // Obtener ejercicios por grupo muscular
      getExercisesByMuscleGroup: (muscleGroup) => {
        const { exercisesByMuscleGroup } = get();
        return exercisesByMuscleGroup[muscleGroup] || [];
      },

      // Filtrar ejercicios
      setFilter: (filterType, value) => {
        set(state => ({
          filters: {
            ...state.filters,
            [filterType]: value
          }
        }));
      },

      // Obtener ejercicios filtrados
      getFilteredExercises: () => {
        const { allExercises, filters } = get();
        
        return allExercises.filter(exercise => {
          // Filtro por grupo muscular
          if (filters.muscleGroup && exercise.grupo_muscular !== filters.muscleGroup) {
            return false;
          }
          
          // Filtro por dificultad
          if (filters.difficulty && exercise.dificultad !== filters.difficulty) {
            return false;
          }
          
          // Filtro por equipamiento
          if (filters.equipment && exercise.equipamiento !== filters.equipment) {
            return false;
          }
          
          // Filtro por tipo de ejercicio
          if (filters.isCompound !== null && exercise.es_compuesto !== filters.isCompound) {
            return false;
          }
          
          return true;
        });
      },

      // Buscar ejercicios por nombre
      searchExercises: (searchTerm) => {
        const { allExercises } = get();
        
        if (!searchTerm.trim()) {
          return allExercises;
        }
        
        const term = searchTerm.toLowerCase();
        return allExercises.filter(exercise => 
          exercise.nombre.toLowerCase().includes(term) ||
          exercise.descripcion?.toLowerCase().includes(term) ||
          exercise.grupo_muscular.toLowerCase().includes(term)
        );
      },

      // Obtener ejercicios compuestos
      getCompoundExercises: () => {
        const { allExercises } = get();
        return allExercises.filter(exercise => exercise.es_compuesto);
      },

      // Obtener ejercicios por dificultad
      getExercisesByDifficulty: (difficulty) => {
        const { allExercises } = get();
        return allExercises.filter(exercise => exercise.dificultad === difficulty);
      },

      // Obtener grupos musculares disponibles
      getAvailableMuscleGroups: () => {
        const { exercisesByMuscleGroup } = get();
        return Object.keys(exercisesByMuscleGroup);
      },

      // Obtener equipamiento disponible
      getAvailableEquipment: () => {
        const { allExercises } = get();
        const equipment = new Set();
        
        allExercises.forEach(exercise => {
          if (exercise.equipamiento) {
            equipment.add(exercise.equipamiento);
          }
        });
        
        return Array.from(equipment);
      },

      // Obtener ejercicio por ID
      getExerciseById: (id) => {
        const { allExercises } = get();
        return allExercises.find(exercise => exercise.id === id);
      },

      // Obtener detalles del ejercicio por nombre
      getExerciseDetails: (exerciseName) => {
        const { allExercises } = get();
        return allExercises.find(exercise => exercise.nombre === exerciseName);
      },

      // Obtener ejercicios recomendados para un objetivo
      getRecommendedExercises: (objective, experience) => {
        const { allExercises } = get();
        
        // Lógica básica de recomendación
        let recommended = allExercises;
        
        // Filtrar por experiencia
        if (experience === 'principiante') {
          recommended = recommended.filter(exercise => 
            exercise.dificultad === 'principiante'
          );
        } else if (experience === 'intermedio') {
          recommended = recommended.filter(exercise => 
            exercise.dificultad !== 'avanzado'
          );
        }
        
        // Priorizar ejercicios compuestos para ganar músculo
        if (objective === 'ganar_musculo') {
          recommended.sort((a, b) => {
            if (a.es_compuesto && !b.es_compuesto) return -1;
            if (!a.es_compuesto && b.es_compuesto) return 1;
            return 0;
          });
        }
        
        return recommended.slice(0, 20); // Top 20 recomendados
      },

      // Resetear filtros
      resetFilters: () => {
        set({
          filters: {
            muscleGroup: null,
            difficulty: null,
            equipment: null,
            isCompound: null
          }
        });
      },

      // Resetear estado
      reset: () => {
        set({
          allExercises: [],
          exercisesByMuscleGroup: {},
          loading: false,
          error: null,
          filters: {
            muscleGroup: null,
            difficulty: null,
            equipment: null,
            isCompound: null
          }
        });
      }
    }),
    {
      name: 'exercise-store',
      enabled: import.meta.env.DEV
    }
  )
); 