import React from 'react'
import PropTypes from 'prop-types'

const Stat = ({ label, value }) => (
  <div className="session-stat">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
)

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

const SessionProgress = ({ stats }) => {
  const { totalExercises, completedExercises, totalSeries, completedSeries } = stats
  return (
    <section className="session-progress">
      <Stat label="Ejercicios" value={`${completedExercises}/${totalExercises}`} />
      <Stat label="Series" value={`${completedSeries}/${totalSeries}`} />
    </section>
  )
}

SessionProgress.propTypes = {
  stats: PropTypes.shape({
    totalExercises: PropTypes.number,
    completedExercises: PropTypes.number,
    totalSeries: PropTypes.number,
    completedSeries: PropTypes.number
  }).isRequired
}

export default SessionProgress

