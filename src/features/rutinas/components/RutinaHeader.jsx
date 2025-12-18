import React from 'react'
import PropTypes from 'prop-types'

/**
 * Header pasivo de Rutina v2.
 * Muestra nombre, tipo y estado del día seleccionado.
 * Sin acciones ni métricas.
 */
function RutinaHeader ({ nombre, tipo, dayState, diasSemana, onGestionRutinas, onEditar, onEjercicios }) {
  const estadoLabel = dayState === 'training'
    ? 'Día de entrenamiento'
    : dayState === 'rest'
      ? 'Día de descanso'
      : 'Día sin ejercicios'

  return (
    <header className="rutina-header">
      <div className="rutina-header__info">
        <div className="rutina-header__title">
          <p className="rutina-eyebrow">Rutina</p>
          <h1>{nombre || 'Mi Rutina'}</h1>
          <div className="rutina-header__meta">
            <span className="rutina-pill rutina-pill--type">{tipo || 'Personalizada'}</span>
            {diasSemana !== undefined && (
              <span className="rutina-pill rutina-pill--days">{`${diasSemana} días/semana`}</span>
            )}
            <span className={`rutina-pill rutina-pill--state rutina-pill--${dayState || 'empty'}`}>
              {estadoLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="rutina-header__actions">
        <button type="button" className="rutina-header__btn primary" onClick={onEditar}>
          <span className="btn-icon" aria-hidden="true">✏️</span>
          Editar rutina
        </button>
        <button type="button" className="rutina-header__btn secondary" onClick={onGestionRutinas}>
          <span className="btn-icon" aria-hidden="true">↻</span>
          Gestionar rutinas
        </button>
        <button type="button" className="rutina-header__btn tertiary" onClick={onEjercicios}>
          <span className="btn-icon" aria-hidden="true">🏋️</span>
          Ejercicios
        </button>
      </div>
    </header>
  )
}

RutinaHeader.propTypes = {
  nombre: PropTypes.string,
  tipo: PropTypes.string,
  dayState: PropTypes.oneOf(['training', 'rest', 'empty']),
  diasSemana: PropTypes.number,
  onGestionRutinas: PropTypes.func,
  onEditar: PropTypes.func,
  onEjercicios: PropTypes.func
}

export default RutinaHeader

