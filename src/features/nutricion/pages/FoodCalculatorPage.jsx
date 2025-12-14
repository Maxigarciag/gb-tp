import React from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import FoodMacroCalculator from '@/features/nutricion/components/registro-comidas/FoodMacroCalculator'
import '@/styles/components/nutricion/NutricionPage.css'

const FoodCalculatorPage = () => {
  return (
    <AuthOnly>
      <div className="nutricion-page">
        <div className="nutricion-simple-header">
          <h1 className="nutricion-simple-title">Calculadora por Alimento</h1>
          <p className="nutricion-simple-text">
            Calcula las calorías y macros de un alimento por porción y guarda el resultado para usarlo en tus comidas.
          </p>
        </div>

        <div className="nutricion-card macro-page-card">
          <FoodMacroCalculator />
        </div>
      </div>
    </AuthOnly>
  )
}

export default FoodCalculatorPage


