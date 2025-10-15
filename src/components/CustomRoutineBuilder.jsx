import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { exercises as exercisesApi, workoutRoutines, routineDays, routineExercises } from '../lib/supabase'
import { useRoutineStore } from '../stores/routineStore'
import { useUIStore } from '../stores/uiStore'
import ConfirmDialogOptimized from './ConfirmDialogOptimized'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/CustomRoutineBuilder.css'

const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function CustomRoutineBuilder () {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { loadUserRoutine } = useRoutineStore()
  const { showSuccess, showError } = useUIStore()

  const [nombre, setNombre] = useState('Mi Rutina Personalizada')
  const [diasSeleccionados, setDiasSeleccionados] = useState([]) // Sin días pre-seleccionados por defecto
  const [catalogo, setCatalogo] = useState({ byGroup: {}, all: [] })
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [originalData, setOriginalData] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  // Estados para ejercicio personalizado
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false)
  const [customExerciseData, setCustomExerciseData] = useState({
    nombre: '',
    grupo_muscular: '',
    descripcion: '',
    instrucciones: ''
  })
  const [customExerciseLoading, setCustomExerciseLoading] = useState(false)
  const [diaParaEjercicioPersonalizado, setDiaParaEjercicioPersonalizado] = useState(null)
  
  // Estados para drag & drop
  const [draggedExercise, setDraggedExercise] = useState(null)
  const [dragOverDay, setDragOverDay] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  
  const [rutina, setRutina] = useState(() => {
    // Solo cargar borrador si estamos editando una rutina existente
    const params = new URLSearchParams(location.search)
    const editId = params.get('id')
    
    if (editId) {
      const saved = localStorage.getItem('customRoutineDraft')
      return saved ? JSON.parse(saved) : {}
    } else {
      // Para nuevas rutinas, limpiar el localStorage y empezar vacío
      localStorage.removeItem('customRoutineDraft')
      return {}
    }
  })

  React.useEffect(() => {
    ;(async () => {
      const { data } = await exercisesApi.getAllForRoutines()
      const byGroup = (data || []).reduce((acc, e) => {
        const g = e.grupo_muscular || 'General'
        if (!acc[g]) acc[g] = []
        acc[g].push(e)
        return acc
      }, {})
      setCatalogo({ byGroup, all: data || [] })
    })()
  }, [])

  // Detectar si viene desde la página de ejercicios para crear ejercicio
  const [isExerciseOnlyMode, setIsExerciseOnlyMode] = useState(false)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    if (urlParams.get('action') === 'create-exercise') {
      setIsExerciseOnlyMode(true)
      setShowCustomExerciseModal(true)
    }
  }, [location.search])

  // Precargar rutina si venimos con ?id=...
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const editId = params.get('id')
    if (!editId) return
    
    setIsEditing(true)
    ;(async () => {
      const { data, error } = await workoutRoutines.getById(editId)
      if (error || !data) return
      
      // Guardar datos originales para comparar cambios
      const originalRutina = {
        nombre: data.nombre || 'Mi Rutina Personalizada',
        dias: (data.routine_days || []).map(d => d.dia_semana),
        rutina: {}
      }
      
      // Mapear ejercicios por día
      const mapa = {}
      for (const d of (data.routine_days || [])) {
        mapa[d.dia_semana] = (d.routine_exercises || []).sort((a,b) => (a.orden||0)-(b.orden||0)).map(re => ({
          exercise: re.exercises,
          series: re.series || 3,
          repeticiones_min: re.repeticiones_min || 8,
          repeticiones_max: re.repeticiones_max || 12,
          peso_objetivo: re.peso_sugerido ?? 0
        }))
      }
      originalRutina.rutina = mapa
      
      setOriginalData(originalRutina)
      setNombre(originalRutina.nombre)
      setDiasSeleccionados(originalRutina.dias)
      setRutina(mapa)
    })()
  }, [location.search])

  // Detectar cambios comparando con datos originales
  useEffect(() => {
    if (!originalData || !isEditing) return
    
    const currentData = {
      nombre,
      dias: diasSeleccionados,
      rutina
    }
    
    const hasChangesDetected = JSON.stringify(currentData) !== JSON.stringify(originalData)
    setHasChanges(hasChangesDetected)
  }, [nombre, diasSeleccionados, rutina, originalData, isEditing])

  React.useEffect(() => {
    // Solo guardar borrador si estamos editando una rutina existente
    if (isEditing) {
      localStorage.setItem('customRoutineDraft', JSON.stringify(rutina))
    }
  }, [rutina, isEditing])

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

  // Funciones de Drag & Drop
  const handleDragStart = (e, dia, idx) => {
    setDraggedExercise({ dia, idx, exercise: rutina[dia][idx] })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragOver = (e, dia, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDay(dia)
    setDragOverIndex(idx)
  }

  const handleDragEnter = (e, dia, idx) => {
    e.preventDefault()
    setDragOverDay(dia)
    setDragOverIndex(idx)
  }

  const handleDragLeave = (e) => {
    // Solo limpiar si realmente salimos del elemento
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverDay(null)
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e, targetDia, targetIdx) => {
    e.preventDefault()
    
    if (!draggedExercise) return
    
    const { dia: sourceDia, idx: sourceIdx } = draggedExercise
    
    // Si es el mismo día, reordenar
    if (sourceDia === targetDia) {
      setRutina(prev => {
        const list = [...(prev[sourceDia] || [])]
        const [movedExercise] = list.splice(sourceIdx, 1)
        list.splice(targetIdx, 0, movedExercise)
        return { ...prev, [sourceDia]: list }
      })
    } else {
      // Si es día diferente, mover ejercicio
      setRutina(prev => {
        const sourceList = [...(prev[sourceDia] || [])]
        const targetList = [...(prev[targetDia] || [])]
        
        const [movedExercise] = sourceList.splice(sourceIdx, 1)
        targetList.splice(targetIdx, 0, movedExercise)
        
        return {
          ...prev,
          [sourceDia]: sourceList,
          [targetDia]: targetList
        }
      })
      
      showSuccess(`Ejercicio movido de ${sourceDia} a ${targetDia}`)
    }
    
    // Limpiar estados de drag
    setDraggedExercise(null)
    setDragOverDay(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedExercise(null)
    setDragOverDay(null)
    setDragOverIndex(null)
  }

  const handleUndoChanges = () => {
    if (!originalData) return
    
    setNombre(originalData.nombre)
    setDiasSeleccionados(originalData.dias)
    setRutina(originalData.rutina)
    setHasChanges(false)
    
    showSuccess('Cambios deshechos')
  }

  const canSaveToCloud = !!user

  // Generar resumen de cambios para el modal de confirmación
  const generateChangesSummary = () => {
    if (!originalData || !isEditing) return null
    
    const changes = []
    
    // Cambios en nombre
    if (nombre !== originalData.nombre) {
      changes.push(`Nombre: "${originalData.nombre}" → "${nombre}"`)
    }
    
    // Cambios en días
    const diasRemoved = originalData.dias.filter(d => !diasSeleccionados.includes(d))
    const diasAdded = diasSeleccionados.filter(d => !originalData.dias.includes(d))
    
    if (diasRemoved.length > 0) {
      changes.push(`Días removidos: ${diasRemoved.join(', ')}`)
    }
    if (diasAdded.length > 0) {
      changes.push(`Días agregados: ${diasAdded.join(', ')}`)
    }
    
    // Cambios en ejercicios
    const allDias = [...new Set([...originalData.dias, ...diasSeleccionados])]
    
    allDias.forEach(dia => {
      const originalEjercicios = originalData.rutina[dia] || []
      const currentEjercicios = rutina[dia] || []
      
      if (originalEjercicios.length !== currentEjercicios.length) {
        changes.push(`${dia}: ${originalEjercicios.length} → ${currentEjercicios.length} ejercicios`)
      } else {
        // Verificar cambios en ejercicios individuales
        currentEjercicios.forEach((ej, idx) => {
          const originalEj = originalEjercicios[idx]
          if (originalEj) {
            if (ej.series !== originalEj.series) {
              changes.push(`${dia} - ${ej.exercise.nombre}: ${originalEj.series} → ${ej.series} series`)
            }
            if (ej.repeticiones_min !== originalEj.repeticiones_min || ej.repeticiones_max !== originalEj.repeticiones_max) {
              changes.push(`${dia} - ${ej.exercise.nombre}: ${originalEj.repeticiones_min}-${originalEj.repeticiones_max} → ${ej.repeticiones_min}-${ej.repeticiones_max} reps`)
            }
            if (ej.peso_objetivo !== originalEj.peso_objetivo) {
              changes.push(`${dia} - ${ej.exercise.nombre}: ${originalEj.peso_objetivo}kg → ${ej.peso_objetivo}kg`)
            }
          }
        })
      }
    })
    
    return changes
  }

  const handleSaveClick = () => {
    if (isEditing && hasChanges) {
      setShowConfirmDialog(true)
    } else {
      handleSave()
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      if (!nombre || diasSeleccionados.length === 0) {
        showError('Completá el nombre y al menos un día')
        setLoading(false)
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

      if (isEditing && originalData) {
        // MODIFICAR RUTINA EXISTENTE
        const params = new URLSearchParams(location.search)
        const editId = params.get('id')
        
        // Actualizar la rutina principal
        const { error: updateError } = await workoutRoutines.update(editId, {
          nombre: nombre,
          tipo_rutina: tipoRutina,
          dias_por_semana: nDias
        })
        if (updateError) throw updateError

        // Obtener días existentes para comparar
        const { data: existingDays } = await routineDays.getByRoutine(editId)
        
        // Eliminar días que ya no están seleccionados
        for (const existingDay of existingDays || []) {
          if (!diasSeleccionados.includes(existingDay.dia_semana)) {
            // Eliminar ejercicios del día primero
            await routineExercises.deleteByDay(existingDay.id)
            // Eliminar el día específico
            await routineDays.delete(existingDay.id)
          }
        }

        // Actualizar o crear días según corresponda
        for (const dia of diasSeleccionados) {
          const orden = diasSemana.indexOf(dia) + 1
          const existingDay = existingDays?.find(d => d.dia_semana === dia)
          
          let dayId
          if (existingDay) {
            // Actualizar día existente
            await routineDays.update(existingDay.id, {
              orden,
              descripcion: 'Personalizada'
            })
            dayId = existingDay.id
            
            // Eliminar ejercicios existentes para recrearlos
            await routineExercises.deleteByDay(dayId)
          } else {
            // Crear nuevo día
            const { data: day, error: dayError } = await routineDays.create({
              routine_id: editId,
              dia_semana: dia,
              nombre_dia: dia,
              descripcion: 'Personalizada',
              es_descanso: false,
              orden
            })
            if (dayError || !day?.[0]) throw dayError || new Error('No se pudo crear el día')
            dayId = day[0].id
          }

          // Crear ejercicios del día
          const items = rutina[dia] || []
          for (let i = 0; i < items.length; i++) {
            const it = items[i]
            const { error: exError } = await routineExercises.create({
              routine_day_id: dayId,
              exercise_id: it.exercise?.id || it.id,
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
        showSuccess('Rutina actualizada exitosamente')
        navigate('/rutina')
      } else {
                 // CREAR NUEVA RUTINA
         const prefixedName = nombre // Sin prefijo "Personalizada -"
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
              exercise_id: it.exercise?.id || it.id,
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
      }
    } catch (e) {
      showError('No se pudo guardar la rutina')
    } finally {
      setLoading(false)
      setShowConfirmDialog(false)
    }
  }

  const clearLocal = () => {
    localStorage.removeItem('customRoutine')
    localStorage.removeItem('customRoutineDraft')
    // Limpiar también el estado local
    setRutina({})
    setDiasSeleccionados([])
    setNombre('Mi Rutina Personalizada')
  }

  // Funciones para ejercicio personalizado
  const handleCustomExerciseChange = (field, value) => {
    setCustomExerciseData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateCustomExercise = async () => {
    if (!customExerciseData.nombre || !customExerciseData.grupo_muscular) {
      showError('El nombre y grupo muscular son obligatorios')
      return
    }

    try {
      setCustomExerciseLoading(true)
      
      const exerciseData = {
        nombre: customExerciseData.nombre,
        grupo_muscular: customExerciseData.grupo_muscular,
        descripcion: customExerciseData.descripcion || '',
        instrucciones: customExerciseData.instrucciones ? [customExerciseData.instrucciones] : [],
        consejos: [], // Campo requerido pero vacío para ejercicios personalizados
        musculos_trabajados: [], // Campo requerido pero vacío para ejercicios personalizados
        es_compuesto: false, // Campo requerido, por defecto false para ejercicios personalizados
        es_personalizado: true,
        creado_por: user?.id
      }
      
      // Crear el ejercicio personalizado en la base de datos
      const { data: newExercise, error } = await exercisesApi.create(exerciseData)

      if (error) {
        throw error
      }

      // Solo actualizar el catálogo si el ejercicio se creó exitosamente
      if (newExercise && newExercise.id) {
        const updatedCatalogo = {
          byGroup: { ...catalogo.byGroup },
          all: [...catalogo.all, newExercise]
        }
        
        // Agregar al grupo correspondiente
        if (!updatedCatalogo.byGroup[customExerciseData.grupo_muscular]) {
          updatedCatalogo.byGroup[customExerciseData.grupo_muscular] = []
        }
        updatedCatalogo.byGroup[customExerciseData.grupo_muscular].push(newExercise)
        
        setCatalogo(updatedCatalogo)
      }
      
      // Si estamos en modo solo ejercicio, navegar de vuelta a la página de ejercicios
      if (isExerciseOnlyMode && newExercise && newExercise.id) {
        showSuccess('Ejercicio personalizado creado exitosamente')
        setCustomExerciseData({
          nombre: '',
          grupo_muscular: '',
          descripcion: '',
          instrucciones: ''
        })
        setShowCustomExerciseModal(false)
        navigate('/ejercicios-personalizados')
        return
      }
      
      // Agregar automáticamente el ejercicio al día especificado (modo rutina normal)
      if (diaParaEjercicioPersonalizado && newExercise && newExercise.id) {
        const ejercicioParaRutina = {
          id: newExercise.id,
          nombre: newExercise.nombre,
          grupo_muscular: newExercise.grupo_muscular,
          series: 3,
          repeticiones_min: 8,
          repeticiones_max: 12,
          peso_objetivo: 0,
          descanso: 60
        }
        
        setRutina(prev => ({
          ...prev,
          [diaParaEjercicioPersonalizado]: [...(prev[diaParaEjercicioPersonalizado] || []), ejercicioParaRutina]
        }))
        
        showSuccess(`Ejercicio "${newExercise.nombre}" creado y agregado a ${diaParaEjercicioPersonalizado}`)
      } else if (newExercise && newExercise.id) {
        showSuccess('Ejercicio personalizado creado exitosamente')
      }
      
      // Limpiar el formulario y estado
      setCustomExerciseData({
        nombre: '',
        grupo_muscular: '',
        descripcion: '',
        instrucciones: ''
      })
      setDiaParaEjercicioPersonalizado(null)
      setShowCustomExerciseModal(false)
      
    } catch (error) {
      if (error.code === '23505') {
        showError('Ya existe un ejercicio con ese nombre. Intenta con un nombre diferente.')
      } else {
        showError('Error al crear el ejercicio personalizado')
      }
    } finally {
      setCustomExerciseLoading(false)
    }
  }

  const groups = useMemo(() => Object.keys(catalogo.byGroup).sort(), [catalogo])
  const changesSummary = generateChangesSummary()

  // Si estamos en modo solo ejercicio, solo mostrar el modal
  if (isExerciseOnlyMode) {
    return (
      <div className="builder">
        {/* Modal de ejercicio personalizado */}
        {showCustomExerciseModal && (
          <div className="custom-exercise-modal-overlay">
            <div className="custom-exercise-modal">
              <div className="custom-exercise-modal-header">
                <h3>Crear Ejercicio Personalizado</h3>
                <button 
                  className="custom-exercise-modal-close"
                  onClick={() => {
                    setShowCustomExerciseModal(false)
                    navigate('/ejercicios-personalizados')
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="custom-exercise-modal-content">
                <div className="custom-exercise-form">
                  <div className="form-group">
                    <label htmlFor="custom-exercise-name">Nombre del ejercicio *</label>
                    <input
                      id="custom-exercise-name"
                      type="text"
                      value={customExerciseData.nombre}
                      onChange={(e) => handleCustomExerciseChange('nombre', e.target.value)}
                      placeholder="Ej: Press de banca inclinado"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="custom-exercise-group">Grupo muscular *</label>
                    <select
                      id="custom-exercise-group"
                      value={customExerciseData.grupo_muscular}
                      onChange={(e) => handleCustomExerciseChange('grupo_muscular', e.target.value)}
                    >
                      <option value="">Selecciona un grupo muscular</option>
                      <option value="Pecho">Pecho</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Hombros">Hombros</option>
                      <option value="Brazos">Brazos</option>
                      <option value="Piernas">Piernas</option>
                      <option value="Core">Core</option>
                      <option value="Cardio">Cardio</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="custom-exercise-description">Descripción</label>
                    <textarea
                      id="custom-exercise-description"
                      value={customExerciseData.descripcion}
                      onChange={(e) => handleCustomExerciseChange('descripcion', e.target.value)}
                      placeholder="Breve descripción del ejercicio..."
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="custom-exercise-instructions">Instrucciones</label>
                    <textarea
                      id="custom-exercise-instructions"
                      value={customExerciseData.instrucciones}
                      onChange={(e) => handleCustomExerciseChange('instrucciones', e.target.value)}
                      placeholder="Instrucciones detalladas de cómo realizar el ejercicio..."
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
              
              <div className="custom-exercise-modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCustomExerciseModal(false)
                    navigate('/ejercicios-personalizados')
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleCreateCustomExercise}
                  disabled={customExerciseLoading}
                >
                  {customExerciseLoading ? 'Creando...' : 'Crear Ejercicio'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="builder">
      {/* Indicador de modo edición */}
      {isEditing && (
        <div className="editing-mode-banner">
          <div className="editing-mode-content">
            <div className="editing-mode-icon">✏️</div>
            <div className="editing-mode-text">
              <h3>Editando Rutina Existente</h3>
              <p>Estás modificando "{originalData?.nombre || 'Rutina'}"</p>
            </div>
            {hasChanges && (
              <div className="editing-mode-actions">
                <button 
                  className="btn-secondary btn-undo" 
                  onClick={handleUndoChanges}
                  disabled={loading}
                >
                  🔄 Deshacer Cambios
                </button>
                <div className="changes-indicator">
                  <span className="changes-dot"></span>
                  Cambios sin guardar
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="builder-header">
        <h1>{isEditing ? 'Editar Rutina' : 'Rutina personalizada'}</h1>
        <div className="row">
          <input
            className="builder-name"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre de la rutina"
          />
          <button 
            className="btn-primary" 
            onClick={handleSaveClick} 
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading-content">
                <div className="btn-loading-spinner"></div>
                {isEditing ? 'Guardando cambios...' : 'Guardando rutina...'}
              </div>
            ) : (
              isEditing ? 'Guardar Cambios' : 'Guardar rutina'
            )}
          </button>
        </div>
        <div className="hint">
          {canSaveToCloud 
            ? (isEditing ? 'Los cambios se guardarán en tu cuenta' : 'Se guardará en tu cuenta')
            : 'No estás logeado: se guardará en este dispositivo'
          }
        </div>
      </div>

      <div className="builder-section">
        <div className="section-title">Días de entrenamiento</div>
        <div className="dias-selector">
          <div className="dias-selector-label">
            Selecciona los días en los que quieres entrenar:
          </div>
          <div className="dias-grid">
            {diasSemana.map(d => (
              <label key={d} className={`dia-chip${diasSeleccionados.includes(d) ? ' is-active' : ''}`}>
                <input
                  type="checkbox"
                  checked={diasSeleccionados.includes(d)}
                  onChange={() => handleToggleDia(d)}
                />
                <div className="dia-abreviatura">
                  {d === 'Lunes' ? 'L' : 
                   d === 'Martes' ? 'M' : 
                   d === 'Miércoles' ? 'M' : 
                   d === 'Jueves' ? 'J' : 
                   d === 'Viernes' ? 'V' : 
                   d === 'Sábado' ? 'S' : 'D'}
                </div>
                <div className="dia-nombre">{d}</div>
              </label>
            ))}
          </div>
          <div className="dias-info">
            <span>Días seleccionados: </span>
            <span className="dias-count">{diasSeleccionados.length}</span>
            <span> de 7</span>
          </div>
        </div>
      </div>

      {diasSemana.filter(dia => diasSeleccionados.includes(dia)).map(dia => (
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
            <button 
              className="btn-custom-exercise" 
              onClick={() => {
                setDiaParaEjercicioPersonalizado(dia)
                setShowCustomExerciseModal(true)
              }}
              title="Crear ejercicio personalizado"
            >
              <span>+</span> Ejercicio personalizado
            </button>
          </div>

          <ul className="exercise-list">
            {(rutina[dia] || []).map((it, idx) => (
              <motion.li 
                key={`${dia}-${idx}`} 
                className={`exercise-item ${draggedExercise?.dia === dia && draggedExercise?.idx === idx ? 'dragging' : ''} ${dragOverDay === dia && dragOverIndex === idx ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, dia, idx)}
                onDragOver={(e) => handleDragOver(e, dia, idx)}
                onDragEnter={(e) => handleDragEnter(e, dia, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dia, idx)}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="exercise-drag-handle">
                  <span className="drag-icon">⋮⋮</span>
                </div>
                <div className="exercise-content">
                  <div className="exercise-title">{it.exercise?.nombre || it.nombre || 'Ejercicio no encontrado'}</div>
                  <div className="exercise-fields">
                    <label>Series
                      <input type="number" min="1" max="10" value={it.series || 3} onChange={e => handleUpdateExercise(dia, idx, 'series', e.target.value)} />
                    </label>
                    <label>Reps min
                      <input type="number" min="1" max="50" value={it.repeticiones_min || 8} onChange={e => handleUpdateExercise(dia, idx, 'repeticiones_min', e.target.value)} />
                    </label>
                    <label>Reps max
                      <input type="number" min="1" max="50" value={it.repeticiones_max || 12} onChange={e => handleUpdateExercise(dia, idx, 'repeticiones_max', e.target.value)} />
                    </label>
                    <label>Peso objetivo (kg)
                      <input type="number" min="0" step="0.5" value={it.peso_objetivo || 0} onChange={e => handleUpdateExercise(dia, idx, 'peso_objetivo', e.target.value)} />
                    </label>
                  </div>
                  <button className="icon-btn danger" onClick={() => handleRemoveExercise(dia, idx)}>Eliminar</button>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      ))}

      <div className="builder-footer">
        <button className="btn-secondary" onClick={() => { clearLocal(); navigate('/') }}>Cancelar</button>
      </div>

      {/* Modal de confirmación de cambios */}
      {showConfirmDialog && (
        <div className="confirm-dialog-modal-overlay">
          <div className="confirm-dialog-modal">
            <div className="confirm-dialog-modal-header">
              <h3>Confirmar Cambios</h3>
              <button 
                className="confirm-dialog-modal-close"
                onClick={() => setShowConfirmDialog(false)}
              >
                ×
              </button>
            </div>
            
            <div className="confirm-dialog-modal-content">
              <p>¿Estás seguro de que quieres guardar los siguientes cambios?</p>
              {changesSummary && changesSummary.length > 0 && (
                <div className="changes-summary">
                  <h4>Resumen de cambios:</h4>
                  <ul className="changes-list">
                    {changesSummary.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="confirm-dialog-modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear ejercicio personalizado */}
      {showCustomExerciseModal && (
        <div className="custom-exercise-modal-overlay">
          <div className="custom-exercise-modal">
            <div className="custom-exercise-modal-header">
              <h3>Crear Ejercicio Personalizado</h3>
              <button 
                className="custom-exercise-modal-close"
                onClick={() => {
                  setShowCustomExerciseModal(false)
                  setCustomExerciseData({
                    nombre: '',
                    grupo_muscular: '',
                    descripcion: '',
                    instrucciones: ''
                  })
                  setDiaParaEjercicioPersonalizado(null)
                }}
              >
                ×
              </button>
            </div>
            
            <div className="custom-exercise-modal-content">
              <div className="custom-exercise-form">
                <div className="form-group">
                  <label htmlFor="exercise-name">Nombre del ejercicio *</label>
                  <input
                    id="exercise-name"
                    type="text"
                    value={customExerciseData.nombre}
                    onChange={(e) => handleCustomExerciseChange('nombre', e.target.value)}
                    placeholder="Ej: Press de banca inclinado"
                    maxLength={100}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="exercise-group">Grupo muscular *</label>
                  <select
                    id="exercise-group"
                    value={customExerciseData.grupo_muscular}
                    onChange={(e) => handleCustomExerciseChange('grupo_muscular', e.target.value)}
                  >
                    <option value="">Selecciona un grupo muscular</option>
                    <option value="Pecho">Pecho</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Hombros">Hombros</option>
                    <option value="Brazos">Brazos</option>
                    <option value="Piernas">Piernas</option>
                    <option value="Core">Core</option>
                    <option value="Cardio">Cardio</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="exercise-description">Descripción</label>
                  <textarea
                    id="exercise-description"
                    value={customExerciseData.descripcion}
                    onChange={(e) => handleCustomExerciseChange('descripcion', e.target.value)}
                    placeholder="Breve descripción del ejercicio..."
                    rows={3}
                    maxLength={200}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="exercise-instructions">Instrucciones</label>
                  <textarea
                    id="exercise-instructions"
                    value={customExerciseData.instrucciones}
                    onChange={(e) => handleCustomExerciseChange('instrucciones', e.target.value)}
                    placeholder="Instrucciones detalladas de cómo realizar el ejercicio..."
                    rows={4}
                    maxLength={500}
                  />
                </div>
              </div>
            </div>
            
            <div className="custom-exercise-modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowCustomExerciseModal(false)
                  setCustomExerciseData({
                    nombre: '',
                    grupo_muscular: '',
                    descripcion: '',
                    instrucciones: ''
                  })
                  setDiaParaEjercicioPersonalizado(null)
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateCustomExercise}
                disabled={customExerciseLoading}
              >
                {customExerciseLoading ? 'Creando...' : 'Crear Ejercicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomRoutineBuilder


