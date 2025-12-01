import React, { memo, useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaTimes, FaWeight, FaChartBar, FaHistory, FaPlay, FaChartLine, FaPercentage, FaUtensils, FaFlask } from 'react-icons/fa'
import { useUIStore } from '../../stores/uiStore'
import '../../styles/components/progreso/MobileProgressMenu.css'

// Configuración de opciones por tipo de card (fuera del componente para evitar recreación)
const MENU_OPTIONS = {
  'progreso-corporal': [
    { 
      id: 'registrar',
      label: 'Registrar Peso', 
      icon: FaWeight, 
      route: '/progreso/registrar',
      description: 'Registra tu peso, grasa y músculo'
    },
    { 
      id: 'graficos',
      label: 'Evolución', 
      icon: FaChartBar, 
      route: '/progreso/graficos',
      description: 'Visualiza tu evolución corporal'
    },
    { 
      id: 'historial',
      label: 'Historial', 
      icon: FaHistory, 
      route: '/progreso/historial',
      description: 'Revisa tus registros anteriores'
    }
  ],
  'rutina-ejercicios': [
    { 
      id: 'rutina-hoy',
      label: 'Rutina de Hoy', 
      icon: FaPlay, 
      route: '/progreso/rutina-hoy',
      description: 'Gestiona tu rutina diaria'
    },
    { 
      id: 'graficos-ejercicios',
      label: 'Gráficos de Ejercicios', 
      icon: FaChartLine, 
      route: '/progreso/graficos-ejercicios',
      description: 'Visualiza el progreso por ejercicio'
    }
  ],
  'composicion-corporal': [
    { 
      id: 'bodyfat',
      label: 'Grasa Corporal', 
      icon: FaPercentage, 
      route: '/progreso/composicion',
      params: { tab: null },
      description: 'Calcula tu porcentaje de grasa'
    },
    { 
      id: 'macros',
      label: 'Macronutrientes', 
      icon: FaUtensils, 
      route: '/progreso/composicion',
      params: { tab: 'macros' },
      description: 'Calcula tu distribución de macros'
    },
    { 
      id: 'studies',
      label: 'Mis Estudios', 
      icon: FaFlask, 
      route: '/progreso/composicion',
      params: { tab: 'studies' },
      description: 'Revisa tus estudios de composición'
    }
  ]
}

/**
 * Menú móvil para navegación dentro de las cards de progreso
 * Solo se muestra en móviles cuando se entra a una card
 */
const MobileProgressMenu = memo(({ 
  isOpen, 
  onClose, 
  cardType,
  currentRoute,
  menuId
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setOpenMobileMenu = useUIStore(state => state.setOpenMobileMenu)
  const closeMobileMenu = useUIStore(state => state.closeMobileMenu)
  const storeOpenMenuId = useUIStore(state => state.openMobileMenu)

  // Sincronizar con el store y cerrar si se abre otro menú
  useEffect(() => {
    if (!isOpen) {
      // Si este menú se cierra y es el que está en el store, limpiar el store
      if (storeOpenMenuId === menuId) {
        closeMobileMenu()
      }
      return
    }

    // Si este menú se abre, actualizar el store
    setOpenMobileMenu(menuId)

    // Si hay otro menú abierto, cerrar este
    if (storeOpenMenuId !== menuId && storeOpenMenuId !== null) {
      onClose()
    }
  }, [isOpen, menuId, storeOpenMenuId, setOpenMobileMenu, closeMobileMenu, onClose])

  const handleClose = useCallback(() => {
    closeMobileMenu()
    onClose()
  }, [closeMobileMenu, onClose])

  // Obtener opciones del menú (memoizado)
  const options = useMemo(() => MENU_OPTIONS[cardType] || [], [cardType])

  const handleOptionClick = useCallback((option) => {
    if (option.params) {
      // Para composición corporal, usar searchParams
      const searchParams = new URLSearchParams()
      if (option.params.tab) {
        searchParams.set('tab', option.params.tab)
      }
      navigate(`${option.route}${searchParams.toString() ? '?' + searchParams.toString() : ''}`)
    } else {
      navigate(option.route)
    }
    handleClose()
  }, [navigate, handleClose])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  if (!isOpen) return null

  // Renderizar fuera de la card usando portal
  return createPortal(
    <div 
      className="mobile-progress-menu-backdrop"
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div className="mobile-progress-menu">
        <div className="mobile-progress-menu-header">
          <h3 className="mobile-progress-menu-title">Selecciona una opción</h3>
          <button
            className="mobile-progress-menu-close"
            onClick={handleClose}
            aria-label="Cerrar menú"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mobile-progress-menu-options">
          {options.map((option) => {
            const IconComponent = option.icon
            // Determinar si la opción está activa
            const isActive = (() => {
              if (option.params?.tab !== undefined) {
                const currentTab = searchParams.get('tab')
                if (option.params.tab === null) {
                  return currentRoute === option.route && !currentTab
                }
                return currentRoute === option.route && currentTab === option.params.tab
              }
              return currentRoute === option.route
            })()
            
            return (
              <button
                key={option.id}
                className={`mobile-progress-menu-option ${isActive ? 'active' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                <div className="mobile-progress-menu-option-icon">
                  <IconComponent />
                </div>
                <div className="mobile-progress-menu-option-content">
                  <div className="mobile-progress-menu-option-label">
                    {option.label}
                  </div>
                  <div className="mobile-progress-menu-option-description">
                    {option.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mobile-progress-menu-footer">
          <button
            className="mobile-progress-menu-back"
            onClick={handleClose}
          >
            Volver
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
})

MobileProgressMenu.displayName = 'MobileProgressMenu'

MobileProgressMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cardType: PropTypes.oneOf(['progreso-corporal', 'rutina-ejercicios', 'composicion-corporal']).isRequired,
  currentRoute: PropTypes.string,
  menuId: PropTypes.string.isRequired
}

export default MobileProgressMenu

