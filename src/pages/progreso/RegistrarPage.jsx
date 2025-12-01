import React from 'react'
import AuthOnly from '../../components/layout/AuthOnly'
import { FaWeight, FaChartBar, FaHistory } from 'react-icons/fa'
import Evolution from '../../components/progreso/Evolution'
import '../../styles/components/progreso/ProgresoPage.css'

const RegistrarPage = () => {
  const tabs = [
    { label: 'Registrar', to: '/progreso/registrar', icon: FaWeight },
    { label: 'Evolución', to: '/progreso/graficos', icon: FaChartBar },
    { label: 'Historial', to: '/progreso/historial', icon: FaHistory }
  ]

  return (
    <AuthOnly>
      <div className="progreso-page">
        <Evolution defaultSection="weight" hideGuide={true} navigationTabs={tabs} />
      </div>
    </AuthOnly>
  )
}

export default RegistrarPage

