import { UserStreak } from './streak.types'

export type StreakLevel = {
  minDays: number
  name: string
  emoji: string
}

export const STREAK_LEVELS: StreakLevel[] = [
  { minDays: 1, name: 'Calentando', emoji: '🔥' },
  { minDays: 3, name: 'Constante', emoji: '💪' },
  { minDays: 7, name: 'Imparable', emoji: '⚡️' },
  { minDays: 14, name: 'Élite', emoji: '🏆' },
  { minDays: 30, name: 'Leyenda', emoji: '👑' },
  { minDays: 60, name: 'Mítico', emoji: '🌟' }
]

type StreakLevelResult = {
  level: StreakLevel
  nextLevel: StreakLevel | null
  progressToNext: number // 0-1
  daysToNext: number | null
}

export const getStreakLevel = (currentStreak: number): StreakLevelResult => {
  const safeStreak = Math.max(0, currentStreak || 0)
  const sortedLevels = [...STREAK_LEVELS].sort((a, b) => a.minDays - b.minDays)

  let level = sortedLevels[0]
  for (const l of sortedLevels) {
    if (safeStreak >= l.minDays) {
      level = l
    } else {
      break
    }
  }

  const nextLevel = sortedLevels.find(l => l.minDays > level.minDays) ?? null
  if (!nextLevel) {
    return {
      level,
      nextLevel: null,
      progressToNext: 1,
      daysToNext: null
    }
  }

  const range = nextLevel.minDays - level.minDays
  const progress = range > 0 ? (safeStreak - level.minDays) / range : 0

  return {
    level,
    nextLevel,
    progressToNext: Math.min(1, Math.max(0, progress)),
    daysToNext: Math.max(0, nextLevel.minDays - safeStreak)
  }
}

