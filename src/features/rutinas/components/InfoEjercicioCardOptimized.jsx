/**
 * InfoEjercicioCardOptimized.jsx
 * 
 * Componente moderno y minimalista para mostrar información de ejercicios.
 * Diseño limpio con enfoque en la acción principal: cambiar ejercicio.
 * 
 * @param {Object} props
 * @param {string|Object} props.ejercicio - Ejercicio a mostrar
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onExerciseChange - Callback al cambiar ejercicio
 */

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import PropTypes from 'prop-types'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useUIStore, useExerciseStore } from '@/stores'
import { RefreshCw, Activity, Target } from 'lucide-react'
import '@/styles/components/rutinas/InfoEjercicioCard.css'

const InfoEjercicioCardOptimized = ({ ejercicio, onClose, onExerciseChange }) => {
  const { showSuccess } = useUIStore();
  const { getExercisesByMuscleGroup, allExercises } = useExerciseStore();
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const cardRef = useRef(null);
  const dragY = useMotionValue(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // Obtener información básica del ejercicio
  const exerciseData = useMemo(() => {
    if (!ejercicio) return null;

    const exerciseName = typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre;
    if (!exerciseName) return null;

    const exercise = allExercises.find(ex => ex.nombre === exerciseName);
    if (!exercise) return null;

    return {
      nombre: exercise.nombre,
      grupo_muscular: exercise.grupo_muscular,
      dificultad: exercise.dificultad || 'No especificada',
      descripcion: exercise.descripcion || 'Sin descripción disponible',
      es_compuesto: exercise.es_compuesto || false
    };
  }, [ejercicio, allExercises]);

  // Obtener ejercicios alternativos
  const alternativeExercises = useMemo(() => {
    if (!exerciseData) return [];
    
    const alternatives = getExercisesByMuscleGroup(exerciseData.grupo_muscular);
    return alternatives.filter(ex => ex.nombre !== exerciseData.nombre).slice(0, 6);
  }, [exerciseData, getExercisesByMuscleGroup]);

  // Manejar cierre
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Manejar clic fuera
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Manejar cambio de ejercicio
  const handleConfirmReplacement = useCallback(() => {
    if (selectedReplacement && onExerciseChange) {
      onExerciseChange(ejercicio, selectedReplacement);
      // Removed notification: showSuccess(`Ejercicio cambiado a: ${selectedReplacement.nombre}`);
      setShowReplacementModal(false);
      setSelectedReplacement(null);
      handleClose();
    }
  }, [selectedReplacement, onExerciseChange, ejercicio, handleClose]);

  // Manejar inicio de arrastre
  const handleDragStart = useCallback((event, info) => {
    if (!isMobile) return;
    isDragging.current = true;
    startY.current = info.point.y;
  }, [isMobile]);

  // Manejar arrastre
  const handleDrag = useCallback((event, info) => {
    if (!isMobile || !isDragging.current) return;
    
    const currentY = info.point.y;
    const deltaY = startY.current - currentY;
    
    // Si arrastra hacia arriba más de 30px, expandir
    if (deltaY > 30 && !isExpanded) {
      setIsExpanded(true);
      isDragging.current = false;
      dragY.set(0);
    }
    // Si arrastra hacia abajo más de 30px, contraer
    else if (deltaY < -30 && isExpanded) {
      setIsExpanded(false);
      isDragging.current = false;
      dragY.set(0);
    }
  }, [isMobile, isExpanded, dragY]);

  // Manejar fin de arrastre
  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    dragY.set(0);
  }, [dragY]);

  // Resetear estado al cerrar
  useEffect(() => {
    if (!ejercicio) {
      setIsExpanded(false);
      dragY.set(0);
    }
  }, [ejercicio, dragY]);

  if (!exerciseData) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="exercise-info-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={cardRef}
            className={`exercise-info-card ${isMobile ? 'mobile' : ''} ${isExpanded ? 'expanded' : ''}`}
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle para móviles */}
            {isMobile && (
              <motion.div 
                className="exercise-info-handle"
                drag={isMobile ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              />
            )}
            
            {/* Contenedor scrollable */}
            <div className="exercise-info-scrollable">
              {/* Header */}
              <motion.div 
                className="exercise-info-header"
                drag={isMobile ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              >
              <div className="exercise-info-title-section">
                <h3 className="exercise-info-name">{exerciseData.nombre}</h3>
                <div className="exercise-info-badges">
                  <span className="exercise-badge muscle">{exerciseData.grupo_muscular}</span>
                  <span className={`exercise-badge difficulty ${exerciseData.dificultad?.toLowerCase()}`}>
                    <Activity size={12} />
                    {exerciseData.dificultad}
                  </span>
                  {exerciseData.es_compuesto && (
                    <span className="exercise-badge compound">Compuesto</span>
                  )}
                </div>
              </div>
              </motion.div>

              {/* Descripción */}
              <div className="exercise-info-description">
                <p>{exerciseData.descripcion}</p>
              </div>
            </div>

            {/* Botones de acción - siempre fijos abajo */}
            {alternativeExercises.length > 0 && (
              <div className="exercise-info-actions">
                <button
                  className="exercise-action-btn cancel"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
                <motion.button
                  className="exercise-action-btn confirm"
                  onClick={() => setShowReplacementModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw size={18} />
                  <span>Cambiar ejercicio</span>
                  <span className="exercise-change-count">{alternativeExercises.length} opciones</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Modal de selección */}
      <AnimatePresence>
        {showReplacementModal && (
          <motion.div
            className="exercise-replacement-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowReplacementModal(false);
                setSelectedReplacement(null);
              }
            }}
          >
            <motion.div
              className={`exercise-replacement-modal ${isMobile ? 'mobile' : ''}`}
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="replacement-modal-header">
                {isMobile && <div className="modal-handle" />}
                <h3>Cambiar ejercicio</h3>
              </div>

              <div className="replacement-modal-content">
                <p className="replacement-modal-description">
                  Selecciona un ejercicio alternativo del mismo grupo muscular
                </p>
                
                <div className="replacement-exercises-list">
                  {alternativeExercises.map((alternative, index) => (
                    <motion.div
                      key={alternative.id || index}
                      className={`replacement-exercise-item ${selectedReplacement?.id === alternative.id ? 'selected' : ''}`}
                      onClick={() => setSelectedReplacement(alternative)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="replacement-exercise-info">
                        <h4>{alternative.nombre}</h4>
                        {alternative.descripcion && (
                          <p>{alternative.descripcion}</p>
                        )}
                      </div>
                      <div className="replacement-exercise-badge">
                        {alternative.dificultad}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="replacement-modal-actions">
                <button
                  className="replacement-btn cancel"
                  onClick={() => {
                    setShowReplacementModal(false);
                    setSelectedReplacement(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="replacement-btn confirm"
                  onClick={handleConfirmReplacement}
                  disabled={!selectedReplacement}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

InfoEjercicioCardOptimized.propTypes = {
  ejercicio: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.string,
      nombre: PropTypes.string,
      grupo_muscular: PropTypes.string,
    })
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
  onExerciseChange: PropTypes.func
}

export default InfoEjercicioCardOptimized
