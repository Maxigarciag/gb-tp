const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const getTodayInfo = () => {
  const now = new Date()
  const dayIndex = now.getDay() // 0 domingo
  const dayName = diasSemana[dayIndex]
  const fecha = now.toISOString().split('T')[0]
  // Ajustar a índice Lunes=0 para rutinas existentes
  const routineIndex = dayIndex === 0 ? 6 : dayIndex - 1
  return { dayName, fecha, routineIndex }
}

export const isExerciseCompleted = (completedSeries = 0, totalSeries = 0) => {
  return completedSeries >= totalSeries && totalSeries > 0
}

export const canFinishSession = ({ totalSeries = 0, completedSeries = 0, completedExercises = 0 }) => {
  const hasExercises = completedExercises > 0
  const hasMinimumSeries = totalSeries === 0 ? false : completedSeries >= Math.ceil(totalSeries * 0.3)
  return hasExercises && hasMinimumSeries
}

export const validateSeriesPayload = ({ reps, peso, rpe }) => {
  if (!reps || Number(reps) <= 0) return 'Las repeticiones deben ser mayores a 0'
  if (peso === '' || peso === null || peso === undefined || Number(peso) < 0) {
    return 'El peso debe ser mayor o igual a 0'
  }
  if (rpe !== '' && rpe !== null && rpe !== undefined) {
    const n = Number(rpe)
    if (Number.isNaN(n) || n < 1 || n > 10) return 'El RPE debe estar entre 1 y 10'
  }
  return null
}

export const computeExerciseState = ({ completedSeries, totalSeries }) => {
  if (isExerciseCompleted(completedSeries, totalSeries)) return 'completed'
  if (completedSeries > 0) return 'in_progress'
  return 'pending'
}

