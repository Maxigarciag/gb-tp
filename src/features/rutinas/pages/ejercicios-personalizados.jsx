import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { exercises as exercisesApi } from '@/lib/supabase'
import ConfirmDialogOptimized from '@/features/common/components/ConfirmDialogOptimized'
import {
  ArrowLeft,
  Plus,
  Dumbbell,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Save,
} from 'lucide-react'
import '@/styles/components/rutinas/CustomExercisesManager.css'

const GRUPOS_MUSCULARES = [
  'Pecho', 'Espalda', 'Hombros', 'Brazos',
  'Piernas', 'Core', 'Cardio', 'General',
]

function CustomExercisesManager() {
  const [exercises,       setExercises]       = useState([])
  const [loading,         setLoading]         = useState(true)
  const [errorMsg,        setErrorMsg]        = useState(null)
  const [editingExercise, setEditingExercise] = useState(null)
  const [formError,       setFormError]       = useState(null)
  const [editLoading,     setEditLoading]     = useState(false)
  const [deleteTarget,    setDeleteTarget]    = useState(null)
  const [deleteLoading,   setDeleteLoading]   = useState(false)

  const navigate = useNavigate()

  // ─── Carga ────────────────────────────────────────────────

  const loadExercises = async () => {
    setLoading(true)
    setErrorMsg(null)
    const { data, error } = await exercisesApi.getCustomExercises()
    if (error) setErrorMsg('No se pudieron cargar los ejercicios.')
    else setExercises(data || [])
    setLoading(false)
  }

  useEffect(() => { loadExercises() }, [])

  // ─── Editar ───────────────────────────────────────────────

  const handleEdit = (exercise) => {
    setFormError(null)
    setEditingExercise({
      id:             exercise.id,
      nombre:         exercise.nombre,
      grupo_muscular: exercise.grupo_muscular,
      descripcion:    exercise.descripcion    || '',
      instrucciones:  exercise.instrucciones  || '',
    })
  }

  const handleEditChange = (field, value) => {
    setEditingExercise(prev => ({ ...prev, [field]: value }))
    if (formError) setFormError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingExercise.nombre?.trim()) {
      setFormError('El nombre del ejercicio es obligatorio.')
      return
    }
    if (!editingExercise.grupo_muscular) {
      setFormError('Seleccioná un grupo muscular.')
      return
    }

    setEditLoading(true)
    setFormError(null)

    const { error } = await exercisesApi.update(editingExercise.id, {
      nombre:         editingExercise.nombre.trim(),
      grupo_muscular: editingExercise.grupo_muscular,
      descripcion:    editingExercise.descripcion,
      instrucciones:  editingExercise.instrucciones,
    })

    if (error) {
      setFormError('No se pudo guardar. Intentalo de nuevo.')
      setEditLoading(false)
      return
    }

    setEditingExercise(null)
    setEditLoading(false)
    await loadExercises()
  }

  // ─── Eliminar ─────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const { error } = await exercisesApi.delete(deleteTarget.id)
    if (error) {
      setErrorMsg('No se pudo eliminar el ejercicio.')
      setDeleteLoading(false)
      setDeleteTarget(null)
      return
    }
    setDeleteTarget(null)
    setDeleteLoading(false)
    await loadExercises()
  }

  // ─── Render: cargando ─────────────────────────────────────

  if (loading) {
    return (
      <div className="cem-page">
        <div className="cem-container">
          <div className="cem-state">
            <div className="cem-state-spinner" />
            <p>Cargando tus ejercicios…</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render principal ─────────────────────────────────────

  return (
    <div className="cem-page">
      <motion.div
        className="cem-container"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >

        {/* ══ HEADER ══ */}
        <div className="cem-header-card">
          <div className="cem-header-top">

            <button
              className="cem-back-btn"
              onClick={() => navigate('/rutinas')}
              aria-label="Volver a Mis Rutinas"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="cem-header-info">
              <h1 className="cem-header-title">Mis Ejercicios Personalizados</h1>
              <p className="cem-header-subtitle">
                {exercises.length > 0
                  ? `${exercises.length} ejercicio${exercises.length !== 1 ? 's' : ''} personalizado${exercises.length !== 1 ? 's' : ''}`
                  : 'Crea ejercicios propios para agregar a tus rutinas'}
              </p>
            </div>

            <div className="cem-header-actions">
              <button
                className="cem-btn-action cem-btn-action--primary"
                onClick={() => navigate('/rutina-personalizada?action=create-exercise')}
                title="Crear nuevo ejercicio"
              >
                <Plus size={13} />
                <span>Nuevo ejercicio</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══ ERROR ══ */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              className="cem-error-msg"
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
        {exercises.length === 0 ? (
          <div className="cem-state">
            <Dumbbell size={40} strokeWidth={1.5} style={{ opacity: 0.35 }} />
            <h3>Aún no tenés ejercicios personalizados</h3>
            <p>Creá tu primer ejercicio para agregarlo a tus rutinas</p>
            <button
              className="cem-state-cta"
              onClick={() => navigate('/rutina-personalizada?action=create-exercise')}
            >
              <Plus size={16} />
              Crear mi primer ejercicio
            </button>
          </div>
        ) : (

          /* ══ GRID ══ */
          <div className="cem-grid">
            {exercises.map((ex, i) => (
              <motion.div
                key={ex.id}
                className="exercise-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                {/* Header */}
                <div className="exercise-card__header">
                  <div className="exercise-card__title-group">
                    <h3 className="exercise-card__name">{ex.nombre}</h3>
                    <span className="exercise-group-badge">{ex.grupo_muscular}</span>
                  </div>
                  <div className="exercise-card__actions">
                    <button
                      className="exercise-card__btn"
                      onClick={() => handleEdit(ex)}
                      title="Editar ejercicio"
                      aria-label={`Editar ${ex.nombre}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="exercise-card__btn exercise-card__btn--danger"
                      onClick={() => setDeleteTarget(ex)}
                      title="Eliminar ejercicio"
                      aria-label={`Eliminar ${ex.nombre}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Body — descripción e instrucciones */}
                {(ex.descripcion || ex.instrucciones) && (
                  <div className="exercise-card__body">
                    {ex.descripcion && (
                      <div>
                        <p className="exercise-card__section-label">Descripción</p>
                        <p className="exercise-card__text">{ex.descripcion}</p>
                      </div>
                    )}
                    {ex.instrucciones && (
                      <div>
                        <p className="exercise-card__section-label">Instrucciones</p>
                        <p className="exercise-card__text">{ex.instrucciones}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="exercise-card__footer">
                  <span className="exercise-card__date">
                    Creado: {new Date(ex.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>

      {/* ══ MODAL DE EDICIÓN ══ */}
      <AnimatePresence>
        {editingExercise && (
          <motion.div
            className="cem-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => { if (e.target === e.currentTarget) setEditingExercise(null) }}
          >
            <motion.div
              className="cem-modal"
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="cem-modal__header">
                <h3 className="cem-modal__title">Editar Ejercicio</h3>
                <button
                  className="cem-modal__close"
                  onClick={() => setEditingExercise(null)}
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="cem-modal__body">
                {/* Error de formulario */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      className="cem-form-error"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <AlertCircle size={14} />
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="cem-form-group">
                  <label className="cem-form-label" htmlFor="edit-nombre">
                    Nombre del ejercicio <span>*</span>
                  </label>
                  <input
                    id="edit-nombre"
                    className="cem-form-input"
                    type="text"
                    value={editingExercise.nombre}
                    onChange={e => handleEditChange('nombre', e.target.value)}
                    placeholder="Ej: Press de banca inclinado"
                    maxLength={100}
                  />
                </div>

                <div className="cem-form-group">
                  <label className="cem-form-label" htmlFor="edit-grupo">
                    Grupo muscular <span>*</span>
                  </label>
                  <select
                    id="edit-grupo"
                    className="cem-form-select"
                    value={editingExercise.grupo_muscular}
                    onChange={e => handleEditChange('grupo_muscular', e.target.value)}
                  >
                    <option value="">Seleccioná un grupo muscular</option>
                    {GRUPOS_MUSCULARES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="cem-form-group">
                  <label className="cem-form-label" htmlFor="edit-descripcion">
                    Descripción
                  </label>
                  <textarea
                    id="edit-descripcion"
                    className="cem-form-textarea"
                    value={editingExercise.descripcion}
                    onChange={e => handleEditChange('descripcion', e.target.value)}
                    placeholder="Breve descripción del ejercicio…"
                    rows={3}
                    maxLength={200}
                  />
                </div>

                <div className="cem-form-group">
                  <label className="cem-form-label" htmlFor="edit-instrucciones">
                    Instrucciones
                  </label>
                  <textarea
                    id="edit-instrucciones"
                    className="cem-form-textarea"
                    value={editingExercise.instrucciones}
                    onChange={e => handleEditChange('instrucciones', e.target.value)}
                    placeholder="Instrucciones detalladas de cómo realizar el ejercicio…"
                    rows={4}
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="cem-modal__footer">
                <button
                  className="cem-modal-btn cem-modal-btn--secondary"
                  onClick={() => setEditingExercise(null)}
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button
                  className="cem-modal-btn cem-modal-btn--primary"
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                >
                  {editLoading
                    ? <><span className="cem-modal-btn-spinner" />Guardando…</>
                    : <><Save size={14} />Guardar cambios</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CONFIRMAR ELIMINACIÓN ══ */}
      <ConfirmDialogOptimized
        isOpen={!!deleteTarget}
        type="danger"
        title={`Eliminar "${deleteTarget?.nombre}"`}
        message="Esta acción no se puede deshacer. El ejercicio se eliminará de todas las rutinas donde esté siendo usado."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default CustomExercisesManager
