import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Formulario from "../components/Formulario";

function Home() {
  const { user, userProfile } = useAuth();
  const [isFormUnlocked, setIsFormUnlocked] = useState(false);
  const navigate = useNavigate();

  // Función para obtener días por semana
  const getDiasPorSemana = () => {
    if (!userProfile?.dias_semana) return 0;
    return parseInt(userProfile.dias_semana.split('_')[0]);
  };

  // Función para obtener el próximo entrenamiento
  const getProximoEntrenamiento = () => {
    if (!userProfile) return null;
    
    const dias = getDiasPorSemana();
    if (dias === 3) return "Día 1 - Full Body";
    if (dias === 4) return "Día 1 - Upper Body";
    if (dias === 6) return "Día 1 - Push";
    return "Día 1 - Entrenamiento";
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1>🏋️ Get Big</h1>
          <p className="hero-subtitle">Tu rutina personalizada de entrenamiento</p>
        </div>
        
        {!userProfile ? (
          // Usuario sin perfil - mostrar formulario desbloqueado
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
          // Usuario con perfil - mostrar dashboard
          <div className="dashboard-section">
            <div className="dashboard-grid">
              {/* Próximo Entrenamiento */}
              <div className="dashboard-card next-workout">
                <div className="card-header">
                  <h3>🎯 Próximo Entrenamiento</h3>
                  <span className="card-badge">Hoy</span>
                </div>
                <div className="workout-info">
                  <div className="workout-name">{getProximoEntrenamiento()}</div>
                  <div className="workout-details">
                    <span>⏰ Duración: 1 hora</span>
                    <span>💪 Ejercicios: 6</span>
                    <span>🎯 Objetivo: {userProfile.objetivo === 'ganar_musculo' ? 'Ganar músculo' : userProfile.objetivo === 'perder_grasa' ? 'Perder grasa' : 'Mantener'}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/rutina')}
                  >
                    🏋️ Comenzar Entrenamiento
                  </button>
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="dashboard-card stats-card">
                <div className="card-header">
                  <h3>📊 Tu Progreso</h3>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-icon">🏋️‍♂️</span>
                    <div className="stat-content">
                      <span className="stat-value">12</span>
                      <span className="stat-label">Rutinas completadas</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div className="stat-content">
                      <span className="stat-value">45</span>
                      <span className="stat-label">Días entrenados</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <div className="stat-content">
                      <span className="stat-value">36h</span>
                      <span className="stat-label">Tiempo total</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <div className="stat-content">
                      <span className="stat-value">80%</span>
                      <span className="stat-label">Objetivo completado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="dashboard-card actions-card">
                <div className="card-header">
                  <h3>⚡ Acciones Rápidas</h3>
                </div>
                <div className="actions-grid">
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/rutina')}
                  >
                    <span className="action-icon">🏋️</span>
                    <span>Ver Mi Rutina</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/profile')}
                  >
                    <span className="action-icon">👤</span>
                    <span>Mi Perfil</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setIsFormUnlocked(true)}
                  >
                    <span className="action-icon">✏️</span>
                    <span>Editar Perfil</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/rutina')}
                  >
                    <span className="action-icon">📅</span>
                    <span>Calendario</span>
                  </button>
                </div>
              </div>

              {/* Información del Perfil */}
              <div className="dashboard-card profile-summary">
                <div className="card-header">
                  <h3>👤 Tu Perfil</h3>
                </div>
                <div className="profile-summary-content">
                  <div className="profile-avatar">👤</div>
                  <div className="profile-info">
                    <h4>{userProfile.nombre || 'Usuario'}</h4>
                    <p>Tu perfil está configurado y listo para entrenar</p>
                    <div className="profile-stats">
                      <span className="stat-badge">📅 {getDiasPorSemana()} días</span>
                      <span className="stat-badge">🎯 {userProfile.objetivo === 'ganar_musculo' ? 'Ganar músculo' : userProfile.objetivo === 'perder_grasa' ? 'Perder grasa' : 'Mantener'}</span>
                      <span className="stat-badge">⭐ {userProfile.experiencia || 'No definido'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isFormUnlocked && (
              <div className="edit-form-section">
                <Formulario />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
