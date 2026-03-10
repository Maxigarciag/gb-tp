import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { workoutRoutines } from '@/lib/supabase'
import { useRoutineStore } from '@/stores/routineStore'
import ConfirmDialogOptimized from '@/features/common/components/ConfirmDialogOptimized'
import {
  ArrowLeft,
  Trash2,
  Dumbbell,
  Plus,
  Pencil,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import '@/styles/components/rutinas/RoutinesManager.css'

function RoutinesManager() {
  const [routines,    setRoutines]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState({})
  const [loadingId,   setLoadingId]   = useState(null)   // id de la rutina procesándose
  const [errorMsg,    setErrorMsg]    = useState(null)
  const [confirmData, setConfirmData] = useState(null)   // { type, routine? }

  const navigate = useNavigate()
  const { loadUserRoutine } = useRoutineStore()

  const load = async () => {
    setLoading(true)
    setErrorMsg(null)
    const { data, error } = await workoutRoutines.getUserRoutines()
    if (error) setErrorMsg('No se pudieron cargar las rutinas.')
    else setRoutines(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ─── Activar ──────────────────────────────────────────────

  const activate = async (id) => {
    setLoadingId(id)
    setErrorMsg(null)
    const { error } = await workoutRoutines.setActive(id)
    if (error) {
      setErrorMsg('No se pudo activar la rutina. Intentalo de nuevo.')
      setLoadingId(null)
      return
    }
    await loadUserRoutine()
    navigate('/rutina')
  }

  // ─── Eliminar individual ──────────────────────────────────

  const remove = async (routine) => {
    if (routine?.es_activa) {
      setErrorMsg('No podés eliminar la rutina activa. Activá otra primero.')
      return
    }
    setConfirmData({ type: 'single', routine })
  }

  const confirmRemove = async () => {
    const routine = confirmData?.routine
    if (!routine) return
    setConfirmData(null)
    setLoadingId(routine.id)
    setErrorMsg(null)
    const { error } = await workoutRoutines.deleteDeep(routine.id)
    if (error) setErrorMsg('No se pudo eliminar la rutina.')
    else await load()
    setLoadingId(null)
  }

  // ─── Eliminar masivo ──────────────────────────────────────

  const requestRemoveMany = () => {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (ids.length === 0) return
    const activeIds = routines.filter(r => r.es_activa).map(r => r.id)
    const toDelete = ids.filter(id => !activeIds.includes(id))
    if (toDelete.length === 0) {
      setErrorMsg('No podés eliminar la rutina activa. Deselectala primero.')
      return
    }
    setConfirmData({ type: 'many', ids: toDelete })
  }

  const confirmRemoveMany = async () => {
    const ids = confirmData?.ids
    if (!ids?.length) return
    setConfirmData(null)
    setLoadingId('many')
    setErrorMsg(null)
    const { error } = await workoutRoutines.deleteManyDeep(ids)
    if (error) setErrorMsg('No se pudieron eliminar algunas rutinas.')
    else {
      setSelected({})
      await load()
    }
    setLoadingId(null)
  }

  // ─── Contadores ───────────────────────────────────────────

  const selectedCount = Object.values(selected).filter(Boolean).length
  const isBusy = loadingId !== null

  // ─── Render: estado de carga ──────────────────────────────

  if (loading) {
    return (
      <div className="routines-manager">
        <div className="routines-container">
          <div className="routines-state">
            <div className="routines-state-spinner" />
            <p>Cargando tus rutinas…</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render principal ─────────────────────────────────────

  return (
    <div className="routines-manager">
      <motion.div
        className="routines-container"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >

        {/* ══ HEADER ══ */}
        <div className="routines-header-card">
          <div className="routines-header-top">

            <button
              className="routines-back-btn"
              onClick={() => navigate('/rutina')}
              aria-label="Volver a Mi Rutina"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="routines-header-info">
              <h1 className="routines-header-title">Mis Rutinas</h1>
              <p className="routines-header-subtitle">
                {routines.length > 0
                  ? `${routines.length} rutina${routines.length !== 1 ? 's' : ''} guardada${routines.length !== 1 ? 's' : ''}`
                  : 'Crea tu primera rutina personalizada'}
              </p>
            </div>

            <div className="routines-header-actions">
              {/* Eliminar seleccionadas */}
              <button
                className={`rm-btn-action ${selectedCount > 0 ? 'rm-btn-action--danger-active' : ''}`}
                onClick={requestRemoveMany}
                disabled={selectedCount === 0 || isBusy}
                title="Eliminar seleccionadas"
              >
                {loadingId === 'many'
                  ? <RefreshCw size={13} className="rm-spinner-icon" />
                  : <Trash2 size={13} />
                }
                <span>Eliminar</span>
                {selectedCount > 0 && (
                  <span className="rm-selected-badge">{selectedCount}</span>
                )}
              </button>

              {/* Mis ejercicios */}
              <button
                className="rm-btn-action"
                onClick={() => navigate('/ejercicios-personalizados')}
                title="Gestionar ejercicios personalizados"
              >
                <Dumbbell size={13} />
                <span>Ejercicios</span>
              </button>

              {/* Nueva rutina */}
              <button
                className="rm-btn-action rm-btn-action--primary"
                onClick={() => navigate('/rutina-personalizada')}
                title="Crear nueva rutina"
              >
                <Plus size={13} />
                <span>Nueva rutina</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══ ERROR ══ */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              className="routines-error-msg"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={16} />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ ESTADO VACÍO ══ */}
        {routines.length === 0 ? (
          <div className="routines-state">
            <Dumbbell size={40} strokeWidth={1.5} style={{ opacity: 0.35 }} />
            <h3>Aún no tenés rutinas guardadas</h3>
            <p>Creá tu primera rutina personalizada para comenzar tu entrenamiento</p>
            <button
              className="routines-state-cta"
              onClick={() => navigate('/rutina-personalizada')}
            >
              <Plus size={16} />
              Crear mi primera rutina
            </button>
          </div>
        ) : (

          /* ══ GRID DE RUTINAS ══ */
          <div className="routines-grid">
            {routines.map((r, i) => {
              const isCardBusy = loadingId === r.id
              return (
                <motion.div
                  key={r.id}
                  className={`routine-card ${r.es_activa ? 'routine-card--active' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  {/* Header de la tarjeta */}
                  <div className="routine-card__header">
                    <input
                      type="checkbox"
                      className="routine-card__checkbox"
                      checked={!!selected[r.id]}
                      onChange={e => setSelected(s => ({ ...s, [r.id]: e.target.checked }))}
                      aria-label={`Seleccionar rutina ${r.nombre}`}
                      disabled={isBusy}
                    />
                    <div className="routine-card__name-row">
                      <span className="routine-card__name">{r.nombre}</span>
                      {r.es_activa && (
                        <span className="routine-active-badge">Activa</span>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="routine-card__meta">
                    <span className="routine-card__type">{r.tipo_rutina || 'Personalizada'}</span>
                    <span className="routine-card__sep">•</span>
                    <span className="routine-card__days">{r.dias_por_semana} días / semana</span>
                  </div>

                  {/* Acciones */}
                  <div className="routine-card__actions">
                    {!r.es_activa && (
                      <button
                        className="routine-card__btn routine-card__btn--primary"
                        onClick={() => activate(r.id)}
                        disabled={isCardBusy || isBusy}
                      >
                        {isCardBusy
                          ? <span className="routine-card__btn-spinner" />
                          : <Zap size={13} />
                        }
                        {isCardBusy ? 'Activando…' : 'Activar'}
                      </button>
                    )}
                    <button
                      className="routine-card__btn"
                      onClick={() => navigate(`/rutina-personalizada?id=${r.id}`)}
                      disabled={isCardBusy || isBusy}
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    <button
                      className="routine-card__btn routine-card__btn--danger"
                      onClick={() => remove(r)}
                      disabled={isCardBusy || isBusy}
                      title={r.es_activa ? 'No podés eliminar la rutina activa' : 'Eliminar rutina'}
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

      </motion.div>

      {/* ══ DIALOGO DE CONFIRMACIÓN ══ */}
      <ConfirmDialogOptimized
        isOpen={!!confirmData}
        type="danger"
        title={confirmData?.type === 'many'
          ? `Eliminar ${confirmData?.ids?.length} rutina${confirmData?.ids?.length !== 1 ? 's' : ''}`
          : `Eliminar "${confirmData?.routine?.nombre}"`
        }
        message={confirmData?.type === 'many'
          ? `Vas a eliminar ${confirmData?.ids?.length} rutina${confirmData?.ids?.length !== 1 ? 's' : ''} permanentemente. Esta acción no se puede deshacer.`
          : 'Vas a eliminar esta rutina permanentemente. Esta acción no se puede deshacer.'
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmData?.type === 'many' ? confirmRemoveMany : confirmRemove}
        onClose={() => setConfirmData(null)}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  )
}

export default RoutinesManager
