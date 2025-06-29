import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { userProfiles, workoutRoutines, routineDays, exercises, routineExercises } from "../lib/supabase";
import Button from "./Button";
import { Edit, Dumbbell, Save, X } from 'lucide-react';
import "../styles/Formulario.css";
import { obtenerRutinaRecomendada } from "../utils/rutinas";
import { validarDatos } from "../utils/validaciones";
import { seedExercises } from "../utils/seedExercises.js";

function Formulario() {
  const { user, userProfile, createUserProfile, updateUserProfile } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormLocked, setIsFormLocked] = useState(!!userProfile);

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

    // Validar datos del formulario
    const resultadoValidacion = validarDatos(formData);
    if (!resultadoValidacion.success) {
      setError(resultadoValidacion.errores);
      showError("Por favor, corrige los errores en el formulario");
      setIsLoading(false);
      return;
    }

    // Obtener rutina recomendada
    const rutinaRecomendada = obtenerRutinaRecomendada(
      formData.objetivo,
      formData.tiempoEntrenamiento,
      formData.diasSemana
    );

    if (!rutinaRecomendada) {
      setError({ general: "No hay rutina disponible con estos parámetros." });
      showError("No hay rutina disponible con estos parámetros");
      setIsLoading(false);
      return;
    }

    try {
      // Probar conexión antes de crear perfil
      await userProfiles.testConnection();

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

      // Crear o actualizar perfil en Supabase
      let result;
      result = await updateUserProfile(profileData);

      if (result.error) {
        throw new Error(result.error);
      }

      // Mostrar notificación de éxito
      success("¡Perfil guardado exitosamente! Creando tu rutina personalizada...");

      // Verificar y crear ejercicios básicos si no existen
      const { exists: ejerciciosExisten } = await exercises.checkBasicExercises();
      if (!ejerciciosExisten) {
        await seedExercises();
      }
      
      await createRoutineFromProfile(rutinaRecomendada, formData.diasSemana);

      // Esperar un momento para que el contexto se actualice
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mostrar notificación de rutina creada
      success("¡Rutina personalizada creada! Redirigiendo...");

      // Navegar a la página de rutina
      navigate("/rutina");
    } catch (error) {
      console.error("Error saving profile:", error);
      setError({ general: "Error al guardar los datos. Inténtalo de nuevo." });
      showError("Error al guardar los datos. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Crear rutina basada en el perfil del usuario
  const createRoutineFromProfile = async (tipoRutina, diasSemana) => {
    if (!user) {
      return;
    }

    try {
      // Crear la rutina en la base de datos
      const routineData = {
        user_id: user.id,
        nombre: `Mi Rutina Personalizada - ${tipoRutina}`,
        tipo_rutina: tipoRutina,
        dias_por_semana: parseInt(diasSemana.split('_')[0]),
        es_activa: true
      };

      const { data, error } = await workoutRoutines.create(routineData);
      
      if (error) {
        throw new Error('Error al crear tu rutina personalizada');
      }
      
      // Crear días de rutina y ejercicios básicos
      await createRoutineDays(data[0].id, tipoRutina);
      
    } catch (error) {
      console.error('Error creating routine from profile:', error);
      throw error;
    }
  };

  // Crear días de rutina y ejercicios básicos
  const createRoutineDays = async (routineId, tipoRutina) => {
    try {
      // Obtener ejercicios básicos
      const { data: ejerciciosBasicos, error: ejerciciosError } = await exercises.getBasicExercises();
      if (ejerciciosError) {
        return;
      }
      
      // Crear días de rutina
      const diasRutina = [
        { nombre: "Día 1", descripcion: "Pecho y Tríceps" },
        { nombre: "Día 2", descripcion: "Espalda y Bíceps" },
        { nombre: "Día 3", descripcion: "Piernas y Hombros" },
        { nombre: "Día 4", descripcion: "Cardio y Core" }
      ];

      for (let i = 0; i < diasRutina.length; i++) {
        const { data: dayData, error: dayError } = await routineDays.create({
          routine_id: routineId,
          nombre: diasRutina[i].nombre,
          descripcion: diasRutina[i].descripcion,
          orden: i + 1
        });

        if (dayError) {
          console.error('Error creating routine day:', dayError);
          continue;
        }

        // Asignar ejercicios al día
        await assignExercisesToDay(dayData[0].id, diasRutina[i].descripcion, ejerciciosBasicos);
      }
      
    } catch (error) {
      console.error('Error creating routine days:', error);
    }
  };

  // Asignar ejercicios a un día específico
  const assignExercisesToDay = async (dayId, gruposMusculares, ejerciciosBasicos) => {
    try {
      // Mapear grupos musculares a ejercicios
      const ejerciciosDelDia = ejerciciosBasicos.filter(ejercicio => {
        const grupos = gruposMusculares.toLowerCase();
        return ejercicio.grupo_muscular && grupos.includes(ejercicio.grupo_muscular.toLowerCase());
      }).slice(0, 6); // Máximo 6 ejercicios por día

      // Asignar ejercicios al día
      for (const ejercicio of ejerciciosDelDia) {
        const { error: exerciseError } = await routineExercises.create({
          routine_day_id: dayId,
          exercise_id: ejercicio.id,
          series: 3,
          repeticiones_min: 8,
          repeticiones_max: 12,
          peso_sugerido: 0,
          tiempo_descanso: 60
        });

        if (exerciseError) {
          console.error('Error assigning exercise:', exerciseError);
        }
      }
    } catch (error) {
      console.error('Error assigning exercises to day:', error);
    }
  };

  return (
    <div className="formulario-container">
      {!userProfile && (
        <div className="formulario-header">
          <h1>¡Comienza tu transformación!</h1>
          <p>Completa el formulario para obtener tu plan personalizado de entrenamiento</p>
        </div>
      )}

      {userProfile && (
        <div className="formulario-header">
          <h1>✏️ Editar Perfil</h1>
          <p>Modifica tus datos para generar una nueva rutina personalizada</p>
        </div>
      )}

      {isFormLocked ? (
        <div className="formulario-bloqueado">
          <div className="bloqueado-content">
            <i className="fas fa-lock"></i>
            <h3>Tu perfil ya está configurado</h3>
            <p>Ya tienes un plan personalizado generado. Si deseas modificar tus datos, puedes desbloquear el formulario.</p>
            <div className="datos-actuales">
              <h4>Tu configuración actual:</h4>
              <div className="datos-grid">
                <div className="dato-item">
                  <span className="dato-label">Altura:</span>
                  <span className="dato-valor">{userProfile.altura} cm</span>
                </div>
                <div className="dato-item">
                  <span className="dato-label">Peso:</span>
                  <span className="dato-valor">{userProfile.peso} kg</span>
                </div>
                <div className="dato-item">
                  <span className="dato-label">Edad:</span>
                  <span className="dato-valor">{userProfile.edad} años</span>
                </div>
                <div className="dato-item">
                  <span className="dato-label">Objetivo:</span>
                  <span className="dato-valor">{userProfile.objetivo === 'ganar_musculo' ? 'Ganar músculo' : userProfile.objetivo === 'perder_grasa' ? 'Perder grasa' : 'Mantener'}</span>
                </div>
                <div className="dato-item">
                  <span className="dato-label">Días por semana:</span>
                  <span className="dato-valor">{userProfile.dias_semana.split('_')[0]} días</span>
                </div>
              </div>
            </div>
            <div className="botones-accion">
              <Button 
                variant="outline"
                icon={<Edit size={16} />}
                onClick={() => setIsFormLocked(false)}
              >
                Modificar datos
              </Button>
              <Button 
                variant="primary"
                icon={<Dumbbell size={16} />}
                onClick={() => navigate('/rutina')}
              >
                Ver mi rutina
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
            <Button 
              type="submit" 
              variant="primary" 
              size="large"
              loading={isLoading}
              icon={<Save size={16} />}
              disabled={isLoading}
            >
              {userProfile ? 'Actualizar mi plan' : 'Generar mi plan personalizado'}
            </Button>
            {userProfile && (
              <Button 
                type="button" 
                variant="ghost"
                icon={<X size={16} />}
                onClick={() => setIsFormLocked(true)}
                style={{ marginTop: '1rem' }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default Formulario;