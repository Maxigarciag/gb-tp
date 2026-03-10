import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStore, useRoutineStore } from '@/stores'
import { workoutRoutines, routineDays, exercises } from '@/lib/supabase'
import { supabase } from '@/lib/supabase.js'
import ButtonOptimized from '@/features/common/components/ButtonOptimized'
import { Edit, Dumbbell, Save, X, Lock } from 'lucide-react'
import '@/styles/components/rutinas/Formulario.css'
import { 
  obtenerRutinaRecomendada, 
  rutinas, 
  obtenerConfiguracionEjercicios,
  obtenerConfiguracionObjetivo 
} from '@/data/rutinasPredefinidas'
import { validarDatos } from '@/utils/validaciones'
import { seedExercises } from '@/data/seedExercises.js'

/**
 * Formulario optimizado para crear/editar perfil de usuario y generar rutina automática
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback al completar exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.isEditing - Si está en modo edición
 */
function FormularioOptimized ({ onSuccess, onCancel, isEditing = false }) {
  const { user } = useAuth();
  const { userProfile, createUserProfile } = useUserStore();
  const { createRoutine, loadUserRoutine } = useRoutineStore();
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
    const resultadoValidacion = validarDatos(formData)
    if (!resultadoValidacion.success) {
      setError(resultadoValidacion.errores)
      setIsLoading(false)
      return
    }

    // Obtener rutina recomendada
    const rutinaRecomendada = obtenerRutinaRecomendada(
      formData.objetivo,
      formData.tiempoEntrenamiento,
      formData.diasSemana
    )

    if (!rutinaRecomendada) {
      setError({ general: 'No hay rutina disponible con estos parámetros.' })
      setIsLoading(false)
      return
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

      // Usar createUserProfile que ahora maneja upsert (crear o actualizar)
      const newProfile = await createUserProfile(profileData)
      const success = !!newProfile

      if (!success) {
        throw new Error('Error al guardar el perfil')
      }

      // Mostrar notificación de éxito
      // Removed notification: showSuccess('¡Perfil guardado exitosamente! Creando tu rutina personalizada...')

      // Verificar y crear ejercicios básicos si no existen
      const { exists: ejerciciosExisten } = await exercises.checkBasicExercises()
      
      if (!ejerciciosExisten) {
        await seedExercises()
      }
      
      await createRoutineFromProfile(rutinaRecomendada, formData.diasSemana)

      // Esperar un momento para que el contexto se actualice
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Actualizar el store una vez más para asegurar sincronización
      await loadUserRoutine()
      
      // Actualizar el perfil en el AuthContext para que la página de rutina pueda cargar
      // Usar el perfil que ya tenemos en el contexto en lugar de intentar obtenerlo de nuevo
      if (userProfile) {
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: userProfile }))
      } else {
        window.dispatchEvent(new CustomEvent('profileReload'))
      }
      
      // Mostrar notificación de rutina creada
      // Removed notification: showSuccess('¡Rutina personalizada creada!')

      // Si estamos en modo edición, usar callback en lugar de navegar
      if (isEditing && onSuccess) {
        onSuccess()
      } else {
        // Navegar a la página de rutina
        navigate('/rutina')
      }
    } catch (error) {
      setError({ general: 'Error al guardar los datos. Inténtalo de nuevo.' })
    } finally {
      setIsLoading(false)
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
          nombre: `Mi Rutina Personalizada`,
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
        } else {
        }
      } else {
        // Crear nueva rutina usando el store
        const routineData = {
          user_id: user.id,
          nombre: `Mi Rutina Personalizada`,
          tipo_rutina: tipoRutina,
          dias_por_semana: parseInt(diasSemana.split('_')[0]),
          es_activa: true
        };


        const newRoutine = await createRoutine(routineData);
        
        
        if (!newRoutine) {
          throw new Error('Error al crear tu rutina personalizada');
        }
        
        routineId = newRoutine.id;
      }
      
      // Crear días de rutina y ejercicios básicos
      await createRoutineDays(routineId, tipoRutina);
      
      // Actualizar el store de rutinas para que la página pueda cargar los datos
      await loadUserRoutine();
      
    } catch (error) {
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
      
      // Obtener la rutina predefinida
      const rutinaPredefinida = rutinas[tipoRutina];
      
      if (!rutinaPredefinida) {
        return;
      }
      
      // Convertir la rutina predefinida a formato de días
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const diasRutina = [];
      let orden = 1;
      
      diasSemana.forEach((dia) => {
        const descripcionDia = rutinaPredefinida[dia];
        const esDescanso = descripcionDia.toLowerCase().includes('descanso');
        
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
          continue;
        }


        // Solo asignar ejercicios si no es día de descanso
        if (!diasRutina[i].es_descanso && dayDataResult && dayDataResult[0]) {
          await assignExercisesToDay(dayDataResult[0].id, diasRutina[i].descripcion);
        } else if (diasRutina[i].es_descanso) {
        }
      }
      
    } catch (error) {
      throw error;
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
      
      // Obtener configuración según el perfil del usuario
      const configEjercicios = obtenerConfiguracionEjercicios(
        formData.tiempoEntrenamiento, 
        formData.experiencia || 'principiante'
      );
      const configObjetivo = obtenerConfiguracionObjetivo(formData.objetivo);
      
      // Obtener ejercicios de la base de datos
      const { data: ejerciciosBasicos, error: ejerciciosError } = await supabase
        .from('exercises')
        .select('*');
      
      
      if (ejerciciosError) {
        return;
      }
      
      // Mapear grupos musculares a ejercicios
      const ejerciciosPorGrupo = {};
      
      // Agrupar ejercicios por grupo muscular
      gruposMusculares.forEach(grupo => {
        const ejerciciosDelGrupo = ejerciciosBasicos.filter(ejercicio => {
          if (!ejercicio.grupo_muscular) return false;
          return ejercicio.grupo_muscular === grupo;
        });
        
        if (ejerciciosDelGrupo.length > 0) {
          ejerciciosPorGrupo[grupo] = ejerciciosDelGrupo;
        }
      });
      
      // Seleccionar ejercicios de cada grupo con lógica mejorada
      const ejerciciosSeleccionados = [];
      const ejerciciosPorDia = configEjercicios.ejerciciosPorDia;
      
      // Distribuir ejercicios de manera más inteligente
      const ejerciciosBasePorGrupo = Math.floor(ejerciciosPorDia / gruposMusculares.length);
      const ejerciciosExtra = ejerciciosPorDia % gruposMusculares.length;
      
      gruposMusculares.forEach((grupo, index) => {
        if (ejerciciosPorGrupo[grupo]) {
          // Calcular cuántos ejercicios tomar de este grupo
          let ejerciciosATomar = ejerciciosBasePorGrupo;
          if (index < ejerciciosExtra) {
            ejerciciosATomar += 1;
          }
          
          // Ordenar ejercicios según prioridad del objetivo
          const ejerciciosDelGrupo = ejerciciosPorGrupo[grupo]
            .sort((a, b) => {
              // Priorizar según el objetivo
              if (configObjetivo.prioridad === "compuestos") {
                if (a.es_compuesto && !b.es_compuesto) return -1;
                if (!a.es_compuesto && b.es_compuesto) return 1;
              }
              // Para mantener, balancear entre compuestos y aislados
              if (configObjetivo.prioridad === "balanceado") {
                // Alternar entre compuestos y aislados
                return Math.random() - 0.5;
              }
              return 0;
            })
            .slice(0, ejerciciosATomar);
          
          ejerciciosSeleccionados.push(...ejerciciosDelGrupo);
        }
      });
      
      // Si no hay suficientes ejercicios, agregar más
      if (ejerciciosSeleccionados.length < ejerciciosPorDia) {
        const ejerciciosRestantes = ejerciciosBasicos.filter(ejercicio => 
          !ejerciciosSeleccionados.includes(ejercicio)
        );
        
        const ejerciciosAdicionales = ejerciciosRestantes.slice(0, ejerciciosPorDia - ejerciciosSeleccionados.length);
        ejerciciosSeleccionados.push(...ejerciciosAdicionales);
      }
      
      const ejerciciosPriorizados = ejerciciosSeleccionados.slice(0, ejerciciosPorDia);

      // Calcular peso sugerido basado en el peso del usuario
      const calcularPesoSugerido = (ejercicio) => {
        if (!formData.peso) return 0;
        
        // Porcentajes aproximados del peso corporal según el ejercicio
        const porcentajes = {
          'Pecho': 0.6, // Press de banca ~60% del peso corporal
          'Espalda': 0.5, // Dominadas ~50% del peso corporal
          'Piernas': 0.8, // Sentadillas ~80% del peso corporal
          'Hombros': 0.3, // Press militar ~30% del peso corporal
          'Brazos': 0.2, // Curl de bíceps ~20% del peso corporal
          'Core': 0.1, // Plancha ~10% del peso corporal
        };
        
        const porcentaje = porcentajes[ejercicio.grupo_muscular] || 0.3;
        return Math.round(formData.peso * porcentaje);
      };


      // Asignar ejercicios al día con configuración personalizada
      for (let i = 0; i < ejerciciosPriorizados.length; i++) {
        const ejercicio = ejerciciosPriorizados[i];
        
        
        // Parsear repeticiones
        const [min, max] = configEjercicios.repeticiones.split('-').map(Number);
        
        const exerciseData = {
          routine_day_id: dayId,
          exercise_id: ejercicio.id,
          series: configEjercicios.series,
          repeticiones_min: min,
          repeticiones_max: max,
          peso_sugerido: calcularPesoSugerido(ejercicio),
          tiempo_descanso: configEjercicios.descanso,
          orden: i + 1
        };

        
        const { error: exerciseError } = await supabase
          .from('routine_exercises')
          .insert(exerciseData);

        if (exerciseError) {
        } else {
        }
      }
      
    } catch (error) {
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
    const descripcionLower = descripcion.toLowerCase();
    const gruposEncontrados = [];
    
    // Mapeo directo de grupos musculares específicos
    const mapeoDirecto = {
      'pecho': 'Pecho',
      'espalda': 'Espalda',
      'hombros': 'Hombros',
      'bíceps': 'Brazos',
      'tríceps': 'Brazos',
      'brazos': 'Brazos',
      'cuádriceps': 'Cuádriceps',
      'isquiotibiales': 'Isquiotibiales',
      'gemelos': 'Gemelos',
      'core': 'Core',
      'abdomen': 'Core',
      'abdominales': 'Core'
    };
    
    // Primero buscar grupos musculares específicos
    Object.keys(mapeoDirecto).forEach(grupoDescripcion => {
      if (descripcionLower.includes(grupoDescripcion)) {
        gruposEncontrados.push(mapeoDirecto[grupoDescripcion]);
      }
    });
    
    // Si no se encontraron grupos específicos, usar categorías generales
    if (gruposEncontrados.length === 0) {
      const mapeoCategorias = {
        'push': ['Pecho', 'Hombros', 'Brazos'],
        'pull': ['Espalda', 'Brazos'],
        'upper': ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
        'lower': ['Cuádriceps', 'Isquiotibiales', 'Gemelos', 'Core'],
        'piernas': ['Cuádriceps', 'Isquiotibiales', 'Gemelos'],
        'full body': ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Cuádriceps', 'Isquiotibiales', 'Gemelos', 'Core']
      };
      
      Object.keys(mapeoCategorias).forEach(categoria => {
        if (descripcionLower.includes(categoria)) {
          gruposEncontrados.push(...mapeoCategorias[categoria]);
        }
      });
    }
    
    // Eliminar duplicados
    const gruposUnicos = [...new Set(gruposEncontrados)];
    
    // Si no se encontraron grupos específicos, intentar inferir del contexto
    if (gruposUnicos.length === 0) {
      if (descripcionLower.includes('descanso') || descripcionLower.includes('cardio')) {
        return ['Core']; // En días de descanso, agregar algo de core
      }
    }
    
    return gruposUnicos;
  };


  return (
    <div className="formulario-container">
      {!userProfile && !isEditing && (
        <div className="formulario-header">
          <h1>¡Comienza tu transformación!</h1>
          <p>Completa el formulario para obtener tu plan personalizado de entrenamiento</p>
        </div>
      )}

      {isEditing && (
        <div className="formulario-header">
          <h1>✏️ Editar Perfil</h1>
          <p>Modifica tus datos para generar una nueva rutina personalizada</p>
        </div>
      )}

      {isFormLocked ? (
        <div className="formulario-bloqueado">
          <div className="bloqueado-content">
            <Lock size={20} />
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
              <ButtonOptimized 
                variant="outline"
                icon={<Edit size={16} />}
                onClick={() => setIsFormLocked(false)}
                size="medium"
              >
                Modificar datos
              </ButtonOptimized>
              <ButtonOptimized 
                variant="primary"
                icon={<Dumbbell size={16} />}
                onClick={() => navigate('/rutina')}
                size="medium"
              >
                Ver mi rutina
              </ButtonOptimized>
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
                placeholder="170"
                required
                min="100"
                max="250"
              />
              {error?.altura && <span className="error-message">{error.altura}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="peso">Peso (kg)</label>
              <input
                type="number"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="70"
                required
                min="30"
                max="300"
                step="0.1"
              />
              {error?.peso && <span className="error-message">{error.peso}</span>}
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
                placeholder="25"
                required
                min="12"
                max="120"
              />
              {error?.edad && <span className="error-message">{error.edad}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="sexo">Sexo</label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu sexo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="objetivo">Objetivo principal</label>
              <select
                id="objetivo"
                name="objetivo"
                value={formData.objetivo}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu objetivo</option>
                <option value="ganar_musculo">Ganar músculo</option>
                <option value="perder_grasa">Perder grasa</option>
                <option value="mantener">Mantener forma</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="experiencia">Nivel de experiencia</label>
              <select
                id="experiencia"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu nivel</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="tiempoEntrenamiento">Tiempo disponible por sesión</label>
              <select
                id="tiempoEntrenamiento"
                name="tiempoEntrenamiento"
                value={formData.tiempoEntrenamiento}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona el tiempo</option>
                <option value="30_min">30 minutos</option>
                <option value="1_hora">1 hora</option>
                <option value="2_horas">2 horas</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="diasSemana">Días de entrenamiento por semana</label>
              <select
                id="diasSemana"
                name="diasSemana"
                value={formData.diasSemana}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona los días</option>
                <option value="3_dias">3 días</option>
                <option value="4_dias">4 días</option>
                <option value="6_dias">6 días</option>
              </select>
            </div>
          </div>

          {error?.general && (
            <div className="error-message-general">
              {error.general}
            </div>
          )}

          <div className="form-actions">
            {onCancel && (
              <ButtonOptimized
                type="button"
                variant="outline"
                icon={<X size={16} />}
                onClick={onCancel}
                disabled={isLoading}
                size="medium"
              >
                Cancelar
              </ButtonOptimized>
            )}
            <ButtonOptimized
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              disabled={isLoading}
              loading={isLoading}
              size="large"
            >
              {isLoading ? "Guardando..." : (isEditing ? "Actualizar Datos" : "Guardar y Crear Rutina")}
            </ButtonOptimized>
          </div>
        </form>
      )}
    </div>
  )
}

FormularioOptimized.propTypes = {
	onSuccess: PropTypes.func,
	onCancel: PropTypes.func,
	isEditing: PropTypes.bool
}

export default FormularioOptimized 