import React, { memo } from 'react'
import PropTypes from 'prop-types'

const SelectField = memo(function SelectField({ value, onChange, children }) {
  return (
    <select 
      className="macro-select"
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  )
})

SelectField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

export default SelectField

