import { useState, useEffect, useCallback, useRef } from 'react';
import { useRoutineStore, useExerciseStore, useUserStore } from '../stores';

/**
 * Hook personalizado para optimizar la carga de datos con cache y deduplicación
 */
export const useOptimizedData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const initializationRef = useRef(false);

  // Stores
  const routineStore = useRoutineStore();
  const exerciseStore = useExerciseStore();
  const userStore = useUserStore();

  // Cache para evitar cargas duplicadas
  const cacheRef = useRef({
    exercises: null,
    userProfile: null,
    userRoutine: null
  });

  // Función para cargar datos de forma optimizada
  const loadDataOptimized = useCallback(async (forceRefresh = false) => {
    if (initializationRef.current && !forceRefresh) {
      return;
    }

    try {
      initializationRef.current = true;
      setInitializationError(null);

      // Cargar datos en paralelo
      const promises = [];

      // Cargar ejercicios si no están en cache
      if (!cacheRef.current.exercises || forceRefresh) {
        promises.push(
          exerciseStore.loadAllExercises().then(() => {
            cacheRef.current.exercises = true;
          })
        );
      }

      // Cargar perfil de usuario si no está en cache
      if (!cacheRef.current.userProfile || forceRefresh) {
        promises.push(
          userStore.loadUserProfile().then(() => {
            cacheRef.current.userProfile = true;
          })
        );
      }

      // Cargar rutina del usuario si no está en cache
      if (!cacheRef.current.userRoutine || forceRefresh) {
        promises.push(
          routineStore.loadUserRoutine().then(() => {
            cacheRef.current.userRoutine = true;
          })
        );
      }

      // Esperar a que todas las cargas se completen
      await Promise.allSettled(promises);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error en carga optimizada:', error);
      setInitializationError(error.message);
    }
  }, [exerciseStore, userStore, routineStore]);

  // Función para refrescar datos específicos
  const refreshData = useCallback(async (dataType) => {
    try {
      switch (dataType) {
        case 'exercises':
          await exerciseStore.loadAllExercises();
          cacheRef.current.exercises = true;
          break;
        case 'userProfile':
          await userStore.loadUserProfile();
          cacheRef.current.userProfile = true;
          break;
        case 'userRoutine':
          await routineStore.loadUserRoutine();
          cacheRef.current.userRoutine = true;
          break;
        case 'all':
          await loadDataOptimized(true);
          break;
        default:
          console.warn('Tipo de datos no reconocido:', dataType);
      }
    } catch (error) {
      console.error(`Error refrescando ${dataType}:`, error);
    }
  }, [exerciseStore, userStore, routineStore, loadDataOptimized]);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    cacheRef.current = {
      exercises: null,
      userProfile: null,
      userRoutine: null
    };
  }, []);

  // Función para verificar si los datos están cargados
  const isDataLoaded = useCallback((dataType) => {
    switch (dataType) {
      case 'exercises':
        return exerciseStore.allExercises.length > 0;
      case 'userProfile':
        return !!userStore.userProfile;
      case 'userRoutine':
        return !!routineStore.userRoutine;
      case 'all':
        return (
          exerciseStore.allExercises.length > 0 &&
          !!userStore.userProfile &&
          !!routineStore.userRoutine
        );
      default:
        return false;
    }
  }, [exerciseStore.allExercises.length, userStore.userProfile, routineStore.userRoutine]);

  // Función para obtener estado de carga
  const getLoadingState = useCallback(() => {
    return {
      exercises: exerciseStore.loading,
      userProfile: userStore.loading,
      userRoutine: routineStore.loading,
      any: exerciseStore.loading || userStore.loading || routineStore.loading
    };
  }, [exerciseStore.loading, userStore.loading, routineStore.loading]);

  // Función para obtener errores
  const getErrors = useCallback(() => {
    return {
      exercises: exerciseStore.error,
      userProfile: userStore.error,
      userRoutine: routineStore.error,
      initialization: initializationError,
      any: exerciseStore.error || userStore.error || routineStore.error || initializationError
    };
  }, [exerciseStore.error, userStore.error, routineStore.error, initializationError]);

  // Inicializar datos al montar el componente
  useEffect(() => {
    loadDataOptimized();
  }, [loadDataOptimized]);

  return {
    // Estado
    isInitialized,
    isLoading: getLoadingState().any,
    hasError: !!getErrors().any,
    
    // Funciones
    loadData: loadDataOptimized,
    refreshData,
    clearCache,
    isDataLoaded,
    getLoadingState,
    getErrors,
    
    // Stores
    routineStore,
    exerciseStore,
    userStore
  };
};

/**
 * Hook para optimizar la carga de ejercicios con cache
 */
export const useOptimizedExercises = () => {
  const exerciseStore = useExerciseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Ejercicios filtrados y buscados
  const filteredExercises = exerciseStore.getFilteredExercises();
  const searchedExercises = exerciseStore.searchExercises(debouncedSearchTerm);

  // Combinar filtros y búsqueda
  const finalExercises = debouncedSearchTerm ? searchedExercises : filteredExercises;

  return {
    exercises: finalExercises,
    allExercises: exerciseStore.allExercises,
    exercisesByMuscleGroup: exerciseStore.exercisesByMuscleGroup,
    loading: exerciseStore.loading,
    error: exerciseStore.error,
    searchTerm,
    setSearchTerm,
    setFilter: exerciseStore.setFilter,
    resetFilters: exerciseStore.resetFilters,
    getExercisesByMuscleGroup: exerciseStore.getExercisesByMuscleGroup,
    getCompoundExercises: exerciseStore.getCompoundExercises,
    getExercisesByDifficulty: exerciseStore.getExercisesByDifficulty,
    getAvailableMuscleGroups: exerciseStore.getAvailableMuscleGroups,
    getAvailableEquipment: exerciseStore.getAvailableEquipment,
    getExerciseById: exerciseStore.getExerciseById,
    getRecommendedExercises: exerciseStore.getRecommendedExercises
  };
};

/**
 * Hook para optimizar la carga de rutinas
 */
export const useOptimizedRoutines = () => {
  const routineStore = useRoutineStore();
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  // Función para cambiar el día seleccionado
  const handleSetSelectedDayIndex = useCallback((index) => {
    setSelectedDayIndex(index);
    routineStore.setSelectedDay(index);
  }, [routineStore]);

  return {
    userRoutine: routineStore.userRoutine,
    routineDays: routineStore.routineDays,
    selectedDayIndex,
    setSelectedDayIndex: handleSetSelectedDayIndex,
    currentDayExercises: routineStore.getCurrentDayExercises(),
    selectedDay: routineStore.getSelectedDay(),
    loading: routineStore.loading,
    error: routineStore.error,
    loadUserRoutine: routineStore.loadUserRoutine,
    createRoutine: routineStore.createRoutine,
    updateRoutine: routineStore.updateRoutine,
    addExerciseToDay: routineStore.addExerciseToDay,
    updateExercise: routineStore.updateExercise,
    removeExercise: routineStore.removeExercise
  };
}; 