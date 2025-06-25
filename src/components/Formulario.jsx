import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Formulario.css";
import { obtenerRutinasPosibles } from "../utils/calcularRutina";
import { validarDatos } from "../utils/validaciones";

function Formulario() {
  const { user, userProfile, createUserProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    altura: userProfile?.altura || "",
    peso: userProfile?.peso || "",
    edad: userProfile?.edad || "",
    sexo: userProfile?.sexo || "",
    objetivo: userProfile?.objetivo || "",
    experiencia: userProfile?.experiencia || "",
    tiempoEntrenamiento: userProfile?.tiempo_entrenamiento || "",
    diasSemana: userProfile?.dias_semana || "",
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const resultadoValidacion = validarDatos(formData);
    if (!resultadoValidacion.success) {
      setError(resultadoValidacion.errores);
      setIsLoading(false);
      return;
    }

    const rutina = obtenerRutinasPosibles(
      formData.objetivo,
      formData.tiempoEntrenamiento,
      formData.diasSemana
    );

    if (rutina.length === 0) {
      setError({ general: "No hay rutina disponible con estos parámetros." });
      setIsLoading(false);
      return;
    }

    try {
      // Preparar datos para la base de datos
      const profileData = {
        altura: parseInt(formData.altura),
        peso: parseFloat(formData.peso),
        edad: parseInt(formData.edad),
        sexo: formData.sexo,
        objetivo: formData.objetivo,
        experiencia: formData.experiencia,
        tiempo_entrenamiento: formData.tiempoEntrenamiento,
        dias_semana: formData.diasSemana,
      };

      // Crear o actualizar perfil
      if (userProfile) {
        await updateUserProfile(profileData);
      } else {
        await createUserProfile(profileData);
      }

      console.log("Formulario enviado con datos válidos:", formData);
      console.log("Rutina generada:", rutina);

      // Navegar a la rutina con los datos
      navigate("/rutina", { state: { rutina, formData } });
    } catch (error) {
      console.error("Error saving profile:", error);
      setError({ general: "Error al guardar los datos. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="formulario-container">
      <div className="formulario-header">
        <h1>¡Comienza tu transformación!</h1>
        <p>Completa el formulario para obtener tu plan personalizado de entrenamiento</p>
        {userProfile && (
          <div className="profile-status">
            <i className="fas fa-check-circle"></i>
            Actualizando tu perfil existente
          </div>
        )}
      </div>

      <form className="formulario" onSubmit={handleFormSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="altura">Altura (cm)</label>
            <input
              type="number"
              id="altura"
              name="altura"
              value={formData.altura}
              onChange={handleChange}
              required
              min="100"
              max="250"
            />
          </div>
          <div className="input-group">
            <label htmlFor="peso">Peso (kg)</label>
            <input
              type="number"
              id="peso"
              name="peso"
              value={formData.peso}
              onChange={handleChange}
              required
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              required
              min="12"
              max="120"
            />
          </div>
          <div className="input-group">
            <label htmlFor="sexo">Sexo</label>
            <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required>
              <option value="">Selecciona una opción</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="objetivo">Objetivo</label>
            <select id="objetivo" name="objetivo" value={formData.objetivo} onChange={handleChange} required>
              <option value="">Selecciona una opción</option>
              <option value="ganar_musculo">Ganar músculo</option>
              <option value="perder_grasa">Perder grasa</option>
              <option value="mantener">Mantener</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="experiencia">Experiencia</label>
            <select id="experiencia" name="experiencia" value={formData.experiencia} onChange={handleChange} required>
              <option value="">Selecciona una opción</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="tiempoEntrenamiento">Tiempo de entrenamiento</label>
            <select id="tiempoEntrenamiento" name="tiempoEntrenamiento" value={formData.tiempoEntrenamiento} onChange={handleChange} required>
              <option value="">Selecciona una opción</option>
              <option value="30_min">30 minutos</option>
              <option value="1_hora">1 hora</option>
              <option value="2_horas">2 horas</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="diasSemana">Días de entrenamiento</label>
            <select id="diasSemana" name="diasSemana" value={formData.diasSemana} onChange={handleChange} required>
              <option value="">Selecciona una opción</option>
              <option value="3_dias">3 días</option>
              <option value="4_dias">4 días</option>
              <option value="6_dias">6 días</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {typeof error === 'object' ? Object.values(error).join(", ") : error}
          </div>
        )}

        <div className="button-container">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {userProfile ? 'Actualizando...' : 'Generando plan...'}
              </>
            ) : (
              userProfile ? 'Actualizar mi plan' : 'Generar mi plan personalizado'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Formulario;