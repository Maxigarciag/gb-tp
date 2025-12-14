import React, { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChartBar, FaSave, FaHistory } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { userProgress, bodyCompositionStudies } from '@/lib/supabase'
import CalculatorForm from './CalculatorForm'
import ResultsDisplay from './ResultsDisplay'
import { calculateResults } from '@/utils/macroCalculations'
import '@/styles/components/nutricion/MacroCalculator.css'

const MacroCalculator = memo(function MacroCalculator() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  
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
  const [hasStudies, setHasStudies] = useState(false)
  const [saving, setSaving] = useState(false)

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

  // Verificar si hay estudios previos
  useEffect(() => {
    const checkStudies = async () => {
      if (userProfile?.id) {
        const { data } = await bodyCompositionStudies.getLatestStudy()
        setHasStudies(!!data)
      }
    }
    checkStudies()
  }, [userProfile?.id])

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

  // Guardar estudio
  const handleSaveStudy = useCallback(async () => {
    if (!results || !userProfile?.id) return

    setSaving(true)
    try {
      const studyData = {
        fecha: new Date().toISOString().slice(0, 10),
        peso: formData.weight,
        macros: {
          bmr: results.bmr,
          tdee: results.maintenanceCalories,
          targetCalories: results.targetCalories,
          protein: results.protein,
          carbs: results.carbs,
          fats: results.fats,
          goal: formData.goal,
          activityLevel: formData.activityLevel
        }
      }

      const { error } = await bodyCompositionStudies.saveStudy(studyData)
      if (error) throw error

      // Redirigir al tab de estudios después de guardar
      setTimeout(() => {
        navigate('/progreso/composicion?tab=studies')
      }, 500)
    } catch (error) {
      console.error('Error al guardar estudio:', error)
      alert('❌ Error al guardar el estudio. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }, [results, formData, userProfile])

  return (
    <div className="macro-calculator-container">
      <div className="macro-header">
        <div className="macro-header-left">
          <FaChartBar className="macro-header-icon" />
          <div>
            <h2 className="macro-header-title">Calculadora de Macronutrientes</h2>
            <p className="macro-header-description">Calcula tu distribución óptima de macros</p>
          </div>
        </div>
        {hasStudies && (
          <button 
            className="btn-view-studies"
            onClick={() => navigate('/progreso/composicion?tab=studies')}
          >
            <FaHistory /> Ver Mis Estudios
          </button>
        )}
      </div>

      <CalculatorForm
        formData={formData}
        setFormData={setFormData}
        onGoalChange={handleGoalChange}
        onCalculate={handleCalculate}
        onReset={handleReset}
      />

      {results && (
        <>
          <ResultsDisplay results={results} />
          {userProfile?.id && (
            <button 
              className="btn-save-study"
              onClick={handleSaveStudy}
              disabled={saving}
            >
              <FaSave /> {saving ? 'Guardando...' : 'Guardar Estudio'}
            </button>
          )}
        </>
      )}
    </div>
  )
})

export default MacroCalculator

