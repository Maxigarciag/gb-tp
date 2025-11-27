import React, { memo } from 'react'
import PropTypes from 'prop-types'

const SelectField = memo(function SelectField({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} className="macro-select">
      {children}
    </select>
  )
})

SelectField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

export default SelectField
