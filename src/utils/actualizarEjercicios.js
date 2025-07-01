/**
 * actualizarEjercicios.js
 * 
 * Script para actualizar los ejercicios en la base de datos
 */

import { seedExercises } from './seedExercises.js';

export const actualizarEjercicios = async () => {
  console.log('🔄 Actualizando ejercicios en la base de datos...');
  
  try {
    // Forzar la actualización de ejercicios (eliminar y recrear)
    await seedExercises(true);
    console.log('✅ Ejercicios actualizados correctamente');
  } catch (error) {
    console.error('❌ Error actualizando ejercicios:', error);
  }
}; 