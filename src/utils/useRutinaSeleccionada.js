/**
 * useRutinaSeleccionada.js
 * 
 * Este hook personalizado determina la rutina de entrenamiento final del usuario 
 * en función de los datos ingresados en el formulario y la rutina seleccionada.
 * Se usa en CalendarioRutina.jsx para definir qué rutina debe mostrarse.
 */

import { useMemo } from "react";
import { rutinasPosibles } from "./rutinas.js";

export function useRutinaSeleccionada(formData, rutinaSeleccionada) {
  return useMemo(() => {
    if (rutinaSeleccionada && rutinasPosibles[formData.objetivo]?.[formData.tiempoEntrenamiento]?.[formData.diasSemana]) {
      return rutinaSeleccionada;
    }
    return rutinasPosibles[formData.objetivo]?.[formData.tiempoEntrenamiento]?.[formData.diasSemana] || "FULL BODY";
  }, [formData, rutinaSeleccionada]);
}