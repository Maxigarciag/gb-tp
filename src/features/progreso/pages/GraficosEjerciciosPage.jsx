import React, { Suspense } from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import Evolution from '@/features/progreso/components/Evolution'
import CardLoadingFallback from '@/features/progreso/components/CardLoadingFallback'
import '@/styles/components/progreso/ProgresoPage.css'

const GraficosEjerciciosPage = () => {
  return (
    <AuthOnly>
      <div className="progreso-page">
        <Suspense fallback={<CardLoadingFallback type="charts" />}>
          <Evolution 
            defaultSection="exerciseCharts" 
            hideGuide={true} 
            isInternalNavigation={true}
          />
        </Suspense>
      </div>
    </AuthOnly>
  )
}

export default GraficosEjerciciosPage
 
