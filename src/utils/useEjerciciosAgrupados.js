/**
 * useEjerciciosAgrupados.js
 * 
 * Este hook personalizado agrupa los ejercicios por su grupo muscular correspondiente.
 * Se usa en CalendarioRutina.jsx para organizar los ejercicios de manera visual y estructurada.
 */

import { useMemo } from "react";

export function useEjerciciosAgrupados(ejerciciosActuales) {
  return useMemo(() => {
    const grupos = {};

    ejerciciosActuales.forEach(ejercicio => {
      // Usar el grupo_muscular del ejercicio desde la base de datos
      const grupo = ejercicio.grupo_muscular || "Otros";

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(ejercicio);
    });

    return grupos;
  }, [ejerciciosActuales]);
}