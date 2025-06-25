import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

function EjercicioItem({ ejercicio, index, t, setEjercicioSeleccionado }) {
  const getSeriesReps = (ejercicioIndex) => {
    const esCompuesto = ejercicioIndex === 0;
    return `4${t.series === "Series" ? "x" : " sets of "}${esCompuesto ? "8-10" : "10-12"}`;
  };

  return (
    <motion.li
      className="ejercicio-item"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="ejercicio-info">
        <div className="ejercicio-nombre">{ejercicio}</div>
      </div>
      <div className="ejercicio-series">{getSeriesReps(index)}</div>
      <button
        className="info-button"
        aria-label={`Detalles de ${ejercicio}`}
        onClick={() => setEjercicioSeleccionado(ejercicio)}
      >
        i
      </button>
    </motion.li>
  );
}

EjercicioItem.propTypes = {
  ejercicio: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  t: PropTypes.object.isRequired,
  setEjercicioSeleccionado: PropTypes.func.isRequired,
};

export default EjercicioItem;