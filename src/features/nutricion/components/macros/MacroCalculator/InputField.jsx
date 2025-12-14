import React, { memo } from 'react'
import PropTypes from 'prop-types'

const InputField = memo(function InputField({ label, type, value, onChange, placeholder, unit, step }) {
  return (
    <div className="macro-input-field">
      <label className="macro-input-label">{label}</label>
      <div className="macro-input-wrapper">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="macro-input"
          step={step}
        />
        {unit && <span className="macro-input-unit">{unit}</span>}
      </div>
    </div>
  )
})

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  unit: PropTypes.string,
  step: PropTypes.string
}

export default InputField

