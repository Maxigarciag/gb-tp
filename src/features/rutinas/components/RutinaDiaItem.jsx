import React from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/rutinaCalendarioDias.module.css'

/**
 * Ítem pasivo de día de rutina (sin lógica de entrenamiento).
 * Muestra nombre, índice, estado (entreno/descanso/vacío) y selección.
 */
function RutinaDiaItem ({ dia, descripcion, esDescanso, index, isSelected, onSelect }) {
  const isEmpty = !descripcion || descripcion === 'Sin datos'
  const dayType = esDescanso ? 'rest' : (isEmpty ? 'empty' : 'training')

  return (
    <button
      type="button"
      className={[
        styles.dayCard,
        styles[dayType],
        isSelected ? styles.selected : ''
      ].join(' ')}
      onClick={() => onSelect(index)}
      aria-pressed={isSelected}
      aria-label={`${dia}: ${descripcion || 'Sin datos'}`}
    >
      <div className={styles.dayHeader}>
        <span className={styles.dayName}>{dia}</span>
        <span className={styles.dayIndex}>{index + 1}</span>
      </div>
      <div className={styles.dayBody}>
        <span className={styles.dayDesc}>
          {esDescanso ? 'Descanso' : (descripcion || 'Sin ejercicios')}
        </span>
      </div>
      <div className={styles.dayFooter}>
        {dayType === 'training' && <span className={styles.badgeTraining}>Entreno</span>}
        {dayType === 'rest' && <span className={styles.badgeRest}>Rest</span>}
        {dayType === 'empty' && <span className={styles.badgeEmpty}>Vacío</span>}
      </div>
    </button>
  )
}

RutinaDiaItem.propTypes = {
  dia: PropTypes.string.isRequired,
  descripcion: PropTypes.string,
  esDescanso: PropTypes.bool,
  index: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired
}

export default RutinaDiaItem

