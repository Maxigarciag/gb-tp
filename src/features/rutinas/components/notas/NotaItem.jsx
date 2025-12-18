import React from 'react'
import '@/styles/components/rutinas/notas/NotaItem.css'

function formatDate (value) {
  try {
    const date = new Date(value)
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
  } catch (_e) {
    return ''
  }
}

function NotaItem ({ note, onToggleFavorite, onEdit, onDelete }) {
  return (
    <div className="nota-item">
      <div className="nota-item__body">
        <p className="nota-item__text">{note.contenido}</p>
        <div className="nota-item__meta">
          <span>{formatDate(note.created_at)}</span>
          {note.es_favorita && <span className="tag-fav">★</span>}
        </div>
      </div>
      <div className="nota-item__actions">
        <button
          type="button"
          className={`icon-btn ${note.es_favorita ? 'is-fav' : ''}`}
          onClick={() => onToggleFavorite(note)}
          aria-label={note.es_favorita ? 'Quitar de favoritos' : 'Marcar como favorita'}
        >
          ★
        </button>
        <button type="button" className="icon-btn" onClick={() => onEdit(note)} aria-label="Editar nota">
          ✎
        </button>
        <button type="button" className="icon-btn danger" onClick={() => onDelete(note)} aria-label="Eliminar nota">
          🗑
        </button>
      </div>
    </div>
  )
}

export default NotaItem

