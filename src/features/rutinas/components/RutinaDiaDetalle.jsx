import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

/**
 * Detalle pasivo del día seleccionado.
 * Sin acciones, sin modales, solo lectura.
 */
function RutinaDiaDetalle ({ dia, ejercicios }) {
  const dayState = useMemo(() => {
    if (!dia) return 'empty'
    if (dia.es_descanso) return 'rest'
    if (!ejercicios || ejercicios.length === 0) return 'empty'
    return 'training'
  }, [dia, ejercicios])

  if (!dia) {
    return <div className="state-message">Seleccioná un día para ver el plan.</div>
  }

  if (dayState === 'rest') {
    return <div className="state-message">Día de descanso</div>
  }

  if (dayState === 'empty') {
    return <div className="state-message">Este día no tiene ejercicios configurados.</div>
  }

  return (
    <div className="day-detail-card">
      <div className="day-detail-header">
        <h2>{`Día ${dia.dia_semana}`}</h2>
        {dia.nombre_dia && !dia.es_descanso && (
          <p className="day-detail-subtitle">{dia.nombre_dia}</p>
        )}
      </div>
      <div className="exercise-list passive-list">
        {ejercicios.map((ej) => (
          <div key={ej.id || ej.nombre} className="exercise-item-passive">
            <div className="exercise-name">{ej.nombre}</div>
            <div className="exercise-meta">
              <span>{ej.grupo_muscular || '—'}</span>
              <span>•</span>
              <span>
                {ej.series
                  ? `${ej.series}x${ej.repeticiones_min || ''}-${ej.repeticiones_max || ''}`
                  : 'Sin reps'}
              </span>
              {ej.peso_sugerido !== undefined && ej.peso_sugerido !== null && (
                <>
                  <span>•</span>
                  <span>{`${ej.peso_sugerido} kg objetivo`}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

RutinaDiaDetalle.propTypes = {
  dia: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dia_semana: PropTypes.string,
    nombre_dia: PropTypes.string,
    es_descanso: PropTypes.bool
  }),
  ejercicios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nombre: PropTypes.string,
      grupo_muscular: PropTypes.string,
      series: PropTypes.number,
      repeticiones_min: PropTypes.number,
      repeticiones_max: PropTypes.number,
      peso_sugerido: PropTypes.number
    })
  )
}

export default RutinaDiaDetalle

