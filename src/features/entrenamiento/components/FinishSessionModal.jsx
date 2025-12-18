import React, { useState } from 'react'
import PropTypes from 'prop-types'

const FinishSessionModal = ({ isOpen, onClose, onConfirm, canFinish }) => {
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState('3')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!canFinish) {
      setError('Aún no cumples los mínimos para cerrar la sesión (≥30% series y al menos 1 ejercicio).')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await onConfirm(notes, Number(rating))
    } catch (err) {
      setError(err.message || 'No se pudo finalizar la sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Finalizar sesión</h3>
        <p className="muted-text">Confirma que terminaste tu entrenamiento.</p>
        <form onSubmit={handleConfirm} className="finish-form">
          <label>
            Notas (opcional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Cómo te sentiste, qué ajustar la próxima vez, calificación personal"
            />
          </label>
          <label>
            Calificación (1-5)
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={!canFinish || loading}>
              {loading ? 'Guardando...' : 'Finalizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

FinishSessionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  canFinish: PropTypes.bool.isRequired
}

export default FinishSessionModal

