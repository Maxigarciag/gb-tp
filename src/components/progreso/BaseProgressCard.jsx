import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { FaChevronRight } from 'react-icons/fa'

/**
 * Componente base reutilizable para las cards de progreso
 * Elimina duplicación de código y proporciona funcionalidad común
 * @param {Object} props - Props del componente
 */
const BaseProgressCard = memo(({
  // Props de identificación
  cardId,
  cardType,
  
  // Props de estado
  isActive,
  isVisible = true,
  isExpanded = false,
  
  // Props de configuración
  title,
  description,
  icon: Icon,
  previewStats = [],
  
  // Props de callbacks
  onToggle,
  onExpand,
  onClose,
  
  // Props adicionales
  className = '',
  ...props
}) => {
  // Determinar el estado visual de la card
  const getCardState = () => {
    if (isExpanded) return 'expanded';
    if (isVisible && !isActive) return 'compact';
    return 'visible';
  };

  const cardState = getCardState();
  const cardClassName = `${cardType}-card ${isVisible ? 'visible' : 'hidden'} ${cardState} ${className}`;

  return (
    <div className={cardClassName} {...props}>
      {/* Botón de volver (solo en modo expandido) */}
      {isExpanded && (
        <button
          onClick={onClose}
          className="card-close-btn"
          aria-label="Volver"
          title="Volver"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
      )}

      {/* Header de la card */}
      <div
        role="button"
        tabIndex={0}
        title={title}
        aria-label={title}
        onClick={isExpanded ? undefined : onExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isExpanded) onExpand();
          }
        }}
        className={`card-header ${isActive ? 'active' : ''}`}
      >
        <Icon className="card-icon" />
        <div className="card-content">
          <div className="card-title">{title}</div>
          <div className="card-description">{description}</div>
        </div>
      </div>

      {/* Preview en modo compacto */}
      {cardState === 'compact' && previewStats.length > 0 && (
        <div className="card-preview">
          <div className="card-preview-content">
            <div className="card-preview-stats">
              {previewStats.map((stat, index) => (
                <div key={index} className="card-preview-stat">
                  {stat.icon && <stat.icon className="icon" />}
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
            <FaChevronRight className="card-preview-arrow" />
          </div>
        </div>
      )}

      {/* Las cards ahora solo navegan, no muestran contenido */}
    </div>
  )
})

BaseProgressCard.displayName = 'BaseProgressCard'

BaseProgressCard.propTypes = {
	cardId: PropTypes.string.isRequired,
	cardType: PropTypes.string.isRequired,
	isActive: PropTypes.bool.isRequired,
	isVisible: PropTypes.bool,
	isExpanded: PropTypes.bool,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	icon: PropTypes.elementType.isRequired,
	previewStats: PropTypes.arrayOf(PropTypes.shape({
		icon: PropTypes.elementType,
		label: PropTypes.string,
		value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
	})),
	onToggle: PropTypes.func.isRequired,
	onExpand: PropTypes.func,
	onClose: PropTypes.func,
	className: PropTypes.string
}

export default BaseProgressCard
