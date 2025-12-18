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
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Calendar, 
  Coffee, 
  Clock, 
  AlertCircle,
  Dumbbell 
} from 'lucide-react'
import { useWeeklyCalendar } from '@/hooks/useWeeklyCalendar'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useState, useEffect, useRef } from 'react'
import '@/styles/components/home/WeeklyCalendar.css'

const WeeklyCalendar = ({ onDayClick }) => {
  const { weekDays, loading } = useWeeklyCalendar()
  const isMobile = useIsMobile()
  const [currentPage, setCurrentPage] = useState(0)
  const lastWeekDaysRef = useRef([])

  const hasData = weekDays.length > 0
  const displayDays = hasData ? weekDays : lastWeekDaysRef.current
  const hasFallback = displayDays.length > 0
  const isInitialLoading = loading && !hasData && !hasFallback
  
  // Sistema de paginación para móvil (3 páginas)
  const pages = [
    displayDays.slice(0, 3),  // Página 1: Lun-Mié
    displayDays.slice(3, 6),  // Página 2: Jue-Sáb
    displayDays.slice(6, 7)   // Página 3: Dom
  ]
  
  const visibleDays = isMobile ? pages[currentPage] || [] : displayDays
  const fallbackDay = {
    dayName: '',
    dayNumber: '',
    dayShort: '',
    status: 'no-routine',
    muscleGroup: '',
    exerciseCount: 0,
    isToday: false
  }
  const safeDays = (visibleDays && visibleDays.length > 0)
    ? visibleDays
    : displayDays.length > 0
      ? displayDays
      : Array.from({ length: 7 }, () => fallbackDay)
  
  // Sin swipe en desktop; evitar offsets heredados
  useEffect(() => {
    if (!isMobile) {
      setCurrentPage(0)
    }
  }, [isMobile])

  // Persistir últimos datos para evitar parpadeos al navegar
  useEffect(() => {
    if (weekDays.length > 0) {
      lastWeekDaysRef.current = weekDays
    }
  }, [weekDays])

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
    
    // Sin animación de arrastre; solo control de página
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
        initial={false}
        animate={{ opacity: 1 }}
        drag={false}
        key={isMobile ? `page-${currentPage}` : 'full-week'}
        aria-busy={loading}
      >
        {(isInitialLoading ? Array.from({ length: isMobile ? 3 : 7 }) : safeDays).map((day, index) => {
          const dateKey = day?.isoDate || (day?.year !== undefined && day?.month !== undefined && day?.dayNumber !== undefined
            ? `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.dayNumber).padStart(2, '0')}`
            : null);
          const stableKey = isInitialLoading
            ? `skeleton-${index}`
            : dateKey || day?.dayName || `day-${index}`;

          return (
            <motion.div
              key={stableKey}
              className={`day-card ${isInitialLoading ? 'skeleton' : day.status} ${!isInitialLoading && day.status !== 'no-routine' && day.status !== 'rest' ? 'clickable' : ''}`}
              initial={false}
              onClick={!isInitialLoading ? () => handleDayClick(day) : undefined}
              whileHover={
                !isInitialLoading && day.status !== 'no-routine' && day.status !== 'rest'
                  ? { y: -4, transition: { duration: 0.2 } }
                  : {}
              }
              whileTap={
                !isInitialLoading && day.status !== 'no-routine' && day.status !== 'rest'
                  ? { scale: 0.98 }
                  : {}
              }
            >
              {isInitialLoading ? (
                <div className="day-skeleton">
                  <div className="line short" />
                  <div className="line tiny" />
                  <div className="line medium" />
                </div>
              ) : (
                <>
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
                </>
              )}
            </motion.div>
          );
        })}
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

