/**
 * CalendarioSemanal — selector de día para la página /rutina
 *
 * Muestra Lunes–Domingo de la semana actual con fechas reales,
 * estado de cada día (completed / today / rest / pending / missed)
 * y el nombre del split (Push, Pull, Piernas…).
 *
 * Todas las celdas son clickables: los días de descanso muestran
 * el mensaje de recuperación en el panel inferior.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { CheckCircle, Coffee, Clock, AlertCircle, Dumbbell, Calendar } from 'lucide-react'
import '@/styles/components/rutinas/CalendarioSemanal.css'

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const STATUS_ICON = {
  completed:  <CheckCircle  size={16} />,
  today:      <Dumbbell     size={16} />,
  rest:       <Coffee       size={16} />,
  pending:    <Clock        size={16} />,
  missed:     <AlertCircle  size={16} />,
  'no-routine': <Calendar   size={16} />,
}

const STATUS_LABEL = {
  completed:    'Listo',
  today:        'Hoy',
  rest:         'Desc.',
  pending:      'Próx.',
  missed:       'Omit.',
  'no-routine': '—',
}

// Esqueleto de loading
const SkeletonCell = () => (
  <div className="cal-cell cal-cell--skeleton" aria-hidden="true">
    <div className="cal-skel-line cal-skel-short" />
    <div className="cal-skel-line cal-skel-num"   />
    <div className="cal-skel-line cal-skel-label" />
  </div>
)

// ────────────────────────────────────────────────────────────────────────────
// Componente
// ────────────────────────────────────────────────────────────────────────────

function CalendarioSemanal({ weekDays, selectedDayIndex, onDiaClick, loading }) {
  // Si todavía no cargó, mostrar esqueletos
  if (loading && weekDays.length === 0) {
    return (
      <div className="cal-semana" role="group" aria-label="Semana de entrenamiento">
        {Array.from({ length: 7 }).map((_, i) => <SkeletonCell key={i} />)}
      </div>
    )
  }

  return (
    <div className="cal-semana" role="group" aria-label="Semana de entrenamiento">
      {weekDays.map((day, i) => {
        const isSelected = selectedDayIndex === i
        const isRest     = day.status === 'rest' || day.status === 'no-routine'
        const label      = day.muscleGroup
          ? (day.muscleGroup.length > 6 ? day.muscleGroup.slice(0, 5) + '…' : day.muscleGroup)
          : (isRest ? 'Desc.' : '—')

        return (
          <motion.button
            key={day.isoDate || i}
            type="button"
            className={[
              'cal-cell',
              `cal-cell--${day.status}`,
              isSelected ? 'cal-cell--selected' : '',
              day.isToday  ? 'cal-cell--today-ring' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onDiaClick(i)}
            aria-selected={isSelected}
            aria-label={`${day.dayName} ${day.dayNumber}, ${day.status === 'completed' ? 'completado' : day.muscleGroup || 'descanso'}`}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.96 }}
            initial={false}
          >
            {/* Letra del día */}
            <span className="cal-cell__letter">{day.dayLetter}</span>

            {/* Número del mes */}
            <span className="cal-cell__number">{day.dayNumber}</span>

            {/* Ícono de estado */}
            <span className={`cal-cell__icon cal-cell__icon--${day.status}`}>
              {STATUS_ICON[day.status] ?? STATUS_ICON['no-routine']}
            </span>

            {/* Nombre del split / estado */}
            <span className="cal-cell__label">{label}</span>

            {/* Badge "Hoy" */}
            {day.isToday && (
              <span className="cal-cell__today-badge">hoy</span>
            )}

            {/* Check de completado (esquina) */}
            {day.status === 'completed' && (
              <span className="cal-cell__done" aria-hidden="true">✓</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

CalendarioSemanal.propTypes = {
  weekDays:         PropTypes.array.isRequired,
  selectedDayIndex: PropTypes.number,
  onDiaClick:       PropTypes.func.isRequired,
  loading:          PropTypes.bool,
}

CalendarioSemanal.defaultProps = {
  loading: false,
}

export default CalendarioSemanal
