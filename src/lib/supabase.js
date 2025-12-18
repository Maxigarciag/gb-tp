import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase: Variables de entorno faltantes!');
  console.error('❌ Supabase: VITE_SUPABASE_URL:', supabaseUrl);
  console.error('❌ Supabase: VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Configurada' : 'Faltante');
}

// Singleton global resistente a HMR para evitar múltiples GoTrueClient
const getGlobal = () => (typeof window !== 'undefined' ? window : globalThis)
const globalRef = getGlobal()

if (!globalRef.__getbig_supabase__) {
  globalRef.__getbig_supabase__ = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Configurar persistencia de sesión
      persistSession: true,
      storageKey: 'getbig-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Configurar refresh automático de tokens
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: { 'X-Client-Info': 'getbig-web' },
    },
  })
}

export const supabase = globalRef.__getbig_supabase__

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

  // Iniciar sesión con proveedor OAuth (p. ej., Google)
  signInWithProvider: async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { prompt: 'consent' },
        },
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Envío de magic link al email
  signInWithMagicLink: async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Solicitar restablecimiento de contraseña
  requestPasswordReset: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
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
  },

  // Eliminar cuenta de usuario
  deleteAccount: async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Error obteniendo usuario: ${userError}`);
      }
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Eliminar todos los datos del usuario de las tablas relacionadas
      // Esto se hace en orden para respetar las restricciones de clave foránea
      
      // 0. Eliminar logs de ejercicios asociados a sus sesiones (si no hay cascada)
      const { data: userSessions, error: sessionsListError } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id);
      if (sessionsListError) {
        console.warn('Advertencia al listar sesiones:', sessionsListError);
      }
      const sessionIds = (userSessions || []).map(s => s.id);
      if (sessionIds.length > 0) {
        const { error: logsDelError } = await supabase
          .from('exercise_logs')
          .delete()
          .in('session_id', sessionIds);
        if (logsDelError) {
          console.warn('Advertencia al eliminar exercise_logs:', logsDelError);
        }
      }

      // 1. Eliminar sesiones de entrenamiento
      const { error: sessionsError } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('user_id', user.id);
      
      if (sessionsError) {
        console.warn('Advertencia al eliminar sesiones:', sessionsError);
      }

      // 2. Obtener IDs de rutinas del usuario
      const { data: userRoutines, error: routinesFetchError } = await supabase
        .from('workout_routines')
        .select('id')
        .eq('user_id', user.id);
      
      if (routinesFetchError) {
        console.warn('Advertencia al obtener rutinas:', routinesFetchError);
      } else if (userRoutines && userRoutines.length > 0) {
        const routineIds = userRoutines.map(r => r.id);
        
        // 3. Obtener IDs de días de rutina
        const { data: routineDays, error: daysFetchError } = await supabase
          .from('routine_days')
          .select('id')
          .in('routine_id', routineIds);
        
        if (daysFetchError) {
          console.warn('Advertencia al obtener días de rutina:', daysFetchError);
        } else if (routineDays && routineDays.length > 0) {
          const dayIds = routineDays.map(d => d.id);
          
          // 4. Eliminar ejercicios de rutina
          const { error: routineExercisesError } = await supabase
            .from('routine_exercises')
            .delete()
            .in('routine_day_id', dayIds);
          
          if (routineExercisesError) {
            console.warn('Advertencia al eliminar ejercicios de rutina:', routineExercisesError);
          }
        }
        
        // 5. Eliminar días de rutina
        const { error: routineDaysError } = await supabase
          .from('routine_days')
          .delete()
          .in('routine_id', routineIds);
        
        if (routineDaysError) {
          console.warn('Advertencia al eliminar días de rutina:', routineDaysError);
        }
        
        // 6. Eliminar rutinas de entrenamiento
        const { error: routinesError } = await supabase
          .from('workout_routines')
          .delete()
          .in('id', routineIds);
        
        if (routinesError) {
          console.warn('Advertencia al eliminar rutinas:', routinesError);
        }
      }

      // 6.1 Eliminar progreso del usuario
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);
      if (progressError) {
        console.warn('Advertencia al eliminar progreso:', progressError);
      }

      // 7. Eliminar perfil de usuario
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) {
        console.warn('Advertencia al eliminar perfil:', profileError);
      }

      // 8. Eliminar usuario de autenticación (requiere backend con Service Role)
      // Preferencia: usar VITE_DELETE_USER_ENDPOINT si está definido (por ejemplo, Edge Function de Supabase)
      const customDeleteEndpoint = import.meta.env.VITE_DELETE_USER_ENDPOINT;
      if (customDeleteEndpoint) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            await fetch(customDeleteEndpoint, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (e) {
          console.warn('Advertencia al eliminar usuario auth (endpoint personalizado):', e);
        }
      } else if (import.meta.env.PROD) {
        // Fallback: ruta serverless en el mismo host (Vercel u otro)
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (token) {
            const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
            const url = apiBase ? `${apiBase}/api/delete-user` : '/api/delete-user';
            await fetch(url, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (e) {
          console.warn('Advertencia al eliminar usuario auth (serverless fallback):', e);
        }
      } else {
        console.info('Saltando eliminación de usuario auth: no hay endpoint configurado en desarrollo');
      }

      // 9. Cerrar sesión como cleanup
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.warn('Advertencia al cerrar sesión:', signOutError);
      }

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
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

  // Crear o actualizar perfil de usuario optimizado
  create: async (profileData) => {
    try {
      // Verificar que el usuario esté autenticado
      const { user, error: userError } = await auth.getCurrentUser();
      if (userError) {
        console.error('❌ userProfiles.create: Error de autenticación:', userError);
        throw new Error(`Error de autenticación: ${userError}`);
      }
      
      if (!user) {
        console.error('❌ userProfiles.create: Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }
      
      // Asegurar que el ID del usuario esté incluido en los datos del perfil
      const profileDataWithId = {
        id: user.id, // Esto es requerido por la política RLS
        ...profileData
      };
      
      // Usar upsert para crear o actualizar el perfil
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([profileDataWithId], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
      
      if (error) {
        console.error('❌ userProfiles.create: Error al crear/actualizar perfil:', error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ userProfiles.create: Excepción:', error);
      return { data: null, error: error.message };
    }
  },

  // Obtener perfil del usuario actual optimizado
  getCurrent: async () => {
    try {
      console.log('🔍 userProfiles.getCurrent: Iniciando...');
      const { user, error: userError } = await auth.getCurrentUser();
      
      if (userError) {
        console.error('❌ userProfiles.getCurrent: Error obteniendo usuario:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('❌ userProfiles.getCurrent: No hay usuario autenticado');
        return { data: null, error: 'No authenticated user' };
      }

      console.log('👤 userProfiles.getCurrent: Usuario encontrado:', user.id);
      console.log('🔍 userProfiles.getCurrent: Consultando perfil...');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      console.log('📋 userProfiles.getCurrent: Datos obtenidos:', data);
      console.log('❌ userProfiles.getCurrent: Error de consulta:', error);
      
      if (error) {
        console.log('🔄 userProfiles.getCurrent: Reintentando consulta...');
        // Intentar recargar una vez más
        const { data: retryData, error: retryError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        console.log('📋 userProfiles.getCurrent: Datos del reintento:', retryData);
        console.log('❌ userProfiles.getCurrent: Error del reintento:', retryError);
        
        if (retryError) {
          throw retryError;
        }
        
        return { data: retryData, error: null };
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('❌ userProfiles.getCurrent: Excepción:', error);
      return { data: null, error: error.message };
    }
  },

  // Verificar si existe perfil (para debug)
  checkExists: async (userId) => {
    try {
      // Verificar el perfil específico
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      // Verificar si el perfil existe y está completo
      const exists = !!data;
      const isComplete = data && data.altura && data.peso && data.edad && data.sexo && 
                        data.objetivo && data.experiencia && data.tiempo_entrenamiento && data.dias_semana;
      
      if (error) {
        console.error('❌ userProfiles.checkExists: Error:', error);
      }
      
      return { exists, isComplete, error, data }
    } catch (error) {
      console.error('❌ userProfiles.checkExists: Excepción:', error);
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
      console.log('🔄 userProfiles.forceReload: Iniciando...');
      const { user, error: userError } = await auth.getCurrentUser();
      
      if (userError) {
        console.error('❌ userProfiles.forceReload: Error obteniendo usuario:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('❌ userProfiles.forceReload: No hay usuario autenticado');
        return { data: null, error: 'No authenticated user' };
      }

      console.log('👤 userProfiles.forceReload: Usuario encontrado:', user.id);
      console.log('🔄 userProfiles.forceReload: Consultando perfil...');

      // Limpiar cache y recargar
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      console.log('📋 userProfiles.forceReload: Datos obtenidos:', data);
      console.log('❌ userProfiles.forceReload: Error de consulta:', error);
      
      return { data, error }
    } catch (error) {
      console.error('❌ userProfiles.forceReload: Excepción:', error);
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

  // Obtener todos los ejercicios (básicos + personalizados del usuario)
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Si no hay usuario, solo mostrar ejercicios básicos
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .is('es_personalizado', null)
        .order('grupo_muscular', { ascending: true })
      return { data, error }
    }

    // Si hay usuario, mostrar ejercicios básicos + personalizados del usuario
    // Usar una consulta más simple y clara
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`es_personalizado.is.null,es_personalizado.eq.false,and(es_personalizado.eq.true,creado_por.eq.${user.id})`)
      .order('grupo_muscular', { ascending: true })
    return { data, error }
  },

  // Obtener todos los ejercicios disponibles para rutinas (básicos + todos los personalizados)
  getAllForRoutines: async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or('es_personalizado.is.null,es_personalizado.eq.false,es_personalizado.eq.true')
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
  },

  // Crear ejercicio personalizado
  create: async (exerciseData) => {
    try {
      // Si hay conflicto de nombre único, agregar un sufijo único
      let finalExerciseData = { ...exerciseData }
      let attempts = 0
      const maxAttempts = 5
      
      while (attempts < maxAttempts) {
        const { data, error } = await supabase
          .from('exercises')
          .insert(finalExerciseData)
          .select()
          .single()
        
        if (!error) {
          return { data, error: null }
        }
        
        // Si es error de conflicto (409 o 23505) y es por el nombre, intentar con nombre único
        if ((error.code === '23505' || error.code === '409' || error.message?.includes('conflict')) && attempts < maxAttempts - 1) {
          finalExerciseData.nombre = `${exerciseData.nombre} (${Date.now()})`
          attempts++
          continue
        }
        
        console.error('Error en Supabase create:', error)
        console.error('Código de error:', error.code)
        console.error('Mensaje:', error.message)
        console.error('Detalles:', error.details)
        return { data: null, error }
      }
      
      return { data: null, error: new Error('No se pudo crear el ejercicio después de varios intentos') }
    } catch (err) {
      console.error('Error en create:', err)
      return { data: null, error: err }
    }
  },

  // Obtener ejercicios personalizados del usuario actual
  getCustomExercises: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'No authenticated user' };

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('es_personalizado', true)
      .eq('creado_por', user.id)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Actualizar ejercicio personalizado
  update: async (exerciseId, updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exerciseId)
      .eq('creado_por', user.id) // Solo permitir actualizar ejercicios propios
      .select()
      .single()
    return { data, error }
  },

  // Eliminar ejercicio personalizado
  delete: async (exerciseId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    const { data, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('creado_por', user.id) // Solo permitir eliminar ejercicios propios
      .select()
      .single()
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

  // Obtener rutina por ID (con días y ejercicios)
  getById: async (routineId) => {
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
      .eq('id', routineId)
      .maybeSingle()
    return { data, error }
  },

  // Obtener rutina activa
  getActive: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };

    // Obtener la rutina activa más reciente
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
      .order('created_at', { ascending: false })
      .limit(1)
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

  // Eliminar rutina con dependencias (días + ejercicios)
  deleteDeep: async (routineId) => {
    try {
      // Obtener días de la rutina
      const { data: days, error: daysFetchError } = await supabase
        .from('routine_days')
        .select('id')
        .eq('routine_id', routineId)

      if (daysFetchError) return { error: daysFetchError }

      const dayIds = (days || []).map(d => d.id)

      // Eliminar ejercicios de los días
      if (dayIds.length > 0) {
        const { error: exErr } = await supabase
          .from('routine_exercises')
          .delete()
          .in('routine_day_id', dayIds)
        if (exErr) return { error: exErr }
      }

      // Eliminar días
      const { error: delDaysErr } = await supabase
        .from('routine_days')
        .delete()
        .eq('routine_id', routineId)
      if (delDaysErr) return { error: delDaysErr }

      // Eliminar rutina
      const { error: delRoutineErr } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', routineId)
      if (delRoutineErr) return { error: delRoutineErr }

      return { error: null }
    } catch (e) {
      return { error: e }
    }
  },

  // Eliminar múltiples rutinas con dependencias
  deleteManyDeep: async (routineIds) => {
    try {
      if (!Array.isArray(routineIds) || routineIds.length === 0) {
        return { error: null }
      }
      // Obtener días de todas las rutinas
      const { data: days, error: daysFetchError } = await supabase
        .from('routine_days')
        .select('id')
        .in('routine_id', routineIds)
      if (daysFetchError) return { error: daysFetchError }
      const dayIds = (days || []).map(d => d.id)

      // Eliminar ejercicios
      if (dayIds.length > 0) {
        const { error: exErr } = await supabase
          .from('routine_exercises')
          .delete()
          .in('routine_day_id', dayIds)
        if (exErr) return { error: exErr }
      }

      // Eliminar días
      const { error: delDaysErr } = await supabase
        .from('routine_days')
        .delete()
        .in('routine_id', routineIds)
      if (delDaysErr) return { error: delDaysErr }

      // Eliminar rutinas
      const { error: delRoutineErr } = await supabase
        .from('workout_routines')
        .delete()
        .in('id', routineIds)
      if (delRoutineErr) return { error: delRoutineErr }

      return { error: null }
    } catch (e) {
      return { error: e }
    }
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

  // Actualizar día de rutina
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('routine_days')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Eliminar un día específico
  delete: async (id) => {
    const { data, error } = await supabase
      .from('routine_days')
      .delete()
      .eq('id', id)
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

// Funciones para notas de días de rutina
export const routineDayNotes = {
  // Obtener favoritas o no favoritas con límite (para panel)
  getByDay: async ({ dayId, esFavorita, limit = 4 }) => {
    const query = supabase
      .from('routine_day_notes')
      .select('*')
      .eq('routine_day_id', dayId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (typeof esFavorita === 'boolean') {
      query.eq('es_favorita', esFavorita)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Obtener todas las notas de un día (para historial)
  listAllByDay: async (dayId) => {
    const { data, error } = await supabase
      .from('routine_day_notes')
      .select('*')
      .eq('routine_day_id', dayId)
      .order('es_favorita', { ascending: false })
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Crear nota
  create: async ({ routine_day_id, contenido, es_favorita = false }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No authenticated user' }

    const payload = {
      routine_day_id,
      contenido,
      es_favorita,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('routine_day_notes')
      .insert([payload])
      .select()
      .single()

    return { data, error }
  },

  // Actualizar nota (incluye toggle favorito)
  update: async (noteId, updates) => {
    const { data, error } = await supabase
      .from('routine_day_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single()
    return { data, error }
  },

  // Eliminar nota
  delete: async (noteId) => {
    const { data, error } = await supabase
      .from('routine_day_notes')
      .delete()
      .eq('id', noteId)
      .select()
      .single()
    return { data, error }
  },

  // Eliminar notas no favoritas más antiguas dejando solo 3
  pruneNonFavorites: async (dayId) => {
    const { data, error } = await supabase
      .from('routine_day_notes')
      .select('id')
      .eq('routine_day_id', dayId)
      .eq('es_favorita', false)
      .order('created_at', { ascending: false })

    if (error) return { error }
    const notes = data || []
    if (notes.length <= 3) return { error: null }

    const toDelete = notes.slice(3).map(n => n.id)
    const { error: delError } = await supabase
      .from('routine_day_notes')
      .delete()
      .in('id', toDelete)
    return { error: delError || null }
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

  // Obtener sesión por ID
  getById: async (sessionId) => {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    return { data, error }
  },

  // Buscar sesión por fecha (con o sin routine_day_id)
  findByDate: async ({ userId, routineId, routineDayId, fecha }) => {
    if (!userId || !routineId || !fecha) {
      return { data: null, error: new Error('Parámetros incompletos') }
    }

    // Normalizar a YYYY-MM-DD
    const normalizeDateKey = (value) => {
      if (!value) return null
      const base = typeof value === 'string' ? value.split('T')[0] : value
      if (typeof base === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(base)) return base
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return null
      return d.toISOString().split('T')[0]
    }

    const dateKey = normalizeDateKey(fecha)
    if (!dateKey) return { data: null, error: new Error('Fecha inválida') }

    const buildQuery = () => {
      let q = supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .eq('fecha', dateKey)
        .order('created_at', { ascending: false })
        .limit(1)

      if (routineDayId) {
        q = q.eq('routine_day_id', routineDayId)
      }
      return q
    }

    const runRangeQuery = async () => {
      // Rango por día para columnas tipo timestamptz
      const start = new Date(`${dateKey}T00:00:00.000Z`).toISOString()
      const end = new Date(`${dateKey}T23:59:59.999Z`).toISOString()
      let q = supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .gte('fecha', start)
        .lt('fecha', end)
        .order('created_at', { ascending: false })
        .limit(1)
      if (routineDayId) {
        q = q.eq('routine_day_id', routineDayId)
      }
      return q.maybeSingle()
    }

    // 1) Intento directo con eq
    const { data, error } = await buildQuery().maybeSingle()
    if (error && error?.code !== 'PGRST116') {
      return { data: null, error }
    }

    if (data) return { data, error: null }

    // 2) Intento con rango horario (para columnas con tz)
    const { data: rangeData, error: rangeError } = await runRangeQuery()
    if (rangeError && rangeError?.code !== 'PGRST116') {
      return { data: null, error: rangeError }
    }

    return { data: rangeData || null, error: null }
  },

  // Obtener sesiones del usuario
  getUserSessions: async (limit = 50) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: null };
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
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Obtener notas de sesiones por día de rutina (para panel de notas)
  getNotesByDay: async (dayId, limit = 5) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], error: null }

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('id, notas, fecha, created_at, calificacion')
      .eq('user_id', user.id)
      .eq('routine_day_id', dayId)
      .not('notas', 'is', null)
      .not('notas', 'eq', '')
      .order('fecha', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
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

  // Obtener logs por usuario (aplanando desde sesiones del usuario)
  getByUser: async (userId, limit = 500) => {
    try {
      // Reutilizar sesiones filtradas por usuario para garantizar RLS correcta
      const { data: sessions, error } = await workoutSessions.getUserSessions(limit);
      if (error) return { data: null, error };
      const logs = [];
      for (const s of (sessions || [])) {
        for (const l of (s.exercise_logs || [])) {
          logs.push({ ...l });
        }
      }
      // Ordenar por fecha de creación ascendente para gráficos
      logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return { data: logs, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
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
    // Normalizar nombres de campos a los de la base
    const payload = {
      user_id: progressData.user_id,
      fecha: progressData.fecha,
      peso_corporal: progressData.peso ?? progressData.peso_corporal ?? null,
      porcentaje_grasa: progressData.grasa ?? progressData.porcentaje_grasa ?? null,
      masa_muscular: progressData.musculo ?? progressData.masa_muscular ?? null,
      medidas: progressData.medidas ?? null,
      fotos: progressData.fotos ?? null,
      notas: progressData.notas ?? null,
    };
    const { data, error } = await supabase
      .from('user_progress')
      .upsert([payload], { onConflict: 'user_id,fecha' })
      .select()
    return { data, error }
  },

  // Obtener progreso del usuario
  getUserProgress: async (limit = 30) => {
    // Compatibilidad: devuelve los últimos registros del usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: null };
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Obtener progreso por usuario explícito
  getByUser: async (userId, limit = 30) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false })
      .limit(limit)
    // Normalizar claves para el frontend (compatibilidad)
    const normalized = (data || []).map(r => ({
      ...r,
      peso: r.peso_corporal,
      grasa: r.porcentaje_grasa,
      musculo: r.masa_muscular,
    }));
    return { data: normalized, error }
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
    // Asegurar que solo se actualice el registro del usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };
    const payload = {
      peso_corporal: updates.peso ?? updates.peso_corporal ?? null,
      porcentaje_grasa: updates.grasa ?? updates.porcentaje_grasa ?? null,
      masa_muscular: updates.musculo ?? updates.masa_muscular ?? null,
      medidas: updates.medidas ?? null,
      fotos: updates.fotos ?? null,
      notas: updates.notas ?? null,
    };
    const { data, error } = await supabase
      .from('user_progress')
      .update(payload)
      .eq('fecha', fecha)
      .eq('user_id', user.id)
      .select()
    return { data, error }
  }
}

// Funciones para estudios de composición corporal
export const bodyCompositionStudies = {
  // Guardar un estudio completo (grasa + macros)
  saveStudy: async (studyData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'No authenticated user' };
    
    const fecha = studyData.fecha || new Date().toISOString().slice(0, 10);
    
    // Obtener registro existente o crear uno nuevo
    const { data: existing } = await supabase
      .from('user_progress')
      .select('estudios_corporales')
      .eq('user_id', user.id)
      .eq('fecha', fecha)
      .maybeSingle();
    
    const estudios = existing?.estudios_corporales || [];
    const nuevoEstudio = {
      bodyfat: studyData.bodyfat || null,
      macros: studyData.macros || null,
      fecha_estudio: new Date().toISOString()
    };
    
    estudios.push(nuevoEstudio);
    
    const payload = {
      user_id: user.id,
      fecha: fecha,
      estudios_corporales: estudios,
    };
    
    // Actualizar también campos básicos si vienen
    if (studyData.peso) payload.peso_corporal = studyData.peso;
    if (studyData.bodyfat?.percentage) payload.porcentaje_grasa = studyData.bodyfat.percentage;
    
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(payload, { onConflict: 'user_id,fecha' })
      .select();
    
    return { data, error };
  },

  // Obtener todos los estudios del usuario
  getUserStudies: async (limit = 50) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('fecha, estudios_corporales, peso_corporal')
      .eq('user_id', user.id)
      .not('estudios_corporales', 'is', null)
      .order('fecha', { ascending: false })
      .limit(limit);
    
    // Aplanar estudios en array único
    const allStudies = [];
    (data || []).forEach(record => {
      if (record.estudios_corporales && Array.isArray(record.estudios_corporales)) {
        record.estudios_corporales.forEach(estudio => {
          allStudies.push({
            ...estudio,
            fecha: record.fecha,
            peso: record.peso_corporal
          });
        });
      }
    });
    
    // Ordenar por fecha_estudio descendente
    allStudies.sort((a, b) => {
      const dateA = new Date(a.fecha_estudio || a.fecha);
      const dateB = new Date(b.fecha_estudio || b.fecha);
      return dateB - dateA;
    });
    
    return { data: allStudies, error };
  },

  // Obtener último estudio
  getLatestStudy: async () => {
    const { data: studies, error } = await bodyCompositionStudies.getUserStudies(1);
    return { 
      data: studies?.data?.[0] || null, 
      error 
    };
  },

  // Obtener fechas donde se realizaron estudios (para marcadores en gráficos)
  getStudyDates: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('fecha')
      .eq('user_id', user.id)
      .not('estudios_corporales', 'is', null)
      .order('fecha', { ascending: true });
    
    const dates = (data || []).map(r => r.fecha);
    return { data: dates, error };
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

