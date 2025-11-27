import React, { useState, useEffect, useCallback, memo } from 'react'
import { FaChartBar } from 'react-icons/fa'
import { useAuth } from '../../../contexts/AuthContext'
import { userProgress } from '../../../lib/supabase'
import CalculatorForm from './CalculatorForm'
import ResultsDisplay from './ResultsDisplay'
import { calculateResults } from '../../../utils/macroCalculations'
import '../../../styles/MacroCalculator.css'

const MacroCalculator = memo(function MacroCalculator() {
  const { userProfile } = useAuth()
  
  // Valores del perfil del usuario (se actualizan reactivamente)
  const profileGender = userProfile?.sexo === 'femenino' ? 'mujer' : 'hombre'
  const profileAge = userProfile?.edad || 25
  const profileWeight = userProfile?.peso || 75
  const profileHeight = userProfile?.altura || 175

  const [formData, setFormData] = useState({
    gender: profileGender,
    goal: 'deficit',
    age: profileAge,
    weight: profileWeight,
    height: profileHeight,
    bodyFat: undefined,
    activityLevel: 1.55,
    calorieAdjustment: 500,
  })
  const [results, setResults] = useState(null)

  // Cargar el último % de grasa registrado
  useEffect(() => {
    const loadLatestBodyFat = async () => {
      const { data } = await userProgress.getLatest()
      if (data?.porcentaje_grasa) {
        setFormData(prev => ({
          ...prev,
          bodyFat: data.porcentaje_grasa
        }))
      }
    }
    loadLatestBodyFat()
  }, [])

  // Actualizar formData cuando cambian los datos del perfil (peso, altura, edad, género)
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        gender: profileGender,
        age: profileAge,
        weight: profileWeight,
        height: profileHeight,
      }))
      // Limpiar resultados anteriores cuando cambian los datos del perfil
      setResults(null)
    }
  }, [profileGender, profileAge, profileWeight, profileHeight, userProfile])

  const handleCalculate = useCallback(() => {
    if (!formData.age || !formData.weight || !formData.height) {
      alert('Por favor, completa los campos obligatorios (edad, peso, altura)')
      return
    }
    setResults(calculateResults(formData))
  }, [formData])

  const handleReset = useCallback(() => {
    setFormData({
      gender: profileGender,
      goal: 'deficit',
      age: profileAge,
      weight: profileWeight,
      height: profileHeight,
      bodyFat: undefined,
      activityLevel: 1.55,
      calorieAdjustment: 500,
    })
    setResults(null)
  }, [profileGender, profileAge, profileWeight, profileHeight])

  const handleGoalChange = useCallback((newGoal) => {
    const adjustments = { deficit: 500, superavit: 300, mantenimiento: 0 }
    setFormData(prev => ({
      ...prev,
      goal: newGoal,
      calorieAdjustment: adjustments[newGoal] || 300
    }))
  }, [])

  return (
    <div className="macro-calculator">
      <div className="macro-calculator-container">
        <div className="macro-header">
          <FaChartBar className="macro-header-icon" />
          <h2 className="macro-header-title">Calculadora de Macronutrientes</h2>
        </div>
        <p className="macro-header-description">Calcula tu distribución óptima de macros</p>

        <CalculatorForm
          formData={formData}
          setFormData={setFormData}
          onGoalChange={handleGoalChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />

        {results && <ResultsDisplay results={results} />}
      </div>
    </div>
  )
})

export default MacroCalculator
