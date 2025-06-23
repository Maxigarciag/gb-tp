/**
 * useEjerciciosAgrupados.js
 * 
 * Este hook personalizado agrupa los ejercicios por su grupo muscular correspondiente.
 * Se usa en CalendarioRutina.jsx para organizar los ejercicios de manera visual y estructurada.
 */

import { useMemo } from "react";
import { ejerciciosPorMusculo } from "./ejercicios.js";

export function useEjerciciosAgrupados(ejerciciosActuales) {
  return useMemo(() => {
    const grupos = {};

    ejerciciosActuales.forEach(ejercicio => {
      const grupo = Object.keys(ejerciciosPorMusculo).find(musculo =>
        ejerciciosPorMusculo[musculo].includes(ejercicio)
      ) || "Otros";

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(ejercicio);
    });

    return grupos;
  }, [ejerciciosActuales]);
}