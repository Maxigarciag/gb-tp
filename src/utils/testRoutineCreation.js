/**
 * testRoutineCreation.js
 * 
 * Script de prueba para verificar la creación de rutinas
 */

import { workoutRoutines, exercises, userProfiles } from '../lib/supabase.js';
import { obtenerRutinaRecomendada } from './rutinas.js';
import { seedExercises } from './seedExercises.js';

export const testRoutineCreation = async () => {
  console.log('🧪 Test: Iniciando prueba de creación de rutinas...');
  
  try {
    // 1. Verificar conexión
    console.log('🧪 Test: Verificando conexión...');
    const connectionTest = await userProfiles.testConnection();
    console.log('🧪 Test: Conexión:', connectionTest);
    
    // 2. Verificar ejercicios básicos
    console.log('🧪 Test: Verificando ejercicios básicos...');
    const { exists: ejerciciosExisten } = await exercises.checkBasicExercises();
    console.log('🧪 Test: Ejercicios existen:', ejerciciosExisten);
    
    if (!ejerciciosExisten) {
      console.log('🧪 Test: Creando ejercicios básicos...');
      await seedExercises();
    }
    
    // 3. Probar obtención de rutina recomendada
    console.log('🧪 Test: Probando obtención de rutina recomendada...');
    const rutinaRecomendada = obtenerRutinaRecomendada('ganar_musculo', '1_hora', '4_dias');
    console.log('🧪 Test: Rutina recomendada:', rutinaRecomendada);
    
    // 4. Verificar rutinas existentes
    console.log('🧪 Test: Verificando rutinas existentes...');
    const { data: rutinasExistentes } = await workoutRoutines.listUserRoutines();
    console.log('🧪 Test: Rutinas existentes:', rutinasExistentes?.length || 0);
    
    console.log('✅ Test: Prueba completada exitosamente');
    return {
      success: true,
      connection: connectionTest,
      ejerciciosExisten,
      rutinaRecomendada,
      rutinasExistentes: rutinasExistentes?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Test: Error en prueba:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 