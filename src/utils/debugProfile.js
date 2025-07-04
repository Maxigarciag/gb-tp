// Utilidad para debug del perfil de usuario
// Ejecutar en la consola del navegador para probar la creación de perfiles

import { userProfiles, supabase } from '../lib/supabase.js';

// Función para crear un perfil de prueba
export const createTestProfile = async () => {
  try {
    console.log('🧪 DEBUG: Creando perfil de prueba...');
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ DEBUG: No hay usuario autenticado');
      return { data: null, error: 'No hay usuario autenticado' };
    }
    
    const testProfileData = {
      altura: 180,
      peso: 80,
      edad: 25,
      sexo: 'masculino',
      objetivo: 'ganar_musculo',
      experiencia: 'principiante',
      tiempo_entrenamiento: '1_hora',
      dias_semana: '3_dias'
    };
    
    console.log('📋 DEBUG: Datos del perfil de prueba:', testProfileData);
    
    const result = await userProfiles.create(testProfileData);
    
    console.log('📋 DEBUG: Resultado de creación:', result);
    
    if (result.error) {
      console.error('❌ DEBUG: Error creando perfil:', result.error);
    } else {
      console.log('✅ DEBUG: Perfil creado exitosamente:', result.data);
    }
    
    return result;
  } catch (error) {
    console.error('❌ DEBUG: Excepción creando perfil:', error);
    return { data: null, error: error.message };
  }
};

// Función para verificar el estado actual
export const checkCurrentState = async () => {
  try {
    console.log('🔍 DEBUG: Verificando estado actual...');
    
    // Verificar usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 DEBUG: Usuario autenticado:', user?.id);
    
    // Verificar perfiles existentes
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('*');
    console.log('📋 DEBUG: Todos los perfiles:', allProfiles);
    console.log('❌ DEBUG: Error consultando todos:', allError);
    
    // Verificar perfil específico
    if (user) {
      const { data: specificProfile, error: specificError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      console.log('📋 DEBUG: Perfil específico:', specificProfile);
      console.log('❌ DEBUG: Error consultando específico:', specificError);
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Excepción verificando estado:', error);
  }
};

// Función para limpiar todos los perfiles (solo para desarrollo)
export const clearAllProfiles = async () => {
  try {
    console.log('🗑️ DEBUG: Limpiando todos los perfiles...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos excepto un ID imposible
    
    console.log('📋 DEBUG: Perfiles eliminados:', data);
    console.log('❌ DEBUG: Error eliminando perfiles:', error);
    
    return { data, error };
  } catch (error) {
    console.error('❌ DEBUG: Excepción eliminando perfiles:', error);
    return { data: null, error: error.message };
  }
};

// Exportar funciones para uso en consola
if (typeof window !== 'undefined') {
  window.debugProfile = {
    createTestProfile,
    checkCurrentState,
    clearAllProfiles
  };
  
  console.log('🧪 DEBUG: Funciones de debug disponibles en window.debugProfile');
} 