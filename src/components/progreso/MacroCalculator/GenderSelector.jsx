import React, { memo } from 'react'
import PropTypes from 'prop-types'

const GenderSelector = memo(function GenderSelector({ selected, onChange }) {
  return (
    <div className="macro-gender-container">
      <button
        type="button"
        onClick={() => onChange('hombre')}
        className={`macro-gender-btn ${selected === 'hombre' ? 'active' : ''}`}
      >
        Hombre
      </button>
      <button
        type="button"
        onClick={() => onChange('mujer')}
        className={`macro-gender-btn ${selected === 'mujer' ? 'active' : ''}`}
      >
        Mujer
      </button>
    </div>
  )
})

GenderSelector.propTypes = {
  selected: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default GenderSelector
