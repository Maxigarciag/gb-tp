import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { userProfiles, workoutRoutines, routineDays, exercises, routineExercises } from "../lib/supabase";
import { supabase } from "../lib/supabase.js";
import Button from "./Button";
import { Edit, Dumbbell, Save, X } from 'lucide-react';
import "../styles/Formulario.css";
import { obtenerRutinaRecomendada, rutinas } from "../utils/rutinas";
import { validarDatos } from "../utils/validaciones";
import { seedExercises } from "../utils/seedExercises.js";

function Formulario({ onSuccess, onCancel, isEditing = false }) {
  const { user, userProfile, createUserProfile, updateUserProfile } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormLocked, setIsFormLocked] = useState(!!userProfile && !isEditing);

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
      success("¡Rutina personalizada creada!");

      // Si estamos en modo edición, usar callback en lugar de navegar
      if (isEditing && onSuccess) {
        onSuccess();
      } else {
        // Navegar a la página de rutina
        navigate("/rutina");
      }
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
      // Verificar si ya existe una rutina activa
      const { data: existingRoutine, error: fetchError } = await workoutRoutines.getActive();
      
      let routineId;
      
      if (existingRoutine && !fetchError) {
        // Actualizar rutina existente
        const { error: updateError } = await workoutRoutines.update({
          id: existingRoutine.id,
          nombre: `Mi Rutina Personalizada - ${tipoRutina}`,
          tipo_rutina: tipoRutina,
          dias_por_semana: parseInt(diasSemana.split('_')[0])
        });
        
        if (updateError) {
          throw new Error('Error al actualizar tu rutina personalizada');
        }
        
        routineId = existingRoutine.id;
        
        // Eliminar días de rutina existentes
        const { error: deleteDaysError } = await routineDays.deleteByRoutine(existingRoutine.id);
        if (deleteDaysError) {
          console.error('Error eliminando días de rutina:', deleteDaysError);
        }
      } else {
        // Crear nueva rutina
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
        
        routineId = data[0].id;
      }
      
      // Crear días de rutina y ejercicios básicos
      await createRoutineDays(routineId, tipoRutina);
      
    } catch (error) {
      console.error('Error creating/updating routine from profile:', error);
      throw error;
    }
  };

  // Crear días de rutina y ejercicios básicos
  const createRoutineDays = async (routineId, tipoRutina) => {
    try {
      // Obtener ejercicios básicos
      const { data: ejerciciosBasicos, error: ejerciciosError } = await exercises.getBasicExercises();
      if (ejerciciosError) {
        console.error('Error obteniendo ejercicios básicos:', ejerciciosError);
        return;
      }
      
      // Obtener la rutina predefinida
      const rutinaPredefinida = rutinas[tipoRutina];
      if (!rutinaPredefinida) {
        console.error('Tipo de rutina no encontrado:', tipoRutina);
        return;
      }
      
      // Ejecutar diagnóstico de rutinas
      const { diagnosticarRutinas } = await import('../utils/diagnosticoRutinas.js');
      diagnosticarRutinas();
      
      // Limpiar y recrear ejercicios en la base de datos
      const { limpiarYRecrearEjercicios } = await import('../utils/limpiarYRecrearEjercicios.js');
      await limpiarYRecrearEjercicios();
      
      // Verificar ejercicios
      const { verificarEjercicios } = await import('../utils/verificarEjercicios.js');
      await verificarEjercicios();
      
      // Convertir la rutina predefinida a formato de días
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const diasRutina = [];
      let orden = 1;
      
      diasSemana.forEach((dia) => {
        const descripcionDia = rutinaPredefinida[dia];
        const esDescanso = descripcionDia.toLowerCase().includes('descanso') || 
                          descripcionDia.toLowerCase().includes('cardio');
        
        // Crear un nombre corto para el calendario
        const nombreCorto = crearNombreCorto(descripcionDia, dia);
        
        diasRutina.push({
          dia_semana: dia,
          nombre_dia: nombreCorto,
          descripcion: descripcionDia, // Mantener la descripción completa para ejercicios
          es_descanso: esDescanso,
          orden: orden++
        });
      });

      for (let i = 0; i < diasRutina.length; i++) {
        const dayData = {
          routine_id: routineId,
          dia_semana: diasRutina[i].dia_semana,
          nombre_dia: diasRutina[i].nombre_dia,
          descripcion: diasRutina[i].descripcion,
          es_descanso: diasRutina[i].es_descanso,
          orden: diasRutina[i].orden
        };
        
        const { data: dayDataResult, error: dayError } = await routineDays.create(dayData);

        if (dayError) {
          console.error('Error creating routine day:', dayError);
          continue;
        }

        // Solo asignar ejercicios si no es día de descanso
        if (!diasRutina[i].es_descanso) {
          await assignExercisesToDay(dayDataResult[0].id, diasRutina[i].descripcion);
        }
      }
      
    } catch (error) {
      console.error('Error creating routine days:', error);
    }
  };

  // Asignar ejercicios a un día específico
  const assignExercisesToDay = async (dayId, descripcionDia) => {
    try {
      // Extraer grupos musculares de la descripción del día
      const gruposMusculares = extraerGruposMusculares(descripcionDia);
      
      if (gruposMusculares.length === 0) {
        return;
      }
      
      // Obtener ejercicios de la base de datos
      const { data: ejerciciosBasicos, error: ejerciciosError } = await supabase
        .from('exercises')
        .select('*');
      
      if (ejerciciosError) {
        console.error('Error obteniendo ejercicios:', ejerciciosError);
        return;
      }
      
      // Mapear grupos musculares a ejercicios
      const ejerciciosPorGrupo = {};
      
      // Agrupar ejercicios por grupo muscular
      gruposMusculares.forEach(grupo => {
        const ejerciciosDelGrupo = ejerciciosBasicos.filter(ejercicio => {
          if (!ejercicio.grupo_muscular) return false;
          // Comparar exactamente el grupo muscular
          return ejercicio.grupo_muscular === grupo;
        });
        
        if (ejerciciosDelGrupo.length > 0) {
          ejerciciosPorGrupo[grupo] = ejerciciosDelGrupo;
        }
      });
      
      // Seleccionar ejercicios de cada grupo, priorizando compuestos
      const ejerciciosSeleccionados = [];
      
      // Distribuir ejercicios de manera más inteligente
      const ejerciciosBasePorGrupo = Math.floor(6 / gruposMusculares.length);
      const ejerciciosExtra = 6 % gruposMusculares.length;
      
      gruposMusculares.forEach((grupo, index) => {
        if (ejerciciosPorGrupo[grupo]) {
          // Calcular cuántos ejercicios tomar de este grupo
          let ejerciciosATomar = ejerciciosBasePorGrupo;
          if (index < ejerciciosExtra) {
            ejerciciosATomar += 1; // Distribuir ejercicios extra
          }
          
          const ejerciciosDelGrupo = ejerciciosPorGrupo[grupo]
            .sort((a, b) => {
              // Priorizar ejercicios compuestos
              if (a.es_compuesto && !b.es_compuesto) return -1;
              if (!a.es_compuesto && b.es_compuesto) return 1;
              return 0;
            })
            .slice(0, ejerciciosATomar);
          
          ejerciciosSeleccionados.push(...ejerciciosDelGrupo);
        }
      });
      
      // Si no hay suficientes ejercicios, agregar más hasta llegar a 6
      if (ejerciciosSeleccionados.length < 6) {
        const ejerciciosRestantes = ejerciciosBasicos.filter(ejercicio => 
          !ejerciciosSeleccionados.includes(ejercicio)
        );
        
        const ejerciciosAdicionales = ejerciciosRestantes.slice(0, 6 - ejerciciosSeleccionados.length);
        ejerciciosSeleccionados.push(...ejerciciosAdicionales);
      }
      
      const ejerciciosPriorizados = ejerciciosSeleccionados.slice(0, 6);

      // Asignar ejercicios al día
      for (let i = 0; i < ejerciciosPriorizados.length; i++) {
        const ejercicio = ejerciciosPriorizados[i];
        const { error: exerciseError } = await supabase
          .from('routine_exercises')
          .insert({
            routine_day_id: dayId,
            exercise_id: ejercicio.id,
            series: 3,
            repeticiones_min: 8,
            repeticiones_max: 12,
            peso_sugerido: 0,
            tiempo_descanso: 60,
            orden: i + 1
          });

        if (exerciseError) {
          console.error('Error assigning exercise:', exerciseError);
        }
      }
    } catch (error) {
      console.error('Error assigning exercises to day:', error);
    }
  };

  // Función para crear nombres cortos para el calendario
  const crearNombreCorto = (descripcion, diaSemana) => {
    if (descripcion.toLowerCase().includes('descanso')) {
      return 'Descanso';
    }
    
    // Extraer grupos musculares para crear un nombre corto
    const grupos = extraerGruposMusculares(descripcion);
    if (grupos.length > 0) {
      // Capitalizar la primera letra de cada grupo
      const gruposCapitalizados = grupos.map(grupo => 
        grupo.charAt(0).toUpperCase() + grupo.slice(1)
      );
      return gruposCapitalizados.join(', ');
    }
    
    // Si no se pueden extraer grupos, usar el día de la semana
    return diaSemana;
  };

  // Función para extraer grupos musculares de la descripción del día
  const extraerGruposMusculares = (descripcion) => {
    // Mapeo de grupos musculares en las descripciones a grupos musculares en la base de datos
    const mapeoGrupos = {
      'pecho': 'Pecho',
      'espalda': 'Espalda',
      'hombros': 'Hombros',
      'bíceps': 'Brazos',
      'tríceps': 'Brazos',
      'brazos': 'Brazos',
      'cuádriceps': 'Cuádriceps',
      'isquiotibiales': 'Isquiotibiales',
      'gemelos': 'Gemelos',
      'piernas': ['Cuádriceps', 'Isquiotibiales', 'Gemelos'], // Piernas incluye múltiples grupos
      'core': 'Core' // Necesitamos agregar ejercicios de core
    };
    
    const descripcionLower = descripcion.toLowerCase();
    const gruposEncontrados = [];
    
    // Buscar grupos musculares en la descripción
    Object.keys(mapeoGrupos).forEach(grupoDescripcion => {
      if (descripcionLower.includes(grupoDescripcion)) {
        const grupoDB = mapeoGrupos[grupoDescripcion];
        if (Array.isArray(grupoDB)) {
          // Si es un array (como "piernas"), agregar todos los grupos
          gruposEncontrados.push(...grupoDB);
        } else {
          // Si es un string, agregar el grupo
          gruposEncontrados.push(grupoDB);
        }
      }
    });
    
    // Eliminar duplicados
    const gruposUnicos = [...new Set(gruposEncontrados)];
    
    return gruposUnicos;
  };

  return (
    <div className="formulario-container">
      {!userProfile && (
        <div className="formulario-header">
          <h1>¡Comienza tu transformación!</h1>
          <p>Completa el formulario para obtener tu plan personalizado de entrenamiento</p>
        </div>
      )}

      {(userProfile || isEditing) && (
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
              {(userProfile || isEditing) ? 'Actualizar mi plan' : 'Generar mi plan personalizado'}
            </Button>
            {(userProfile || isEditing) && (
              <Button 
                type="button" 
                variant="ghost"
                icon={<X size={16} />}
                onClick={() => {
                  if (isEditing && onCancel) {
                    onCancel();
                  } else {
                    setIsFormLocked(true);
                  }
                }}
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