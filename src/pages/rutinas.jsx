import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutRoutines } from '../lib/supabase'
import { useRoutineStore } from '../stores/routineStore'
import { useUIStore } from '../stores/uiStore'
import '../styles/RoutinesManager.css'

function RoutinesManager () {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const navigate = useNavigate()
  const { showSuccess, showError } = useUIStore()
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
    if (error) return showError('No se pudo activar la rutina')
    showSuccess('Rutina activada')
    await loadUserRoutine()
    navigate('/rutina')
  }

  const remove = async (routine, deep = true) => {
    if (routine?.es_activa) {
      showError('No podés eliminar la rutina activa. Activá otra primero.')
      return
    }
    const { error } = deep ? await workoutRoutines.deleteDeep(routine.id) : await workoutRoutines.delete(routine.id)
    if (error) return showError('No se pudo eliminar la rutina')
    showSuccess('Rutina eliminada')
    load()
  }

  const removeMany = async () => {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (ids.length === 0) return
    // No permitir borrar la activa
    const activeIds = (routines || []).filter(r => r.es_activa).map(r => r.id)
    const toDelete = ids.filter(id => !activeIds.includes(id))
    if (toDelete.length === 0) return showError('No podés eliminar la rutina activa. Activá otra primero.')
    const { error } = await workoutRoutines.deleteManyDeep(toDelete)
    if (error) return showError('No se pudieron eliminar algunas rutinas')
    showSuccess('Rutinas eliminadas')
    setSelected({})
    load()
  }

  if (loading) {
    return (
      <div className="routines-manager">
        <div className="loading-container">
          <div className="loading-spinner">Cargando rutinas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="routines-manager">
      {/* Botón de volver */}
      <div className="back-button-container">
        <button 
          className="btn-back" 
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
      </div>

      <div className="routines-page-header">
        <div className="header-content">
          <h1>Mis Rutinas</h1>
          <p>Gestiona todas tus rutinas de entrenamiento, crea nuevas o edita las existentes</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary" 
            onClick={removeMany} 
            disabled={Object.values(selected).filter(Boolean).length === 0}
          >
            Eliminar seleccionadas
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/ejercicios-personalizados')}
          >
            Mis ejercicios
          </button>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/rutina-personalizada')}
          >
            Crear nueva rutina
          </button>
        </div>
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


