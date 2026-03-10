import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRoutineStore, useExerciseStore, useUIStore } from '@/stores'
import { workoutRoutines, supabase } from '@/lib/supabase'
import ResumenStats from '@/features/home/components/ResumenStats.jsx'
import CalendarioSemanal from './CalendarioSemanal.jsx'
import EjercicioGrupo from './EjercicioGrupo.jsx'
import InfoEjercicioCardOptimized from './InfoEjercicioCardOptimized.jsx'
import NotasRutinaPanel from './notas/NotasRutinaPanel.jsx'
import ErrorBoundaryOptimized from '@/features/common/components/ErrorBoundaryOptimized.jsx'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEjerciciosAgrupados } from '@/hooks/useEjerciciosAgrupados.js'
import { useRutinaCalendario } from '@/hooks/useRutinaCalendario.js'
import { seedExercises } from '@/data/seedExercises.js'
import { ChevronDown, Play, Coffee, RefreshCw, CheckCircle, Pencil, Dumbbell, Settings } from 'lucide-react'
import '@/styles/components/rutinas/CalendarioRutina.css'

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// ─── Helpers de fecha ────────────────────────────────────────────────────────

const getTodayDayIndex = () => {
  const jsDay = new Date().getDay()  // 0=Dom, 1=Lun … 6=Sáb
  return jsDay === 0 ? 6 : jsDay - 1  // → 0=Lun … 6=Dom
}

const getLocalDateKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────────────────────────

