/**
 * debugUserProfile.js
 * 
 * Script para debuggear el perfil del usuario
 */

import { userProfiles } from '../lib/supabase.js';

export const debugUserProfile = async () => {
  console.log('🔍 Debug: Iniciando debug del perfil de usuario...');
  
  try {
    // Obtener perfil actual
    const { data: profile, error } = await userProfiles.getCurrent();
    
    console.log('🔍 Debug: Perfil obtenido:', profile);
    console.log('🔍 Debug: Error (si hay):', error);
    
    if (profile) {
      console.log('🔍 Debug: Propiedades del perfil:');
      console.log('  - ID:', profile.id);
      console.log('  - Altura:', profile.altura);
      console.log('  - Peso:', profile.peso);
      console.log('  - Edad:', profile.edad);
      console.log('  - Sexo:', profile.sexo);
      console.log('  - Objetivo:', profile.objetivo);
      console.log('  - Experiencia:', profile.experiencia);
      console.log('  - Tiempo entrenamiento:', profile.tiempo_entrenamiento);
      console.log('  - Días semana:', profile.dias_semana);
      console.log('  - Creado:', profile.created_at);
      console.log('  - Actualizado:', profile.updated_at);
    }
    
    return {
      success: true,
      profile,
      error
    };
    
  } catch (error) {
    console.error('❌ Debug: Error obteniendo perfil:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 