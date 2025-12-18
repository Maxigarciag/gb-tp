import React, { useEffect } from 'react'
import NotaItem from './NotaItem'
import '@/styles/components/rutinas/notas/NotasModals.css'

function NotasHistorialModal ({ open, onClose, dayLabel, data, reload }) {
  useEffect(() => {
    if (open) {
      reload?.()
    }
  }, [open])

  if (!open) return null

  const { favoritas = [], regulares = [], loading, error } = data || {}

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <div>
            <p className="modal-subtitle">Historial de notas</p>
            <h3>{dayLabel || 'Día'}</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body modal-body--scroll">
          {loading && <div className="notas-empty">Cargando historial...</div>}
          {error && !loading && <div className="notas-empty error">No pudimos cargar el historial.</div>}
          {!loading && !error && favoritas.length === 0 && regulares.length === 0 && (
            <div className="notas-empty">Sin notas registradas.</div>
          )}

          {!loading && !error && favoritas.length > 0 && (
            <section className="notas-group">
              <div className="notas-group__header">
                <span className="chip chip-fav">Favoritas</span>
              </div>
              <div className="notas-list">
                {favoritas.map(note => (
                  <NotaItem
                    key={note.id}
                    note={note}
                    onToggleFavorite={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {!loading && !error && regulares.length > 0 && (
            <section className="notas-group">
              <div className="notas-group__header">
                <span className="chip chip-regular">Todas</span>
              </div>
              <div className="notas-list">
                {regulares.map(note => (
                  <NotaItem
                    key={note.id}
                    note={note}
                    onToggleFavorite={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotasHistorialModal

