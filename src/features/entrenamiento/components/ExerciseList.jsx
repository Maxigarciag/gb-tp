import React from 'react'
import PropTypes from 'prop-types'
import ExerciseCard from './ExerciseCard'

const ExerciseList = ({ exercises, exerciseStates, onSaveSeries, sessionCompleted, recommendedId }) => {
  return (
    <section className="exercise-list">
      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id || ex.routine_exercise_id}
          exercise={ex}
          progress={exerciseStates[ex.id] || { state: 'pending', completedSeries: 0, totalSeries: ex.series || 3 }}
          onSaveSeries={onSaveSeries}
          disabled={sessionCompleted}
          isRecommended={recommendedId === ex.id}
        />
      ))}
    </section>
  )
}

ExerciseList.propTypes = {
  exercises: PropTypes.array.isRequired,
  exerciseStates: PropTypes.object.isRequired,
  onSaveSeries: PropTypes.func.isRequired,
  sessionCompleted: PropTypes.bool,
  recommendedId: PropTypes.string
}

export default ExerciseList

