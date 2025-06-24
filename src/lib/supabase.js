import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones de autenticación
export const auth = {
  // Registro con email y contraseña
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // metadata adicional
      }
    })
    return { data, error }
  },

  // Inicio de sesión
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Cerrar sesión
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Escuchar cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funciones para perfiles de usuario
export const userProfiles = {
  // Crear perfil de usuario
  create: async (profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
    return { data, error }
  },

  // Obtener perfil del usuario actual
  getCurrent: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No authenticated user' }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    return { data, error }
  },

  // Actualizar perfil
  update: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No authenticated user' }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
    return { data, error }
  }
}

// Funciones para ejercicios
export const exercises = {
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
      .eq('es_activa', true)
      .single()
    return { data, error }
  },

  // Activar rutina
  setActive: async (routineId) => {
    // Primero desactivar todas las rutinas
    await supabase
      .from('workout_routines')
      .update({ es_activa: false })
      .neq('id', routineId)

    // Luego activar la seleccionada
    const { data, error } = await supabase
      .from('workout_routines')
      .update({ es_activa: true })
      .eq('id', routineId)
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