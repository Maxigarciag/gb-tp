/**
 * useEjerciciosDelDiaDB.js
 * 
 * Este hook personalizado obtiene la lista de ejercicios asignados a un día específico de la rutina
 * desde la base de datos.
 */

import { useMemo, useCallback, useState, useEffect } from "react";
import { exercises } from "../lib/supabase.js";

export function useEjerciciosDelDiaDB(diaSeleccionado, userRoutine) {
  const [ejerciciosDelDia, setEjerciciosDelDia] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarEjerciciosDelDia = useCallback(async () => {
    if (diaSeleccionado === null || !userRoutine || !userRoutine.routine_days) {
      setEjerciciosDelDia([]);
      return;
    }

    try {
      setLoading(true);
      const diaSeleccionadoData = userRoutine.routine_days[diaSeleccionado];
      
      if (!diaSeleccionadoData || !diaSeleccionadoData.routine_exercises) {
        setEjerciciosDelDia([]);
        return;
      }

      // Obtener ejercicios del día desde la base de datos
      const ejercicios = diaSeleccionadoData.routine_exercises.map(re => ({
        ...re.exercises,
        series: re.series,
        repeticiones_min: re.repeticiones_min,
        repeticiones_max: re.repeticiones_max,
        peso_sugerido: re.peso_sugerido,
        tiempo_descanso: re.tiempo_descanso
      }));

      setEjerciciosDelDia(ejercicios);
    } catch (error) {
      console.error('Error loading exercises for day:', error);
      setEjerciciosDelDia([]);
    } finally {
      setLoading(false);
    }
  }, [diaSeleccionado, userRoutine]);

  useEffect(() => {
    cargarEjerciciosDelDia();
  }, [cargarEjerciciosDelDia]);

  return { ejercicios: ejerciciosDelDia, loading };
} 