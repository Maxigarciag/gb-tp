import React from 'react'
import PropTypes from 'prop-types'
import RutinaDiaItem from './RutinaDiaItem.jsx'
import styles from '../styles/rutinaCalendarioDias.module.css'

/**
 * Calendario pasivo específico de Rutina:
 * - Diferencia entrenamiento, descanso y vacío.
 * - Refleja el ciclo semanal/split.
 * - El día seleccionado solo cambia el detalle (no acciones de sesión).
 */
function RutinaCalendarioDias ({ diasRutina, diaSeleccionado, onSelectDia }) {
  return (
    <div className={styles.wrapper} aria-label="Calendario de rutina">
      <div className={styles.grid}>
        {diasRutina.map(([dia, descripcion, esDescanso, index]) => (
          <RutinaDiaItem
            key={dia}
            dia={dia}
            descripcion={descripcion}
            esDescanso={!!esDescanso}
            index={index}
            isSelected={diaSeleccionado === index}
            onSelect={onSelectDia}
          />
        ))}
      </div>
    </div>
  )
}

RutinaCalendarioDias.propTypes = {
  diasRutina: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
    )
  ).isRequired,
  diaSeleccionado: PropTypes.number,
  onSelectDia: PropTypes.func.isRequired
}

export default RutinaCalendarioDias

