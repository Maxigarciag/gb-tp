/**
 * Página de gestión de rutinas del usuario
 * Permite crear, editar, activar y eliminar rutinas
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutRoutines } from '@/lib/supabase'
import { useRoutineStore } from '@/stores/routineStore'
import { useUIStore } from '@/stores/uiStore'
import '@/styles/components/rutinas/RoutinesManager.css'

function RoutinesManager() {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const navigate = useNavigate()
  const { loadUserRoutine } = useRoutineStore()

  const load = async () => {
    setLoading(true)
    const { data, error } = await workoutRoutines.getUserRoutines()
    if (!error) setRoutines(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const activate = async (id) => {
    const { error } = await workoutRoutines.setActive(id)
    if (error) {
      console.error('No se pudo activar la rutina', error)
      return
    }
    await loadUserRoutine()
    navigate('/rutina')
  }

  const remove = async (routine, deep = true) => {
    if (routine?.es_activa) {
      console.warn('No podés eliminar la rutina activa. Activá otra primero.')
      return
    }
    const { error } = deep ? await workoutRoutines.deleteDeep(routine.id) : await workoutRoutines.delete(routine.id)
    if (error) {
      console.error('No se pudo eliminar la rutina', error)
      return
    }
    load()
  }

  const removeMany = async () => {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (ids.length === 0) return
    // No permitir borrar la activa
    const activeIds = (routines || []).filter(r => r.es_activa).map(r => r.id)
    const toDelete = ids.filter(id => !activeIds.includes(id))
    if (toDelete.length === 0) {
      console.warn('No podés eliminar la rutina activa. Activá otra primero.')
      return
    }
    const { error } = await workoutRoutines.deleteManyDeep(toDelete)
    if (error) {
      console.error('No se pudieron eliminar algunas rutinas', error)
      return
    }
    setSelected({})
    load()
  }

  // Si está cargando, mostrar contenido básico sin loading
  if (loading) {
    return (
      <div className="routines-manager">
        <div className="routines-hero-header">
          <button
            className="back-button-floating"
            onClick={() => navigate(-1)}
            aria-label="Volver atrás"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="routines-hero-content">
            <h1 className="routines-hero-title">Mis Rutinas</h1>
            <p className="routines-hero-subtitle">Preparando tu lista de rutinas...</p>
          </div>
        </div>

        <div className="routines-actions-container">
          <button className="action-item" disabled>
            <div className="action-icon">🗑️</div>
            <div className="action-content">
              <span className="action-title">Eliminar seleccionadas</span>
              <span className="action-count">0 seleccionadas</span>
            </div>
          </button>

          <div className="action-divider"></div>

          <button
            className="action-item"
            onClick={() => navigate('/ejercicios-personalizados')}
          >
            <div className="action-icon">💪</div>
            <div className="action-content">
              <span className="action-title">Mis ejercicios</span>
              <span className="action-desc">Gestiona ejercicios</span>
            </div>
          </button>

          <div className="action-divider"></div>

          <button
            className="action-item primary"
            onClick={() => navigate('/rutina-personalizada')}
          >
            <div className="action-icon">➕</div>
            <div className="action-content">
              <span className="action-title">Crear nueva rutina</span>
              <span className="action-desc">Diseña tu rutina</span>
            </div>
          </button>
        </div>

        <div className="empty-routines">
          <div className="emoji">⏳</div>
          <h3>Cargando rutinas...</h3>
          <p>Preparando tu lista de rutinas de entrenamiento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="routines-manager">
      {/* Header con gradiente similar a RutinaGlobalOptimized */}
      <div className="routines-hero-header">
        <button
          className="back-button-floating"
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="routines-hero-content">
          <h1 className="routines-hero-title">Mis Rutinas</h1>
          <p className="routines-hero-subtitle">Gestiona todas tus rutinas de entrenamiento, crea nuevas o edita las existentes</p>
        </div>
      </div>

      {/* Bloque unificado de acciones */}
      <div className="routines-actions-container">
        <button
          className="action-item"
          onClick={removeMany}
          disabled={Object.values(selected).filter(Boolean).length === 0}
        >
          <div className="action-icon">🗑️</div>
          <div className="action-content">
            <span className="action-title">Eliminar seleccionadas</span>
            <span className="action-count">{Object.values(selected).filter(Boolean).length} seleccionadas</span>
          </div>
        </button>

        <div className="action-divider"></div>

        <button
          className="action-item"
          onClick={() => navigate('/ejercicios-personalizados')}
        >
          <div className="action-icon">💪</div>
          <div className="action-content">
            <span className="action-title">Mis ejercicios</span>
            <span className="action-desc">Gestiona ejercicios</span>
          </div>
        </button>

        <div className="action-divider"></div>

        <button
          className="action-item primary"
          onClick={() => navigate('/rutina-personalizada')}
        >
          <div className="action-icon">➕</div>
          <div className="action-content">
            <span className="action-title">Crear nueva rutina</span>
            <span className="action-desc">Diseña tu rutina</span>
          </div>
        </button>
      </div>

      {(!routines || routines.length === 0) ? (
        <div className="empty-routines">
          <div className="emoji">🏋️‍♂️</div>
          <h3>Aún no tienes rutinas guardadas</h3>
          <p>Crea tu primera rutina personalizada para comenzar tu entrenamiento</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/rutina-personalizada')}
          >
            Crear mi primera rutina
          </button>
        </div>
      ) : (
        <div className="routines-grid">
          {routines.map(r => (
            <div key={r.id} className="routine-card">
              {/* Indicador de rutina activa */}
              {r.es_activa && (
                <div className="routine-active-badge">
                  Activa
                </div>
              )}

              <div className="routine-card-header">
                <div className="routine-title">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={e => setSelected(s => ({ ...s, [r.id]: e.target.checked }))}
                    aria-label={`Seleccionar rutina ${r.nombre}`}
                  />
                  <div className="routine-name">{r.nombre}</div>
                </div>
                <div className="routine-meta">
                  <span className="routine-type">{r.tipo_rutina}</span>
                  <span>•</span>
                  <span>{r.dias_por_semana} días por semana</span>
                </div>
              </div>

              <div className="card-actions">
                {!r.es_activa && (
                  <button
                    className="btn-primary"
                    onClick={() => activate(r.id)}
                  >
                    Activar
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/rutina-personalizada?id=${r.id}`)}
                >
                  Editar
                </button>
                <button
                  className="btn-danger"
                  onClick={() => remove(r)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoutinesManager


