import React, { memo } from 'react'
import PropTypes from 'prop-types'
import ResultItem from './ResultItem'

const ResultsDisplay = memo(function ResultsDisplay({ results }) {
  if (!results) return null

  return (
    <div className="macro-results">
      <ResultItem label="Tasa Metabólica Basal (BMR)" value={Math.round(results.bmr)} unit="kcal/día" />
      <ResultItem label="Gasto Energético Diario (TDEE)" value={Math.round(results.maintenanceCalories)} unit="kcal/día" />
      <ResultItem label="Calorías Objetivo" value={Math.round(results.targetCalories)} unit="kcal/día" />
      <ResultItem label="Proteínas" value={results.protein} unit="g/día" />
      <ResultItem label="Carbohidratos" value={results.carbs} unit="g/día" />
      <ResultItem label="Grasas" value={results.fats} unit="g/día" />
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
    fats: PropTypes.number.isRequired,
  })
}

export default ResultsDisplay

