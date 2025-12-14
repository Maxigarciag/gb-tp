/**
 * ResumenStats.jsx
 * 
 * Este componente muestra las estadísticas generales de la rutina de entrenamiento, 
 * como la cantidad de días de entrenamiento, duración de las sesiones, objetivo y nivel del usuario.
 * Se usa dentro de CalendarioRutina.jsx para proporcionar un resumen visual de los datos ingresados por el usuario.
 */

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

function ResumenStats({ formData, diasEntrenamiento, routineData }) {
  const containerRef = useRef(null);
  const location = useLocation();

  // Forzar reinicialización del layout cuando cambia la ruta o los datos
  useEffect(() => {
    const forceLayout = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        // Forzar el layout correcto inmediatamente
        container.style.setProperty('display', 'grid', 'important');
        container.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
        container.style.setProperty('width', '100%', 'important');
        container.style.setProperty('max-width', '100%', 'important');
        
        // Asegurar que los hijos también tengan el layout correcto
        const children = Array.from(container.children);
        children.forEach((child, index) => {
          child.style.setProperty('grid-column', `${index + 1}`, 'important');
          child.style.setProperty('grid-row', '1', 'important');
          child.style.setProperty('width', '100%', 'important');
          child.style.setProperty('max-width', '100%', 'important');
        });
        
        // Forzar recálculo del layout
        void container.offsetHeight;
      }
    };

    // Ejecutar inmediatamente
    forceLayout();
    
    // También ejecutar después de que el navegador procese
    requestAnimationFrame(() => {
      forceLayout();
      requestAnimationFrame(forceLayout);
    });
  }, [location.pathname, formData, diasEntrenamiento, routineData]);

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
        return "Ganar músculo";
      case "perder_grasa":
        return "Perder grasa";
      case "mantener":
        return "Mantener";
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

  // Calcular duración basada en la rutina si no hay datos del perfil
  const calcularDuracion = () => {
    if (tiempoEntrenamiento) {
      return formatearTiempo(tiempoEntrenamiento);
    }
    
    // Si no hay datos del perfil, calcular basado en la rutina
    if (routineData?.routine_days) {
      const totalEjercicios = routineData.routine_days.reduce((total, day) => {
        return total + (day.routine_exercises?.length || 0);
      }, 0);
      
      const diasEntrenamiento = routineData.routine_days.filter(day => !day.es_descanso).length;
      
      if (totalEjercicios > 0 && diasEntrenamiento > 0) {
        const ejerciciosPorDia = totalEjercicios / diasEntrenamiento;
        const tiempoEstimado = Math.round(ejerciciosPorDia * 5); // ~5 min por ejercicio
        return `${tiempoEstimado} min`;
      }
    }
    
    return "No especificado";
  };

  // Calcular objetivo basado en la rutina si no hay datos del perfil
  const calcularObjetivo = () => {
    if (objetivo) {
      return formatearObjetivo(objetivo);
    }
    
    // Si no hay datos del perfil, usar el tipo de rutina
    if (routineData?.tipo_rutina) {
      switch (routineData.tipo_rutina) {
        case 'FULL BODY':
          return 'Ganar músculo';
        case 'UPPER LOWER':
          return 'Ganar músculo';
        case 'PUSH PULL LEGS':
          return 'Ganar músculo';
        case 'ARNOLD SPLIT':
          return 'Ganar músculo';
        default:
          return 'Personalizado';
      }
    }
    
    return "No especificado";
  };

  // Calcular nivel basado en la rutina si no hay datos del perfil
  const calcularNivel = () => {
    if (experiencia) {
      return formatearExperiencia(experiencia);
    }
    
    // Si no hay datos del perfil, calcular basado en la complejidad de la rutina
    if (routineData?.routine_days) {
      const diasEntrenamiento = routineData.routine_days.filter(day => !day.es_descanso).length;
      
      if (diasEntrenamiento <= 3) {
        return 'Principiante';
      } else if (diasEntrenamiento <= 5) {
        return 'Intermedio';
      } else {
        return 'Avanzado';
      }
    }
    
    return "No especificado";
  };

  // Verificar si tenemos datos válidos
  const hasValidData = !!(formData && (formData.altura || formData.peso || formData.objetivo || formData.experiencia || formData.tiempo_entrenamiento || formData.tiempoEntrenamiento)) || routineData;

  return (
    <div 
      className="resumen-stats" 
      ref={containerRef} 
      style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        width: '100%',
        gap: 'var(--spacing-xs)'
      }}
    >
      <motion.div 
        className="stat-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        style={{ gridColumn: 'auto', gridRow: 'auto' }}
      >
        <div className="stat-label">Días por semana</div>
        <div className="stat-value">{diasEntrenamiento || 0}</div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        style={{ gridColumn: 'auto', gridRow: 'auto' }}
      >
        <div className="stat-label">Duración</div>
        <div className="stat-value">
          {hasValidData ? calcularDuracion() : "No especificado"}
        </div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        style={{ gridColumn: 'auto', gridRow: 'auto' }}
      >
        <div className="stat-label">Objetivo</div>
        <div className="stat-value">
          {hasValidData ? calcularObjetivo() : "No especificado"}
        </div>
      </motion.div>

      <motion.div 
        className="stat-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.2 }}
        style={{ gridColumn: 'auto', gridRow: 'auto' }}
      >
        <div className="stat-label">Nivel</div>
        <div className="stat-value">
          {hasValidData ? calcularNivel() : "No especificado"}
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
  diasEntrenamiento: PropTypes.number,
  routineData: PropTypes.object,
};

export default ResumenStats;