import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { exercises as exercisesApi, workoutRoutines, routineDays, routineExercises } from '../lib/supabase'
import { useRoutineStore } from '../stores/routineStore'
import { useUIStore } from '../stores/uiStore'
import '../styles/CustomRoutineBuilder.css'

const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function CustomRoutineBuilder () {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { loadUserRoutine } = useRoutineStore()
  const { showSuccess, showError } = useUIStore()

  const [nombre, setNombre] = useState('Mi Rutina Personalizada')
  const [diasSeleccionados, setDiasSeleccionados] = useState(['Lunes','Miércoles','Viernes'])
  const [catalogo, setCatalogo] = useState({ byGroup: {}, all: [] })
  const [loading, setLoading] = useState(false)
  const [rutina, setRutina] = useState(() => {
    const saved = localStorage.getItem('customRoutineDraft')
    return saved ? JSON.parse(saved) : {}
  })

  React.useEffect(() => {
    ;(async () => {
      const { data } = await exercisesApi.getAll()
      const byGroup = (data || []).reduce((acc, e) => {
        const g = e.grupo_muscular || 'General'
        if (!acc[g]) acc[g] = []
        acc[g].push(e)
        return acc
      }, {})
      setCatalogo({ byGroup, all: data || [] })
    })()
  }, [])

  // Precargar rutina si venimos con ?id=...
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const editId = params.get('id')
    if (!editId) return
    ;(async () => {
      const { data, error } = await workoutRoutines.getById(editId)
      if (error || !data) return
      // set nombre y días
      setNombre(data.nombre || 'Mi Rutina Personalizada')
      const dias = (data.routine_days || []).map(d => d.dia_semana)
      if (dias.length) setDiasSeleccionados(dias)
      // mapear ejercicios por día
      const mapa = {}
      for (const d of (data.routine_days || [])) {
        mapa[d.dia_semana] = (d.routine_exercises || []).sort((a,b) => (a.orden||0)-(b.orden||0)).map(re => ({
          exercise: re.exercises,
          series: re.series,
          repeticiones_min: re.repeticiones_min,
          repeticiones_max: re.repeticiones_max,
          peso_objetivo: re.peso_sugerido ?? 0
        }))
      }
      setRutina(mapa)
    })()
  }, [location.search])

  React.useEffect(() => {
    localStorage.setItem('customRoutineDraft', JSON.stringify(rutina))
  }, [rutina])

  const handleToggleDia = (dia) => {
    setDiasSeleccionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  const handleAddExercise = (dia, exercise) => {
    setRutina(prev => {
      const list = prev[dia] || []
      const next = [...list, { exercise, series: 3, repeticiones_min: 8, repeticiones_max: 12, peso_objetivo: 0 }]
      return { ...prev, [dia]: next }
    })
  }

  const handleUpdateExercise = (dia, idx, field, value) => {
    setRutina(prev => {
      const list = [...(prev[dia] || [])]
      list[idx] = { ...list[idx], [field]: value }
      return { ...prev, [dia]: list }
    })
  }

  const handleRemoveExercise = (dia, idx) => {
    setRutina(prev => {
      const list = [...(prev[dia] || [])]
      list.splice(idx, 1)
      return { ...prev, [dia]: list }
    })
  }

  const canSaveToCloud = !!user

  const handleSave = async () => {
    try {
      setLoading(true)
      if (!nombre || diasSeleccionados.length === 0) {
        showError('Completá el nombre y al menos un día')
        return
      }

      if (!canSaveToCloud) {
        const payload = { tipo: 'custom-local', nombre, dias: diasSeleccionados, rutina }
        localStorage.setItem('customRoutine', JSON.stringify(payload))
        showSuccess('Rutina guardada en tu dispositivo')
        navigate('/rutina')
        return
      }

      // Determinar un tipo de rutina válido según los días (restricción en DB)
      const nDias = diasSeleccionados.length
      const tipoRutina = nDias <= 3 ? 'FULL BODY' : (nDias === 4 ? 'UPPER LOWER' : (nDias >= 6 ? 'PUSH PULL LEGS' : 'ARNOLD SPLIT'))

      // Guardado en Supabase
      const prefixedName = /^personalizada/i.test(nombre) ? nombre : `Personalizada – ${nombre}`
      const { data: created, error: createError } = await workoutRoutines.create({
        user_id: user.id,
        nombre: prefixedName,
        tipo_rutina: tipoRutina,
        dias_por_semana: nDias,
        es_activa: true
      })
      if (createError || !created?.[0]) throw createError || new Error('No se pudo crear la rutina')
      const routineId = created[0].id

      // Crear días y ejercicios
      const diaOrden = diasSemana
      for (const dia of diasSeleccionados) {
        const orden = diaOrden.indexOf(dia) + 1
        const { data: day, error: dayError } = await routineDays.create({
          routine_id: routineId,
          dia_semana: dia,
          nombre_dia: dia,
          descripcion: 'Personalizada',
          es_descanso: false,
          orden
        })
        if (dayError || !day?.[0]) throw dayError || new Error('No se pudo crear el día')
        const dayId = day[0].id
        const items = rutina[dia] || []
        for (let i = 0; i < items.length; i++) {
          const it = items[i]
          const { error: exError } = await routineExercises.create({
            routine_day_id: dayId,
            exercise_id: it.exercise.id,
            series: Number(it.series) || 3,
            repeticiones_min: Number(it.repeticiones_min) || 8,
            repeticiones_max: Number(it.repeticiones_max) || 12,
            peso_sugerido: Number(it.peso_objetivo) || null,
            tiempo_descanso: 60,
            orden: i + 1
          })
          if (exError) throw exError
        }
      }

      await loadUserRoutine()
      showSuccess('Rutina personalizada creada y activada')
      navigate('/rutina')
    } catch (e) {
      showError('No se pudo guardar la rutina')
    } finally {
      setLoading(false)
    }
  }

  const clearLocal = () => {
    localStorage.removeItem('customRoutine')
    localStorage.removeItem('customRoutineDraft')
  }

  const groups = useMemo(() => Object.keys(catalogo.byGroup).sort(), [catalogo])

  return (
    <div className="builder">
      <div className="builder-header">
        <h1>Rutina personalizada</h1>
        <div className="row">
          <input
            className="builder-name"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre de la rutina"
          />
          <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar rutina'}</button>
        </div>
        <div className="hint">{canSaveToCloud ? 'Se guardará en tu cuenta' : 'No estás logeado: se guardará en este dispositivo'}</div>
      </div>

      <div className="builder-section">
        <div className="section-title">Días de entrenamiento</div>
        <div className="dias-grid">
          {diasSemana.map(d => (
            <label key={d} className={`dia-chip${diasSeleccionados.includes(d) ? ' is-active' : ''}`}>
              <input
                type="checkbox"
                checked={diasSeleccionados.includes(d)}
                onChange={() => handleToggleDia(d)}
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      {diasSeleccionados.map(dia => (
        <div key={dia} className="builder-section">
          <div className="section-title">{dia}</div>
          <div className="add-row">
            <select onChange={e => { const id = e.target.value; const ex = catalogo.all.find(x => String(x.id) === id); if (ex) handleAddExercise(dia, ex); e.target.value = '' }} defaultValue="">
              <option value="" disabled>Agregar ejercicio...</option>
              {groups.map(g => (
                <optgroup key={g} label={g}>
                  {(catalogo.byGroup[g] || []).map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.nombre}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <ul className="exercise-list">
            {(rutina[dia] || []).map((it, idx) => (
              <li key={`${dia}-${idx}`} className="exercise-item">
                <div className="exercise-title">{it.exercise.nombre}</div>
                <div className="exercise-fields">
                  <label>Series
                    <input type="number" min="1" max="10" value={it.series} onChange={e => handleUpdateExercise(dia, idx, 'series', e.target.value)} />
                  </label>
                  <label>Reps min
                    <input type="number" min="1" max="50" value={it.repeticiones_min} onChange={e => handleUpdateExercise(dia, idx, 'repeticiones_min', e.target.value)} />
                  </label>
                  <label>Reps max
                    <input type="number" min="1" max="50" value={it.repeticiones_max} onChange={e => handleUpdateExercise(dia, idx, 'repeticiones_max', e.target.value)} />
                  </label>
                  <label>Peso objetivo (kg)
                    <input type="number" min="0" step="0.5" value={it.peso_objetivo} onChange={e => handleUpdateExercise(dia, idx, 'peso_objetivo', e.target.value)} />
                  </label>
                </div>
                <button className="icon-btn danger" onClick={() => handleRemoveExercise(dia, idx)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="builder-footer">
        <button className="btn-secondary" onClick={() => { clearLocal(); navigate('/') }}>Cancelar</button>
      </div>
    </div>
  )
}

export default CustomRoutineBuilder


