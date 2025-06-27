import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userProfiles, workoutRoutines, routineDays, exercises, routineExercises } from "../lib/supabase";
import "../styles/Formulario.css";
import { obtenerRutinaRecomendada } from "../utils/rutinas";
import { validarDatos } from "../utils/validaciones";
import { seedExercises } from "../utils/seedExercises";
import { testRoutineCreation } from "../utils/testRoutineCreation";
import { debugUserProfile } from "../utils/debugUserProfile";

function Formulario() {
  const { user, userProfile, createUserProfile, updateUserProfile } = useAuth();
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
    console.log('🔄 Formulario: Iniciando envío del formulario...');
    setIsLoading(true);
    setError(null);

    // Validar datos del formulario
    const resultadoValidacion = validarDatos(formData);
    if (!resultadoValidacion.success) {
      console.log('❌ Formulario: Error de validación:', resultadoValidacion.errores);
      setError(resultadoValidacion.errores);
      setIsLoading(false);
      return;
    }

    console.log('🔄 Formulario: Datos validados correctamente');

    // Obtener rutina recomendada
    const rutinaRecomendada = obtenerRutinaRecomendada(
      formData.objetivo,
      formData.tiempoEntrenamiento,
      formData.diasSemana
    );

    if (!rutinaRecomendada) {
      console.log('❌ Formulario: No hay rutina disponible');
      setError({ general: "No hay rutina disponible con estos parámetros." });
      setIsLoading(false);
      return;
    }

    console.log('🔄 Formulario: Rutina recomendada:', rutinaRecomendada);

    try {
      // Probar conexión antes de crear perfil
      console.log('🔄 Formulario: Probando conexión con Supabase...');
      const connectionTest = await userProfiles.testConnection();
      console.log('🔄 Formulario: Resultado de prueba de conexión:', connectionTest);

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

      console.log('🔄 Formulario: Datos preparados:', profileData);

      // Crear o actualizar perfil en Supabase
      let result;
      console.log('🔄 Formulario: Actualizando perfil...');
      result = await updateUserProfile(profileData);
      console.log("✅ Formulario: Perfil actualizado en Supabase:", result);

      if (result.error) {
        console.error('❌ Formulario: Error en resultado:', result.error);
        throw new Error(result.error);
      }

      console.log("✅ Formulario: Datos guardados correctamente en la base de datos");
      console.log("📊 Formulario: Datos del perfil:", profileData);
      console.log("🏋️ Formulario: Rutina recomendada:", rutinaRecomendada);

      // Crear rutina automáticamente
      console.log('🔄 Formulario: Creando rutina automáticamente...');
      
      // Verificar y crear ejercicios básicos si no existen
      console.log('🔄 Formulario: Verificando ejercicios básicos...');
      const { exists: ejerciciosExisten } = await exercises.checkBasicExercises();
      if (!ejerciciosExisten) {
        console.log('🔄 Formulario: Creando ejercicios básicos...');
        await seedExercises();
      }
      
      await createRoutineFromProfile(rutinaRecomendada, formData.diasSemana);

      // Esperar un momento para que el contexto se actualice
      console.log('🔄 Formulario: Esperando actualización del contexto...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navegar a la página de rutina
      console.log('🔄 Formulario: Navegando a /rutina...');
      navigate("/rutina");
    } catch (error) {
      console.error("❌ Formulario: Error saving profile:", error);
      setError({ general: "Error al guardar los datos. Inténtalo de nuevo." });
    } finally {
      console.log('🔄 Formulario: Finalizando envío del formulario');
      setIsLoading(false);
    }
  };

  // Crear rutina basada en el perfil del usuario
  const createRoutineFromProfile = async (tipoRutina, diasSemana) => {
    if (!user) {
      console.log('❌ Formulario: No hay usuario para crear rutina');
      return;
    }

    try {
      console.log('🔄 Formulario: Creando rutina para usuario:', user.id);
      
      // Crear la rutina en la base de datos
      const routineData = {
        user_id: user.id,
        nombre: `Mi Rutina Personalizada - ${tipoRutina}`,
        tipo_rutina: tipoRutina,
        dias_por_semana: parseInt(diasSemana.split('_')[0]),
        es_activa: true
      };

      console.log('🔄 Formulario: Datos de rutina a crear:', routineData);

      const { data, error } = await workoutRoutines.create(routineData);
      
      if (error) {
        console.error('❌ Formulario: Error creating routine:', error);
        throw new Error('Error al crear tu rutina personalizada');
      }

      console.log('✅ Formulario: Rutina creada exitosamente:', data[0]);
      
      // Crear días de rutina y ejercicios básicos
      await createRoutineDays(data[0].id, tipoRutina);
      
    } catch (error) {
      console.error('❌ Formulario: Error creating routine from profile:', error);
      throw error;
    }
  };

  // Crear días de rutina y ejercicios básicos
  const createRoutineDays = async (routineId, tipoRutina) => {
    try {
      console.log('🔄 Formulario: Creando días de rutina para:', routineId, tipoRutina);
      
      // Obtener ejercicios básicos
      const { data: ejerciciosBasicos, error: ejerciciosError } = await exercises.getBasicExercises();
      if (ejerciciosError) {
        console.error('❌ Formulario: Error getting basic exercises:', ejerciciosError);
        return;
      }

      console.log('🔄 Formulario: Ejercicios básicos obtenidos:', ejerciciosBasicos?.length || 0);
      
      // Definir días según el tipo de rutina
      let diasConfig = [];
      
      if (tipoRutina === "FULL BODY") {
        diasConfig = [
          { nombre: "Día 1 - Full Body", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Espalda', 'Piernas'] },
          { nombre: "Descanso", dia_semana: "Martes", es_descanso: true, orden: 2, grupos: [] },
          { nombre: "Día 2 - Full Body", dia_semana: "Miércoles", es_descanso: false, orden: 3, grupos: ['Hombros', 'Brazos', 'Piernas'] },
          { nombre: "Descanso", dia_semana: "Jueves", es_descanso: true, orden: 4, grupos: [] },
          { nombre: "Día 3 - Full Body", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Pecho', 'Espalda', 'Hombros'] }
        ];
      } else if (tipoRutina === "UPPER LOWER") {
        diasConfig = [
          { nombre: "Día 1 - Upper Body", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Espalda', 'Hombros', 'Brazos'] },
          { nombre: "Día 2 - Lower Body", dia_semana: "Martes", es_descanso: false, orden: 2, grupos: ['Piernas'] },
          { nombre: "Descanso", dia_semana: "Miércoles", es_descanso: true, orden: 3, grupos: [] },
          { nombre: "Día 3 - Upper Body", dia_semana: "Jueves", es_descanso: false, orden: 4, grupos: ['Pecho', 'Espalda', 'Hombros', 'Brazos'] },
          { nombre: "Día 4 - Lower Body", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Piernas'] }
        ];
      } else if (tipoRutina === "PUSH PULL LEGS") {
        diasConfig = [
          { nombre: "Día 1 - Push", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Hombros', 'Brazos'] },
          { nombre: "Día 2 - Pull", dia_semana: "Martes", es_descanso: false, orden: 2, grupos: ['Espalda', 'Brazos'] },
          { nombre: "Día 3 - Legs", dia_semana: "Miércoles", es_descanso: false, orden: 3, grupos: ['Piernas'] },
          { nombre: "Descanso", dia_semana: "Jueves", es_descanso: true, orden: 4, grupos: [] },
          { nombre: "Día 4 - Push", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Pecho', 'Hombros', 'Brazos'] },
          { nombre: "Día 5 - Pull", dia_semana: "Sábado", es_descanso: false, orden: 6, grupos: ['Espalda', 'Brazos'] },
          { nombre: "Día 6 - Legs", dia_semana: "Domingo", es_descanso: false, orden: 7, grupos: ['Piernas'] }
        ];
      } else if (tipoRutina === "ARNOLD SPLIT") {
        diasConfig = [
          { nombre: "Día 1 - Pecho y Espalda", dia_semana: "Lunes", es_descanso: false, orden: 1, grupos: ['Pecho', 'Espalda'] },
          { nombre: "Día 2 - Hombros y Brazos", dia_semana: "Martes", es_descanso: false, orden: 2, grupos: ['Hombros', 'Brazos'] },
          { nombre: "Día 3 - Piernas", dia_semana: "Miércoles", es_descanso: false, orden: 3, grupos: ['Piernas'] },
          { nombre: "Día 4 - Pecho y Espalda", dia_semana: "Jueves", es_descanso: false, orden: 4, grupos: ['Pecho', 'Espalda'] },
          { nombre: "Día 5 - Hombros y Brazos", dia_semana: "Viernes", es_descanso: false, orden: 5, grupos: ['Hombros', 'Brazos'] },
          { nombre: "Día 6 - Piernas", dia_semana: "Sábado", es_descanso: false, orden: 6, grupos: ['Piernas'] }
        ];
      }

      // Crear días de rutina
      for (const diaConfig of diasConfig) {
        const { data: dayData, error: dayError } = await routineDays.create({
          routine_id: routineId,
          nombre_dia: diaConfig.nombre,
          dia_semana: diaConfig.dia_semana,
          es_descanso: diaConfig.es_descanso,
          orden: diaConfig.orden
        });

        if (dayError) {
          console.error('❌ Formulario: Error creating routine day:', dayError);
          continue;
        }

        // Si no es día de descanso, asignar ejercicios
        if (!diaConfig.es_descanso && dayData && ejerciciosBasicos) {
          await assignExercisesToDay(dayData[0].id, diaConfig.grupos, ejerciciosBasicos);
        }
      }

      console.log('✅ Formulario: Días de rutina creados exitosamente');
      
    } catch (error) {
      console.error('❌ Formulario: Error creating routine days:', error);
    }
  };

  // Asignar ejercicios a un día de rutina
  const assignExercisesToDay = async (dayId, gruposMusculares, ejerciciosBasicos) => {
    try {
      // Filtrar ejercicios por grupos musculares del día
      const ejerciciosDelDia = ejerciciosBasicos.filter(ej => 
        gruposMusculares.includes(ej.grupo_muscular)
      ).slice(0, 6); // Máximo 6 ejercicios por día

      console.log(`🔄 Formulario: Asignando ${ejerciciosDelDia.length} ejercicios al día ${dayId}`);

      // Crear ejercicios de rutina
      for (let i = 0; i < ejerciciosDelDia.length; i++) {
        const ejercicio = ejerciciosDelDia[i];
        const { error: exerciseError } = await routineExercises.create({
          routine_day_id: dayId,
          exercise_id: ejercicio.id,
          series: 3,
          repeticiones_min: 8,
          repeticiones_max: 12,
          peso_sugerido: null,
          tiempo_descanso: 90,
          orden: i + 1
        });

        if (exerciseError) {
          console.error('❌ Formulario: Error assigning exercise:', exerciseError);
        }
      }
    } catch (error) {
      console.error('❌ Formulario: Error assigning exercises to day:', error);
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
              <button 
                className="btn-desbloquear"
                onClick={() => setIsFormLocked(false)}
              >
                <i className="fas fa-edit"></i>
                Modificar datos
              </button>
              <button 
                className="btn-ir-rutina"
                onClick={() => navigate('/rutina')}
              >
                <i className="fas fa-dumbbell"></i>
                Ver mi rutina
              </button>
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
            {userProfile && (
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsFormLocked(true)}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default Formulario;