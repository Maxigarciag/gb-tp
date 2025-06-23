/**
 * useEjerciciosDelDia.js
 * 
 * Este hook personalizado obtiene la lista de ejercicios asignados a un día específico de la rutina.
 * Se usa en CalendarioRutina.jsx para mostrar los ejercicios según el día seleccionado.
 */

import { useMemo, useCallback } from "react";
import { ejerciciosPorMusculo } from "./ejercicios.js";

export function useEjerciciosDelDia(diaSeleccionado, diasRutina) {
  const generarEjercicios = useCallback((detalle) => {
    const grupos = detalle.split(":")[1]?.split(",").map(g => g.trim()) || [];

    return grupos.flatMap(grupo => {
      const clave = Object.keys(ejerciciosPorMusculo).find(k =>
        grupo.toLowerCase().includes(k.toLowerCase())
      );
      return clave ? ejerciciosPorMusculo[clave].slice(0, 4) : [];
    });
  }, []);

  return useMemo(() => {
    if (diaSeleccionado === null) return [];
    const descripcion = diasRutina[diaSeleccionado]?.[1];
    return descripcion ? generarEjercicios(descripcion) : [];
  }, [diaSeleccionado, diasRutina, generarEjercicios]);
}