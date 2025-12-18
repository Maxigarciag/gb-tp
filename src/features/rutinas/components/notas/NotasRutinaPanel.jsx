import React, { useEffect, useMemo, useState } from 'react'
import { useRoutineNotesStore } from '@/stores'
import NotaItem from './NotaItem'
import NotasFormModal from './NotasFormModal'
import NotasHistorialModal from './NotasHistorialModal'
import '@/styles/components/rutinas/notas/NotasRutinaPanel.css'

function NotasRutinaPanel ({ dayId, dayLabel = 'Hoy' }) {
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const {
    notesByDay,
    historyByDay,
    loadNotes,
    loadHistory,
    createNote,
    updateNote,
    toggleFavorite,
    deleteNote
  } = useRoutineNotesStore()

  const dayState = notesByDay[dayId] || {}
  const { favoritas = [], regulares = [], sessionNotes = [], hasMoreFavoritas, hasMoreRegulares, loading, error } = dayState

  useEffect(() => {
    if (dayId) {
      loadNotes(dayId)
    }
  }, [dayId])

  const hasNotes = useMemo(() => (
    (favoritas?.length || 0) +
    (regulares?.length || 0) +
    (sessionNotes?.length || 0) > 0
  ), [favoritas, regulares, sessionNotes])

  const handleAdd = () => {
    setEditingNote(null)
    setShowForm(true)
  }

  const handleSave = async (contenido, esFavorita) => {
    if (!dayId || !contenido) return
    if (editingNote) {
      await updateNote(editingNote.id, { contenido, es_favorita: esFavorita }, dayId)
    } else {
      await createNote(dayId, { contenido, esFavorita })
    }
    setShowForm(false)
    setEditingNote(null)
  }

  const handleToggleFavorite = async (note) => {
    await toggleFavorite(note.id, !note.es_favorita, dayId)
  }

  const handleDelete = async (note) => {
    await deleteNote(note.id, dayId)
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleOpenHistory = () => {
    if (dayId) {
      loadHistory(dayId)
    }
    setShowHistory(true)
  }

  const historyState = historyByDay[dayId] || { favoritas: [], regulares: [], loading: false, error: null }

  return (
    <div className="notas-panel">
      <div className="notas-header">
        <div>
          <p className="notas-title">Notas</p>
          <p className="notas-subtitle">{dayLabel || 'Día de rutina'}</p>
          <p className="notas-helper">Anotá tips rápidos del día (ajustes de peso/repes, cues técnicos, molestias leves). Se muestran 3 recientes; las favoritas se quedan.</p>
        </div>
        <button type="button" className="cta primary nota-add-btn" onClick={handleAdd}>
          Añadir
        </button>
      </div>

      {loading && (
        <div className="notas-empty">Cargando notas...</div>
      )}

      {error && !loading && (
        <div className="notas-empty error">No pudimos cargar las notas.</div>
      )}

      {!loading && !error && !hasNotes && (
        <div className="notas-empty">Sin notas aún.</div>
      )}

      {!loading && !error && hasNotes && (
        <div className="notas-content">
          {favoritas.length > 0 && (
            <div className="notas-group">
              <div className="notas-group__header">
                <span className="chip chip-fav">Favoritas</span>
              </div>
              <div className="notas-list">
                {favoritas.map(note => (
                  <NotaItem
                    key={note.id}
                    note={note}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {regulares.length > 0 && (
            <div className="notas-group">
              <div className="notas-group__header">
                <span className="chip chip-regular">Recientes</span>
              </div>
              <div className="notas-list">
                {regulares.map(note => (
                  <NotaItem
                    key={note.id}
                    note={note}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {sessionNotes.length > 0 && (
            <div className="notas-group">
              <div className="notas-group__header">
                <span className="chip chip-session">Notas de entrenamiento</span>
              </div>
              <div className="notas-session-list">
                {sessionNotes.map(sn => (
                  <div key={sn.id} className="nota-session">
                    <div className="nota-session__meta">
                      <span className="nota-session__date">{sn.fecha || new Date(sn.created_at).toLocaleDateString()}</span>
                      {sn.calificacion ? <span className="nota-session__rating">★ {sn.calificacion}</span> : null}
                    </div>
                    <p className="nota-session__text">{sn.contenido}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(hasMoreFavoritas || hasMoreRegulares) && !loading && !error && (
        <button type="button" className="cta secondary notas-history-btn" onClick={handleOpenHistory}>
          Ver historial
        </button>
      )}

      {showForm && (
        <NotasFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingNote(null) }}
          onSave={handleSave}
          initialValues={editingNote ? { contenido: editingNote.contenido, es_favorita: editingNote.es_favorita } : undefined}
        />
      )}

      {showHistory && (
        <NotasHistorialModal
          open={showHistory}
          onClose={() => setShowHistory(false)}
          dayLabel={dayLabel}
          data={historyState}
          reload={() => loadHistory(dayId)}
        />
      )}
    </div>
  )
}

export default NotasRutinaPanel

