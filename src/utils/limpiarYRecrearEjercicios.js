/**
 * limpiarYRecrearEjercicios.js
 * 
 * Script para limpiar completamente la base de datos y recrear todos los ejercicios
 */

import { supabase } from '../lib/supabase.js';

export const limpiarYRecrearEjercicios = async () => {
  try {
    // 1. Eliminar todos los ejercicios existentes
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('Error eliminando ejercicios:', deleteError);
      return;
    }
    
    // 2. Importar y ejecutar seedExercises
    const { seedExercises } = await import('./seedExercises.js');
    await seedExercises(true);
    
  } catch (error) {
    console.error('Error en limpieza:', error);
  }
}; 