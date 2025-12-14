/**
 * Página de perfil del usuario
 * Muestra información del usuario, permite editar perfil y gestionar configuración
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUIStore, useUserStore } from '@/stores'
import FormularioOptimized from '@/features/rutinas/components/FormularioOptimized'
import '@/styles/components/usuario/Profile.css'
import { userProgress, exerciseLogs } from '@/lib/supabase'

function Profile() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { theme, toggleTheme, setTheme, showSuccess, showError } = useUIStore();
  const { deleteAccount, loading: deleteLoading, error: deleteError } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nombre, setNombre] = useState(userProfile?.nombre || "");
  const [nombreError, setNombreError] = useState("");
  const [nombreChangedCount, setNombreChangedCount] = useState(userProfile?.nombre_changed_count || 0);
  const [nombreSuccess, setNombreSuccess] = useState("");
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Detectar parámetro tab en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'settings', 'edit'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

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

  const handleFormSuccess = () => {
    setIsEditing(false);
    // Navegar a la rutina después de actualizar el perfil
    navigate('/rutina');
  };

  const handleFormCancel = () => {
    setActiveTab('overview');
  };

  // Funciones de configuración
  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled)
    // Aquí se podría implementar la lógica real de notificaciones
  }

  const handleExportData = async () => {
    try {
      // Obtener todos los registros de progreso (sin límite)
      const { data: progressData, error: progressError } = await userProgress.getUserProgress(1000);
      // Obtener todos los logs de ejercicios (sin límite)
      const { data: logsData, error: logsError } = await exerciseLogs.getByUser?.(user?.id) || { data: [], error: null };
      if (progressError || logsError) {
        alert('Error al obtener los datos para exportar.');
        return;
      }
      // Formatear CSV de progreso corporal
      const progressHeaders = ['fecha', 'peso', 'grasa', 'musculo'];
      const progressRows = progressData.map(r => [r.fecha, r.peso, r.grasa, r.musculo]);
      const progressCsv = [progressHeaders.join(','), ...progressRows.map(row => row.join(','))].join('\n');
      // Formatear CSV de logs de ejercicios
      const logsHeaders = ['fecha', 'ejercicio', 'peso', 'reps', 'rpe'];
      const logsRows = (logsData || []).map(l => [l.created_at?.slice(0, 10), l.exercises?.nombre, l.peso, l.reps, l.rpe]);
      const logsCsv = [logsHeaders.join(','), ...logsRows.map(row => row.join(','))].join('\n');
      // Unir ambos CSV en un solo archivo (separados por sección)
      const fullCsv = `# Progreso corporal\n${progressCsv}\n\n# Logs de ejercicios\n${logsCsv}`;
      // Descargar archivo
      const blob = new Blob([fullCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `getbig-export-${user?.email || 'usuario'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('¡Datos exportados correctamente!');
    } catch (err) {
      alert('Error inesperado al exportar los datos.');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const success = await deleteAccount();

      if (!success) {
        console.error(`Error al eliminar cuenta: ${deleteError || 'Error desconocido'}`);
        return;
      }

      setShowDeleteConfirm(false);

      // Redirigir al home después de un breve delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error inesperado al eliminar cuenta', error);
    }
  }

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
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

  const renderOverviewTab = () => (
    <div className="profile-overview">
      <div className="quick-stats-grid">
        <div className="quick-stat-card">
          <div className="quick-stat-icon">📅</div>
          <div className="quick-stat-content">
            <h4>Días de Entrenamiento</h4>
            <p>{getDiasPorSemana()} días por semana</p>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon">🎯</div>
          <div className="quick-stat-content">
            <h4>Objetivo Principal</h4>
            <p>
              {userProfile.objetivo === 'ganar_musculo' ? 'Ganar músculo' :
                userProfile.objetivo === 'perder_grasa' ? 'Perder grasa' : 'Mantener forma'}
            </p>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon">⭐</div>
          <div className="quick-stat-content">
            <h4>Nivel de Experiencia</h4>
            <p>{userProfile.experiencia || 'No definido'}</p>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon">⏱️</div>
          <div className="quick-stat-content">
            <h4>Tiempo por Sesión</h4>
            <p>
              {userProfile.tiempo_entrenamiento === '30_min' ? '30 minutos' :
                userProfile.tiempo_entrenamiento === '1_hora' ? '1 hora' :
                  userProfile.tiempo_entrenamiento === '2_horas' ? '2 horas' : 'No definido'}
            </p>
          </div>
        </div>
      </div>

      <div className="quick-actions-grid">
        <button
          className="quick-action-btn primary"
          onClick={() => navigate('/rutina')}
        >
          <i className="fas fa-dumbbell"></i>
          <span>Ver Mi Rutina</span>
        </button>
        <button
          className="quick-action-btn secondary"
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog"></i>
          <span>Configuración</span>
        </button>
        <button
          className="quick-action-btn secondary"
          onClick={() => navigate('/formulario')}
        >
          <i className="fas fa-clipboard-list"></i>
          <span>Nuevo Formulario</span>
        </button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="profile-settings">
      <div className="settings-section">
        <h3>⚙️ Configuración General</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Notificaciones</h4>
              <p>Recibir recordatorios de entrenamiento</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationsToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Modo Oscuro</h4>
              <p>Cambiar entre tema claro y oscuro</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={handleThemeToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🔒 Privacidad y Datos</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Exportar Datos</h4>
              <p>Descargar toda tu información personal</p>
            </div>
            <button className="btn-secondary small" onClick={handleExportData}>
              <i className="fas fa-download"></i>
              Exportar
            </button>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Eliminar Perfil y Datos</h4>
              <p>Eliminar permanentemente tu perfil, rutinas, progresos y registros</p>
            </div>
            <button className="btn-danger small" onClick={handleDeleteAccount}>
              <i className="fas fa-trash"></i>
              Eliminar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>⚠️ Confirmar Eliminación de Perfil</h3>
            <p>¿Estás seguro de que querés eliminar tu perfil y todos los datos asociados? Esta acción no se puede deshacer.</p>
            <p><strong>Se eliminarán permanentemente:</strong></p>
            <ul>
              <li>Tu perfil de usuario</li>
              <li>Tu progreso corporal</li>
              <li>Tus rutinas de entrenamiento</li>
              <li>Tus sesiones de entrenamiento</li>
              <li>Todos los datos asociados a tu cuenta</li>
            </ul>
            <p><em>Nota: Tu cuenta de autenticación permanecerá, pero todos los datos serán eliminados.</em></p>
            <div className="delete-confirm-actions">
              <button
                className="btn-secondary"
                onClick={cancelDeleteAccount}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={confirmDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Eliminar Perfil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditTab = () => (
    <div className="profile-edit">
      <div className="edit-section">
        <FormularioOptimized
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          isEditing={true}
        />
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {getUserInitials()}
            </div>
            <div className="profile-name-section">
              <div className="name-edit-container">
                {editingName ? (
                  <div className="name-edit-form">
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      className="edit-nombre-input"
                      maxLength={40}
                      autoFocus
                      placeholder="Tu nombre"
                    />
                    <div className="name-edit-actions">
                      <button className="btn-primary small" onClick={handleNombreSave}>
                        <i className="fas fa-check"></i>
                        Actualizar
                      </button>
                      <button className="btn-secondary small" onClick={handleNombreCancel}>
                        <i className="fas fa-times"></i>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="name-display">
                    <h1>{getUserDisplayName()}</h1>
                    <button
                      className="edit-nombre-btn"
                      title="Editar nombre"
                      onClick={handleNombreEdit}
                      disabled={nombreChangedCount >= 2}
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                  </div>
                )}
              </div>
              {nombreError && <div className="error-message">{nombreError}</div>}
              {nombreSuccess && <div className="success-message">{nombreSuccess}</div>}
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-home"></i>
            Resumen
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            Configuración
          </button>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <i className="fas fa-edit"></i>
            Editar Perfil
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'edit' && renderEditTab()}
        </div>
      </div>
    </div>
  );
}

export default Profile; 