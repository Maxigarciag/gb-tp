import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRoutineStore } from '@/stores/routineStore'
import trainingSessionService from '../services/trainingSession.service'
import { getTodayInfo } from '../utils/sessionRules'

/**
 * Gestiona la obtención de la rutina del día y la sesión activa (crear o reutilizar).
 * No usa nada de Progreso.
 */
export const useTrainingSession = () => {
  const { userProfile } = useAuth()
  const { userRoutine, loadUserRoutine, selectedDayIndex, setSelectedDay } = useRoutineStore()

  const [sessionId, setSessionId] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('active') // active | completed
  const [mode, setMode] = useState('active') // active | read-only
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [routineDay, setRoutineDay] = useState(null)

  // Asegurar rutina cargada
  useEffect(() => {
    if (userProfile && !userRoutine) {
      loadUserRoutine()
    }
  }, [userProfile, userRoutine, loadUserRoutine])

  // Seleccionar día actual en store de rutina (sin depender de Progreso)
  useEffect(() => {
    if (selectedDayIndex === null) {
      const { routineIndex } = getTodayInfo()
      setSelectedDay(routineIndex)
    }
  }, [selectedDayIndex, setSelectedDay])

  const exercises = useMemo(() => {
    if (!routineDay || !routineDay.routine_exercises) return []
    return routineDay.routine_exercises.map((re) => ({
      ...re.exercises,
      routine_exercise_id: re.id,
      series: re.series,
      repeticiones_min: re.repeticiones_min,
      repeticiones_max: re.repeticiones_max,
      peso_sugerido: re.peso_sugerido,
      tiempo_descanso: re.tiempo_descanso
    }))
  }, [routineDay])

  const routineName = userRoutine?.nombre || 'Sin rutina activa'
  const dayName = routineDay?.dia_semana || getTodayInfo().dayName

  const initialize = useCallback(async () => {
    if (!userProfile) return

    const { fecha, dayName: todayName, routineIndex } = getTodayInfo()

    try {
      setLoading(true)
      setError(null)
      setStatus('loading')

      if (!userRoutine) {
        // Sin rutina: modo solo lectura, sin sesión activa
        setRoutineDay(null)
        setSessionId(null)
        setSessionStatus('active')
        setMode('read-only')
        setStatus('ready')
        setLoading(false)
        return
      }

      // Resolver day en rutina (prioridad hoy, fallback siguiente/primero)
      const dayCandidate =
        userRoutine.routine_days?.find((d) => d.dia_semana === todayName) ||
        userRoutine.routine_days?.[routineIndex] ||
        null

      const fallbackDay = userRoutine.routine_days?.[0] || null
      const finalDay = dayCandidate || fallbackDay

      if (!finalDay) {
        // Rutina sin días: solo lectura sin ejercicios
        setRoutineDay(null)
        setSessionId(null)
        setSessionStatus('active')
        setMode('read-only')
        setStatus('ready')
        setLoading(false)
        return
      }

      setRoutineDay(finalDay)

      // Día resuelto (hoy o fallback) -> sesión activa salvo que esté completada
      const { sessionId: ensuredId, session } = await trainingSessionService.ensureSession({
        userId: userProfile.id,
        routineId: userRoutine.id,
        routineDayId: finalDay.id,
        fecha
      })

      const completed = session?.completada
      setSessionId(ensuredId)
      setSessionStatus(completed ? 'completed' : 'active')
      setMode(completed ? 'read-only' : 'active')
      setStatus('ready')
    } catch (err) {
      console.error('Error inicializando sesión de entrenamiento', err)
      setError(err.message || 'No se pudo iniciar la sesión')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [userProfile, userRoutine])

  useEffect(() => {
    if (userProfile && userRoutine) {
      initialize()
    }
  }, [userProfile, userRoutine, initialize])

  return {
    loading,
    error,
    sessionId,
    sessionStatus,
    setSessionStatus,
    status,
    mode,
    routineName,
    dayName,
    exercises,
    refreshSession: initialize
  }
}

export default useTrainingSession

