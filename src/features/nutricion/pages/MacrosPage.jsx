import React from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import MacroCalculator from '@/features/nutricion/components/macros/MacroCalculator/MacroCalculator'
import '@/styles/components/nutricion/NutricionPage.css'

const MacrosPage = () => {
  return (
    <AuthOnly>
      <div className="nutricion-page">
        <div className="nutricion-card macro-page-card">
          <MacroCalculator />
        </div>
      </div>
    </AuthOnly>
  )
}

export default MacrosPage

