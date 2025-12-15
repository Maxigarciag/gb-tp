import React from 'react'
import PropTypes from 'prop-types'
import SeriesForm from './SeriesForm'

const ExerciseCard = ({ exercise, progress, onSaveSeries, disabled, isRecommended }) => {
  const { state, completedSeries, totalSeries } = progress

  return (
    <div className={`exercise-card state-${state} ${disabled ? 'exercise-card-disabled' : ''}`}>
      <div className="exercise-card__header">
        <div>
          <p className="eyebrow">{exercise.grupo_muscular || 'Ejercicio'}</p>
          <h3>{exercise.nombre}</h3>
          <p className="meta">
            {totalSeries} series • Reps {exercise.repeticiones_min}-{exercise.repeticiones_max}{' '}
            {exercise.peso_sugerido ? `• Peso sug. ${exercise.peso_sugerido}kg` : ''}
          </p>
        </div>
        <div className="exercise-status">
          {isRecommended && <span className="badge badge-primary">Siguiente</span>}
          <span className="badge status-badge">{state === 'completed' ? 'Completado' : state === 'in_progress' ? 'En progreso' : 'Pendiente'}</span>
          <span className="badge badge-count muted">{completedSeries}/{totalSeries} series</span>
        </div>
      </div>

      {!disabled && state !== 'completed' && (
        <SeriesForm
          onSave={({ reps, peso, rpe }) => onSaveSeries(exercise.id, { reps, peso, rpe })}
          disabled={disabled}
          repsMin={exercise.repeticiones_min}
          repsMax={exercise.repeticiones_max}
        />
      )}

      {disabled && <p className="muted-text">Modo lectura: no se pueden registrar series.</p>}
    </div>
  )
}

ExerciseCard.propTypes = {
  exercise: PropTypes.object.isRequired,
  progress: PropTypes.shape({
    state: PropTypes.string,
    completedSeries: PropTypes.number,
    totalSeries: PropTypes.number
  }).isRequired,
  onSaveSeries: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isRecommended: PropTypes.bool
}

export default ExerciseCard

