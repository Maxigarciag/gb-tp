/**
 * calcularRutina.js
 * 
 * Este archivo contiene funciones para determinar qué rutina es adecuada para el usuario
 * según su objetivo, tiempo disponible y cantidad de días de entrenamiento.
 * Se usa en CalendarioRutina.jsx para seleccionar y asignar una rutina de entrenamiento.
 */

import { rutinasPosibles } from "./rutinas.js";

/**
 * Obtiene las posibles rutinas de entrenamiento según el objetivo, tiempo disponible y días.
 * @param {string} objetivo - Objetivo de entrenamiento ("ganar_musculo", "perder_grasa", "mantener").
 * @param {string} tiempo - Tiempo dedicado al entrenamiento ("30_min", "1_hora", "2_horas").
 * @param {string} dias - Número de días de entrenamiento por semana ("3_dias", "4_dias", "6_dias").
 * @returns {Array} - Lista de rutinas posibles según la selección.
 */
export const obtenerRutinasPosibles = (objetivo, tiempo, dias) => {
  return rutinasPosibles?.[objetivo]?.[tiempo]?.[dias] || [];
};

/**
 * Selecciona la rutina recomendada según el objetivo y los días de entrenamiento.
 * @param {string} objetivo - Objetivo de entrenamiento ("ganar_musculo", "perder_grasa", "mantener").
 * @param {number} dias - Número de días de entrenamiento por semana.
 * @returns {string} - Nombre de la rutina recomendada.
 */
export const seleccionarRutina = (objetivo, dias) => {
  if (dias >= 5) return objetivo === "ganar_musculo" ? "PUSH PULL LEGS" : "ARNOLD SPLIT";
  if (dias === 4) return "UPPER LOWER";
  return "FULL BODY";
};