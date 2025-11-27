import React, { memo, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import GenderSelector from './GenderSelector'
import InputField from './InputField'
import SelectField from './SelectField'

const CalculatorForm = memo(function CalculatorForm({ formData, setFormData, onGoalChange, onCalculate, onReset }) {
  const adjustmentLabel = useMemo(() => {
    if (formData.goal === 'deficit') return 'Déficit Calórico Diario'
    if (formData.goal === 'superavit') return 'Superávit Calórico Diario'
    return 'Ajuste Calórico'
  }, [formData.goal])

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [setFormData])

  return (
    <>
      <p className="macro-gender-title">Selecciona tu género:</p>

      <GenderSelector
        selected={formData.gender}
        onChange={(gender) => handleFieldChange('gender', gender)}
      />

      <div className="macro-goal-section">
        <label className="macro-input-label">Objetivo</label>
        <SelectField value={formData.goal} onChange={(e) => onGoalChange(e.target.value)}>
          <option value="deficit">Pérdida de Grasa (Déficit Calórico)</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="superavit">Ganancia Muscular (Superávit Calórico)</option>
        </SelectField>
      </div>

      <div className="macro-inputs-grid">
        <InputField
          label="Edad"
          type="number"
          value={formData.age || ''}
          onChange={(e) => handleFieldChange('age', Number(e.target.value))}
          placeholder="Ej: 25"
          unit="años"
        />
        <InputField
          label="Peso"
          type="number"
          value={formData.weight || ''}
          onChange={(e) => handleFieldChange('weight', Number(e.target.value))}
          placeholder="Ej: 75"
          unit="kg"
        />
        <InputField
          label="Altura"
          type="number"
          value={formData.height || ''}
          onChange={(e) => handleFieldChange('height', Number(e.target.value))}
          placeholder="Ej: 175"
          unit="cm"
        />
        <InputField
          label="Grasa Corporal (Opcional)"
          type="number"
          value={formData.bodyFat || ''}
          onChange={(e) => handleFieldChange('bodyFat', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Ej: 15"
          unit="%"
          step="0.1"
        />
        <div className="macro-input-field">
          <label className="macro-input-label">Actividad Física</label>
          <SelectField
            value={String(formData.activityLevel)}
            onChange={(e) => handleFieldChange('activityLevel', Number(e.target.value))}
          >
            <option value="1.2">Sedentario</option>
            <option value="1.375">Ligera (1-3 días/semana)</option>
            <option value="1.55">Moderada (3-5 días/semana)</option>
            <option value="1.725">Intensa (6-7 días/semana)</option>
            <option value="1.9">Muy intensa (2 veces al día)</option>
          </SelectField>
        </div>
        <InputField
          label={adjustmentLabel}
          type="number"
          value={formData.calorieAdjustment || ''}
          onChange={(e) => handleFieldChange('calorieAdjustment', Number(e.target.value))}
          placeholder={formData.goal === 'deficit' ? 'Ej: 500' : 'Ej: 300'}
          unit="kcal"
        />
      </div>

      <div className="macro-buttons">
        <button type="button" onClick={onCalculate} className="macro-btn-primary">
          Calcular Macronutrientes
        </button>
        <button type="button" onClick={onReset} className="macro-btn-secondary">
          Limpiar
        </button>
      </div>
    </>
  )
})

CalculatorForm.propTypes = {
  formData: PropTypes.shape({
    gender: PropTypes.string.isRequired,
    goal: PropTypes.string.isRequired,
    age: PropTypes.number,
    weight: PropTypes.number,
    height: PropTypes.number,
    bodyFat: PropTypes.number,
    activityLevel: PropTypes.number.isRequired,
    calorieAdjustment: PropTypes.number
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  onGoalChange: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
}

export default CalculatorForm
