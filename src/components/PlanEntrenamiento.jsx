import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Formulario from "./Formulario.jsx";
import CalendarioPlan from "../components/CalendarioRutina";
import { seleccionarRutina } from "../utils/calcularRutina.js";
import { validarDatos } from "../utils/validaciones.js";
import "../styles/PlanEntrenamiento.css";

function PlanEntrenamiento() {
  const [formData, setFormData] = useState({
    objetivo: "",
    tiempoEntrenamiento: "",
    diasSemana: "",
    peso: "",
    altura: "",
    edad: "",
    sexo: "",
  });

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState("");
  const [error, setError] = useState("");
  const [formCompletado, setFormCompletado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
const errorMensaje = validarDatos(formData);
    if (errorMensaje) {
      setError(errorMensaje);
      return;
    }

    const dias = parseInt(formData.diasSemana.split("_")[0]);
    setRutinaSeleccionada(seleccionarRutina(dias));
    setFormCompletado(true);
  };

  return (
    <div className="home-container">
      <AnimatePresence mode="wait">
        {!formCompletado ? (
          <motion.div
            key="formulario"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <h1>¡Comienza tu transformación!</h1>
            <Formulario
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              error={error}
            />
          </motion.div>
        ) : (
          <motion.div
            key="calendario"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5 }}
          >
            <CalendarioPlan rutinaSeleccionada={rutinaSeleccionada} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlanEntrenamiento;