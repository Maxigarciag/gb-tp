// Script para insertar ejercicios básicos en la base de datos
import { supabase } from '../lib/supabase.js';

const ejerciciosBasicos = [
  // Pecho
  {
    nombre: "Press de Banca",
    grupo_muscular: "Pecho",
    descripcion: "Ejercicio compuesto para el pecho",
    instrucciones: ["Acuéstate en el banco", "Agarra la barra", "Baja la barra al pecho", "Empuja hacia arriba"],
    consejos: ["Mantén los pies en el suelo", "Arquea ligeramente la espalda"],
    musculos_trabajados: ["Pectoral mayor", "Tríceps", "Deltoides anteriores"],
    es_compuesto: true
  },
  {
    nombre: "Flexiones de Pecho",
    grupo_muscular: "Pecho",
    descripcion: "Ejercicio de peso corporal para el pecho",
    instrucciones: ["Colócate en posición de plancha", "Baja el cuerpo", "Empuja hacia arriba"],
    consejos: ["Mantén el cuerpo recto", "Respira correctamente"],
    musculos_trabajados: ["Pectoral mayor", "Tríceps", "Deltoides anteriores"],
    es_compuesto: true
  },
  {
    nombre: "Aperturas con Mancuernas",
    grupo_muscular: "Pecho",
    descripcion: "Ejercicio de aislamiento para el pecho",
    instrucciones: ["Acuéstate en el banco", "Extiende los brazos", "Abre y cierra los brazos"],
    consejos: ["Mantén los codos ligeramente flexionados", "Controla el movimiento"],
    musculos_trabajados: ["Pectoral mayor"],
    es_compuesto: false
  },

  // Espalda
  {
    nombre: "Dominadas",
    grupo_muscular: "Espalda",
    descripcion: "Ejercicio de peso corporal para la espalda",
    instrucciones: ["Agarra la barra", "Levanta el cuerpo", "Baja controladamente"],
    consejos: ["Mantén el cuerpo recto", "Aprieta los omóplatos"],
    musculos_trabajados: ["Dorsal ancho", "Trapecio", "Romboides"],
    es_compuesto: true
  },
  {
    nombre: "Remo con Barra",
    grupo_muscular: "Espalda",
    descripcion: "Ejercicio compuesto para la espalda",
    instrucciones: ["Agarra la barra", "Inclínate hacia adelante", "Tira la barra hacia el pecho"],
    consejos: ["Mantén la espalda recta", "Aprieta los omóplatos"],
    musculos_trabajados: ["Dorsal ancho", "Trapecio", "Romboides"],
    es_compuesto: true
  },
  {
    nombre: "Remo con Mancuernas",
    grupo_muscular: "Espalda",
    descripcion: "Ejercicio unilateral para la espalda",
    instrucciones: ["Apoya una rodilla en el banco", "Tira la mancuerna hacia la cadera"],
    consejos: ["Mantén la espalda recta", "Controla el movimiento"],
    musculos_trabajados: ["Dorsal ancho", "Trapecio", "Romboides"],
    es_compuesto: false
  },

  // Piernas
  {
    nombre: "Sentadillas",
    grupo_muscular: "Piernas",
    descripcion: "Ejercicio compuesto para las piernas",
    instrucciones: ["Párate con los pies separados", "Baja como si te sentaras", "Levántate"],
    consejos: ["Mantén las rodillas alineadas", "Baja hasta que los muslos estén paralelos al suelo"],
    musculos_trabajados: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    es_compuesto: true
  },
  {
    nombre: "Peso Muerto",
    grupo_muscular: "Piernas",
    descripcion: "Ejercicio compuesto para piernas y espalda",
    instrucciones: ["Agarra la barra", "Mantén la espalda recta", "Levántate"],
    consejos: ["Mantén la barra cerca del cuerpo", "Aprieta los glúteos"],
    musculos_trabajados: ["Isquiotibiales", "Glúteos", "Espalda baja"],
    es_compuesto: true
  },
  {
    nombre: "Zancadas",
    grupo_muscular: "Piernas",
    descripcion: "Ejercicio unilateral para las piernas",
    instrucciones: ["Da un paso hacia adelante", "Baja hasta que la rodilla toque el suelo", "Levántate"],
    consejos: ["Mantén el torso recto", "Alterna las piernas"],
    musculos_trabajados: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    es_compuesto: true
  },

  // Hombros
  {
    nombre: "Press Militar",
    grupo_muscular: "Hombros",
    descripcion: "Ejercicio compuesto para los hombros",
    instrucciones: ["Sujeta las mancuernas", "Presiona hacia arriba", "Baja controladamente"],
    consejos: ["Mantén el torso recto", "No arquees la espalda"],
    musculos_trabajados: ["Deltoides anteriores", "Deltoides laterales", "Tríceps"],
    es_compuesto: true
  },
  {
    nombre: "Elevaciones Laterales",
    grupo_muscular: "Hombros",
    descripcion: "Ejercicio de aislamiento para los hombros",
    instrucciones: ["Sujeta las mancuernas", "Eleva los brazos lateralmente", "Baja controladamente"],
    consejos: ["Mantén los codos ligeramente flexionados", "No uses impulso"],
    musculos_trabajados: ["Deltoides laterales"],
    es_compuesto: false
  },

  // Brazos
  {
    nombre: "Curl de Bíceps",
    grupo_muscular: "Brazos",
    descripcion: "Ejercicio de aislamiento para bíceps",
    instrucciones: ["Sujeta las mancuernas", "Curl hacia arriba", "Baja controladamente"],
    consejos: ["Mantén los codos fijos", "No uses impulso"],
    musculos_trabajados: ["Bíceps braquial"],
    es_compuesto: false
  },
  {
    nombre: "Extensiones de Tríceps",
    grupo_muscular: "Brazos",
    descripcion: "Ejercicio de aislamiento para tríceps",
    instrucciones: ["Sujeta la mancuerna", "Extiende el brazo", "Baja controladamente"],
    consejos: ["Mantén el codo fijo", "Controla el movimiento"],
    musculos_trabajados: ["Tríceps braquial"],
    es_compuesto: false
  }
];

export const seedExercises = async () => {
  try {
    // Verificar si ya existen ejercicios
    const { data: existingExercises, error: checkError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing exercises:', checkError);
      return;
    }

    if (existingExercises && existingExercises.length > 0) {
      return; // Ya existen ejercicios
    }

    // Insertar ejercicios básicos
    const { data, error } = await supabase
      .from('exercises')
      .insert(ejerciciosBasicos)
      .select();

    if (error) {
      console.error('Error seeding exercises:', error);
      return;
    }

    console.log('✅ Ejercicios básicos creados exitosamente');
  } catch (error) {
    console.error('Error in seedExercises:', error);
  }
}; 