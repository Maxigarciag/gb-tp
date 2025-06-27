import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import EjercicioItem from "./EjercicioItem.jsx";
/**
- EjercicioGrupo.jsx
- Este componente muestra los grupos de ejercicios de la rutina seleccionada.
- Cada grupo puede expandirse para revelar los ejercicios dentro de él.
- Se usa dentro de CalendarioRutina.jsx para visualizar la rutina diaria. */

function EjercicioGrupo({ ejerciciosAgrupados, gruposExpandidos, toggleGrupo, setEjercicioSeleccionado, t }) { // ✅ Agregado setEjercicioSeleccionado
  return (
    <div className="grupos-ejercicios-container">
      {Object.entries(ejerciciosAgrupados).map(([grupo, ejercicios]) => (
        <div key={grupo} className="grupo-ejercicios">
          <motion.div
            className="grupo-header"
            onClick={() => toggleGrupo(grupo)}
            onKeyDown={(e) => e.key === "Enter" && toggleGrupo(grupo)}
            role="button"
            tabIndex="0"
            aria-expanded={!!gruposExpandidos[grupo]}
            aria-controls={`grupo-content-${grupo}`}
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <div className="grupo-titulo">
              {grupo}
              <motion.span
                animate={{ rotate: gruposExpandidos[grupo] ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flecha"
              >
                ▼
              </motion.span>
            </div>
            <div className="ejercicios-count">
              {ejercicios.length} {ejercicios.length === 1 ? "ejercicio" : "ejercicios"}
            </div>
          </motion.div>

          <AnimatePresence>
            {gruposExpandidos[grupo] && (
              <motion.div
                id={`grupo-content-${grupo}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grupo-contenido"
              >
                <ul className="ejercicios-lista">
                  {ejercicios.map((ejercicio, index) => (
                    <EjercicioItem 
                      key={`${grupo}-${ejercicio.id || index}`} 
                      ejercicio={ejercicio} 
                      index={index} 
                      t={t} 
                      setEjercicioSeleccionado={setEjercicioSeleccionado}
                    />
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

EjercicioGrupo.propTypes = {
  ejerciciosAgrupados: PropTypes.object.isRequired,
  gruposExpandidos: PropTypes.object.isRequired,
  toggleGrupo: PropTypes.func.isRequired,
  setEjercicioSeleccionado: PropTypes.func.isRequired, // ✅ Agregado para evitar el warning
  t: PropTypes.object.isRequired,
};

export default EjercicioGrupo;