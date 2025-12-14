import React from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import { FaWeight, FaChartBar, FaHistory } from 'react-icons/fa'
import Evolution from '@/features/progreso/components/Evolution'
import '@/styles/components/progreso/ProgresoPage.css'

const GraficosPage = () => {
  const tabs = [
    { label: 'Registrar', to: '/progreso/registrar', icon: FaWeight },
    { label: 'Evolución', to: '/progreso/graficos', icon: FaChartBar },
    { label: 'Historial', to: '/progreso/historial', icon: FaHistory }
  ]

  return (
    <AuthOnly>
      <div className="progreso-page">
        <Evolution defaultSection="charts" hideGuide={true} navigationTabs={tabs} />
      </div>
    </AuthOnly>
  )
}

export default GraficosPage

