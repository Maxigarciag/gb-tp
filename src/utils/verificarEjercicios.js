/**
 * verificarEjercicios.js
 * 
 * Script para verificar que los ejercicios se están cargando correctamente
 */

import { exercises } from '../lib/supabase.js';

export const verificarEjercicios = async () => {
  try {
    // Obtener todos los ejercicios básicos
    const { data: ejerciciosBasicos, error } = await exercises.getBasicExercises();
    
    if (error) {
      console.error('Error obteniendo ejercicios:', error);
      return;
    }
    
    // Agrupar ejercicios por grupo muscular
    const ejerciciosPorGrupo = {};
    ejerciciosBasicos.forEach(ejercicio => {
      const grupo = ejercicio.grupo_muscular;
      if (!ejerciciosPorGrupo[grupo]) {
        ejerciciosPorGrupo[grupo] = [];
      }
      ejerciciosPorGrupo[grupo].push(ejercicio);
    });
    
    // Verificar grupos específicos que necesitamos
    const gruposNecesarios = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Cuádriceps', 'Isquiotibiales', 'Gemelos', 'Core'];
    
    gruposNecesarios.forEach(grupo => {
      const ejerciciosDelGrupo = ejerciciosPorGrupo[grupo] || [];
      if (ejerciciosDelGrupo.length === 0) {
        console.warn(`No hay ejercicios para el grupo: ${grupo}`);
      }
    });
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}; 