/**
 * Hook para el calendario de rutina
 * A diferencia de useWeeklyCalendar (que muestra hoy + 6 días futuros),
 * este hook muestra siempre Lunes–Domingo de la semana ACTUAL con fechas reales.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRoutineStore } from '../stores/routineStore'
import { supabase } from '../lib/supabase'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DIAS_CORTOS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
// L M X J V S D  (X para Miércoles, convención española)
const DIAS_LETRA   = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

/**
 * Calcula los 7 días de la semana actual (Lun–Dom) en orden.
 * Retorna el array indexado 0=Lunes … 6=Domingo.
 */
const getMonSunWeek = () => {
  const today    = new Date()
  const dow      = today.getDay()                    // 0=Dom, 1=Lun … 6=Sáb
  const fromMon  = dow === 0 ? 6 : dow - 1          // cuántos días desde el lunes
  const monday   = new Date(today)
  monday.setDate(today.getDate() - fromMon)

  return Array.from({ length: 7 }, (_, i) => {
    const date   = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dayOfWeek = date.getDay()                  // 0=Dom, 1=Lun …
    const isToday   = date.toDateString() === today.toDateString()
    return {
      date,
      dayName:   DIAS_SEMANA[dayOfWeek],             // 'Lunes', 'Martes' …
      dayShort:  DIAS_CORTOS[dayOfWeek],             // 'Lun', 'Mar' …
      dayLetter: DIAS_LETRA[dayOfWeek],              // 'L', 'M', 'X' …
      dayNumber: date.getDate(),
      month:     date.getMonth(),
      year:      date.getFullYear(),
      isToday,
    }
  })
}

const extractMuscleGroup = (description) => {
  if (!description) return 'Entrenamiento'
  const desc = description.toLowerCase()
  if (desc.includes('descanso'))  return 'Descanso'
  if (desc.includes('cardio'))    return 'Cardio'
  if (desc.includes('pecho'))     return 'Pecho'
  if (desc.includes('espalda'))   return 'Espalda'
  if (desc.includes('piernas') || desc.includes('cuádriceps') || desc.includes('isquio')) return 'Piernas'
  if (desc.includes('hombros'))   return 'Hombros'
  if (desc.includes('brazos') || desc.includes('bíceps') || desc.includes('tríceps')) return 'Brazos'
  if (desc.includes('core') || desc.includes('abdomen')) return 'Core'
  if (desc.includes('push'))       return 'Push'
  if (desc.includes('pull'))       return 'Pull'
  if (desc.includes('upper'))      return 'Tren Superior'
  if (desc.includes('lower'))      return 'Tren Inferior'
  if (desc.includes('full body'))  return 'Full Body'
  return description.split(',')[0].trim() || 'Entrenamiento'
}

export const useRutinaCalendario = () => {
  const { userProfile }      = useAuth()
  const { userRoutine }      = useRoutineStore()
  const [weekDays, setWeekDays] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!userProfile?.id) return {}
    try {
      const today     = new Date()
      // Traemos sesiones de la semana actual + un buffer de 1 día en cada extremo
      const dow       = today.getDay()
      const fromMon   = dow === 0 ? 6 : dow - 1
      const monday    = new Date(today)
      monday.setDate(today.getDate() - fromMon)
      const sunday    = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const startDate = monday.toISOString().split('T')[0]
      const endDate   = sunday.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, fecha, completada, routine_day_id')
        .eq('user_id', userProfile.id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)

      if (error) return {}

      const map = {}
      data?.forEach(s => {
        const [y, m, d] = (s.fecha || '').split('-').map(Number)
        const dateObj   = new Date(y, (m || 1) - 1, d || 1)
        const key       = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        map[key] = s
      })
      return map
    } catch {
      return {}
    }
  }, [userProfile?.id])

  const getRoutineInfoForDay = useCallback((dayName) => {
    if (!userRoutine?.routine_days) return null
    const rd = userRoutine.routine_days.find(d => d.dia_semana === dayName)
    if (!rd) return null
    return {
      id:          rd.id,
      description: rd.descripcion || rd.nombre_dia,
      isRest:      rd.es_descanso,
      exercises:   rd.routine_exercises || [],
      muscleGroup: extractMuscleGroup(rd.descripcion || rd.nombre_dia),
    }
  }, [userRoutine])

  const getDayStatus = useCallback((day, routineInfo, session) => {
    const today   = new Date(); today.setHours(0, 0, 0, 0)
    const dayDate = new Date(day.date); dayDate.setHours(0, 0, 0, 0)
    const isPast  = dayDate < today
    const isToday = dayDate.getTime() === today.getTime()

    if (!routineInfo)        return 'no-routine'
    if (routineInfo.isRest)  return 'rest'
    if (session?.completada) return 'completed'
    if (isToday)             return 'today'
    if (isPast)              return 'missed'
    return 'pending'
  }, [])

  const processWeek = useCallback(async () => {
    setLoading(true)
    try {
      const days     = getMonSunWeek()
      const sessions = await fetchSessions()

      const processed = days.map(day => {
        const dateKey     = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.dayNumber).padStart(2, '0')}`
        const session     = sessions[dateKey]
        const routineInfo = getRoutineInfoForDay(day.dayName)
        const status      = getDayStatus(day, routineInfo, session)
        return {
          ...day,
          isoDate:       dateKey,
          routineInfo,
          session,
          status,
          muscleGroup:   routineInfo?.muscleGroup || null,
          exerciseCount: routineInfo?.exercises?.length || 0,
        }
      })

      setWeekDays(processed)
    } catch (err) {
      console.error('useRutinaCalendario error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchSessions, getRoutineInfoForDay, getDayStatus])

  const refresh = useCallback(() => processWeek(), [processWeek])

  useEffect(() => {
    if (userProfile && userRoutine) processWeek()
  }, [userProfile, userRoutine, processWeek])

  // Refrescar al completar entrenamientos
  useEffect(() => {
    const handler = (e) => {
      const target = e?.detail?.userId
      if (!userProfile?.id || (target && target !== userProfile.id)) return
      refresh()
    }
    window.addEventListener('progreso-page-refresh', handler)
    return () => window.removeEventListener('progreso-page-refresh', handler)
  }, [refresh, userProfile?.id])

  return { weekDays, loading, refresh }
}