function RutinaGlobalOptimized() {
  const { userProfile }                                     = useAuth()
  const { expandGroup, collapseAllGroups, expandedGroups }  = useUIStore()
  const routineStore                                        = useRoutineStore()
  const exerciseStore                                       = useExerciseStore()
  const navigate                                            = useNavigate()
  const location                                            = useLocation()

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [userRoutines,          setUserRoutines]          = useState([])
  const [showChooseBanner,      setShowChooseBanner]      = useState(false)
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null)
  const [isCreatingRoutine,     setIsCreatingRoutine]     = useState(false)
  const [reloadAttempted,       setReloadAttempted]       = useState(false)
  const [statsExpanded,         setStatsExpanded]         = useState(false)
  // Evita el flash de "sin rutina" antes de que se complete la primera carga
  const [hasAttemptedLoad,      setHasAttemptedLoad]      = useState(false)

  // Estado de la sesión de HOY (para el CTA)
  const [todaySession, setTodaySession] = useState({
    status:    'idle',   // idle | checking | ready | error
    completed: false,
    hasSession: false,
  })

  const selectedDayIndex = routineStore.selectedDayIndex
  const isProcessingDay  = useRef(false)

  // Calendario semanal (Lun–Dom semana actual con fechas reales)
  const { weekDays, loading: calLoading } = useRutinaCalendario()

  // Índice del día de hoy en nuestro esquema (0=Lun, 6=Dom)
  const todayDayIndex = useMemo(() => getTodayDayIndex(), [])

  // Parámetro de día en URL
  const urlParams  = new URLSearchParams(location.search)
  const dayFromUrl = urlParams.get('day')

  // ─── Día de rutina de HOY ─────────────────────────────────────────────────

  const todayRoutineDay = useMemo(() => {
    if (!routineStore.userRoutine?.routine_days) return null
    const todayName = DIAS_SEMANA[todayDayIndex]
    return routineStore.userRoutine.routine_days.find(d => d.dia_semana === todayName) || null
  }, [routineStore.userRoutine, todayDayIndex])

  // ─── Chequeo de sesión de HOY ─────────────────────────────────────────────

  useEffect(() => {
    if (
      !userProfile?.id ||
      !routineStore.userRoutine?.id ||
      !todayRoutineDay?.id ||
      todayRoutineDay?.es_descanso
    ) {
      setTodaySession({ status: 'idle', completed: false, hasSession: false })
      return
    }

    let mounted = true
    setTodaySession(prev => ({ ...prev, status: 'checking' }))

    const checkTodaySession = async () => {
      try {
        const dateKey = getLocalDateKey()
        const { data } = await supabase
          .from('workout_sessions')
          .select('id, completada')
          .eq('user_id', userProfile.id)
          .eq('routine_day_id', todayRoutineDay.id)
          .eq('fecha', dateKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (mounted) {
          setTodaySession({
            status:    'ready',
            completed: !!data?.completada,
            hasSession: !!data,
          })
        }
      } catch {
        if (mounted) setTodaySession({ status: 'error', completed: false, hasSession: false })
      }
    }

    checkTodaySession()
    return () => { mounted = false }
  }, [userProfile?.id, routineStore.userRoutine?.id, todayRoutineDay?.id])

  // Refrescar estado de sesión al volver de /entrenamiento
  useEffect(() => {
    const handler = () => {
      setTodaySession({ status: 'idle', completed: false, hasSession: false })
    }
    window.addEventListener('progreso-page-refresh', handler)
    return () => window.removeEventListener('progreso-page-refresh', handler)
  }, [])

  // ─── Efectos de inicialización ────────────────────────────────────────────

  useEffect(() => {
    if (!userProfile && !reloadAttempted) {
      setReloadAttempted(true)
      window.dispatchEvent(new CustomEvent('profileReload'))
    }
  }, [userProfile, reloadAttempted])

  useEffect(() => { seedExercises() }, [])

  useEffect(() => {
    if (userProfile?.id) {
      setHasAttemptedLoad(true)
      routineStore.loadUserRoutine()
      exerciseStore.loadAllExercises();
      (async () => {
        const { data } = await workoutRoutines.getUserRoutines()
        setUserRoutines(data || [])
        setShowChooseBanner((data || []).length > 1)
      })()
    }
  }, [userProfile?.id])

  // ─── Auto-selección de día ────────────────────────────────────────────────

  useEffect(() => {
    const days = routineStore.userRoutine?.routine_days
    if (!days || days.length === 0) return
    if (isProcessingDay.current) return

    isProcessingDay.current = true

    // 1. Parámetro URL
    if (dayFromUrl) {
      const idx = DIAS_SEMANA.indexOf(dayFromUrl)
      if (idx !== -1 && days.some(d => d.dia_semana === dayFromUrl)) {
        routineStore.setSelectedDay(idx)
        window.history.replaceState({}, '', window.location.pathname)
      }
      setTimeout(() => { isProcessingDay.current = false }, 100)
      return
    }

    // Respetar selección válida existente
    if (selectedDayIndex !== null) {
      const curDay = DIAS_SEMANA[selectedDayIndex]
      if (days.some(d => d.dia_semana === curDay)) {
        setTimeout(() => { isProcessingDay.current = false }, 100)
        return
      }
    }

    // 2. Día de hoy (si es día de entreno)
    const todayName = DIAS_SEMANA[todayDayIndex]
    const todayRDay = days.find(d => d.dia_semana === todayName && !d.es_descanso)
    if (todayRDay) {
      routineStore.setSelectedDay(todayDayIndex)
      setTimeout(() => { isProcessingDay.current = false }, 100)
      return
    }

    // 3. Primer día de entreno disponible
    const firstTraining = days.find(d => d.routine_exercises?.length > 0) || days[0]
    if (firstTraining) {
      const idx = DIAS_SEMANA.indexOf(firstTraining.dia_semana)
      if (idx !== -1) routineStore.setSelectedDay(idx)
    }

    setTimeout(() => { isProcessingDay.current = false }, 100)
  }, [routineStore.userRoutine?.routine_days?.length, dayFromUrl])

  // ─── Colapsar grupos al cambiar de día ────────────────────────────────────

  useEffect(() => {
    if (selectedDayIndex !== null) collapseAllGroups()
  }, [selectedDayIndex, collapseAllGroups])

  // ─── Ejercicios del día ───────────────────────────────────────────────────

  const currentDayExercises = useMemo(() => {
    if (selectedDayIndex === null) return []
    return routineStore.getCurrentDayExercises() || []
  }, [selectedDayIndex, routineStore.exercisesByDay, routineStore.userRoutine])

  const ejerciciosAgrupados = useEjerciciosAgrupados(currentDayExercises)

  // Auto-expandir si ≤ 3 grupos
  useEffect(() => {
    const grupos = Object.keys(ejerciciosAgrupados)
    if (grupos.length > 0 && grupos.length <= 3) {
      const t = setTimeout(() => grupos.forEach(g => expandGroup(g)), 80)
      return () => clearTimeout(t)
    }
  }, [ejerciciosAgrupados])

  // ─── Día seleccionado ─────────────────────────────────────────────────────

  const selectedDay = useMemo(() => {
    if (selectedDayIndex === null) return null
    return routineStore.getSelectedDay()
  }, [selectedDayIndex])

  // ¿El día seleccionado es hoy?
  const isSelectedDayToday = selectedDayIndex === todayDayIndex

  // ─── Datos para ResumenStats ──────────────────────────────────────────────

  const processedRoutine = useMemo(() => {
    const ur = routineStore.userRoutine
    if (!ur?.routine_days) return DIAS_SEMANA.map((dia, i) => [dia, 'Descanso', true, i])
    return DIAS_SEMANA.map((dia, i) => {
      const rd = ur.routine_days.find(d => d.dia_semana === dia)
      return rd ? [dia, rd.nombre_dia, rd.es_descanso || false, i] : [dia, 'Descanso', true, i]
    })
  }, [routineStore.userRoutine])

  const diasEntrenamiento = useMemo(
    () => processedRoutine.filter(([, , esDescanso]) => !esDescanso),
    [processedRoutine]
  )

  // ─── Crear rutina desde perfil ────────────────────────────────────────────

  const createRoutineFromProfile = useCallback(async () => {
    if (!userProfile) return
    try {
      setIsCreatingRoutine(true)
      let tipoRutina = 'FULL BODY'
      if (userProfile.dias_semana === '4_dias') tipoRutina = 'UPPER LOWER'
      else if (userProfile.dias_semana === '6_dias') tipoRutina = 'PUSH PULL LEGS'
      const routineData = {
        user_id:         userProfile.id,
        nombre:          'Mi Rutina Personalizada',
        tipo_rutina:     tipoRutina,
        dias_por_semana: parseInt(userProfile.dias_semana.split('_')[0]),
        es_activa:       true,
      }
      const nr = await routineStore.createRoutine(routineData)
      if (nr) await routineStore.loadUserRoutine()
    } catch (err) {
      console.error('Error al crear rutina:', err)
    } finally {
      setIsCreatingRoutine(false)
    }
  }, [userProfile?.id, userProfile?.dias_semana])

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleEjercicioClick    = useCallback(e  => setEjercicioSeleccionado(e), [])
  const handleCloseEjercicioInfo = useCallback(() => setEjercicioSeleccionado(null), [])

  const handleExerciseChange = useCallback(async (oldEx, newEx) => {
    try {
      const ok = await routineStore.changeExercise(oldEx, newEx)
      if (ok && selectedDayIndex !== null) {
        setTimeout(() => routineStore.loadExercisesForDay(selectedDayIndex), 100)
      }
    } catch (err) {
      console.error('Error cambiando ejercicio:', err)
    }
  }, [routineStore, selectedDayIndex])

  const handleToggleGrupo = useCallback(grupoId => {
    useUIStore.getState().toggleGroup(grupoId)
  }, [])

  const handleDiaClick = useCallback(index => routineStore.setSelectedDay(index), [routineStore])

  // Navegar a entrenamiento (siempre con HOY como día objetivo)
  const handleGoToTraining = useCallback(() => {
    const routineId = routineStore.userRoutine?.id || ''
    const dayId     = todayRoutineDay?.id || ''
    const params    = routineId
      ? `?routineId=${routineId}${dayId ? `&dayId=${dayId}` : ''}`
      : ''
    navigate(`/entrenamiento${params}`)
  }, [routineStore.userRoutine?.id, todayRoutineDay?.id, navigate])

  // ─── Estados especiales ───────────────────────────────────────────────────

  if (isCreatingRoutine) {
    return (
      <div className="calendario-rutina">
        <div className="rutina-state-msg">
          <div className="rutina-state-spinner" />
          <h3>Creando tu rutina…</h3>
          <p>Estamos configurando tu plan basado en tu perfil</p>
        </div>
      </div>
    )
  }

  if (routineStore.error) {
    return (
      <div className="calendario-rutina">
        <div className="rutina-state-msg rutina-state-msg--error">
          <p>{routineStore.error}</p>
          <button className="btn-reintentar" onClick={() => routineStore.loadUserRoutine()}>
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!hasAttemptedLoad || routineStore.loading) {
    return (
      <div className="calendario-rutina">
        <div className="rutina-state-msg">
          <div className="rutina-state-spinner" />
          <p>Cargando tu rutina…</p>
        </div>
      </div>
    )
  }

  if (!routineStore.userRoutine) {
    return (
      <div className="calendario-rutina">
        <div className="rutina-state-msg">
          <h3>No tenés una rutina configurada</h3>
          <p>Creá una rutina personalizada basada en tu perfil o explorá las plantillas disponibles</p>
          <button className="btn-crear-rutina" onClick={createRoutineFromProfile} disabled={isCreatingRoutine}>
            {isCreatingRoutine ? 'Creando…' : 'Crear Rutina Personalizada'}
          </button>
          <button className="btn-explorar-rutinas" onClick={() => navigate('/rutinas')}>
            Ver plantillas
          </button>
        </div>
      </div>
    )
  }

  // ─── Render principal ─────────────────────────────────────────────────────

  const routine     = routineStore.userRoutine
  const isRestDay   = !!selectedDay?.es_descanso
  const hasExercises = currentDayExercises.length > 0

  // Estado del CTA de hoy
  const isTodayTraining    = todayRoutineDay && !todayRoutineDay.es_descanso
  const isTodayCompleted   = isTodayTraining && todaySession.completed
  const isCheckingToday    = todaySession.status === 'checking'

  return (
    <ErrorBoundaryOptimized>
      <div className="calendario-rutina">
        <motion.div
          className="rutina-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          layout={false}
        >

          {/* ══════ HEADER DE RUTINA ══════ */}
          <div className="rutina-header-card">
            <div className="rutina-header-top">

              <div className="rutina-header-info">
                <h2 className="rutina-header-name">{routine.nombre || 'Mi Rutina'}</h2>
                <span className="rutina-type-badge">{routine.tipo_rutina || 'Personalizada'}</span>
              </div>

              <div className="rutina-header-actions">
                <button
                  className="btn-accion-header"
                  onClick={() => navigate(`/rutina-personalizada${routine.id ? `?id=${routine.id}` : ''}`)}
                  title="Editar rutina"
                >
                  <Pencil size={13} />
                  <span>Editar</span>
                </button>
                {showChooseBanner && (
                  <button
                    className="btn-accion-header"
                    onClick={() => navigate('/rutinas')}
                    title="Cambiar rutina activa"
                  >
                    <RefreshCw size={13} />
                    <span>Cambiar</span>
                  </button>
                )}
                <button
                  className="btn-accion-header"
                  onClick={() => navigate('/ejercicios-personalizados')}
                  title="Mis ejercicios personalizados"
                >
                  <Dumbbell size={13} />
                  <span>Ejercicios</span>
                </button>
                <button
                  className={`btn-stats-toggle ${statsExpanded ? 'is-open' : ''}`}
                  onClick={() => setStatsExpanded(v => !v)}
                  aria-expanded={statsExpanded}
                  title="Ver estadísticas"
                >
                  <Settings size={13} />
                  <ChevronDown size={13} className="stats-chevron" />
                </button>
              </div>
            </div>

            {/* Acordeón de estadísticas */}
            <AnimatePresence>
              {statsExpanded && (
                <motion.div
                  key="stats-accordion"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="stats-accordion"
                >
                  <div className="stats-accordion-inner">
                    <ResumenStats
                      key={`stats-${location.pathname}-${routine.id || 'no'}`}
                      formData={userProfile || {}}
                      diasEntrenamiento={diasEntrenamiento.length}
                      routineData={routine}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ══════ CALENDARIO SEMANAL ══════ */}
          <CalendarioSemanal
            weekDays={weekDays}
            selectedDayIndex={selectedDayIndex}
            onDiaClick={handleDiaClick}
            loading={calLoading}
          />

          {/* ══════ CTA DE ENTRENAMIENTO DE HOY ══════ */}
          {isTodayTraining && (
            <div className="cta-hoy-wrapper">
              {isTodayCompleted ? (
                <div className="cta-hoy cta-hoy--done">
                  <CheckCircle size={18} />
                  <span>Sesión de hoy completada</span>
                </div>
              ) : (
                <button
                  className="cta-hoy cta-hoy--active"
                  onClick={handleGoToTraining}
                  disabled={isCheckingToday}
                >
                  <Play size={16} />
                  <span>{isCheckingToday ? 'Verificando…' : `Entrenar ahora — ${todayRoutineDay?.nombre_dia || 'Hoy'}`}</span>
                </button>
              )}
            </div>
          )}

          {/* ══════ PANEL DEL DÍA SELECCIONADO ══════ */}
          {selectedDayIndex !== null && (
            <motion.div
              key={selectedDayIndex}
              className="dia-detail-layout"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >

              {/* Header del día */}
              <div className="dia-detail-header">
                <div className="dia-detail-title-group">
                  <h3 className="dia-detail-name">
                    {selectedDay?.nombre_dia || selectedDay?.dia_semana || DIAS_SEMANA[selectedDayIndex]}
                  </h3>
                  <span className="dia-detail-weekday">
                    {selectedDay?.dia_semana || DIAS_SEMANA[selectedDayIndex]}
                    {isSelectedDayToday && <span className="dia-hoy-tag">Hoy</span>}
                  </span>
                </div>

                {/* CTA en el header: solo si el día seleccionado es HOY y no está completado */}
                {isSelectedDayToday && !isRestDay && hasExercises && !isTodayCompleted && (
                  <button className="btn-comenzar" onClick={handleGoToTraining}>
                    <Play size={14} />
                    <span>Comenzar</span>
                  </button>
                )}
                {isSelectedDayToday && !isRestDay && hasExercises && isTodayCompleted && (
                  <span className="btn-completado">
                    <CheckCircle size={14} />
                    <span>Completado</span>
                  </span>
                )}
              </div>

              {/* ── Día de descanso ── */}
              {isRestDay ? (
                <div className="dia-descanso-msg">
                  <Coffee size={36} className="dia-descanso-icon" />
                  <p className="dia-descanso-title">Día de descanso</p>
                  <p className="dia-descanso-sub">Recuperate, dormí bien y preparate para el próximo entreno</p>
                </div>
              ) : (

                /* ── Dos columnas: ejercicios + notas ── */
                <div className="dia-detail-columns">
                  <div className="dia-col-ejercicios">
                    {!hasExercises ? (
                      <p className="no-exercises">No hay ejercicios asignados para este día.</p>
                    ) : (
                      <EjercicioGrupo
                        ejerciciosAgrupados={ejerciciosAgrupados}
                        gruposExpandidos={expandedGroups}
                        toggleGrupo={handleToggleGrupo}
                        setEjercicioSeleccionado={handleEjercicioClick}
                      />
                    )}
                  </div>

                  <div className="dia-col-notas">
                    {selectedDay?.id ? (
                      <NotasRutinaPanel
                        dayId={selectedDay.id}
                        dayLabel={selectedDay.nombre_dia || selectedDay.dia_semana}
                      />
                    ) : (
                      <div className="notas-unavailable">Notas no disponibles</div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* Info de ejercicio — fuera del grid, overlay full-screen */}
      {ejercicioSeleccionado && (
        <InfoEjercicioCardOptimized
          ejercicio={ejercicioSeleccionado}
          onClose={handleCloseEjercicioInfo}
          onExerciseChange={handleExerciseChange}
        />
      )}
    </ErrorBoundaryOptimized>
  )
}

export default RutinaGlobalOptimized
