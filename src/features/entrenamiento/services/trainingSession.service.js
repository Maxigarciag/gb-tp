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

    const normalizeDateKey = (value) => {
      if (!value) return null
      if (typeof value === 'string') {
        const trimmed = value.includes('T') ? value.split('T')[0] : value
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
      }
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return null
      return d.toISOString().split('T')[0]
    }

    const buildLocalDateKey = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const normalizedTarget = normalizeDateKey(fecha)
    const localKey = buildLocalDateKey()
    const targetDates = [normalizedTarget || fecha].filter(Boolean)
    if (localKey && !targetDates.includes(localKey)) {
      targetDates.push(localKey)
    }

    const isSameDay = (value) => {
      const normalized = normalizeDateKey(value)
      if (!normalized) return false
      return targetDates.includes(normalized)
    }

    // Intento principal: leer directo por fecha (UTC y local) para evitar caché o límite de getUserSessions
    for (const dateKey of targetDates) {
      // 1) fecha + routine_day_id
      const { data: byDay, error: byDayError } = await workoutSessions.findByDate({
        userId,
        routineId,
        routineDayId,
        fecha: dateKey
      })
      if (byDayError) throw byDayError
      if (byDay) {
        return { sessionId: byDay.id, session: byDay }
      }

      // 2) fallback: fecha + rutina (sin routine_day_id)
      const { data: byRoutine, error: byRoutineError } = await workoutSessions.findByDate({
        userId,
        routineId,
        routineDayId: null,
        fecha: dateKey
      })
      if (byRoutineError) throw byRoutineError
      if (byRoutine) {
        return { sessionId: byRoutine.id, session: byRoutine }
      }
    }

    // Fallback final: revisar últimas sesiones en memoria por si algún caso no capturado
    const { data: sesiones, error } = await workoutSessions.getUserSessions(30)
    if (error) throw error
    const existentePorFecha = (sesiones || []).find(
      (s) => s.user_id === userId && s.routine_id === routineId && isSameDay(s.fecha)
    )
    if (existentePorFecha) {
      return { sessionId: existentePorFecha.id, session: existentePorFecha }
    }

    // Crear nueva sesión
    const { data: created, error: createError } = await workoutSessions.create({
      user_id: userId,
      routine_id: routineId,
      routine_day_id: routineDayId,
      fecha: targetDates[0],
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

