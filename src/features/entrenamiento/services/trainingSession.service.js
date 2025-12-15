import { workoutSessions, exerciseLogs } from '@/lib/supabase'

/**
 * Servicio centralizado para gestionar sesiones de entrenamiento.
 * No crea tablas nuevas: reutiliza workout_sessions y exercise_logs existentes.
 */
const trainingSessionService = {
  /**
   * Busca una sesión existente para (user, rutina, día, fecha) o crea una nueva.
   * @returns {{ sessionId: string, session: object }}
   */
  async ensureSession({ userId, routineId, routineDayId, fecha }) {
    if (!userId || !routineId || !routineDayId || !fecha) {
      throw new Error('Parámetros incompletos para crear/obtener sesión')
    }

    // Obtener últimas sesiones del usuario para evitar duplicados
    const { data: sesiones, error } = await workoutSessions.getUserSessions(30)
    if (error) throw error

    const existente = (sesiones || []).find(
      (s) =>
        s.user_id === userId &&
        s.routine_id === routineId &&
        s.routine_day_id === routineDayId &&
        s.fecha === fecha
    )

    // Fallback: si no coincide routine_day_id pero hay sesión del mismo día y rutina, reutilizarla
    const existentePorFecha =
      existente ||
      (sesiones || []).find(
        (s) =>
          s.user_id === userId &&
          s.routine_id === routineId &&
          s.fecha === fecha
      )

    if (existentePorFecha) {
      return { sessionId: existentePorFecha.id, session: existentePorFecha }
    }

    // Crear nueva sesión
    const { data: created, error: createError } = await workoutSessions.create({
      user_id: userId,
      routine_id: routineId,
      routine_day_id: routineDayId,
      fecha,
      completada: false
    })
    if (createError) throw createError
    if (!created || created.length === 0) {
      throw new Error('No se pudo crear la sesión de entrenamiento')
    }

    const session = created[0]
    return { sessionId: session.id, session }
  },

  /**
   * Obtiene logs de ejercicios para una sesión.
   */
  async fetchLogs(sessionId) {
    if (!sessionId) return []
    const { data, error } = await exerciseLogs.getBySession(sessionId)
    if (error) throw error
    return data || []
  },

  /**
   * Guarda una serie (reps, peso, rpe opcional) para un ejercicio dado.
   */
  async saveSeries({ sessionId, exerciseId, reps, peso, rpe, serieNumero }) {
    if (!sessionId || !exerciseId) throw new Error('Faltan ids para guardar la serie')
    const payload = {
      session_id: sessionId,
      exercise_id: exerciseId,
      repeticiones: Number(reps),
      peso: Number(peso),
      serie_numero: serieNumero ?? 1,
      rpe: rpe === '' || rpe === null || rpe === undefined ? null : Number(rpe),
      created_at: new Date().toISOString()
    }
    const { error } = await exerciseLogs.create(payload)
    if (error) throw error
  },

  /**
   * Marca la sesión como completada con notas y calificación opcional.
   */
  async finishSession(sessionId, notes = '', rating = null) {
    if (!sessionId) throw new Error('No hay sesión activa para finalizar')
    const { error } = await workoutSessions.finish(sessionId, notes, rating)
    if (error) throw error
    return true
  },

  /**
   * Obtiene detalles de sesión por id (para conocer estado completada).
   */
  async getSessionById(sessionId) {
    if (!sessionId) return null
    const { data, error } = await workoutSessions.getById(sessionId)
    if (error) throw error
    return data || null
  }
}

export default trainingSessionService

