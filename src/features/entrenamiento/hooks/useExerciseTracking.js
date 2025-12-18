import { useCallback, useEffect, useMemo, useState } from 'react'
import trainingSessionService from '../services/trainingSession.service'
import { computeExerciseState, validateSeriesPayload } from '../utils/sessionRules'

/**
 * Gestiona estados por ejercicio, carga de logs y registro de series.
 */
export const useExerciseTracking = ({ sessionId, exercises }) => {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Permite controlar si queremos mostrar loader completo (solo para la carga inicial)
  const loadLogs = useCallback(async (showLoading = false) => {
    if (!sessionId) return
    try {
      if (showLoading) setIsLoading(true)
      setError(null)
      const data = await trainingSessionService.fetchLogs(sessionId)
      setLogs(data)
    } catch (err) {
      console.error('Error cargando logs', err)
      setError(err.message || 'No se pudieron cargar las series')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadLogs(true) // solo la primera vez mostramos el skeleton
  }, [loadLogs])

  const exerciseStates = useMemo(() => {
    const grouped = logs.reduce((acc, log) => {
      const key = log.exercise_id
      if (!acc[key]) acc[key] = []
      acc[key].push(log)
      return acc
    }, {})

    return (exercises || []).reduce((acc, ex) => {
      const exLogs = grouped[ex.id] || []
      const completedSeries = exLogs.length
      const totalSeries = ex.series || 3
      const state = computeExerciseState({ completedSeries, totalSeries })
      const volume = exLogs.reduce((sum, l) => sum + (Number(l.peso) || 0) * (Number(l.repeticiones) || 0), 0)

      acc[ex.id] = {
        state,
        completedSeries,
        totalSeries,
        volume,
        lastUpdate: exLogs.length > 0 ? exLogs[exLogs.length - 1].created_at : null
      }
      return acc
    }, {})
  }, [logs, exercises])

  const saveSeries = useCallback(
    async ({ exerciseId, reps, peso, rpe }) => {
      const validation = validateSeriesPayload({ reps, peso, rpe })
      if (validation) {
        throw new Error(validation)
      }
      try {
        setSaving(true)
        const serieNumero = (exerciseStates[exerciseId]?.completedSeries || 0) + 1
        await trainingSessionService.saveSeries({ sessionId, exerciseId, reps, peso, rpe, serieNumero })
        await loadLogs(false) // refresca datos sin bloquear toda la vista
      } finally {
        setSaving(false)
      }
    },
    [sessionId, loadLogs, exerciseStates]
  )

  return {
    exerciseStates,
    saveSeries,
    reloadLogs: loadLogs,
    isLoading,
    saving,
    error
  }
}

export default useExerciseTracking

