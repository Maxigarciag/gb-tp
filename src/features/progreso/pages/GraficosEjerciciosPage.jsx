import React, { Suspense, lazy } from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import { FaPlay, FaChartLine } from 'react-icons/fa'
import Evolution from '@/features/progreso/components/Evolution'
import CardLoadingFallback from '@/features/progreso/components/CardLoadingFallback'
import '@/styles/components/progreso/ProgresoPage.css'

const GraficosEjerciciosPage = () => {
  const tabs = [
    { label: 'Rutina de hoy', to: '/progreso/rutina-hoy', icon: FaPlay },
    { label: 'Gráficos de ejercicios', to: '/progreso/graficos-ejercicios', icon: FaChartLine }
  ]

  return (
    <AuthOnly>
      <div className="progreso-page">
        <Suspense fallback={<CardLoadingFallback type="charts" />}>
          <Evolution 
            defaultSection="exerciseCharts" 
            hideGuide={true} 
            isInternalNavigation={true}
            navigationTabs={tabs}
          />
        </Suspense>
      </div>
    </AuthOnly>
  )
}

export default GraficosEjerciciosPage

