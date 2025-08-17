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

  // Calcular IMC
  const calcularIMC = () => {
    if (!formData?.altura || !formData?.peso) return null;
    const alturaMetros = formData.altura / 100;
    return (formData.peso / (alturaMetros * alturaMetros)).toFixed(1);
  };

  const imc = calcularIMC();

  // Función para formatear el tiempo de entrenamiento
  const formatearTiempo = (tiempo) => {
    if (!tiempo) return "No especificado";
    
    const tiempoStr = tiempo.toString();
    if (tiempoStr.includes("_")) {
      return tiempoStr.replace("_", " ");
    }
    return tiempoStr;
  };

  // Función para formatear el objetivo
  const formatearObjetivo = (objetivo) => {
    if (!objetivo) return "No especificado";
    
    switch (objetivo) {
      case "ganar_musculo":
        return t.masa || "Ganar músculo";
      case "perder_grasa":
        return t.definicion || "Perder grasa";
      case "mantener":
        return t.mantenimiento || "Mantener";
      default:
        return objetivo;
    }
  };

  // Función para formatear la experiencia
  const formatearExperiencia = (experiencia) => {
    if (!experiencia) return "No especificado";
    
    const experienciaStr = experiencia.toString();
    return experienciaStr.charAt(0).toUpperCase() + experienciaStr.slice(1);
  };

  // Obtener el tiempo de entrenamiento del perfil (puede estar en diferentes propiedades)
  const tiempoEntrenamiento = formData?.tiempo_entrenamiento || formData?.tiempoEntrenamiento;
  const objetivo = formData?.objetivo;
  const experiencia = formData?.experiencia;

  // Verificar si tenemos datos válidos
  const hasValidData = !!(formData && (formData.altura || formData.peso || formData.objetivo || formData.experiencia || formData.tiempo_entrenamiento || formData.tiempoEntrenamiento))

  return (
    <div className="resumen-stats">
      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-label">{t?.dias_semana || "Días por semana"}</div>
        <div className="stat-value">{diasEntrenamiento || 0}</div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-label">{t?.duracion || "Duración"}</div>
        <div className="stat-value">
          {hasValidData && tiempoEntrenamiento ? formatearTiempo(tiempoEntrenamiento) : "No especificado"}
        </div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-label">{t?.objetivo || "Objetivo"}</div>
        <div className="stat-value">
          {hasValidData && objetivo ? formatearObjetivo(objetivo) : "No especificado"}
        </div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="stat-label">{t?.nivel || "Nivel"}</div>
        <div className="stat-value">
          {hasValidData && experiencia ? formatearExperiencia(experiencia) : "No especificado"}
        </div>
      </motion.div>
    </div>
  );
}

ResumenStats.propTypes = {
  formData: PropTypes.shape({
    objetivo: PropTypes.string,
    tiempo_entrenamiento: PropTypes.string,
    tiempoEntrenamiento: PropTypes.string,
    experiencia: PropTypes.string,
  }),
  t: PropTypes.object,
  diasEntrenamiento: PropTypes.number,
};

export default ResumenStats;