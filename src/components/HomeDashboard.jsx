import React from "react";
import Button from "./Button";
import "../styles/HomeDashboard.css";

const HomeDashboard = ({ 
  nombreUsuario, 
  rutinaHoy, 
  onEditProfile 
}) => {
  return (
    <div className="home-dashboard-outer">
      <div className="home-dashboard-card">
        <div className="dashboard-header">
          <h2>¡Hola, {nombreUsuario}!</h2>
          <p className="dashboard-mensaje">¡Estás listo para avanzar hacia tus objetivos!</p>
        </div>
        <div className="dashboard-today-block">
          <span>Hoy:</span> <strong>{rutinaHoy}</strong>
        </div>
        <div className="dashboard-actions-block">
          <Button variant="primary" size="large" onClick={onEditProfile}>
            Editar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard; 