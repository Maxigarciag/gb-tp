import React, { Suspense, lazy, useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaPercentage, FaUtensils, FaFlask } from 'react-icons/fa'

import AuthOnly from '../../components/layout/AuthOnly'
import HeaderTabs from '../../components/navigation/HeaderTabs'
import CardLoadingFallback from '../../components/progreso/CardLoadingFallback'

import '../../styles/components/progreso/ProgresoPage.css'
import '../../styles/components/progreso/Evolution.css'
import { useIsMobile } from '../../hooks/useIsMobile'

const BodyFatCalculator = lazy(() => import('../../components/progreso/BodyFatCalculator'))
const MacroCalculator = lazy(() => import('../../components/progreso/MacroCalculator/MacroCalculator'))
const BodyCompositionStudies = lazy(() => import('../../components/progreso/BodyCompositionStudies'))

const ComposicionPage = () => {
  const [searchParams] = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(urlTab || 'bodyfat')
  const isMobile = useIsMobile()

  // Sincronizar con URL
  useEffect(() => {
    if (urlTab && ['bodyfat', 'macros', 'studies'].includes(urlTab)) {
      setActiveTab(urlTab)
    }
  }, [urlTab])

  const tabs = [
    { label: 'Grasa Corporal', to: '/progreso/composicion', icon: FaPercentage, id: 'bodyfat' },
    { label: 'Macronutrientes', to: '/progreso/composicion', icon: FaUtensils, id: 'macros' },
    { label: 'Mis Estudios', to: '/progreso/composicion', icon: FaFlask, id: 'studies' }
  ]

  const handleTabClick = useCallback((tab) => {
    if (tab.id) {
      setActiveTab(tab.id)
      // Actualizar URL sin recargar la página
      const newUrl = new URL(window.location)
      if (tab.id === 'bodyfat') {
        newUrl.searchParams.delete('tab')
      } else {
        newUrl.searchParams.set('tab', tab.id)
      }
      window.history.pushState({}, '', newUrl)
    }
  }, [])

  // Determinar tab activo basado en el estado local (memoizado)
  const tabsWithActive = useMemo(() => 
    tabs.map(tab => ({
      ...tab,
      isActive: tab.id === activeTab
    })),
    [activeTab]
  )

  return (
    <AuthOnly>
      <div className="progreso-page">
        <div className="evolution-container">
          {/* HeaderTabs integrado dentro de la card - Oculto en móviles */}
          {tabsWithActive.length > 0 && !isMobile && (
            <div className="evolution-header-tabs">
              <HeaderTabs 
                items={tabsWithActive} 
                className="evolution-tabs-inline"
                onTabClick={handleTabClick}
              />
            </div>
          )}

          {/* Contenido de la calculadora activa o estudios */}
          <div className="card-section">
            <Suspense fallback={<CardLoadingFallback type="calculator" />}>
              {activeTab === 'bodyfat' ? (
                <BodyFatCalculator />
              ) : activeTab === 'macros' ? (
                <MacroCalculator />
              ) : (
                <BodyCompositionStudies 
                  compact={false}
                  showLatest={true}
                  showHistory={true}
                  showNewStudyButton={true}
                  onNewStudyClick={() => setActiveTab('bodyfat')}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </AuthOnly>
  )
}

export default ComposicionPage

