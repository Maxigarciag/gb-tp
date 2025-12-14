import { useCallback, useEffect, useState } from 'react'
import { streakRepository } from './streak.repository'
import { UserStreak } from './streak.types'

type UseStreakState = {
  streak: UserStreak | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useStreak = (): UseStreakState => {
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStreak = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await streakRepository.getUserStreak()
    if (error) {
      setStreak(null)
      setError(error.message ?? 'Error al cargar racha')
    } else {
      setStreak(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStreak()
  }, [fetchStreak])

  return {
    streak,
    loading,
    error,
    refetch: fetchStreak
  }
}

