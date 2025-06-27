/**
 * rutinas.js
 * 
 * Este archivo contiene las rutinas de entrenamiento predefinidas.
 * Cada rutina tiene asignados los grupos musculares que se trabajan en cada día de la semana.
 * Se usa en CalendarioRutina.jsx para seleccionar y mostrar la rutina correspondiente.
 */

export const rutinas = {
  "PUSH PULL LEGS": {
    Lunes: "Push: Pecho, Hombros, Tríceps",
    Martes: "Pull: Espalda, Bíceps, Core",
    Miércoles: "Piernas: Cuádriceps, Isquiotibiales, Gemelos",
    Jueves: "Push: Pecho, Hombros, Tríceps",
    Viernes: "Pull: Espalda, Bíceps, Core",
    Sábado: "Piernas: Cuádriceps, Isquiotibiales, Gemelos",
    Domingo: "Descanso activo (cardio ligero o yoga)"
  },
  "ARNOLD SPLIT": {
    Lunes: "Pecho y Espalda",
    Martes: "Hombros y Brazos",
    Miércoles: "Piernas y Core",
    Jueves: "Pecho y Espalda",
    Viernes: "Hombros y Brazos",
    Sábado: "Piernas y Core",
    Domingo: "Descanso"
  },
  "UPPER LOWER": {
    Lunes: "Upper: Pecho, Espalda, Hombros, Brazos",
    Martes: "Lower: Piernas completas, Core",
    Miércoles: "Descanso o Cardio",
    Jueves: "Upper: Pecho, Espalda, Hombros, Brazos",
    Viernes: "Lower: Piernas completas, Core",
    Sábado: "Descanso o Cardio",
    Domingo: "Descanso"
  },
  "FULL BODY": {
    Lunes: "Full Body: Compuesto (Pecho, Espalda, Piernas)",
    Martes: "Cardio o Descanso",
    Miércoles: "Full Body: Aislado (Hombros, Brazos, Core)",
    Jueves: "Cardio o Descanso",
    Viernes: "Full Body: Compuesto (Pecho, Espalda, Piernas)",
    Sábado: "Cardio o Descanso",
    Domingo: "Descanso activo"
  }
};

export const rutinasPosibles = {
  ganar_musculo: {
    "30_min": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "" },
    "1_hora": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "PUSH PULL LEGS" },
    "2_horas": { "3_dias": "PUSH PULL LEGS", "4_dias": "UPPER LOWER", "6_dias": "ARNOLD SPLIT" }
  },
  perder_grasa: {
    "30_min": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "" },
    "1_hora": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "PUSH PULL LEGS" },
    "2_horas": { "3_dias": "UPPER LOWER", "4_dias": "PUSH PULL LEGS", "6_dias": "ARNOLD SPLIT" }
  },
  mantener: {
    "30_min": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "" },
    "1_hora": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "FULL BODY" },
    "2_horas": { "3_dias": "FULL BODY", "4_dias": "UPPER LOWER", "6_dias": "UPPER LOWER" }
  }
};

/**
 * Obtiene la rutina recomendada según el objetivo, tiempo disponible y días.
 * @param {string} objetivo - Objetivo de entrenamiento ("ganar_musculo", "perder_grasa", "mantener").
 * @param {string} tiempo - Tiempo dedicado al entrenamiento ("30_min", "1_hora", "2_horas").
 * @param {string} dias - Número de días de entrenamiento por semana ("3_dias", "4_dias", "6_dias").
 * @returns {string|null} - Nombre de la rutina recomendada o null si no hay rutina disponible.
 */
export const obtenerRutinaRecomendada = (objetivo, tiempo, dias) => {
  const rutina = rutinasPosibles?.[objetivo]?.[tiempo]?.[dias];
  return rutina || null;
};

/**
 * Obtiene las posibles rutinas de entrenamiento según el objetivo, tiempo disponible y días.
 * @param {string} objetivo - Objetivo de entrenamiento ("ganar_musculo", "perder_grasa", "mantener").
 * @param {string} tiempo - Tiempo dedicado al entrenamiento ("30_min", "1_hora", "2_horas").
 * @param {string} dias - Número de días de entrenamiento por semana ("3_dias", "4_dias", "6_dias").
 * @returns {Array} - Lista de rutinas posibles según la selección.
 */
export const obtenerRutinasPosibles = (objetivo, tiempo, dias) => {
  const rutinaRecomendada = obtenerRutinaRecomendada(objetivo, tiempo, dias);
  return rutinaRecomendada ? [rutinaRecomendada] : [];
};