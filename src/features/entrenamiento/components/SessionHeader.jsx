import React from 'react'
import PropTypes from 'prop-types'

const SessionHeader = ({
  routineName,
  dayName,
  progressPercent,
  onFinish,
  canFinish,
  isCompleting,
  isCompleted
}) => {
  const finishButtonClasses = [
    'btn-finish',
    isCompleting ? 'is-loading' : '',
    isCompleted ? 'is-completed' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className="entrenamiento-header">
      <div className="entrenamiento-header__info">
        <div className="entrenamiento-header__title">
          <p className="eyebrow">Sesión de entrenamiento</p>
          <h1>{routineName}</h1>
          <span className="day-pill">{dayName}</span>
        </div>
        <div className="entrenamiento-header__progress">
          <span className="progress-label">Progreso</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              role="progressbar"
            />
          </div>
          <span className="progress-value">{progressPercent}%</span>
        </div>
      </div>

      <div className="entrenamiento-header__actions">
        <button
          className={finishButtonClasses}
          onClick={onFinish}
          disabled={!canFinish || isCompleting || isCompleted}
          aria-live="polite"
        >
          {isCompleted ? (
            <>
              <span className="btn-finish__icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" role="presentation" focusable="false">
                  <path d="M16.7 5.7a1 1 0 0 0-1.4-1.4L8 11.6 4.7 8.3a1 1 0 0 0-1.4 1.4l4 4a1 1 0 0 0 1.4 0l8-8Z" />
                </svg>
              </span>
              <span className="btn-finish__label">Sesión completada</span>
            </>
          ) : isCompleting ? (
            <span className="btn-finish__label">Finalizando…</span>
          ) : (
            <span className="btn-finish__label">Finalizar sesión</span>
          )}
        </button>
      </div>
    </header>
  )
}

SessionHeader.propTypes = {
  routineName: PropTypes.string.isRequired,
  dayName: PropTypes.string,
  progressPercent: PropTypes.number.isRequired,
  onFinish: PropTypes.func.isRequired,
  canFinish: PropTypes.bool.isRequired,
  isCompleting: PropTypes.bool,
  isCompleted: PropTypes.bool
}

export default SessionHeader

