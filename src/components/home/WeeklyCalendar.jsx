/**
 * Componente de Calendario Semanal
 * Muestra los próximos 7 días con información de entrenamiento
 * 
 * Estados visuales:
 * - completed (verde): Día con sesión completada
 * - today (azul): Día actual con entrenamiento programado
 * - rest (gris): Día de descanso
 * - pending (gris oscuro): Día futuro con entrenamiento
 * - missed (rojo suave): Día pasado sin completar
 * - no-routine (transparente): Sin rutina programada
 */

import PropTypes from 'prop-types'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { 
  CheckCircle, 
  Calendar, 
  Coffee, 
  Clock, 
  AlertCircle,
  Dumbbell 
} from 'lucide-react'
import { useWeeklyCalendar } from '../../hooks/useWeeklyCalendar'
import { useState, useEffect } from 'react'
import '../../styles/WeeklyCalendar.css'

const WeeklyCalendar = ({ onDayClick }) => {
  const { weekDays, loading } = useWeeklyCalendar()
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  
  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Sistema de paginación para móvil (3 páginas)
  const pages = [
    weekDays.slice(0, 3),  // Página 1: Lun-Mié
    weekDays.slice(3, 6),  // Página 2: Jue-Sáb
    weekDays.slice(6, 7)   // Página 3: Dom
  ]
  
  const visibleDays = isMobile ? pages[currentPage] || [] : weekDays
  
  // Motion values para el swipe
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  /**
   * Obtiene el icono según el estado del día
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} />
      case 'today':
        return <Dumbbell size={20} />
      case 'rest':
        return <Coffee size={20} />
      case 'pending':
        return <Clock size={20} />
      case 'missed':
        return <AlertCircle size={20} />
      default:
        return <Calendar size={20} />
    }
  }

  /**
   * Obtiene el texto descriptivo según el estado
   */
  const getStatusText = (status, muscleGroup) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'today':
        return muscleGroup || 'Entrenar hoy'
      case 'rest':
        return 'Descanso'
      case 'pending':
        return muscleGroup || 'Programado'
      case 'missed':
        return 'No completado'
      case 'no-routine':
        return 'Sin rutina'
      default:
        return '-'
    }
  }

  /**
   * Maneja el clic en un día
   */
  const handleDayClick = (day) => {
    // Solo permitir clic en días con entrenamiento programado
    if (day.status === 'no-routine' || day.status === 'rest') {
      return
    }
    
    if (onDayClick) {
      onDayClick(day)
    }
  }

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const dayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  if (loading) {
    return (
      <div className="weekly-calendar-container">
        <div className="calendar-header">
          <Calendar size={24} />
          <h3>Calendario Semanal</h3>
        </div>
        <div className="weekly-calendar-grid">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="day-card skeleton">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line medium"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Manejar el gesto de deslizamiento
  const handleDragEnd = (event, info) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    
    // Si el deslizamiento fue significativo (más de 50px o velocidad alta)
    if (Math.abs(offset) > 50 || Math.abs(velocity) > 500) {
      if (offset > 0 && currentPage > 0) {
        // Deslizar a la derecha = página anterior
        setCurrentPage(currentPage - 1)
      } else if (offset < 0 && currentPage < pages.length - 1) {
        // Deslizar a la izquierda = página siguiente
        setCurrentPage(currentPage + 1)
      }
    }
    
    // Animar de vuelta a la posición
    animate(x, 0, { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    })
  }

  return (
    <div className="weekly-calendar-container">
      <div className="calendar-header">
        <Calendar size={24} />
        <h3>Tu Semana de Entrenamiento</h3>
      </div>
      
      {/* Indicadores de página - Solo en móvil */}
      {isMobile && pages.length > 1 && (
        <div className="calendar-page-indicators">
          {pages.map((_, pageIndex) => (
            <button
              key={pageIndex}
              className={`page-indicator ${pageIndex === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageIndex)}
              aria-label={`Página ${pageIndex + 1} de ${pages.length}`}
            >
              <span className="page-dot"></span>
            </button>
          ))}
        </div>
      )}
      
      <motion.div 
        className={`weekly-calendar-grid ${isMobile ? 'mobile-swipe' : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x: isMobile ? x : 0, opacity: isMobile ? opacity : 1 }}
        key={isMobile ? `page-${currentPage}` : 'full-week'}
      >
        {visibleDays.map((day) => (
          <motion.div
            key={`${day.dayName}-${day.dayNumber}`}
            className={`day-card ${day.status} ${day.status !== 'no-routine' && day.status !== 'rest' ? 'clickable' : ''}`}
            variants={dayVariants}
            onClick={() => handleDayClick(day)}
            whileHover={
              day.status !== 'no-routine' && day.status !== 'rest'
                ? { y: -4, transition: { duration: 0.2 } }
                : {}
            }
            whileTap={
              day.status !== 'no-routine' && day.status !== 'rest'
                ? { scale: 0.98 }
                : {}
            }
          >
            {/* Badge de "Hoy" */}
            {day.isToday && (
              <div className="today-badge">
                Hoy
              </div>
            )}

            {/* Día de la semana */}
            <div className="day-header">
              <span className="day-name">{day.dayShort}</span>
              <span className="day-number">{day.dayNumber}</span>
            </div>

            {/* Icono de estado */}
            <div className="day-status-icon">
              {getStatusIcon(day.status)}
            </div>

            {/* Información del entrenamiento */}
            <div className="day-info">
              <span className="muscle-group">
                {getStatusText(day.status, day.muscleGroup)}
              </span>
              
              {day.exerciseCount > 0 && day.status !== 'rest' && (
                <span className="exercise-count">
                  {day.exerciseCount} {day.exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                </span>
              )}
            </div>

            {/* Indicador de completado */}
            {day.status === 'completed' && (
              <div className="completion-badge">
                ✓
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Leyenda */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot completed"></div>
          <span>Completado</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot today"></div>
          <span>Hoy</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot pending"></div>
          <span>Programado</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot rest"></div>
          <span>Descanso</span>
        </div>
      </div>
    </div>
  )
}

WeeklyCalendar.propTypes = {
  onDayClick: PropTypes.func
}

export default WeeklyCalendar

