import React, { useState } from 'react'
import PropTypes from 'prop-types'

const SeriesForm = ({ onSave, disabled, repsMin, repsMax }) => {
  const [reps, setReps] = useState('')
  const [peso, setPeso] = useState('')
  const [rpe, setRpe] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const repsPlaceholder = repsMin && repsMax ? `${repsMin}-${repsMax} reps sugeridas` : 'Repeticiones'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      setSaving(true)
      await onSave({ reps, peso, rpe })
      setReps('')
      setPeso('')
      setRpe('')
    } catch (err) {
      setError(err.message || 'No se pudo guardar la serie')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="series-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Reps
          <input
            type="number"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            disabled={disabled || saving}
            placeholder={repsPlaceholder}
          />
        </label>
        <label>
          Peso (kg)
          <input
            type="number"
            min="0"
            step="0.5"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            required
            disabled={disabled || saving}
          />
        </label>
        <label>
          RPE (1-10, opcional)
          <input
            type="number"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={disabled || saving}>
        {saving ? 'Guardando...' : 'Guardar serie'}
      </button>
    </form>
  )
}

SeriesForm.propTypes = {
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  repsMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  repsMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default SeriesForm

