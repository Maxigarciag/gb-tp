import React, { Suspense, lazy } from 'react'
import AuthOnly from '@/features/layout/components/AuthOnly'
import HeaderTabs from '@/features/navigation/components/HeaderTabs'
import { FaPlay, FaChartLine } from 'react-icons/fa'
import CardLoadingFallback from '@/features/progreso/components/CardLoadingFallback'
import '@/styles/components/progreso/ProgresoPage.css'
import '@/styles/components/progreso/Evolution.css'
import { useIsMobile } from '@/hooks/useIsMobile'

const ProfessionalWorkoutTracker = lazy(() => import('@/features/progreso/components/ProfessionalWorkoutTracker'))

const RutinaHoyPage = () => {
  const isMobile = useIsMobile()
  const tabs = [
    { label: 'Rutina de hoy', to: '/progreso/rutina-hoy', icon: FaPlay },
    { label: 'Gráficos de ejercicios', to: '/progreso/graficos-ejercicios', icon: FaChartLine }
  ]

  return (
    <AuthOnly>
      <div className="progreso-page">
        <div className="evolution-container">
          {/* HeaderTabs integrado dentro de la card - Oculto en móviles */}
          {!isMobile && (
            <div className="evolution-header-tabs">
              <HeaderTabs items={tabs} className="evolution-tabs-inline" />
            </div>
          )}

          {/* Contenido */}
          <div className="card-section">
            <Suspense fallback={<CardLoadingFallback type="routine" />}>
              <ProfessionalWorkoutTracker />
            </Suspense>
          </div>
        </div>
      </div>
    </AuthOnly>
  )
}

export default RutinaHoyPage

