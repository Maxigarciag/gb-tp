import React, { useEffect, useState } from 'react'
import '@/styles/components/rutinas/notas/NotasModals.css'

function NotasFormModal ({ open, onClose, onSave, initialValues }) {
  const [contenido, setContenido] = useState('')
  const [esFavorita, setEsFavorita] = useState(false)

  useEffect(() => {
    if (open) {
      setContenido(initialValues?.contenido || '')
      setEsFavorita(initialValues?.es_favorita || false)
    }
  }, [open, initialValues])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!contenido.trim()) return
    onSave(contenido.trim(), esFavorita)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{initialValues ? 'Editar nota' : 'Nueva nota'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="modal-label">
            Contenido
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={4}
              placeholder="Escribe tu nota..."
            />
          </label>
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={esFavorita}
              onChange={(e) => setEsFavorita(e.target.checked)}
            />
            Marcar como favorita
          </label>
          <div className="modal-actions">
            <button type="button" className="cta secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="cta primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotasFormModal

