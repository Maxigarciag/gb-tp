import React, { memo } from 'react'
import PropTypes from 'prop-types'

const GenderSelector = memo(function GenderSelector({ selected, onChange }) {
  return (
    <div className="macro-gender-container">
      <button 
        type="button"
        className={`macro-gender-btn ${selected === 'hombre' ? 'active' : ''}`}
        onClick={() => onChange('hombre')}
      >
        Hombre
      </button>
      <button 
        type="button"
        className={`macro-gender-btn ${selected === 'mujer' ? 'active' : ''}`}
        onClick={() => onChange('mujer')}
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

