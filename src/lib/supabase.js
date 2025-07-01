import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase: Variables de entorno faltantes!');
  console.error('❌ Supabase: VITE_SUPABASE_URL:', supabaseUrl);
  console.error('❌ Supabase: VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Configurada' : 'Faltante');
}

// Crear instancia singleton de Supabase para evitar múltiples instancias
let supabaseInstance = null;

const createSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Configurar persistencia de sesión
        persistSession: true,
        storageKey: 'getbig-auth-token',
        storage: window.localStorage,
        // Configurar refresh automático de tokens
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      // Configurar timeouts más largos para conexiones lentas
      global: {
        headers: {
          'X-Client-Info': 'getbig-web'
        }
      }
    });
  }
  return supabaseInstance;
};

// Configuración optimizada para mejor persistencia
export const supabase = createSupabaseClient();

// Funciones de autenticación optimizadas
export const auth = {
  // Registro con email y contraseña
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error;
      return { data, error: null }
    } catch (error) {
      return { data: null, error };
    }
  },

  // Inicio de sesión optimizado
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error;
      return { data, error: null }
    } catch (error) {
      return { data: null, error };
    }
  },

  // Cerrar sesión optimizado
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error;
      return { error: null }
    } catch (error) {
      return { error };
    }
  },

  // Obtener usuario actual con mejor manejo de errores
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error;
      }
      
      return { user, error: null }
    } catch (error) {
      return { user: null, error };
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funciones para perfiles de usuario optimizadas
export const userProfiles = {
  // Función de prueba para verificar conexión
  testConnection: async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en prueba de conexión')), 10000)
      );
      
      const connectionPromise = (async () => {
        const { user, error } = await auth.getCurrentUser();
        
        if (error) {
          throw new Error(`Error obteniendo usuario: ${error}`);
        }
        
        if (user) {
          // Probar consulta simple
          const { data, error: queryError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (queryError) {
            throw new Error(`Error en consulta: ${queryError.message}`);
          }
        }
        
        return { success: true, user };
      })();
      
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Crear perfil de usuario optimizado
  create: async (profileData) => {
    try {
      // Verificar que el usuario esté autenticado
      const { user, error: userError } = await auth.getCurrentUser();
      if (userError) {
        throw new Error(`Error de autenticación: ${userError}`);
      }
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener perfil del usuario actual optimizado
  getCurrent: async () => {
    try {
      const { user, error: userError } = await auth.getCurrentUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      if (error) {
        // Intentar recargar una vez más
        const { data: retryData, error: retryError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        if (retryError) {
          throw retryError;
        }
        
        return { data: retryData, error: null };
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Verificar si existe perfil (para debug)
  checkExists: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
      return { exists: !!data, error }
    } catch (error) {
      return { exists: false, error: error.message };
    }
  },

  // Actualizar perfil optimizado
  update: async (updates) => {
    try {
      const { user, error: userError } = await auth.getCurrentUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        
      if (error) {
        throw error;
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Función para forzar recarga del perfil
  forceReload: async () => {
    try {
      const { user, error: userError } = await auth.getCurrentUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        return { data: null, error: 'No authenticated user' };
      }

      // Limpiar cache y recargar
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

// Funciones para ejercicios
export const exercises = {
  // Verificar si existen ejercicios básicos
  checkBasicExercises: async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id')
      .in('grupo_muscular', ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Cuádriceps', 'Isquiotibiales', 'Gemelos'])
      .limit(1)
    return { exists: !!data?.length, error }
  },

  // Obtener todos los ejercicios
  getAll: async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('grupo_muscular', { ascending: true })
    return { data, error }
  },

  // Obtener ejercicios por grupo muscular
  getByMuscleGroup: async (grupoMuscular) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('grupo_muscular', grupoMuscular)
    return { data, error }
  },

  // Obtener ejercicios básicos para rutinas
  getBasicExercises: async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .in('grupo_muscular', ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Cuádriceps', 'Isquiotibiales', 'Gemelos'])
      .limit(50)
    return { data, error }
  },

  // Buscar ejercicios
  search: async (searchTerm) => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`nombre.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`)
    return { data, error }
  }
}

// Funciones para rutinas de entrenamiento
export const workoutRoutines = {
  // Crear nueva rutina
  create: async (routineData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    // Limpiar rutinas activas existentes antes de crear una nueva
    await supabase
      .from('workout_routines')
      .update({ es_activa: false })
      .eq('user_id', user.id)
      .eq('es_activa', true);

    const { data, error } = await supabase
      .from('workout_routines')
      .insert([routineData])
      .select()
    return { data, error }
  },

  // Obtener rutinas del usuario
  getUserRoutines: async () => {
    const { data, error } = await supabase
      .from('workout_routines')
      .select(`
        *,
        routine_days (
          *,
          routine_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Obtener rutina activa
  getActive: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    // Primero, limpiar rutinas duplicadas activas (mantener solo la más reciente)
    await supabase
      .from('workout_routines')
      .update({ es_activa: false })
      .eq('user_id', user.id)
      .eq('es_activa', true)
      .lt('created_at', (
        await supabase
          .from('workout_routines')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('es_activa', true)
          .order('created_at', { ascending: false })
          .limit(1)
      ).data?.[0]?.created_at || new Date().toISOString());

    // Ahora obtener la rutina activa (debería ser solo una)
    const { data, error } = await supabase
      .from('workout_routines')
      .select(`
        *,
        routine_days (
          *,
          routine_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('es_activa', true)
      .maybeSingle()
    return { data, error }
  },

  // Activar rutina
  setActive: async (routineId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    // Primero desactivar todas las rutinas del usuario
    await supabase
      .from('workout_routines')
      .update({ es_activa: false })
      .eq('user_id', user.id);

    // Luego activar la seleccionada
    const { data, error } = await supabase
      .from('workout_routines')
      .update({ es_activa: true })
      .eq('id', routineId)
      .eq('user_id', user.id)
      .select()
    return { data, error }
  },

  // Eliminar rutina
  delete: async (routineId) => {
    const { data, error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
    return { data, error }
  },

  // Actualizar rutina
  update: async (updates) => {
    const { data, error } = await supabase
      .from('workout_routines')
      .update(updates)
      .eq('id', updates.id)
      .select()
    return { data, error }
  },

  // Función de debug: listar todas las rutinas del usuario
  listUserRoutines: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    return { data, error };
  }
}

// Funciones para días de rutina
export const routineDays = {
  // Crear día de rutina
  create: async (dayData) => {
    const { data, error } = await supabase
      .from('routine_days')
      .insert([dayData])
      .select()
    return { data, error }
  },

  // Obtener días de una rutina
  getByRoutine: async (routineId) => {
    const { data, error } = await supabase
      .from('routine_days')
      .select(`
        *,
        routine_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('routine_id', routineId)
      .order('orden', { ascending: true })
    return { data, error }
  },

  // Eliminar todos los días de una rutina
  deleteByRoutine: async (routineId) => {
    const { data, error } = await supabase
      .from('routine_days')
      .delete()
      .eq('routine_id', routineId)
    return { data, error }
  }
}

// Funciones para ejercicios de rutina
export const routineExercises = {
  // Agregar ejercicio a día de rutina
  create: async (exerciseData) => {
    const { data, error } = await supabase
      .from('routine_exercises')
      .insert([exerciseData])
      .select()
    return { data, error }
  },

  // Actualizar ejercicio de rutina
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('routine_exercises')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Eliminar ejercicio de rutina
  delete: async (id) => {
    const { data, error } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Eliminar todos los ejercicios de un día específico
  deleteByDay: async (dayId) => {
    const { data, error } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_day_id', dayId)
    return { data, error }
  }
}

// Funciones para sesiones de entrenamiento
export const workoutSessions = {
  // Crear nueva sesión
  create: async (sessionData) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([sessionData])
      .select()
    return { data, error }
  },

  // Obtener sesiones del usuario
  getUserSessions: async (limit = 50) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_routines (nombre),
        routine_days (nombre_dia),
        exercise_logs (
          *,
          exercises (nombre, grupo_muscular)
        )
      `)
      .order('fecha', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Iniciar sesión
  start: async (sessionId) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({ 
        hora_inicio: new Date().toISOString(),
        completada: false 
      })
      .eq('id', sessionId)
      .select()
    return { data, error }
  },

  // Finalizar sesión
  finish: async (sessionId, notas = '', calificacion = null) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({ 
        hora_fin: new Date().toISOString(),
        completada: true,
        notas,
        calificacion
      })
      .eq('id', sessionId)
      .select()
    return { data, error }
  }
}

// Funciones para registro de ejercicios
export const exerciseLogs = {
  // Registrar serie de ejercicio
  create: async (logData) => {
    const { data, error } = await supabase
      .from('exercise_logs')
      .insert([logData])
      .select()
    return { data, error }
  },

  // Obtener logs de una sesión
  getBySession: async (sessionId) => {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select(`
        *,
        exercises (nombre, grupo_muscular)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  // Actualizar log de ejercicio
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('exercise_logs')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  }
}

// Funciones para progreso del usuario
export const userProgress = {
  // Registrar progreso
  create: async (progressData) => {
    const { data, error } = await supabase
      .from('user_progress')
      .insert([progressData])
      .select()
    return { data, error }
  },

  // Obtener progreso del usuario
  getUserProgress: async (limit = 30) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Obtener último registro de progreso
  getLatest: async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  },

  // Actualizar progreso
  update: async (fecha, updates) => {
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('fecha', fecha)
      .select()
    return { data, error }
  }
}

// Funciones de utilidad
export const utils = {
  // Obtener estadísticas del usuario
  getUserStats: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No authenticated user' }

    // Obtener conteos
    const [routinesResult, sessionsResult, progressResult] = await Promise.all([
      supabase.from('workout_routines').select('id', { count: 'exact' }),
      supabase.from('workout_sessions').select('id', { count: 'exact' }).eq('completada', true),
      supabase.from('user_progress').select('id', { count: 'exact' })
    ])

    return {
      data: {
        totalRoutines: routinesResult.count || 0,
        completedSessions: sessionsResult.count || 0,
        progressEntries: progressResult.count || 0
      },
      error: null
    }
  },

  // Obtener resumen de la semana actual
  getWeekSummary: async () => {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('fecha, completada, duracion_minutos')
      .gte('fecha', startOfWeek.toISOString().split('T')[0])
      .order('fecha', { ascending: true })

    return { data, error }
  }
}