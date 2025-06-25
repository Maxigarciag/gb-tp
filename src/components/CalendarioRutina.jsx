import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ResumenStats from "./ResumenStats.jsx";
import ListaDias from "./ListaDias.jsx";
import EjercicioGrupo from "./EjercicioGrupo.jsx";
import InfoEjercicioCard from "./InfoEjercicioCard.jsx";
import { useEjerciciosDelDia } from "../utils/useEjerciciosDelDia.js";
import { useEjerciciosAgrupados } from "../utils/useEjerciciosAgrupados.js";
import { rutinas } from "../utils/rutinas.js";
import { traducciones } from "../utils/traducciones.js";
import "../styles/CalendarioRutina.css";

function CalendarioRutina() {
  const location = useLocation();
  const rutinaSeleccionada = location.state?.rutina || null;
  const formData = location.state?.formData || {};

  if (!rutinaSeleccionada || Object.keys(formData).length === 0) {
    return (
      <div className="calendario-rutina">
        <p className="error-message">
          No se ha generado una rutina. Por favor, completa el formulario desde la página principal.
        </p>
      </div>
    );
  }

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [gruposExpandidos, setGruposExpandidos] = useState({});
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const language = "es";
  const t = traducciones[language];

  const rutina = rutinas[rutinaSeleccionada] || rutinas["FULL BODY"];
  const diasRutina = Object.entries(rutina);

  const diasEntrenamiento = useMemo(() =>
    diasRutina
      .map(([dia, descripcion], index) => ({ dia, descripcion, index }))
      .filter(({ descripcion }) => !descripcion.toLowerCase().includes(t.descanso.toLowerCase()))
  , [diasRutina, t.descanso]);

  const ejerciciosActuales = useEjerciciosDelDia(diaSeleccionado, diasRutina);
  const ejerciciosAgrupados = useEjerciciosAgrupados(ejerciciosActuales);

  useEffect(() => {
    if (diasEntrenamiento.length > 0 && diaSeleccionado === null) {
      setDiaSeleccionado(diasEntrenamiento[0].index);
    }
  }, [diasEntrenamiento, diaSeleccionado]);

  useEffect(() => {
    if (Object.keys(ejerciciosAgrupados).length > 0 && Object.keys(gruposExpandidos).length === 0) {
      const primerGrupo = Object.keys(ejerciciosAgrupados)[0];
      setGruposExpandidos({ [primerGrupo]: true });
    }
  }, [ejerciciosAgrupados]);

  const handleClickDia = useCallback((index) => {
    setDiaSeleccionado(index);
  }, []);

  const toggleGrupo = useCallback((grupo) => {
    setGruposExpandidos(prev => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  }, []);

  return (
    <div className="calendario-rutina">
      <ResumenStats formData={formData} t={t} diasEntrenamiento={diasEntrenamiento.length} />
      <h4 className="seccion-titulo">Distribución semanal</h4>
      <ListaDias
        diasRutina={diasRutina}
        t={t}
        diaSeleccionado={diaSeleccionado}
        handleClickDia={handleClickDia}
      />

      {diaSeleccionado !== null && (
        <motion.div className="rutina-detalle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <EjercicioGrupo
            ejerciciosAgrupados={ejerciciosAgrupados}
            gruposExpandidos={gruposExpandidos}
            toggleGrupo={toggleGrupo}
            setEjercicioSeleccionado={setEjercicioSeleccionado}
            t={t}
          />
        </motion.div>
      )}

      {ejercicioSeleccionado && (
        <InfoEjercicioCard
          ejercicio={ejercicioSeleccionado}
          onClose={() => setEjercicioSeleccionado(null)}
        />
      )}
    </div>
  );
}

export default CalendarioRutina;