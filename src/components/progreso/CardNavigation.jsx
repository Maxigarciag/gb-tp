import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

/**
 * Componente optimizado para navegación interna de cards
 * Incluye memoización y callbacks optimizados
 * @param {Object} props
 * @param {string} props.activeSubTab - Tab activo actual
 * @param {Function} props.onSubTabChange - Callback al cambiar tab
 * @param {Array} props.tabs - Array de tabs disponibles
 * @param {boolean} props.isExpanded - Si la navegación está expandida
 * @param {Function} props.onToggleExpand - Callback para toggle
 * @param {string} props.className - Clases CSS adicionales
 */
const CardNavigation = memo(({ 
  activeSubTab, 
  onSubTabChange, 
  tabs = [], 
  isExpanded = false, 
  onToggleExpand,
  className = '' 
}) => {
  // Early return si no hay tabs
  if (!tabs.length) return null;

  // Callback memoizado para el toggle
  const handleToggle = useCallback(() => {
    onToggleExpand?.();
  }, [onToggleExpand]);

  // Callback memoizado para cambio de tab
  const handleTabChange = useCallback((tabId) => {
    onSubTabChange?.(tabId);
  }, [onSubTabChange]);

  return (
    <div className={`card-navigation ${className}`}>
      {/* Botón de toggle para expandir/colapsar */}
      <button
        onClick={handleToggle}
        className="card-navigation-toggle"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Colapsar menú' : 'Expandir menú'}
        type="button"
      >
        <span>Navegación</span>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Menú de navegación */}
      {isExpanded && (
        <div className="card-navigation-menu" role="menu">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`card-navigation-item ${activeSubTab === tab.id ? 'active' : ''}`}
                aria-pressed={activeSubTab === tab.id}
                role="menuitem"
                type="button"
              >
                {IconComponent && <span className="navigation-icon" aria-hidden="true"><IconComponent /></span>}
                <span className="navigation-label">{tab.label}</span>
                {tab.description && (
                  <span className="navigation-description">{tab.description}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

CardNavigation.displayName = 'CardNavigation'

CardNavigation.propTypes = {
	activeSubTab: PropTypes.string,
	onSubTabChange: PropTypes.func,
	tabs: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		label: PropTypes.string,
		icon: PropTypes.elementType,
		description: PropTypes.string
	})),
	isExpanded: PropTypes.bool,
	onToggleExpand: PropTypes.func,
	className: PropTypes.string
}

export default CardNavigation
