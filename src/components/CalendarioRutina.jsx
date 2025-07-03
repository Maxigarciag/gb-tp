import React from "react";
import { useAuth } from "../contexts/AuthContext";
import RutinaGlobalOptimized from "./RutinaGlobalOptimized.jsx";

function CalendarioRutina() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="calendario-rutina">
        <div className="info-message">
          <h2>Perfil requerido</h2>
          <p>Necesitas completar tu perfil para ver tu rutina.</p>
          <p>Ve al formulario para crear tu perfil.</p>
        </div>
      </div>
    );
  }

  return <RutinaGlobalOptimized />;
}

export default CalendarioRutina;