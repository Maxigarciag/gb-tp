import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ResultItem from './ResultItem'

const ResultsDisplay = memo(function ResultsDisplay({ results }) {
  return (
    <div className="macro-results">
      <ResultItem label="Metabolismo Basal (TMB)" value={results.bmr} unit="kcal" />
      <ResultItem label="Calorías de Mantenimiento" value={results.maintenanceCalories} unit="kcal" />
      <ResultItem label="Calorías Objetivo" value={results.targetCalories} unit="kcal" />
      <ResultItem label="Proteínas" value={results.protein} unit="g" />
      <ResultItem label="Hidratos de Carbono" value={results.carbs} unit="g" />
      <ResultItem label="Grasas" value={results.fats} unit="g" />
    </div>
  )
})

ResultsDisplay.propTypes = {
  results: PropTypes.shape({
    bmr: PropTypes.number.isRequired,
    maintenanceCalories: PropTypes.number.isRequired,
    targetCalories: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fats: PropTypes.number.isRequired
  }).isRequired
}

export default ResultsDisplay
