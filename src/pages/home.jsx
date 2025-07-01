import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Formulario from "../components/Formulario";
import HomeDashboard from "../components/HomeDashboard";
import { rutinas, obtenerRutinaRecomendada } from "../utils/rutinas";

const diasSemanaES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];

function Home() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Determinar el nombre del usuario
  const nombreUsuario = userProfile?.nombre || "Usuario";

  // Calcular el día de la semana actual en español
  const hoy = new Date();
  const diaSemana = diasSemanaES[hoy.getDay()];

  // Obtener el tipo de rutina personalizada del usuario
  let rutinaHoy = "";
  if (userProfile) {
    const tipoRutina = obtenerRutinaRecomendada(
      userProfile.objetivo,
      userProfile.tiempo_entrenamiento || userProfile.tiempoEntrenamiento,
      userProfile.dias_semana
    );
    if (tipoRutina && rutinas[tipoRutina] && rutinas[tipoRutina][diaSemana]) {
      rutinaHoy = rutinas[tipoRutina][diaSemana];
    } else {
      rutinaHoy = "Descanso o sin rutina asignada";
    }
  }

  const handleEditProfile = () => {
    // Navegar a la página de perfil en lugar de mostrar el formulario
    navigate("/profile");
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {!userProfile ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-icon">📝</div>
              <h2>¡Comienza tu transformación!</h2>
              <p>Completa el formulario para obtener tu rutina personalizada de entrenamiento.</p>
              <div className="benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🎯</span>
                  <span>Rutina adaptada a tu objetivo</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📅</span>
                  <span>Planificación semanal personalizada</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💪</span>
                  <span>Ejercicios específicos para tu nivel</span>
                </div>
              </div>
            </div>
            <Formulario />
          </div>
        ) : (
          <HomeDashboard
            nombreUsuario={nombreUsuario}
            rutinaHoy={rutinaHoy}
            onEditProfile={handleEditProfile}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
