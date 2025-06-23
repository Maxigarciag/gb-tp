/**
 * ResumenStats.jsx
 * 
 * Este componente muestra las estadísticas generales de la rutina de entrenamiento, 
 * como la cantidad de días de entrenamiento, duración de las sesiones, objetivo y nivel del usuario.
 * Se usa dentro de CalendarioRutina.jsx para proporcionar un resumen visual de los datos ingresados por el usuario.
 */

import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

function ResumenStats({ formData, t, diasEntrenamiento }) {
  return (
    <div className="resumen-stats">
      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-label">{t.dias_semana}</div>
        <div className="stat-value">{diasEntrenamiento}</div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-label">{t.duracion}</div>
        <div className="stat-value">
          {formData.tiempoEntrenamiento.replace("_", " ")}
        </div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-label">{t.objetivo}</div>
        <div className="stat-value">
          {formData.objetivo === "ganar_musculo" ? t.masa : 
          formData.objetivo === "perder_grasa" ? t.definicion : t.mantenimiento}
        </div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="stat-label">{t.nivel}</div>
        <div className="stat-value">
          {formData.experiencia.charAt(0).toUpperCase() + 
          formData.experiencia.slice(1)}
        </div>
      </motion.div>
    </div>
  );
}

ResumenStats.propTypes = {
  formData: PropTypes.shape({
    objetivo: PropTypes.string.isRequired,
    tiempoEntrenamiento: PropTypes.string.isRequired,
    experiencia: PropTypes.string.isRequired,
  }).isRequired,
  t: PropTypes.object.isRequired,
  diasEntrenamiento: PropTypes.number.isRequired,
};

export default ResumenStats;