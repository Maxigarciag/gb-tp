import React, { memo, useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/HeaderTabs.css'

/**
 * Componente de navegación tipo tabs horizontal
 * Responsive: Desktop muestra tabs sin scroll, Mobile muestra scroll horizontal
 * @param {Object} props
 * @param {Array} props.items - Array de items de navegación { label, to, icon, isActive?, id? }
 * @param {string} props.className - Clases CSS adicionales
 * @param {Function} props.onTabClick - Callback opcional cuando se hace clic en un tab (recibe el item completo)
 */
const HeaderTabs = memo(({ items = [], className = '', onTabClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const tabsContainerRef = useRef(null)
  const activeTabRef = useRef(null)

  // Detectar tab activa basado en la ruta actual o en isActive del item
  const getActiveTab = useCallback(() => {
    // Si los items tienen isActive, usar eso
    const activeItem = items.find(item => item.isActive === true)
    if (activeItem) return activeItem.to || activeItem.id

    const currentPath = location.pathname
    // Buscar coincidencia exacta primero
    const exactMatch = items.find(item => item.to === currentPath)
    if (exactMatch) return exactMatch.to

    // Si no hay coincidencia exacta, buscar la que mejor coincida (para rutas anidadas)
    const sortedByLength = items
      .filter(item => item.to && currentPath.startsWith(item.to))
      .sort((a, b) => b.to.length - a.to.length)
    
    return sortedByLength.length > 0 ? sortedByLength[0].to : null
  }, [location.pathname, items])

  const activeTab = getActiveTab()

  // Scroll suave al tab activo en mobile
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current
      const activeElement = activeTabRef.current
      
      // Solo hacer scroll en mobile (cuando el contenedor tiene scroll)
      if (container.scrollWidth > container.clientWidth) {
        const containerRect = container.getBoundingClientRect()
        const activeRect = activeElement.getBoundingClientRect()
        const scrollLeft = container.scrollLeft
        const elementLeft = activeRect.left - containerRect.left + scrollLeft
        const elementWidth = activeRect.width
        const containerWidth = container.clientWidth

        // Calcular posición para centrar el elemento activo
        const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2)
        
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        })
      }
    }
  }, [activeTab])

  const handleTabClick = useCallback((item) => {
    // Si hay un callback personalizado, usarlo
    if (onTabClick) {
      onTabClick(item)
      return
    }
    // Si no, navegar normalmente
    if (item.to) {
      navigate(item.to)
    }
  }, [navigate, onTabClick])

  if (!items || items.length === 0) return null

  return (
    <nav 
      className={`header-tabs ${className}`}
      role="tablist"
      aria-label="Navegación de secciones"
    >
      <div 
        ref={tabsContainerRef}
        className="header-tabs-container"
      >
        {items.map((item, index) => {
          const isActive = item.isActive !== undefined 
            ? item.isActive 
            : (activeTab === item.to || activeTab === item.id)
          const IconComponent = item.icon
          const itemKey = item.id || item.to || index
          
          return (
            <button
              key={itemKey}
              ref={isActive ? activeTabRef : null}
              onClick={() => handleTabClick(item)}
              className={`header-tab ${isActive ? 'active' : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${itemKey}`}
              type="button"
            >
              {IconComponent && (
                <span className="header-tab-icon" aria-hidden="true">
                  <IconComponent />
                </span>
              )}
              <span className="header-tab-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
})

HeaderTabs.displayName = 'HeaderTabs'

HeaderTabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
      icon: PropTypes.elementType,
      isActive: PropTypes.bool,
      id: PropTypes.string
    })
  ).isRequired,
  className: PropTypes.string,
  onTabClick: PropTypes.func
}

export default HeaderTabs

