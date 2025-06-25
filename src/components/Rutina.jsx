import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Formulario from "./Formulario";
import CalendarioRutina from "./CalendarioRutina";
import "../styles/Global.css";
import "../styles/Rutina.css";

function Rutina() {
  // Estado inicial completo (igual a tu versión)
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

  // Persistencia (localStorage)
  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) setFormData(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  // Handlers idénticos a tu versión original
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarDatos = () => {
    const { altura, peso, edad } = formData;
    if (isNaN(altura) || isNaN(peso) || isNaN(edad)) {
      setError("Valores numéricos inválidos");
      return false;
    }
    setError("");
    return true;
  };

  const seleccionarRutina = (dias) => {
    if (dias >= 5) return "PUSH PULL LEGS";
    if (dias === 4) return "UPPER LOWER";
    return "FULL BODY";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarDatos()) return;
    const dias = parseInt(formData.diasSemana.split("_")[0]);
    setRutinaSeleccionada(seleccionarRutina(dias));
    setFormCompletado(true);
  };

  const reiniciarFormulario = () => {
    setFormData({
      objetivo: "",
      tiempoEntrenamiento: "",
      diasSemana: "",
      peso: "",
      altura: "",
      edad: "",
      sexo: "",
    });
    setRutinaSeleccionada("");
    setFormCompletado(false);
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
            <label htmlFor="">Completa el formulario para obtener tu plan personalizado de entrenamiento y nutrición</label>
            <Formulario
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              error={error}
              setFormData={setFormData}
              setRutinaSeleccionada={setRutinaSeleccionada}
              reiniciarFormulario={reiniciarFormulario}
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
            <CalendarioRutina
              rutinaSeleccionada={rutinaSeleccionada}
              diasSemana={parseInt(formData.diasSemana.split("_")[0])}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Rutina;