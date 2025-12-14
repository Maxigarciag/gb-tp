import React, { memo } from 'react'
import PropTypes from 'prop-types'

const ResultItem = memo(function ResultItem({ label, value, unit }) {
  return (
    <div className="macro-result-item">
      <span className="macro-result-label">{label}</span>
      <div className="macro-result-value-container">
        <span className="macro-result-value">{value}</span>
        {unit && <span className="macro-result-unit">{unit}</span>}
      </div>
    </div>
  )
})

ResultItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string
}

export default ResultItem

