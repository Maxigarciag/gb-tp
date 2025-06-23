/**
 * InfoEjercicioCard.jsx
 * 
 * Este componente muestra información detallada sobre un ejercicio cuando es seleccionado.
 * Muestra su descripción, instrucciones, consejos y los músculos trabajados.
 * Se usa dentro de CalendarioRutina.jsx cuando el usuario selecciona un ejercicio en la rutina.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import "../styles/InfoEjercicioCard.css"; // Asegúrate de tener estilos para la tarjeta

const InfoEjercicioCard = ({ ejercicio, onClose }) => {
  // Datos de ejemplo para cada ejercicio (puedes expandir esto)
  const infoEjercicios = {
    "Press banca plano": {
      descripcion: "Ejercicio compuesto para el pecho que también trabaja tríceps y hombros delanteros.",
      instrucciones: [
        "Acuéstate boca arriba en un banco plano",
        "Agarra la barra con manos separadas al ancho de los hombros",
        "Baja la barra al pecho de manera controlada",
        "Empuja la barra hacia arriba hasta extender los brazos"
      ],
      consejos: [
        "Mantén los pies firmes en el suelo",
        "No arquees demasiado la espalda",
        "Controla el movimiento en ambas fases"
      ],
      musculos: ["Pecho", "Tríceps", "Hombros delanteros"]
    },
    "Dominadas": {
      descripcion: "Ejercicio fundamental para la espalda que trabaja también bíceps y hombros.",
      instrucciones: [
        "Agarra la barra con las palmas hacia adelante",
        "Cuelga con los brazos completamente extendidos",
        "Tira del cuerpo hacia arriba hasta que la barbilla supere la barra",
        "Baja de manera controlada a la posición inicial"
      ],
      consejos: [
        "Mantén el core activado durante todo el movimiento",
        "Evita balancearte o usar impulso",
        "Concéntrate en usar los músculos de la espalda"
      ],
      musculos: ["Espalda", "Bíceps", "Hombros"]
    }
  };

  const info = infoEjercicios[ejercicio] || {
    descripcion: "Información no disponible para este ejercicio.",
    instrucciones: [],
    consejos: [],
    musculos: []
  };

  return (
    <AnimatePresence>
      <motion.div
        className="info-card-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="info-card">
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar información del ejercicio"
          >
            ×
          </button>
          
          <h3 className="ejercicio-title">{ejercicio}</h3>
          
          <div className="info-section">
            <h4>Descripción</h4>
            <p>{info.descripcion}</p>
          </div>
          
          {info.instrucciones.length > 0 && (
            <div className="info-section">
              <h4>Instrucciones</h4>
              <ol>
                {info.instrucciones.map((inst, index) => (
                  <li key={index}>{inst}</li>
                ))}
              </ol>
            </div>
          )}
          
          {info.consejos.length > 0 && (
            <div className="info-section">
              <h4>Consejos</h4>
              <ul>
                {info.consejos.map((consejo, index) => (
                  <li key={index}>{consejo}</li>
                ))}
              </ul>
            </div>
          )}
          
          {info.musculos.length > 0 && (
            <div className="info-section">
              <h4>Músculos trabajados</h4>
              <div className="musculos-tags">
                {info.musculos.map((musculo, index) => (
                  <span key={index} className="musculo-tag">{musculo}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

InfoEjercicioCard.propTypes = {
  ejercicio: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default InfoEjercicioCard;