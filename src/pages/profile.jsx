import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Formulario from "../components/Formulario";
import "../styles/Profile.css";

function Profile() {
  const { user, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const getDiasPorSemana = () => {
    if (!userProfile?.dias_semana) return 0;
    return parseInt(userProfile.dias_semana.split('_')[0]);
  };

  const getUserDisplayName = () => {
    if (userProfile?.nombre) return userProfile.nombre;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  if (!userProfile) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <h1>👤 Mi Perfil</h1>
          <div className="no-profile-message">
            <p>No tienes un perfil configurado.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Ir a Home para configurar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>👤 Mi Perfil</h1>
          <p>Gestiona tu información personal y configuración de entrenamiento</p>
        </div>

        <div className="profile-layout">
          <div className="profile-info-card">
            <div className="profile-avatar-large">
              {getUserInitials()}
            </div>
            
            <div className="profile-details">
              <h2>{getUserDisplayName()}</h2>
              <p className="profile-email">{user?.email}</p>
              
              <div className="profile-stats-grid">
                <div className="stat-item">
                  <span className="stat-icon">📅</span>
                  <div className="stat-content">
                    <span className="stat-value">{getDiasPorSemana()}</span>
                    <span className="stat-label">Días por semana</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <div className="stat-content">
                    <span className="stat-value">
                      {userProfile.objetivo === 'ganar_musculo' ? 'Ganar músculo' : 
                       userProfile.objetivo === 'perder_grasa' ? 'Perder grasa' : 'Mantener'}
                    </span>
                    <span className="stat-label">Objetivo</span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <div className="stat-content">
                    <span className="stat-value">{userProfile.experiencia || 'No definido'}</span>
                    <span className="stat-label">Nivel</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/rutina')}
                >
                  🏋️ Ver Mi Rutina
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? '🔒 Cancelar Edición' : '✏️ Editar Perfil'}
                </button>
              </div>
            </div>
          </div>

          <div className="profile-details-card">
            <h3>📊 Información Personal</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Altura:</span>
                <span className="detail-value">{userProfile.altura} cm</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Peso:</span>
                <span className="detail-value">{userProfile.peso} kg</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Edad:</span>
                <span className="detail-value">{userProfile.edad} años</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sexo:</span>
                <span className="detail-value">
                  {userProfile.sexo === 'masculino' ? 'Masculino' : 'Femenino'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tiempo de entrenamiento:</span>
                <span className="detail-value">
                  {userProfile.tiempo_entrenamiento === '30_min' ? '30 minutos' : 
                   userProfile.tiempo_entrenamiento === '1_hora' ? '1 hora' : '2 horas'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Días de entrenamiento:</span>
                <span className="detail-value">{getDiasPorSemana()} días por semana</span>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-form-section">
            <Formulario />
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile; 