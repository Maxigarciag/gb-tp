import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutRoutines } from '../lib/supabase'
import { useRoutineStore } from '../stores/routineStore'
import { useUIStore } from '../stores/uiStore'

function RoutinesManager () {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
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

  const remove = async (id) => {
    const { error } = await workoutRoutines.delete(id)
    if (error) return showError('No se pudo eliminar la rutina')
    showSuccess('Rutina eliminada')
    load()
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando rutinas...</div>

  return (
    <div className="main-container" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Mis rutinas</h2>
        <button className="btn-primary" onClick={() => navigate('/rutina-personalizada')}>Crear nueva rutina</button>
      </div>
      {(!routines || routines.length === 0) ? (
        <div style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card-background)' }}>
          Aún no tenés rutinas guardadas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {routines.map(r => (
            <div key={r.id} style={{ border: '1px solid var(--input-border)', borderRadius: 12, padding: 16, background: 'var(--card-background)' }}>
              <div style={{ fontWeight: 600 }}>{r.nombre}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{r.tipo_rutina} · {r.dias_por_semana} días</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {!r.es_activa && <button className="btn-primary" onClick={() => activate(r.id)}>Activar</button>}
                <button className="btn-secondary" onClick={() => navigate('/rutina-personalizada')}>Duplicar/Editar</button>
                <button className="icon-btn danger" onClick={() => remove(r.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoutinesManager


