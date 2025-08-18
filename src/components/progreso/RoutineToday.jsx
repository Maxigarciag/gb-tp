import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseLogCard from './ExerciseLogCard';
import { useRoutineStore } from '../../stores/routineStore';
import { workoutSessions, exerciseLogs } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../stores/uiStore';
import { FaDumbbell, FaFire, FaCheckCircle } from 'react-icons/fa';
import '../../styles/Evolution.css';
import '../../styles/ExerciseLog.css';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const RoutineToday = () => {
  const navigate = useNavigate();
  const {
    userRoutine,
    loading,
    selectedDayIndex,
    setSelectedDay,
    loadUserRoutine,
    getCurrentDayExercises
  } = useRoutineStore();
  const { userProfile } = useAuth();

  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [finishLoading, setFinishLoading] = useState(false);
  const { showSuccess, showError, showInfo } = useUIStore();
  const [logsCount, setLogsCount] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [openCards, setOpenCards] = useState({});
  const toggleCard = (id) => setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));

  // Seleccionar día automáticamente basado en la rutina disponible
  useEffect(() => {
    if (!userRoutine) {
      loadUserRoutine();
      return;
    }
    
    // Solo auto-seleccionar si no hay un día ya seleccionado explícitamente
    if (selectedDayIndex !== null) {
      return;
    }
    
    // Siempre intentar seleccionar el día actual primero
    const today = new Date().getDay(); // 0=Domingo, 1=Lunes...
    const indiceHoy = today === 0 ? 6 : today - 1;
    const diaHoy = diasSemana[indiceHoy];
    
    // Verificar si el día actual tiene entrenamiento
    const diaActualTieneEntrenamiento = userRoutine.routine_days?.some(day => 
      day.dia_semana === diaHoy && 
      day.routine_exercises && 
      day.routine_exercises.length > 0
    );
    
    if (diaActualTieneEntrenamiento) {
      setSelectedDay(indiceHoy);
    } else {
      // Si hoy no hay entrenamiento, NO seleccionar ningún día
      // Solo mostrar el mensaje de descanso
      setSelectedDay(null);
    }
  }, [userRoutine, loadUserRoutine]); // Removido selectedDayIndex de las dependencias

  // Crear sesión de entrenamiento si no existe
  useEffect(() => {
    const crearSesionSiNoExiste = async () => {
      // Verificar que tenemos todos los datos necesarios antes de continuar
      if (!userProfile) {
        return;
      }
      
      if (!userRoutine) {
        return;
      }
      
      if (selectedDayIndex === null) {
        return;
      }
      
      // Verificar que el índice del día sea válido
      if (selectedDayIndex < 0 || selectedDayIndex >= diasSemana.length) {
        setSessionError('Error: Día de rutina inválido');
        return;
      }
      
      // Verificar que el día seleccionado existe en la rutina
      const diaSeleccionado = diasSemana[selectedDayIndex];
      const diaExiste = userRoutine.routine_days?.some(day => day.dia_semana === diaSeleccionado);
      
      if (!diaExiste) {
        setSessionError(`Error: El día ${diaSeleccionado} no está configurado en tu rutina`);
        return;
      }
      
      // Verificar que el día seleccionado tiene ejercicios
      const diaTieneEjercicios = userRoutine.routine_days?.some(day => 
        day.dia_semana === diaSeleccionado && 
        day.routine_exercises && 
        day.routine_exercises.length > 0
      );
      
      if (!diaTieneEjercicios) {
        return; // No crear sesión para días sin ejercicios
      }
      
      setSessionLoading(true);
      setSessionError(null);
      
      try {
        // Verificar que tenemos todos los datos necesarios
        if (!userRoutine?.id) {
          throw new Error('No se encontró la rutina del usuario');
        }
        
        if (!userRoutine.routine_days || userRoutine.routine_days.length === 0) {
          throw new Error('La rutina no tiene días configurados');
        }
        
        // Buscar el routine_day_id real
        const diaSemana = diasSemana[selectedDayIndex];
        
        const routineDay = userRoutine.routine_days.find(day => day.dia_semana === diaSemana);
        
        if (!routineDay) {
          throw new Error(`No se encontró el día de rutina para ${diaSemana}. Días disponibles: ${userRoutine.routine_days.map(d => d.dia_semana).join(', ')}`);
        }
        
        const routine_day_id = routineDay.id;
        if (!routine_day_id) {
          throw new Error('El día de rutina no tiene ID válido');
        }
        
        // Buscar si ya existe una sesión para hoy
        const fechaHoy = new Date().toISOString().split('T')[0];
        const { data: sesiones, error } = await workoutSessions.getUserSessions(20);
        
        if (error) {
          throw new Error('Error al obtener sesiones de entrenamiento');
        }
        
        const sesionHoy = sesiones?.find(s =>
          s.user_id === userProfile.id &&
          s.routine_id === userRoutine.id &&
          s.routine_day_id === routine_day_id &&
          s.fecha === fechaHoy
        );
        
        if (sesionHoy) {
          setSessionId(sesionHoy.id);
          setSessionFinished(!!sesionHoy.completada);
        } else {
          // Crear nueva sesión
          const { data, error: createError } = await workoutSessions.create({
            user_id: userProfile.id,
            routine_id: userRoutine.id,
            routine_day_id,
            fecha: fechaHoy,
            completada: false
          });
          
          if (createError) {
            throw new Error('Error al crear nueva sesión de entrenamiento');
          }
          
          if (!data || data.length === 0) {
            throw new Error('No se pudo crear la sesión de entrenamiento');
          }
          
          setSessionId(data[0].id);
          setSessionFinished(false);
        }
      } catch (err) {
        setSessionError(`Error: ${err.message}`);
      } finally {
        setSessionLoading(false);
      }
    };
    
    // Solo ejecutar si tenemos todos los datos necesarios
    if (userProfile && userRoutine && selectedDayIndex !== null) {
      crearSesionSiNoExiste();
    }
  }, [userProfile, userRoutine, selectedDayIndex]);

  // Contar logs de la sesión para habilitar el botón de finalizar
  useEffect(() => {
    const fetchLogsCount = async () => {
      if (!sessionId) return;
      const { data, error } = await exerciseLogs.getBySession(sessionId);
      if (!error && data) setLogsCount(data.length);
      else setLogsCount(0);
    };
    fetchLogsCount();
  }, [sessionId]);

  const ejercicios = getCurrentDayExercises();
  
  // Verificar que los ejercicios se carguen correctamente
  useEffect(() => {
    if (selectedDayIndex !== null && userRoutine && ejercicios.length === 0) {
      // Forzar recarga de ejercicios del día
      const timer = setTimeout(() => {
        if (userRoutine?.routine_days) {
          const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          const diaSemana = diasSemana[selectedDayIndex];
          const dayData = userRoutine.routine_days.find(day => day.dia_semana === diaSemana);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDayIndex, userRoutine, ejercicios.length]);

  // Verificar si el día actual tiene entrenamiento
  const today = new Date().getDay();
  const indiceHoy = today === 0 ? 6 : today - 1;
  const diaHoy = diasSemana[indiceHoy];
  const esDiaActual = selectedDayIndex === indiceHoy;
  const diaActualTieneEntrenamiento = userRoutine?.routine_days?.some(day => 
    day.dia_semana === diaHoy && 
    day.routine_exercises && 
    day.routine_exercises.length > 0
  );
  
  // Si no hay día seleccionado, es porque hoy no hay entrenamiento
  if (selectedDayIndex === null) {
    return (
      <div className="exercise-log-container" style={{ minHeight: 'auto', gap: 0, padding: '20px' }}>
                 <div className="rest-day-message" style={{ 
           padding: '40px 20px', 
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           borderRadius: '16px',
           color: 'white',
           textAlign: 'center',
           margin: '20px 0'
         }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            🧘‍♂️ ¡Hoy es día de descanso!
          </div>
          <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
            Aprovecha para recuperar energía y prepararte para tu próximo entrenamiento.
          </div>
          
          {/* Selector de día para ver otros entrenamientos */}
          {userRoutine?.routine_days && userRoutine.routine_days.length > 1 && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>
                ¿Querés ver tu rutina de otro día?
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {userRoutine.routine_days.map((day) => {
                  const dayIndex = diasSemana.indexOf(day.dia_semana);
                  const hasExercises = day.routine_exercises && day.routine_exercises.length > 0;
                  
                  return (
                     <button
                       key={day.id}
                       onClick={() => {
                          // Navegar directamente al calendario de rutinas
                          // El día se seleccionará automáticamente en la página de destino
                          navigate('/rutina');
                        }}
                       disabled={!hasExercises}
                       style={{
                         padding: '12px 20px',
                         borderRadius: '8px',
                         border: 'none',
                         background: hasExercises ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                         color: 'white',
                         cursor: hasExercises ? 'pointer' : 'not-allowed',
                         fontSize: '14px',
                         fontWeight: '500',
                         transition: 'all 0.2s ease'
                       }}
                       onMouseEnter={(e) => {
                         if (hasExercises) {
                           e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                         }
                       }}
                       onMouseLeave={(e) => {
                         if (hasExercises) {
                           e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                         }
                       }}
                     >
                       {day.dia_semana}
                       {!hasExercises && ' (sin ejercicios)'}
                     </button>
                   );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Resumen visual del día (solo cuando hay día seleccionado)
  const diaSemana = diasSemana[selectedDayIndex];
  const routineName = userRoutine?.nombre || 'Rutina Personalizada';
  
  const gruposMusculares = Array.from(new Set(
    ejercicios.flatMap(ej => ej.grupo_muscular ? [ej.grupo_muscular] : [])
  ));
  
  const mensajeMotivacional = `¡Hoy es día de ${gruposMusculares.length ? gruposMusculares.join(', ') : 'entrenamiento'}! Da lo mejor de ti 🚀`;

  const handleFinishSession = async () => {
    setFinishLoading(true);
    try {
      const { error } = await workoutSessions.finish(sessionId);
      if (error) throw error;
      setSessionFinished(true);
      showSuccess('¡Sesión finalizada y guardada!');
    } catch (err) {
      showError('Error al finalizar la sesión.');
    } finally {
      setFinishLoading(false);
    }
  };

  // Mostrar loading mientras se crea la sesión
  if (sessionLoading) {
    return (
      <div className="exercise-log-container" style={{ minHeight: 'auto', gap: 0, padding: 0 }}>
        <div className="loading-state" style={{ justifyContent: 'center', padding: '40px 20px', fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Cargando tu rutina...
        </div>
      </div>
    );
  }

  // Mostrar errores o estados vacíos
  if (sessionError) {
    return (
      <div className="exercise-log-container" style={{ minHeight: 'auto', gap: 0, padding: '20px' }}>
        <div className="error-state" style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          fontSize: '16px', 
          color: 'var(--color-error)',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            ⚠️ Error al cargar la rutina
          </div>
          <div style={{ marginBottom: '16px' }}>
            {sessionError}
          </div>
          <button 
            onClick={() => {
              setSessionError(null);
              setSessionLoading(true);
              // Recargar la rutina
              loadUserRoutine();
            }}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  if (!userRoutine) return (
    <div className="card-section" style={{ padding: 16 }}>
      <p style={{ margin: 0 }}>No se encontró una rutina activa.</p>
      <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Pedile a tu coach una nueva rutina o creá una desde tu perfil.</p>
    </div>
  );
  

  if (!ejercicios.length) return (
    <div className="card-section" style={{ padding: 16 }}>
      <p style={{ margin: 0 }}>No hay ejercicios asignados para hoy.</p>
      <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Revisá otros días de la semana con las flechas o consultá tu rutina completa.</p>
    </div>
  );

  return (
    <div>
             {/* Resumen visual del día */}
       <div className="workout-summary-card">
         <div className="workout-title">
           <FaDumbbell />
           <span>{routineName}</span>
         </div>
         <div className="workout-details">
           <b>Día:</b> {diaSemana} &nbsp; | &nbsp;
           <b>Grupos:</b> {gruposMusculares.length ? gruposMusculares.join(', ') : 'General'}
         </div>
         <div className="motivational-message">
           <FaFire />
           {mensajeMotivacional}
         </div>
         
                   {/* Selector de día */}
          {userRoutine?.routine_days && userRoutine.routine_days.length > 1 && (
            <div className="day-selector" style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '8px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Cambiar día de entrenamiento:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {userRoutine.routine_days.map((day, idx) => {
                  const dayIndex = diasSemana.indexOf(day.dia_semana);
                  const isSelected = dayIndex === selectedDayIndex;
                  const hasExercises = day.routine_exercises && day.routine_exercises.length > 0;
                  
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(dayIndex)}
                      disabled={!hasExercises}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSelected 
                          ? 'var(--color-primary)' 
                          : hasExercises 
                            ? 'var(--bg-tertiary)' 
                            : 'var(--bg-secondary)',
                        color: isSelected 
                          ? 'white' 
                          : hasExercises 
                            ? 'var(--text-primary)' 
                            : 'var(--text-secondary)',
                        cursor: hasExercises ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: isSelected ? '600' : '400',
                        opacity: hasExercises ? 1 : 0.5
                      }}
                    >
                      {day.dia_semana}
                      {!hasExercises && ' (sin ejercicios)'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          

       </div>
      {/* Ejercicios en tarjetas modernas */}
      <div className="exercises-grid">
        {ejercicios.map((ej, idx) => {
          const isOpen = openCards[ej.id || ej.routine_exercise_id];
          return (
            <div
              key={ej.id || ej.routine_exercise_id}
              className={`exercise-card${isOpen ? ' expanded' : ''}`}
              style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
            >
              <button
                onClick={() => toggleCard(ej.id || ej.routine_exercise_id)}
                className={`exercise-header${isOpen ? ' expanded' : ''}`}
                aria-expanded={isOpen}
                aria-controls={`card-content-${ej.id || ej.routine_exercise_id}`}
              >
                <FaDumbbell />
                <span className="exercise-name">{ej.nombre}</span>
                <span className="exercise-muscle-group">{ej.grupo_muscular || 'General'}</span>
                <span className={`expand-icon${isOpen ? ' expanded' : ''}`}>{isOpen ? '▲' : '▼'}</span>
              </button>
              <div
                id={`card-content-${ej.id || ej.routine_exercise_id}`}
                className={`exercise-content${isOpen ? ' expanded' : ''}`}
                aria-hidden={!isOpen}
                style={{ maxHeight: isOpen ? 600 : 0, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
              >
                {isOpen && (
                  <ExerciseLogCard 
                    ejercicio={ej} 
                    sessionId={sessionId}
                    onSaved={() => {
                      // Refrescar conteo de logs y dar feedback sutil
                      showInfo('Progreso guardado')
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="finish-session-container">
        <button
          onClick={handleFinishSession}
          disabled={finishLoading || sessionFinished || logsCount === 0}
          className={`finish-session-btn${sessionFinished ? ' completed' : ''}`}
        >
          {sessionFinished ? <><FaCheckCircle style={{ marginRight: 8 }} />Sesión completada</> : finishLoading ? 'Guardando...' : 'Finalizar sesión'}
        </button>
      </div>
      {/* Notificaciones globales gestionadas por NotificationSystemOptimized */}
    </div>
  );
};

export default RoutineToday; 