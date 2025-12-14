import React from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import RegistroComidas from '@/features/nutricion/components/registro-comidas/RegistroComidas'
import '@/styles/components/nutricion/NutricionPage.css'

const RegistroComidasPage = () => {
  return (
    <AuthOnly>
      <div className="nutricion-page registro-comidas-page">
        <RegistroComidas />
      </div>
    </AuthOnly>
  )
}

export default RegistroComidasPage

