/**
 * InfoEjercicioCardOptimized.jsx
 * 
 * Versión optimizada del componente que muestra información detallada sobre un ejercicio.
 * Incluye mejor manejo de estado, animaciones mejoradas, y integración con stores.
 * 
 * @param {Object} props
 * @param {string|Object} props.ejercicio - Ejercicio a mostrar (nombre o objeto completo)
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onExerciseChange - Callback al cambiar ejercicio
 */

import React, { useMemo, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { useUIStore, useExerciseStore } from '../stores'
import { X, Target, Lightbulb, BookOpen, Activity, Clock, TrendingUp, RefreshCw } from 'lucide-react'
import '../styles/InfoEjercicioCard.css'

const InfoEjercicioCardOptimized = ({ ejercicio, onClose, onExerciseChange }) => {
  const { showInfo, showSuccess } = useUIStore();
  const { getExercisesByMuscleGroup, allExercises } = useExerciseStore();
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState(null);

  // Memoizar la información del ejercicio
  const exerciseInfo = useMemo(() => {
    if (!ejercicio) return null;

    // Obtener el nombre del ejercicio (puede ser string o objeto)
    const exerciseName = typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre;
    if (!exerciseName) return null;

    // Intentar obtener información del store primero
    const storeInfo = allExercises.find(ex => ex.nombre === exerciseName);
    if (storeInfo) {
      return {
        descripcion: storeInfo.descripcion || "Descripción no disponible",
        instrucciones: storeInfo.instrucciones || [],
        consejos: storeInfo.consejos || [],
        musculos: storeInfo.grupo_muscular ? [storeInfo.grupo_muscular] : [],
        dificultad: storeInfo.dificultad || "No especificada",
        tiempoEstimado: "Variable",
        beneficios: storeInfo.es_compuesto ? ["Fuerza", "Hipertrofia"] : ["Fuerza"]
      };
    }

    // Fallback a información hardcodeada
    const infoEjercicios = {
      "Press banca plano": {
        descripcion: "Ejercicio compuesto fundamental para el desarrollo del pecho que también trabaja tríceps y hombros delanteros de manera eficiente.",
        instrucciones: [
          "Acuéstate boca arriba en un banco plano con los pies firmes en el suelo",
          "Agarra la barra con manos separadas al ancho de los hombros",
          "Desengancha la barra del rack y mantén los brazos extendidos",
          "Baja la barra al pecho de manera controlada, manteniendo los codos cerca del cuerpo",
          "Empuja la barra hacia arriba hasta extender completamente los brazos",
          "Mantén la tensión en el pecho durante todo el movimiento"
        ],
        consejos: [
          "Mantén los pies firmes en el suelo y no los levantes",
          "No arquees demasiado la espalda - mantén una posición natural",
          "Controla el movimiento en ambas fases (excéntrica y concéntrica)",
          "Respira de manera controlada: inhala al bajar, exhala al subir",
          "Mantén los hombros retraídos durante todo el movimiento"
        ],
        musculos: ["Pecho", "Tríceps", "Hombros delanteros"],
        dificultad: "Intermedio",
        tiempoEstimado: "3-5 minutos",
        beneficios: ["Fuerza", "Hipertrofia", "Estabilidad"]
      },
      "Dominadas": {
        descripcion: "Ejercicio fundamental para la espalda que desarrolla fuerza funcional y trabaja múltiples grupos musculares simultáneamente.",
        instrucciones: [
          "Agarra la barra con las palmas hacia adelante, manos separadas al ancho de los hombros",
          "Cuelga con los brazos completamente extendidos y el cuerpo relajado",
          "Activa el core y mantén el cuerpo en línea recta",
          "Tira del cuerpo hacia arriba usando los músculos de la espalda",
          "Continúa hasta que la barbilla supere la barra",
          "Baja de manera controlada a la posición inicial"
        ],
        consejos: [
          "Mantén el core activado durante todo el movimiento",
          "Evita balancearte o usar impulso - haz el movimiento controlado",
          "Concéntrate en usar los músculos de la espalda, no solo los brazos",
          "Mantén los hombros lejos de las orejas",
          "Respira de manera controlada durante el movimiento"
        ],
        musculos: ["Espalda", "Bíceps", "Hombros", "Core"],
        dificultad: "Avanzado",
        tiempoEstimado: "2-4 minutos",
        beneficios: ["Fuerza", "Resistencia", "Control corporal"]
      },
      "Sentadillas": {
        descripcion: "Ejercicio rey para el desarrollo de las piernas que mejora la fuerza funcional y la movilidad.",
        instrucciones: [
          "Colócate de pie con los pies separados al ancho de los hombros",
          "Mantén el pecho alto y la mirada hacia adelante",
          "Baja el cuerpo como si te sentaras en una silla",
          "Mantén las rodillas alineadas con los dedos de los pies",
          "Baja hasta que los muslos estén paralelos al suelo",
          "Empuja hacia arriba a través de los talones"
        ],
        consejos: [
          "Mantén el peso en los talones, no en las puntas de los pies",
          "Mantén las rodillas alineadas con los dedos de los pies",
          "No dejes que las rodillas se doblen hacia adentro",
          "Mantén el pecho alto y la espalda recta",
          "Respira de manera controlada durante el movimiento"
        ],
        musculos: ["Cuádriceps", "Glúteos", "Isquiotibiales", "Core"],
        dificultad: "Principiante",
        tiempoEstimado: "2-3 minutos",
        beneficios: ["Fuerza", "Movilidad", "Estabilidad"]
      }
    };

    return infoEjercicios[exerciseName] || {
      descripcion: "Información detallada no disponible para este ejercicio. Consulta con un entrenador para obtener instrucciones específicas.",
      instrucciones: [],
      consejos: [],
      musculos: [],
      dificultad: "No especificada",
      tiempoEstimado: "Variable",
      beneficios: []
    };
  }, [ejercicio, allExercises]);

  // Manejar cierre con callback optimizado
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Manejar clic fuera de la tarjeta
  const handleBackdropClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Manejar tecla Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  // Obtener ejercicios alternativos del mismo grupo muscular
  const alternativeExercises = useMemo(() => {
    if (!ejercicio) return [];
    
    // Obtener el nombre del ejercicio (puede ser string o objeto)
    const exerciseName = typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre;
    if (!exerciseName) return [];
    
    const currentExercise = allExercises.find(ex => ex.nombre === exerciseName);
    if (!currentExercise) return [];
    
    const muscleGroup = currentExercise.grupo_muscular;
    const alternatives = getExercisesByMuscleGroup(muscleGroup);
    
    // Excluir el ejercicio actual
    return alternatives.filter(ex => ex.nombre !== exerciseName);
  }, [ejercicio, allExercises, getExercisesByMuscleGroup]);

  // Manejar apertura del modal de reemplazo
  const handleOpenReplacementModal = useCallback(() => {
    setShowReplacementModal(true);
  }, []);

  // Manejar cierre del modal de reemplazo
  const handleCloseReplacementModal = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowReplacementModal(false);
    setSelectedReplacement(null);
  }, []);

  // Manejar selección de ejercicio de reemplazo
  const handleSelectReplacement = useCallback((replacementExercise) => {
    setSelectedReplacement(replacementExercise);
  }, []);

  // Manejar confirmación del reemplazo
  const handleConfirmReplacement = useCallback(() => {
    if (selectedReplacement && onExerciseChange) {
      onExerciseChange(ejercicio, selectedReplacement);
      showSuccess(`Ejercicio cambiado a: ${selectedReplacement.nombre}`);
      handleCloseReplacementModal();
      handleClose();
    }
  }, [selectedReplacement, onExerciseChange, ejercicio, showSuccess, handleCloseReplacementModal, handleClose]);

  // Animaciones optimizadas
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transformOrigin: 'center'
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!exerciseInfo) {
    return null;
  }

  return (
    <AnimatePresence key="info-card-main">
              <motion.div
          key="info-card-backdrop"
          className="info-card-container"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
        <motion.div
          className="info-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="card-header">
            <motion.button 
              className="close-button"
              onClick={handleClose}
              aria-label="Cerrar información del ejercicio"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>
          
          <motion.h3 
            className="ejercicio-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre}
          </motion.h3>

          {/* Información rápida */}
          <motion.div 
            className="quick-info"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="info-badges">
              <span className="badge difficulty">
                <Activity size={14} />
                {exerciseInfo.dificultad}
              </span>
              <span className="badge time">
                <Clock size={14} />
                {exerciseInfo.tiempoEstimado}
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className="info-section"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <h4>
              <BookOpen size={16} />
              Descripción
            </h4>
            <p>{exerciseInfo.descripcion}</p>
          </motion.div>
          
          {exerciseInfo.instrucciones.length > 0 && (
            <motion.div 
              className="info-section"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <h4>
                <Target size={16} />
                Instrucciones
              </h4>
              <ol className="instructions-list">
                {exerciseInfo.instrucciones.map((inst, index) => (
                  <motion.li 
                    key={`instruction-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {inst}
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
          
          {exerciseInfo.consejos.length > 0 && (
            <motion.div 
              className="info-section"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <h4>
                <Lightbulb size={16} />
                Consejos
              </h4>
              <ul className="tips-list">
                {exerciseInfo.consejos.map((consejo, index) => (
                  <motion.li 
                    key={`tip-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {consejo}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
          
          {exerciseInfo.musculos.length > 0 && (
            <motion.div 
              className="info-section"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              <h4>
                <Activity size={16} />
                Músculos trabajados
              </h4>
              <div className="musculos-tags">
                {exerciseInfo.musculos.map((musculo, index) => (
                  <motion.span 
                    key={`muscle-${index}`} 
                    className="musculo-tag"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {musculo}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {exerciseInfo.beneficios.length > 0 && (
            <motion.div 
              className="info-section"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
            >
              <h4>
                <TrendingUp size={16} />
                Beneficios
              </h4>
              <div className="benefits-tags">
                {exerciseInfo.beneficios.map((beneficio, index) => (
                  <motion.span 
                    key={`benefit-${index}`} 
                    className="benefit-tag"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    {beneficio}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Botón para cambiar ejercicio */}
          {alternativeExercises.length > 0 && (
            <motion.div 
              className="info-section"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8 }}
            >
              <motion.button
                className="change-exercise-btn"
                onClick={handleOpenReplacementModal}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(37, 99, 235, 0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw size={16} />
                Cambiar ejercicio
                <span className="alternatives-count">
                  {alternativeExercises.length} alternativas disponibles
                </span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal de selección de ejercicio alternativo */}
      <AnimatePresence key="replacement-modal">
        {showReplacementModal && (
          <motion.div
            key="replacement-modal-backdrop"
            className="replacement-modal-container"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseReplacementModal(e);
              }
            }}
          >
            <motion.div
              className="replacement-modal"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Cambiar ejercicio</h3>
                <motion.button 
                  className="close-button"
                  onClick={handleCloseReplacementModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="modal-content">
                <p className="modal-description">
                  Selecciona un ejercicio alternativo del mismo grupo muscular:
                </p>
                
                <div className="alternatives-list">
                  {alternativeExercises.map((alternative, index) => (
                    <motion.div
                      key={`alternative-${alternative.id || index}`}
                      className={`alternative-item ${selectedReplacement?.id === alternative.id ? 'selected' : ''}`}
                      onClick={() => handleSelectReplacement(alternative)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(37, 99, 235, 0.05)" }}
                    >
                      <div className="alternative-info">
                        <h4>{alternative.nombre}</h4>
                        <p>{alternative.descripcion}</p>
                        <div className="alternative-badges">
                          <span className="badge difficulty">
                            {alternative.dificultad}
                          </span>
                          {alternative.es_compuesto && (
                            <span className="badge compound">
                              Compuesto
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <motion.button
                  className="cancel-btn"
                  onClick={handleCloseReplacementModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  className="confirm-btn"
                  onClick={handleConfirmReplacement}
                  disabled={!selectedReplacement}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmar cambio
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

InfoEjercicioCardOptimized.propTypes = {
  ejercicio: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.string,
      nombre: PropTypes.string,
      grupo_muscular: PropTypes.string,
      descripcion: PropTypes.string,
      series: PropTypes.number,
      repeticiones_min: PropTypes.number,
      repeticiones_max: PropTypes.number,
      peso_sugerido: PropTypes.number,
      tiempo_descanso: PropTypes.number
    })
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
  onExerciseChange: PropTypes.func
}

export default InfoEjercicioCardOptimized 