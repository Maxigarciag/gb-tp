import React, { Suspense, lazy } from 'react'
import AuthOnly from '../../components/layout/AuthOnly'
import HeaderTabs from '../../components/navigation/HeaderTabs'
import { FaPlay, FaChartLine } from 'react-icons/fa'
import CardLoadingFallback from '../../components/progreso/CardLoadingFallback'
import '../../styles/ProgresoPage.css'
import '../../styles/Evolution.css'

const ProfessionalWorkoutTracker = lazy(() => import('../../components/progreso/ProfessionalWorkoutTracker'))

const RutinaHoyPage = () => {
  const tabs = [
    { label: 'Rutina de hoy', to: '/progreso/rutina-hoy', icon: FaPlay },
    { label: 'Gráficos de ejercicios', to: '/progreso/graficos-ejercicios', icon: FaChartLine }
  ]

  return (
    <AuthOnly>
      <div className="progreso-page">
        <div className="evolution-container">
          {/* HeaderTabs integrado dentro de la card */}
          <div className="evolution-header-tabs">
            <HeaderTabs items={tabs} className="evolution-tabs-inline" />
          </div>

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

