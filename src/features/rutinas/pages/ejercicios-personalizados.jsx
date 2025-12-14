/**
 * Página de gestión de ejercicios personalizados del usuario
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exercises as exercisesApi } from '@/lib/supabase'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmDialogOptimized from '@/features/common/components/ConfirmDialogOptimized'
import '@/styles/components/rutinas/CustomExercisesManager.css'

function CustomExercisesManager() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingExercise, setEditingExercise] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const navigate = useNavigate()
  const { user } = useAuth()

  const loadExercises = async () => {
    try {
      setLoading(true)
      const { data, error } = await exercisesApi.getCustomExercises()
      if (error) throw error
      setExercises(data || [])
    } catch (error) {
      console.error('Error al cargar los ejercicios personalizados', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExercises()
  }, [])

  const handleEdit = (exercise) => {
    setEditingExercise({
      id: exercise.id,
      nombre: exercise.nombre,
      grupo_muscular: exercise.grupo_muscular,
      descripcion: exercise.descripcion || '',
      instrucciones: exercise.instrucciones || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingExercise.nombre || !editingExercise.grupo_muscular) {
      console.warn('El nombre y grupo muscular son obligatorios')
      return
    }

    try {
      setEditLoading(true)
      const { data, error } = await exercisesApi.update(editingExercise.id, {
        nombre: editingExercise.nombre,
        grupo_muscular: editingExercise.grupo_muscular,
        descripcion: editingExercise.descripcion,
        instrucciones: editingExercise.instrucciones
      })

      if (error) throw error

      setEditingExercise(null)
      loadExercises()
    } catch (error) {
      console.error('Error al actualizar el ejercicio', error)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteDialog) return

    try {
      setDeleteLoading(true)
      const { error } = await exercisesApi.delete(showDeleteDialog.id)
      if (error) throw error

      setShowDeleteDialog(null)
      loadExercises()
    } catch (error) {
      console.error('Error al eliminar el ejercicio', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditChange = (field, value) => {
    setEditingExercise(prev => ({ ...prev, [field]: value }))
  }

  // Si está cargando, mostrar contenido básico sin loading
  if (loading) {
    return (
      <div className="custom-exercises-manager">
        <div className="back-button-container">
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
            aria-label="Volver atrás"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>

        <div className="page-header">
          <div className="header-content">
            <h1>Mis Ejercicios Personalizados</h1>
            <p>Preparando tu lista de ejercicios...</p>
          </div>
        </div>

        <div className="empty-exercises">
          <div className="emoji">⏳</div>
          <h3>Cargando ejercicios...</h3>
          <p>Preparando tu lista de ejercicios personalizados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="custom-exercises-manager">
      {/* Header */}
      <div className="back-button-container">
        <button
          className="btn-back"
          onClick={() => navigate('/rutinas')}
          aria-label="Volver a Mis Rutinas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <div className="exercises-page-header">
        <div className="header-content">
          <h1>Mis Ejercicios Personalizados</h1>
          <p>Gestiona los ejercicios que has creado personalmente</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/rutina-personalizada?action=create-exercise')}
          >
            Crear nuevo ejercicio
          </button>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="empty-exercises">
          <div className="emoji">💪</div>
          <h3>Aún no tienes ejercicios personalizados</h3>
          <p>Crea tu primer ejercicio personalizado para agregarlo a tus rutinas</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/rutina-personalizada?action=create-exercise')}
          >
            Crear mi primer ejercicio
          </button>
        </div>
      ) : (
        <div className="exercises-grid">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-card-header">
                <div className="exercise-title">
                  <h3>{exercise.nombre}</h3>
                  <span className="exercise-group">{exercise.grupo_muscular}</span>
                </div>
                <div className="exercise-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(exercise)}
                    title="Editar ejercicio"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => setShowDeleteDialog(exercise)}
                    title="Eliminar ejercicio"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {exercise.descripcion && (
                <div className="exercise-description">
                  <p>{exercise.descripcion}</p>
                </div>
              )}

              {exercise.instrucciones && (
                <div className="exercise-instructions">
                  <h4>Instrucciones:</h4>
                  <p>{exercise.instrucciones}</p>
                </div>
              )}

              <div className="exercise-meta">
                <span className="created-date">
                  Creado: {new Date(exercise.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editingExercise && (
        <div className="edit-exercise-modal-overlay">
          <div className="edit-exercise-modal">
            <div className="edit-exercise-modal-header">
              <h3>Editar Ejercicio Personalizado</h3>
              <button
                className="edit-exercise-modal-close"
                onClick={() => setEditingExercise(null)}
              >
                ×
              </button>
            </div>

            <div className="edit-exercise-modal-content">
              <div className="custom-exercise-form">
                <div className="form-group">
                  <label htmlFor="edit-exercise-name">Nombre del ejercicio *</label>
                  <input
                    id="edit-exercise-name"
                    type="text"
                    value={editingExercise?.nombre || ''}
                    onChange={(e) => handleEditChange('nombre', e.target.value)}
                    placeholder="Ej: Press de banca inclinado"
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-exercise-group">Grupo muscular *</label>
                  <select
                    id="edit-exercise-group"
                    value={editingExercise?.grupo_muscular || ''}
                    onChange={(e) => handleEditChange('grupo_muscular', e.target.value)}
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
                  <label htmlFor="edit-exercise-description">Descripción</label>
                  <textarea
                    id="edit-exercise-description"
                    value={editingExercise?.descripcion || ''}
                    onChange={(e) => handleEditChange('descripcion', e.target.value)}
                    placeholder="Breve descripción del ejercicio..."
                    rows={3}
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-exercise-instructions">Instrucciones</label>
                  <textarea
                    id="edit-exercise-instructions"
                    value={editingExercise?.instrucciones || ''}
                    onChange={(e) => handleEditChange('instrucciones', e.target.value)}
                    placeholder="Instrucciones detalladas de cómo realizar el ejercicio..."
                    rows={4}
                    maxLength={500}
                  />
                </div>
              </div>
            </div>

            <div className="edit-exercise-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setEditingExercise(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteDialog && (
        <div className="delete-exercise-modal-overlay">
          <div className="delete-exercise-modal">
            <div className="delete-exercise-modal-header">
              <h3>Eliminar Ejercicio</h3>
              <button
                className="delete-exercise-modal-close"
                onClick={() => setShowDeleteDialog(null)}
              >
                ×
              </button>
            </div>

            <div className="delete-exercise-modal-content">
              <p>¿Estás seguro de que quieres eliminar el ejercicio <strong>"{showDeleteDialog?.nombre}"</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer y el ejercicio se eliminará de todas las rutinas donde esté siendo usado.</p>
            </div>

            <div className="delete-exercise-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteDialog(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomExercisesManager
