/**
 * ListaDias.jsx
 * 
 * Este componente muestra la lista de los días de la rutina de entrenamiento.
 * Permite al usuario seleccionar un día para ver los ejercicios correspondientes.
 * Se usa dentro de CalendarioRutina.jsx y maneja la lógica de selección de días.
 */

import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

function ListaDias({ diasRutina, t, diaSeleccionado, handleClickDia }) {
  return (
    <div className="dias-semana">
      {diasRutina.map(([dia, descripcion, esDescanso, index]) => {
        const esSeleccionado = diaSeleccionado === index;

        return (
          <motion.div
            key={dia}
            className={`dia-semana ${esDescanso ? "dia-descanso" : esSeleccionado ? "dia-seleccionado" : "dia-activo"}`}
            onClick={!esDescanso ? () => handleClickDia(index) : undefined}
            onKeyDown={(e) => !esDescanso && e.key === "Enter" && handleClickDia(index)}
            role="button"
            tabIndex={!esDescanso ? "0" : undefined}
            aria-label={`${dia}: ${descripcion}`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={!esDescanso ? { scale: 1.05 } : {}}
            whileTap={!esDescanso ? { scale: 0.98 } : {}}
          >
            <div className="dia-nombre">{dia}</div>
            <div className="dia-descripcion">{esDescanso ? descripcion : 'Entreno'}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

ListaDias.propTypes = {
  diasRutina: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]))).isRequired,
  t: PropTypes.object.isRequired,
  diaSeleccionado: PropTypes.number,
  handleClickDia: PropTypes.func.isRequired,
};

export default ListaDias;