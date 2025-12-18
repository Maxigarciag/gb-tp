/**
 * Hook personalizado para el calendario semanal
 * Maneja la lógica de los próximos 7 días de entrenamiento
 * 
 * @returns {Object} Datos del calendario semanal
 * @property {Array} weekDays - Array de 7 días con su información
 * @property {boolean} loading - Si está cargando datos
 * @property {Function} refresh - Función para refrescar los datos
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRoutineStore } from '../stores/routineStore'
import { supabase } from '../lib/supabase'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const useWeeklyCalendar = () => {
  const { userProfile } = useAuth()
  const { userRoutine } = useRoutineStore()
  const [weekDays, setWeekDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [completedSessions, setCompletedSessions] = useState({})

  /**
   * Obtiene las fechas de los próximos 7 días
   */
  const getNext7Days = useCallback(() => {
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      days.push({
        date,
        dayName: DIAS_SEMANA[date.getDay()],
        dayShort: DIAS_CORTOS[date.getDay()],
        dayNumber: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: i === 0
      })
    }
    
    return days
  }, [])

  /**
   * Obtiene las sesiones completadas de la semana
   */
  const fetchCompletedSessions = useCallback(async () => {
    if (!userProfile?.id) return {}

    try {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 7) // Una semana atrás para seguridad
      
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 7) // Una semana adelante

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, fecha, completada, routine_day_id')
        .eq('user_id', userProfile.id)
        .gte('fecha', startDate.toISOString().split('T')[0])
        .lte('fecha', endDate.toISOString().split('T')[0])

      if (error) {
        console.error('Error fetching sessions:', error)
        return {}
      }

      // Crear un mapa de fecha -> sesión
      const sessionsMap = {}
      data?.forEach(session => {
        // Parsear fecha como local para evitar desfases
        const [y, m, d] = (session.fecha || '').split('-').map(Number)
        const sessionDate = new Date(y, (m || 1) - 1, d || 1)
        const dateKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}-${String(sessionDate.getDate()).padStart(2, '0')}`
        sessionsMap[dateKey] = session
      })

      return sessionsMap
    } catch (error) {
      console.error('Error in fetchCompletedSessions:', error)
      return {}
    }
  }, [userProfile?.id])

  /**
   * Obtiene la información del día de la rutina
   */
  const getRoutineInfoForDay = useCallback((dayName) => {
    if (!userRoutine?.routine_days) return null

    const routineDay = userRoutine.routine_days.find(
      rd => rd.dia_semana === dayName
    )

    if (!routineDay) return null

    return {
      id: routineDay.id,
      description: routineDay.descripcion || routineDay.nombre_dia,
      isRest: routineDay.es_descanso,
      exercises: routineDay.routine_exercises || [],
      muscleGroup: extractMuscleGroup(routineDay.descripcion || routineDay.nombre_dia)
    }
  }, [userRoutine])

  /**
   * Extrae el grupo muscular de la descripción del día
   */
  const extractMuscleGroup = (description) => {
    if (!description) return 'Entrenamiento'
    
    const desc = description.toLowerCase()
    
    // Patrones específicos
    if (desc.includes('descanso')) return 'Descanso'
    if (desc.includes('cardio')) return 'Cardio'
    if (desc.includes('pecho')) return 'Pecho'
    if (desc.includes('espalda')) return 'Espalda'
    if (desc.includes('piernas') || desc.includes('cuádriceps') || desc.includes('isquio')) return 'Piernas'
    if (desc.includes('hombros')) return 'Hombros'
    if (desc.includes('brazos') || desc.includes('bíceps') || desc.includes('tríceps')) return 'Brazos'
    if (desc.includes('core') || desc.includes('abdomen')) return 'Core'
    
    // Patrones de tipo de rutina
    if (desc.includes('push')) return 'Push'
    if (desc.includes('pull')) return 'Pull'
    if (desc.includes('upper')) return 'Tren Superior'
    if (desc.includes('lower')) return 'Tren Inferior'
    if (desc.includes('full body')) return 'Cuerpo Completo'
    
    // Si tiene múltiples grupos, tomar el primero o devolver la descripción corta
    return description.split(',')[0].trim() || 'Entrenamiento'
  }

  /**
   * Determina el estado de un día
   * Estados posibles:
   * - 'completed': Día completado (sesión completada)
   * - 'today': Día de hoy con entrenamiento
   * - 'rest': Día de descanso
   * - 'pending': Día futuro con entrenamiento
   * - 'missed': Día pasado sin completar
   * - 'no-routine': Sin rutina programada
   */
  const getDayStatus = useCallback((day, routineInfo, session) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    
    const isPast = dayDate < today
    const isToday = dayDate.getTime() === today.getTime()
    
    // Si no hay rutina programada para este día
    if (!routineInfo) {
      return 'no-routine'
    }
    
    // Si es día de descanso
    if (routineInfo.isRest) {
      return 'rest'
    }
    
    // Si hay sesión completada
    if (session && session.completada) {
      return 'completed'
    }
    
    // Si es hoy
    if (isToday) {
      return 'today'
    }
    
    // Si es pasado y no se completó
    if (isPast) {
      return 'missed'
    }
    
    // Día futuro con entrenamiento
    return 'pending'
  }, [])

  /**
   * Procesa los días y genera la información completa
   */
  const processWeekDays = useCallback(async () => {
    setLoading(true)
    
    try {
      const days = getNext7Days()
      const sessions = await fetchCompletedSessions()
      
      const processedDays = days.map(day => {
        const dateKey = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.dayNumber).padStart(2, '0')}`
        const session = sessions[dateKey]
        const routineInfo = getRoutineInfoForDay(day.dayName)
        const status = getDayStatus(day, routineInfo, session)
        
        return {
          ...day,
          isoDate: dateKey,
          routineInfo,
          session,
          status,
          muscleGroup: routineInfo?.muscleGroup || null,
          exerciseCount: routineInfo?.exercises?.length || 0
        }
      })
      
      setWeekDays(processedDays)
      setCompletedSessions(sessions)
    } catch (error) {
      console.error('Error processing week days:', error)
    } finally {
      setLoading(false)
    }
  }, [getNext7Days, fetchCompletedSessions, getRoutineInfoForDay, getDayStatus])

  /**
   * Refresca los datos del calendario
   */
  const refresh = useCallback(() => {
    processWeekDays()
  }, [processWeekDays])

  // Cargar datos iniciales
  useEffect(() => {
    if (userProfile && userRoutine) {
      processWeekDays()
    }
  }, [userProfile, userRoutine, processWeekDays])

  // Escuchar refresh externo (al finalizar sesión u otros eventos)
  useEffect(() => {
    const handler = (event) => {
      const targetUser = event?.detail?.userId
      if (!userProfile?.id || (targetUser && targetUser !== userProfile.id)) return
      refresh()
    }
    window.addEventListener('progreso-page-refresh', handler)
    return () => window.removeEventListener('progreso-page-refresh', handler)
  }, [refresh, userProfile?.id])

  return {
    weekDays,
    loading,
    refresh,
    completedSessions
  }
}

