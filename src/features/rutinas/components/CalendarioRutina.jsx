import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoutineStore } from '@/stores'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getTodayInfo } from '@/features/entrenamiento/utils/sessionRules'
import RutinaHeader from './RutinaHeader.jsx'
import '@/styles/components/rutinas/CalendarioRutina.css'
import NotasRutinaPanel from './notas/NotasRutinaPanel'

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/**
 * Rutina v2: vista pasiva del plan con puente único a Entrenamiento.
 * No registra progreso ni permite acciones operativas.
 */
function CalendarioRutina () {
  const navigate = useNavigate()
  const routineStore = useRoutineStore()
  const { userProfile } = useAuth()

  const { userRoutine, loading, error } = routineStore
  const [stackIndex, setStackIndex] = useState(0)
  const [todaySessionState, setTodaySessionState] = useState({
    status: 'idle', // idle | checking | ready | error
    completed: false,
    hasSession: false
  })

  // Cargar rutina activa al montar
  useEffect(() => {
    routineStore.loadUserRoutine()
  }, [])

  const routineDays = userRoutine?.routine_days || []

  const trainingDaysCount = useMemo(
    () => routineDays.filter(d => !d.es_descanso).length,
    [routineDays]
  )

  const todayIndex = useMemo(() => {
    const jsDay = new Date().getDay() // 0 Domingo
    return jsDay === 0 ? 6 : jsDay - 1
  }, [])

  const buildSlide = (diaData, label) => {
    if (!diaData) {
      return {
        label,
        title: 'Día de descanso',
        state: 'empty',
        focus: null,
        ejercicios: [],
        diaId: null
      }
    }
    const ejercicios = (diaData.routine_exercises || [])
      .filter(re => re.exercises)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
      .map(re => ({
        id: re.id,
        nombre: re.exercises?.nombre,
        grupo_muscular: re.exercises?.grupo_muscular,
        series: re.series,
        repeticiones_min: re.repeticiones_min,
        repeticiones_max: re.repeticiones_max,
        peso_sugerido: re.peso_sugerido
      }))
    const isRest = diaData.es_descanso
    const isEmpty = ejercicios.length === 0
    const displayTitle = isRest ? 'Descanso' : (diaData.nombre_dia || diaData.dia_semana || 'Día sin nombre')
    return {
      label,
      title: displayTitle,
      state: isRest ? 'rest' : (isEmpty ? 'empty' : 'training'),
      focus: diaData.nombre_dia || null,
      ejercicios,
      diaId: diaData.id,
      notes: diaData.notas || diaData.descripcion || null
    }
  }

  const orderedSlides = useMemo(() => {
    const slides = []
    for (let i = 0; i < 7; i++) {
      const idx = (todayIndex + i) % 7
      const diaSemana = diasSemana[idx]
      const diaData = routineDays.find(d => d.dia_semana === diaSemana) || null
      const label = i === 0 ? 'Hoy' : (i === 1 ? 'Mañana' : diaSemana)
      slides.push(buildSlide(diaData, label))
    }
    return slides
  }, [routineDays, todayIndex])

  const visibleSlides = useMemo(() => {
    if (!orderedSlides.length) return []

    const len = orderedSlides.length
    const clampIndex = (idx) => Math.min(Math.max(idx, 0), len - 1)

    const current = clampIndex(stackIndex)
    const next = current + 1 < len ? current + 1 : null
    const upcoming = current + 2 < len ? current + 2 : null

    const slides = [
      { slide: orderedSlides[current], role: 'current', absoluteIndex: current }
    ]

    if (next !== null) {
      slides.push({ slide: orderedSlides[next], role: 'next', absoluteIndex: next })
    }

    if (upcoming !== null) {
      slides.push({ slide: orderedSlides[upcoming], role: 'upcoming', absoluteIndex: upcoming })
    }

    return slides
  }, [orderedSlides, stackIndex])

  useEffect(() => {
    setStackIndex(0)
  }, [orderedSlides.length])

  const todaySlide = orderedSlides[0]
  const currentSlideEntry = visibleSlides.find(v => v.role === 'current')
  const currentSlide = currentSlideEntry?.slide || todaySlide

  const handleGoToTraining = () => {
    if (!userRoutine) return
    const dayId = todaySlide?.diaId || ''
    navigate(`/entrenamiento?routineId=${userRoutine.id}${dayId ? `&dayId=${dayId}` : ''}`)
  }

  const nextTrainingInfo = useMemo(() => {
    // Buscar próximo día con estado training en los siguientes 7 días (incluyendo hoy si aplica)
    const trainingIndex = orderedSlides.findIndex(slide => slide.state === 'training')
    if (trainingIndex === -1) return null
    const daysAhead = trainingIndex
    return {
      daysAhead,
      label: orderedSlides[trainingIndex].title
    }
  }, [orderedSlides])

  const selectSlide = (absoluteIndex) => {
    if (!orderedSlides.length) return
    const len = orderedSlides.length
    const clamped = Math.min(Math.max(absoluteIndex, 0), len - 1)
    setStackIndex(clamped)
  }

  const handlePrev = () => {
    setStackIndex(prev => Math.max(prev - 1, 0))
  }

  // Estado de sesión del día (completada / pendiente)
  useEffect(() => {
    let isMounted = true
    const loadTodayStatus = async () => {
      // Solo aplica cuando hay usuario, rutina activa y día de entrenamiento
      if (!userProfile?.id || !userRoutine?.id || todaySlide?.state !== 'training' || !todaySlide?.diaId) {
        if (!isMounted) return
        setTodaySessionState({
          status: 'idle',
          completed: false,
          hasSession: false
        })
        return
      }

      setTodaySessionState(prev => ({
        ...prev,
        status: 'checking'
      }))

      const buildLocalDateKey = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const fetchSessionByDate = async (dateKey) => {
        // Intento principal: fecha + routine_day_id (más reciente primero)
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('id, completada')
          .eq('user_id', userProfile.id)
          .eq('routine_id', userRoutine.id)
          .eq('routine_day_id', todaySlide.diaId)
          .eq('fecha', dateKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error && error?.code !== 'PGRST116') throw error // PGRST116 = no rows
        if (data) return data

        // Fallback: rutina + fecha (por si cambió el routine_day_id)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('workout_sessions')
          .select('id, completada')
          .eq('user_id', userProfile.id)
          .eq('routine_id', userRoutine.id)
          .eq('fecha', dateKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (fallbackError && fallbackError?.code !== 'PGRST116') throw fallbackError
        return fallbackData || null
      }

      try {
        // Fecha en UTC (uso actual) y fecha local como respaldo
        const dateKeyUtc = getTodayInfo().fecha
        const dateKeyLocal = buildLocalDateKey()

        let sessionData = await fetchSessionByDate(dateKeyUtc)
        if (!sessionData && dateKeyLocal !== dateKeyUtc) {
          sessionData = await fetchSessionByDate(dateKeyLocal)
        }

        if (!isMounted) return

        setTodaySessionState({
          status: 'ready',
          completed: !!sessionData?.completada,
          hasSession: !!sessionData
        })
      } catch (err) {
        if (!isMounted) return
        console.error('CalendarioRutina: excepción al leer sesión del día', err)
        setTodaySessionState({
          status: 'error',
          completed: false,
          hasSession: false
        })
      }
    }

    loadTodayStatus()

    return () => {
      isMounted = false
    }
  }, [userProfile?.id, userRoutine?.id, todaySlide?.diaId, todaySlide?.state])

  const isTodayTrainingDay = todaySlide?.state === 'training'
  const isTodayCompleted = isTodayTrainingDay && todaySessionState.completed
  const isCheckingToday = todaySessionState.status === 'checking'

  const ctaText = isTodayCompleted
    ? 'Sesión de entrenamiento terminada'
    : (isCheckingToday ? 'Comprobando estado...' : 'Entrenar ahora')

  const ctaIcon = isTodayCompleted ? '✓' : '→'
  const ctaAria = isTodayCompleted ? 'Sesión de entrenamiento terminada' : 'Ir al entrenamiento'

  const nextTrainingMessage = useMemo(() => {
    if (!nextTrainingInfo) {
      return 'No tenés entrenamientos programados en tu rutina.'
    }
    if (nextTrainingInfo.daysAhead === 0) {
      return `Entrenamiento de hoy: ${nextTrainingInfo.label}`
    }
    if (nextTrainingInfo.daysAhead === 1) {
      return `Próximo entrenamiento: ${nextTrainingInfo.label} (mañana)`
    }
    return `Próximo entrenamiento: ${nextTrainingInfo.label} en ${nextTrainingInfo.daysAhead} días`
  }, [nextTrainingInfo])

  // Estados de error o vacíos
  if (loading) {
    return (
      <div className="calendario-rutina passive entrenamiento-loading">
        <div className="entrenamiento-loading__card">
          <div className="entrenamiento-loading__spinner" aria-hidden="true" />
          <p className="entrenamiento-loading__text">Cargando tu rutina...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calendario-rutina passive">
        <div className="state-message">{error}</div>
        <button className="cta" onClick={() => routineStore.loadUserRoutine()}>
          Reintentar
        </button>
      </div>
    )
  }

  if (!userRoutine) {
    return (
      <div className="calendario-rutina passive">
        <div className="state-message">No tenés una rutina activa.</div>
        <div className="cta-row">
          <button className="cta" onClick={() => navigate('/rutinas')}>
            Ir a gestión de rutinas
          </button>
          <button className="cta secondary" onClick={() => navigate('/rutina-personalizada')}>
            Crear rutina
          </button>
        </div>
      </div>
    )
  }

  if (!routineDays.length) {
    return (
      <div className="calendario-rutina passive">
        <div className="state-message">Tu rutina no tiene días configurados.</div>
        <div className="cta-row">
          <button className="cta" onClick={() => navigate('/rutina-personalizada')}>
            Agregar días y ejercicios
          </button>
          <button className="cta secondary" onClick={() => navigate('/rutinas')}>
            Volver a gestión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="calendario-rutina passive" aria-label="Vista de rutina">
      {/* Header de rutina (pasivo) */}
      <RutinaHeader
        nombre={userRoutine.nombre}
        tipo={userRoutine.tipo_rutina}
        dayState={todaySlide?.state}
        diasSemana={trainingDaysCount}
        onGestionRutinas={() => navigate('/rutinas')}
        onEditar={() => navigate('/rutina-personalizada')}
        onEjercicios={() => navigate('/ejercicios-personalizados')}
      />

      {/* Carrusel apilado de días + notas en split */}
      <div className="day-region">
        <div className="day-stack" aria-label="Días de la rutina">
          {visibleSlides.map(entry => {
            const { slide, absoluteIndex, role: roleKey } = entry
            return (
              <div
                key={`${slide.label}-${roleKey}`}
                className={`day-card day-card--${roleKey} day-card--${slide.state}`}
                onClick={() => selectSlide(absoluteIndex)}
              >
                <div className="day-slide__header">
                {roleKey === 'current' && stackIndex > 0 && (
                  <button
                    type="button"
                    className="day-card__back"
                    onClick={(e) => { e.stopPropagation(); handlePrev() }}
                    aria-label="Volver al día anterior"
                  >
                    ←
                  </button>
                )}
                  <div>
                    <p className="day-slide__label">{slide.label}</p>
                    <h2 className="day-slide__title">{slide.title}</h2>
                  </div>
                  <span className={`day-chip day-chip--${slide.state}`}>
                    {slide.state === 'training' ? 'Entreno' : slide.state === 'rest' ? 'Descanso' : 'Vacío'}
                  </span>
                </div>
                <div className="day-card__content">
                  {slide.state === 'training' && (
                    <div className="exercise-list passive-list compact" role="list">
                      {slide.ejercicios.map((ej) => (
                        <div key={ej.id || ej.nombre} className="exercise-item-passive compact" role="listitem">
                          <div className="exercise-name-row">
                            <span className="exercise-name">{ej.nombre}</span>
                            <button type="button" className="info-pill" aria-label="Info ejercicio" disabled>
                              Info
                            </button>
                          </div>
                          <div className="exercise-meta">
                            <span>{ej.grupo_muscular || '—'}</span>
                            <span>•</span>
                            <span>
                              {ej.series
                                ? `${ej.series}x${ej.repeticiones_min || ''}-${ej.repeticiones_max || ''}`
                                : 'Sin reps'}
                            </span>
                            {ej.peso_sugerido !== undefined && ej.peso_sugerido !== null && (
                              <>
                                <span>•</span>
                                <span>{`${ej.peso_sugerido} kg objetivo`}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {slide.state === 'rest' && (
                  <div className="state-message inline">
                    Hoy no tenés nada programado. Aprovechá para descansar y recuperar energía.
                  </div>
                )}

                  {slide.state === 'empty' && (
                    <div className="state-message inline">Sin ejercicios configurados para este día.</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <NotasRutinaPanel
          dayId={currentSlide?.diaId}
          dayLabel={currentSlide?.title}
        />
      </div>

      {/* CTA único a Entrenamiento */}
      <div className="cta-section">
        {isTodayTrainingDay ? (
          <button
            className={`cta primary cta-entrenar ${isTodayCompleted ? 'is-completed' : ''}`}
            onClick={handleGoToTraining}
            aria-label={ctaAria}
            disabled={isTodayCompleted}
          >
            <span className="cta-entrenar__icon" aria-hidden="true">
              {ctaIcon}
            </span>
            <span className="cta-entrenar__text">
              {ctaText}
            </span>
          </button>
        ) : (
          <div className="state-message">
            {nextTrainingMessage}
          </div>
        )}
      </div>

    </div>
  )
}

export default CalendarioRutina