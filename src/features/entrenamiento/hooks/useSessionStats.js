import { useMemo } from 'react'
import { canFinishSession, computeExerciseState } from '../utils/sessionRules'

/**
 * Calcula estadísticas agregadas y recomendación de siguiente ejercicio.
 */
export const useSessionStats = ({ exercises = [], exerciseStates = {} }) => {
  const stats = useMemo(() => {
    return exercises.reduce(
      (acc, ex) => {
        const state = exerciseStates[ex.id] || {
          state: 'pending',
          completedSeries: 0,
          totalSeries: ex.series || 3
        }
        acc.totalExercises += 1
        acc.totalSeries += state.totalSeries
        acc.completedSeries += state.completedSeries
        if (computeExerciseState({ completedSeries: state.completedSeries, totalSeries: state.totalSeries }) === 'completed') {
          acc.completedExercises += 1
        }
        return acc
      },
      { totalExercises: 0, completedExercises: 0, totalSeries: 0, completedSeries: 0 }
    )
  }, [exercises, exerciseStates])

  const progressPercent = useMemo(() => {
    if (stats.totalExercises === 0) return 0
    return Math.round((stats.completedExercises / stats.totalExercises) * 100)
  }, [stats])

  const canFinish = useMemo(
    () =>
      canFinishSession({
        totalSeries: stats.totalSeries,
        completedSeries: stats.completedSeries,
        completedExercises: stats.completedExercises
      }),
    [stats]
  )

  const recommendedExercise = useMemo(() => {
    // Prioridad: en progreso -> pendiente -> ninguno
    const inProgress = exercises.find((ex) => exerciseStates[ex.id]?.state === 'in_progress')
    if (inProgress) return inProgress
    const pending = exercises.find((ex) => exerciseStates[ex.id]?.state === 'pending')
    return pending || null
  }, [exercises, exerciseStates])

  return {
    stats,
    progressPercent,
    canFinish,
    recommendedExercise
  }
}

export default useSessionStats

