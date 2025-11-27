import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

function EjercicioItem({ ejercicio, index, setEjercicioSeleccionado }) {
  // Verificar si ejercicio es un objeto o un string
  const nombreEjercicio = typeof ejercicio === 'object' ? ejercicio.nombre : ejercicio;
  const series = ejercicio.series || 3;
  const repeticionesMin = ejercicio.repeticiones_min || 8;
  const repeticionesMax = ejercicio.repeticiones_max || 12;

  const getSeriesReps = (ejercicioIndex) => {
    const esCompuesto = ejercicioIndex === 0;
    return `${series}x${esCompuesto ? `${repeticionesMin}-${repeticionesMax}` : `${repeticionesMin}-${repeticionesMax}`}`;
  };

  return (
    <motion.li
      className="ejercicio-item"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="ejercicio-info">
        <div className="ejercicio-nombre">{nombreEjercicio}</div>
      </div>
      <div className="ejercicio-series">{getSeriesReps(index)}</div>
      <button
        className="info-button"
        aria-label={`Detalles de ${nombreEjercicio}`}
        onClick={() => setEjercicioSeleccionado(ejercicio)}
      >
        i
      </button>
    </motion.li>
  );
}

EjercicioItem.propTypes = {
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
  index: PropTypes.number.isRequired,
  setEjercicioSeleccionado: PropTypes.func.isRequired,
};

export default EjercicioItem;