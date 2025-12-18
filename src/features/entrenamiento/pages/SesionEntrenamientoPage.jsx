import React, { useMemo, useState } from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import { Link } from 'react-router-dom'

import useTrainingSession from '../hooks/useTrainingSession'
import useExerciseTracking from '../hooks/useExerciseTracking'
import useSessionStats from '../hooks/useSessionStats'

import SessionHeader from '../components/SessionHeader'
import SessionProgress from '../components/SessionProgress'
import ExerciseList from '../components/ExerciseList'
import FinishSessionModal from '../components/FinishSessionModal'
import LockedTrainingState from '../components/LockedTrainingState'
import trainingSessionService from '../services/trainingSession.service'
import { triggerProgressRefresh, forceProgressRefresh } from '@/utils/cacheUtils'
import { useAuth } from '@/contexts/AuthContext'

import '../styles/entrenamiento.css'

/**
 * Page orquestadora de la sesión diaria.
 * Solo conecta hooks y componentes existentes, sin lógica nueva.
 */
const SesionEntrenamientoPage = () => {
  const { loading, error, sessionId, sessionStatus, setSessionStatus, routineName, dayName, exercises, status, mode } =
    useTrainingSession()
  const { userProfile } = useAuth()

  const {
    exerciseStates,
    saveSeries,
    reloadLogs,
    isLoading: logsLoading,
    saving,
    error: logsError
  } = useExerciseTracking({ sessionId, exercises })

  const { stats, progressPercent, canFinish, recommendedExercise } = useSessionStats({
    exercises,
    exerciseStates
  })

  const [showFinishModal, setShowFinishModal] = useState(false)
  const [finishing, setFinishing] = useState(false)

  const isCompleted = sessionStatus === 'completed'
  const isReadOnly = mode === 'read-only'
  const headerError = error || logsError

  const handleSaveSeries = async (exerciseId, { reps, peso, rpe }) => {
    if (isCompleted || isReadOnly) return
    await saveSeries({ exerciseId, reps, peso, rpe })
  }

  const handleConfirmFinish = async (notes, rating) => {
    try {
      setFinishing(true)
      await trainingSessionService.finishSession(sessionId, notes, rating)
      setSessionStatus('completed')
      await reloadLogs()
      // Limpiar caché y notificar a vistas dependientes (calendario, progreso, home)
      await forceProgressRefresh(userProfile?.id, 'finish-session')
      setShowFinishModal(false)
    } catch (err) {
      throw err
    } finally {
      setFinishing(false)
    }
  }

  const content = useMemo(() => {
    if (status === 'loading' || logsLoading) {
      return (
        <div className="entrenamiento-loading" role="status" aria-live="polite">
          <div className="entrenamiento-loading__card">
            <span className="entrenamiento-loading__spinner" aria-hidden="true" />
            <p className="entrenamiento-loading__text">Cargando sesión...</p>
          </div>
        </div>
      )
    }

    if (status === 'error' || headerError) {
      return (
        <div className="entrenamiento-shell error">
          <h3>Error</h3>
          <p>{headerError || 'No se pudo cargar la sesión'}</p>
        </div>
      )
    }

    return (
      <div className="entrenamiento-shell">
        {isReadOnly && (
          <LockedTrainingState
            title="Hoy no tenés entrenamiento asignado"
            description="Podés revisar tu planificación en modo lectura. Editá tu rutina si querés ajustar el día."
            ctaHref="/rutina"
          />
        )}
        <SessionHeader
          routineName={routineName}
          dayName={dayName || 'Hoy'}
          progressPercent={progressPercent}
          onFinish={() => {
            if (!isReadOnly) setShowFinishModal(true)
          }}
          canFinish={!isReadOnly && canFinish}
          isCompleting={finishing}
          isCompleted={isCompleted}
        />

        <SessionProgress stats={stats} />

        <ExerciseList
          exercises={exercises}
          exerciseStates={exerciseStates}
          onSaveSeries={handleSaveSeries}
          sessionCompleted={isCompleted || isReadOnly}
          recommendedId={recommendedExercise?.id}
        />

        {!isReadOnly && (
          <FinishSessionModal
            isOpen={showFinishModal}
            onClose={() => setShowFinishModal(false)}
            onConfirm={handleConfirmFinish}
            canFinish={canFinish}
          />
        )}
      </div>
    )
  }, [
    status,
    logsLoading,
    headerError,
    sessionId,
    routineName,
    dayName,
    progressPercent,
    canFinish,
    finishing,
    isCompleted,
    isReadOnly,
    stats,
    exercises,
    exerciseStates,
    recommendedExercise,
    handleSaveSeries
  ])

  return (
    <AuthOnly>
      {content || <div className="entrenamiento-shell" />}
    </AuthOnly>
  )
}

export default SesionEntrenamientoPage

