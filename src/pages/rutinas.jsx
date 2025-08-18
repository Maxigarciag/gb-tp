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

  if (loading) return <div style={{ padding: 16 }}>Cargando rutinas...</div>

  return (
    <div className="main-container routines-manager" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Mis rutinas</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={removeMany} disabled={Object.values(selected).filter(Boolean).length === 0}>Eliminar seleccionadas</button>
          <button className="btn-primary" onClick={() => navigate('/rutina-personalizada')}>Crear nueva rutina</button>
        </div>
      </div>
      {(!routines || routines.length === 0) ? (
        <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card-background)' }}>
          Aún no tenés rutinas guardadas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {routines.map(r => (
            <div key={r.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card-background)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!selected[r.id]} onChange={e => setSelected(s => ({ ...s, [r.id]: e.target.checked }))} aria-label={`Seleccionar rutina ${r.nombre}`} />
                  <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                </div>
                {r.es_activa && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Activa</span>}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{r.tipo_rutina} · {r.dias_por_semana} días</div>
              <div className="card-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {!r.es_activa && <button className="btn-primary" onClick={() => activate(r.id)}>Activar</button>}
                <button className="btn-secondary" onClick={() => navigate(`/rutina-personalizada?id=${r.id}`)}>Editar</button>
                <button className="icon-btn danger" onClick={() => remove(r)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoutinesManager


