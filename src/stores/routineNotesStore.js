import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { routineDayNotes, workoutSessions } from '@/lib/supabase'

const mapPanelData = (favoritas = [], regulares = []) => ({
  favoritas: favoritas.slice(0, 3),
  regulares: regulares.slice(0, 3),
  hasMoreFavoritas: favoritas.length > 3,
  hasMoreRegulares: regulares.length > 3
})

export const useRoutineNotesStore = create(devtools((set, get) => ({
  notesByDay: {},
  historyByDay: {},
  error: null,

  setDayLoading: (dayId, loading) => {
    set(state => ({
      notesByDay: {
        ...state.notesByDay,
        [dayId]: {
          ...(state.notesByDay[dayId] || {}),
          loading
        }
      }
    }))
  },

  loadNotes: async (dayId) => {
    if (!dayId) return
    get().setDayLoading(dayId, true)
    try {
      const [favRes, regRes, sessionsRes] = await Promise.all([
        routineDayNotes.getByDay({ dayId, esFavorita: true, limit: 4 }),
        routineDayNotes.getByDay({ dayId, esFavorita: false, limit: 4 }),
        workoutSessions.getNotesByDay(dayId, 5)
      ])

      if (favRes.error || regRes.error || sessionsRes.error) {
        throw favRes.error || regRes.error || sessionsRes.error
      }

      const panel = mapPanelData(favRes.data || [], regRes.data || [])
      const sessionNotes = (sessionsRes.data || []).map(sn => ({
        id: sn.id,
        contenido: sn.notas,
        fecha: sn.fecha,
        created_at: sn.created_at,
        calificacion: sn.calificacion
      }))
      set(state => ({
        notesByDay: {
          ...state.notesByDay,
          [dayId]: {
            ...panel,
            sessionNotes,
            loading: false,
            error: null
          }
        }
      }))
    } catch (error) {
      set(state => ({
        notesByDay: {
          ...state.notesByDay,
          [dayId]: {
            ...(state.notesByDay[dayId] || {}),
            loading: false,
            error: 'No pudimos cargar las notas'
          }
        },
        error
      }))
    }
  },

  loadHistory: async (dayId) => {
    if (!dayId) return
    set(state => ({
      historyByDay: {
        ...state.historyByDay,
        [dayId]: { loading: true, error: null, favoritas: [], regulares: [] }
      }
    }))
    try {
      const { data, error } = await routineDayNotes.listAllByDay(dayId)
      if (error) throw error

      const favoritas = (data || []).filter(n => n.es_favorita)
      const regulares = (data || []).filter(n => !n.es_favorita)

      set(state => ({
        historyByDay: {
          ...state.historyByDay,
          [dayId]: { loading: false, error: null, favoritas, regulares }
        }
      }))
    } catch (error) {
      set(state => ({
        historyByDay: {
          ...state.historyByDay,
          [dayId]: { loading: false, error: 'No pudimos cargar el historial', favoritas: [], regulares: [] }
        },
        error
      }))
    }
  },

  createNote: async (dayId, { contenido, esFavorita = false }) => {
    if (!dayId || !contenido) return false
    get().setDayLoading(dayId, true)
    try {
      const { error: createError } = await routineDayNotes.create({
        routine_day_id: dayId,
        contenido,
        es_favorita: esFavorita
      })
      if (createError) throw createError

      if (!esFavorita) {
        await routineDayNotes.pruneNonFavorites(dayId)
      }

      await get().loadNotes(dayId)
      return true
    } catch (error) {
      set({ error })
      get().setDayLoading(dayId, false)
      return false
    }
  },

  updateNote: async (noteId, updates, dayId) => {
    if (!noteId) return false
    if (dayId) get().setDayLoading(dayId, true)
    try {
      const { error } = await routineDayNotes.update(noteId, updates)
      if (error) throw error
      if (dayId) {
        await get().loadNotes(dayId)
      }
      return true
    } catch (error) {
      set({ error })
      if (dayId) get().setDayLoading(dayId, false)
      return false
    }
  },

  toggleFavorite: async (noteId, esFavorita, dayId) => {
    if (!noteId) return false
    if (dayId) get().setDayLoading(dayId, true)
    try {
      const { error } = await routineDayNotes.update(noteId, { es_favorita: esFavorita })
      if (error) throw error
      if (!esFavorita && dayId) {
        await routineDayNotes.pruneNonFavorites(dayId)
      }
      if (dayId) {
        await get().loadNotes(dayId)
      }
      return true
    } catch (error) {
      set({ error })
      if (dayId) get().setDayLoading(dayId, false)
      return false
    }
  },

  deleteNote: async (noteId, dayId) => {
    if (!noteId) return false
    if (dayId) get().setDayLoading(dayId, true)
    try {
      const { error } = await routineDayNotes.delete(noteId)
      if (error) throw error
      if (dayId) {
        await get().loadNotes(dayId)
      }
      return true
    } catch (error) {
      set({ error })
      if (dayId) get().setDayLoading(dayId, false)
      return false
    }
  }
}), { name: 'routine-notes-store', enabled: import.meta.env.DEV }))

