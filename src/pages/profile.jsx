import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Formulario from "../components/Formulario";
import "../styles/Profile.css";

function Profile() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nombre, setNombre] = useState(userProfile?.nombre || "");
  const [nombreError, setNombreError] = useState("");
  const [nombreChangedCount, setNombreChangedCount] = useState(userProfile?.nombre_changed_count || 0);
  const [nombreSuccess, setNombreSuccess] = useState("");
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

  // Validación: solo letras y espacios, mínimo 2 caracteres
  const validateNombre = (value) => {
    if (!value || value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$/.test(value.trim())) return "Solo se permiten letras y espacios.";
    return "";
  };

  const handleNombreEdit = () => {
    setEditingName(true);
    setNombreError("");
    setNombreSuccess("");
  };

  const handleNombreCancel = () => {
    setEditingName(false);
    setNombre(userProfile?.nombre || "");
    setNombreError("");
    setNombreSuccess("");
  };

  const handleNombreSave = async () => {
    const error = validateNombre(nombre);
    if (error) {
      setNombreError(error);
      return;
    }
    if (nombreChangedCount >= 2) {
      setNombreError("Solo puedes cambiar tu nombre 2 veces.");
      return;
    }
    // Actualizar en la base de datos
    const { error: updateError } = await updateUserProfile({ nombre, nombre_changed_count: (nombreChangedCount + 1) });
    if (updateError) {
      setNombreError("Error al guardar el nombre. Intenta de nuevo.");
      return;
    }
    setNombreSuccess("¡Nombre actualizado!");
    setNombreError("");
    setEditingName(false);
    setNombreChangedCount(nombreChangedCount + 1);
    window.location.reload(); // Refrescar para ver el cambio en toda la app
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      className="edit-nombre-input"
                      maxLength={40}
                      autoFocus
                    />
                    <button className="btn-primary" style={{padding: '0.2rem 0.7rem', fontSize: '1rem'}} onClick={handleNombreSave}>Guardar</button>
                    <button className="btn-secondary" style={{padding: '0.2rem 0.7rem', fontSize: '1rem'}} onClick={handleNombreCancel}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <h2 style={{margin: 0}}>{getUserDisplayName()}</h2>
                    <button
                      className="edit-nombre-btn"
                      title="Editar nombre"
                      onClick={handleNombreEdit}
                      disabled={nombreChangedCount >= 2}
                      style={{background: 'none', border: 'none', cursor: nombreChangedCount < 2 ? 'pointer' : 'not-allowed', color: '#2563eb', fontSize: '1.2rem'}}
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                  </>
                )}
              </div>
              {nombreError && <div className="error-message" style={{marginTop: 8}}>{nombreError}</div>}
              {nombreSuccess && <div className="info-message" style={{marginTop: 8}}>{nombreSuccess}</div>}
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