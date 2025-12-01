/**
 * useEjerciciosAgrupados.js
 * 
 * Este hook personalizado agrupa los ejercicios por su grupo muscular correspondiente.
 * Se usa en CalendarioRutina.jsx para organizar los ejercicios de manera visual y estructurada.
 */

import { useMemo } from "react";

export function useEjerciciosAgrupados(ejerciciosActuales) {
  return useMemo(() => {
    if (!ejerciciosActuales || !Array.isArray(ejerciciosActuales)) {
      return {};
    }

    const grupos = {};

    ejerciciosActuales.forEach(ejercicio => {
      // Usar el grupo_muscular del ejercicio desde la base de datos
      let grupo = ejercicio.grupo_muscular || "Otros";
      
      // Agrupar grupos musculares de piernas bajo "Piernas"
      if (grupo === "Cuádriceps" || grupo === "Isquiotibiales" || grupo === "Gemelos") {
        grupo = "Piernas";
      }

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(ejercicio);
    });

    // Retornar el objeto de grupos directamente
    return grupos;
  }, [ejerciciosActuales]);
}