import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { FaArrowUp, FaArrowDown, FaEquals, FaPercentage, FaUtensils } from 'react-icons/fa'
import '@/styles/components/progreso/StudyComparison.css'

const StudyComparison = memo(function StudyComparison({ latestStudy, previousStudy }) {
  const comparisons = useMemo(() => {
    if (!latestStudy || !previousStudy) return null

    const comparisons = []

    // Comparación de grasa corporal
    if (latestStudy.bodyfat && previousStudy.bodyfat) {
      const diff = latestStudy.bodyfat.percentage - previousStudy.bodyfat.percentage
      const absDiff = Math.abs(diff)
      const isPositive = diff > 0
      const isNeutral = diff === 0

      comparisons.push({
        type: 'bodyfat',
        label: 'Grasa Corporal',
        icon: FaPercentage,
        latest: latestStudy.bodyfat.percentage.toFixed(1) + '%',
        previous: previousStudy.bodyfat.percentage.toFixed(1) + '%',
        diff: absDiff.toFixed(1) + '%',
        isPositive,
        isNeutral,
        color: latestStudy.bodyfat.color
      })
    }

    // Comparación de macros
    if (latestStudy.macros && previousStudy.macros) {
      const latestCal = latestStudy.macros.targetCalories
      const previousCal = previousStudy.macros.targetCalories
      const diff = latestCal - previousCal
      const absDiff = Math.abs(diff)
      const isPositive = diff > 0
      const isNeutral = diff === 0

      comparisons.push({
        type: 'calories',
        label: 'Calorías Objetivo',
        icon: FaUtensils,
        latest: latestCal + ' kcal',
        previous: previousCal + ' kcal',
        diff: absDiff + ' kcal',
        isPositive,
        isNeutral
      })

      // Comparación de proteínas
      const proteinDiff = latestStudy.macros.protein - previousStudy.macros.protein
      comparisons.push({
        type: 'protein',
        label: 'Proteínas',
        icon: FaUtensils,
        latest: latestStudy.macros.protein + 'g',
        previous: previousStudy.macros.protein + 'g',
        diff: Math.abs(proteinDiff) + 'g',
        isPositive: proteinDiff > 0,
        isNeutral: proteinDiff === 0
      })
    }

    return comparisons
  }, [latestStudy, previousStudy])

  if (!comparisons || comparisons.length === 0) {
    return null
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="study-comparison">
      <div className="comparison-header">
        <h4>Comparación con Estudio Anterior</h4>
        <span className="comparison-dates">
          {formatDate(previousStudy.fecha)} → {formatDate(latestStudy.fecha)}
        </span>
      </div>

      <div className="comparison-items">
        {comparisons.map((comp, index) => {
          const IconComponent = comp.icon
          let diffIcon = null
          let diffClass = 'neutral'

          if (comp.isNeutral) {
            diffIcon = <FaEquals />
            diffClass = 'neutral'
          } else if (comp.isPositive) {
            diffIcon = <FaArrowUp />
            diffClass = comp.type === 'bodyfat' ? 'negative' : 'positive'
          } else {
            diffIcon = <FaArrowDown />
            diffClass = comp.type === 'bodyfat' ? 'positive' : 'negative'
          }

          return (
            <div key={index} className="comparison-item">
              <div className="comparison-item-header">
                <IconComponent className="comparison-icon" />
                <span className="comparison-label">{comp.label}</span>
              </div>
              
              <div className="comparison-values">
                <div className="comparison-value-group">
                  <span className="comparison-value-label">Anterior:</span>
                  <span className="comparison-value">{comp.previous}</span>
                </div>
                
                <div className="comparison-arrow">→</div>
                
                <div className="comparison-value-group">
                  <span className="comparison-value-label">Actual:</span>
                  <span 
                    className="comparison-value latest"
                    style={comp.color ? { color: comp.color } : {}}
                  >
                    {comp.latest}
                  </span>
                </div>
              </div>

              <div className={`comparison-diff ${diffClass}`}>
                {diffIcon}
                <span>{comp.diff}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

StudyComparison.propTypes = {
  latestStudy: PropTypes.object,
  previousStudy: PropTypes.object
}

export default StudyComparison

