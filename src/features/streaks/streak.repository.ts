import { supabase } from '@/lib/supabase'
import { UserStreak } from './streak.types'

type StreakResponse = {
  data: UserStreak | null
  error: Error | null
}

export const streakRepository = {
  /**
   * Obtiene la racha del usuario autenticado desde la tabla user_streaks.
   * No realiza cálculos en cliente.
   */
  getUserStreak: async (): Promise<StreakResponse> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) return { data: null, error: authError }
      const user = authData?.user
      if (!user) return { data: null, error: new Error('Usuario no autenticado') }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_completed_day')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) return { data: null, error }
      return { data: data ?? null, error: null }
    } catch (err) {
      const fallbackError = err instanceof Error ? err : new Error('Error al obtener racha')
      return { data: null, error: fallbackError }
    }
  }
}

