import React, { useEffect, useState } from 'react';
import ExerciseLogCard from './ExerciseLogCard';
import { useRoutineStore } from '../../stores/routineStore';
import { workoutSessions, exerciseLogs } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ToastOptimized from '../ToastOptimized';
import { FaDumbbell, FaFire, FaCheckCircle } from 'react-icons/fa';
import '../../styles/Evolution.css';
import '../../styles/ExerciseLog.css';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const RoutineToday = () => {
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
  const [toast, setToast] = useState(null);
  const [logsCount, setLogsCount] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [openCards, setOpenCards] = useState({});
  const toggleCard = (id) => setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));

  // Calcular el índice del día actual (Lunes=0, Domingo=6)
  useEffect(() => {
    const today = new Date().getDay(); // 0=Domingo, 1=Lunes...
    const indiceHoy = today === 0 ? 6 : today - 1;
    if (selectedDayIndex !== indiceHoy) {
      setSelectedDay(indiceHoy);
    }
    if (!userRoutine) {
      loadUserRoutine();
    }
    // eslint-disable-next-line
  }, [userRoutine, selectedDayIndex, setSelectedDay, loadUserRoutine]);

  // Crear sesión de entrenamiento si no existe
  useEffect(() => {
    const crearSesionSiNoExiste = async () => {
      if (!userProfile || !userRoutine || selectedDayIndex === null) return;
      setSessionLoading(true);
      setSessionError(null);
      try {
        // Buscar el routine_day_id real
        const diaSemana = diasSemana[selectedDayIndex];
        const routineDay = userRoutine.routine_days?.find(day => day.dia_semana === diaSemana);
        const routine_day_id = routineDay?.id;
        if (!routine_day_id) throw new Error('No se encontró el día de rutina.');
        // Buscar si ya existe una sesión para hoy
        const fechaHoy = new Date().toISOString().split('T')[0];
        const { data: sesiones, error } = await workoutSessions.getUserSessions(20);
        if (error) throw error;
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
          if (createError) throw createError;
          setSessionId(data[0].id);
          setSessionFinished(false);
        }
      } catch (err) {
        setSessionError('Error al crear o buscar la sesión de entrenamiento.');
      } finally {
        setSessionLoading(false);
      }
    };
    crearSesionSiNoExiste();
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
  }, [sessionId, toast]); // toast para refrescar tras guardar logs

  const ejercicios = getCurrentDayExercises();

  // Resumen visual del día
  const diaSemana = diasSemana[selectedDayIndex ?? 0];
  const routineName = userRoutine?.nombre || 'Rutina Personalizada';
  const gruposMusculares = Array.from(new Set(
    ejercicios.flatMap(ej => ej.grupo_muscular ? [ej.grupo_muscular] : [])
  ));
  const mensajeMotivacional = `¡Hoy es día de ${gruposMusculares.length ? gruposMusculares.join(', ') : 'entrenamiento'}! Da lo mejor de ti 🚀`;

  const handleFinishSession = async () => {
    setFinishLoading(true);
    setToast(null);
    try {
      const { error } = await workoutSessions.finish(sessionId);
      if (error) throw error;
      setSessionFinished(true);
      setToast({ type: 'success', message: '¡Sesión finalizada y guardada!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Error al finalizar la sesión.' });
    } finally {
      setFinishLoading(false);
    }
  };

  // Mostrar loading mientras se crea la sesión
  if (sessionLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        fontSize: '18px',
        color: 'var(--text-secondary)',
        fontWeight: 500
      }}>
        Cargando tu rutina...
      </div>
    );
  }

  // Mostrar errores o estados vacíos
  if (sessionError) return <p style={{ color: 'red' }}>{sessionError}</p>;
  if (!userRoutine) return (
    <div style={{
      background: 'var(--card-background)',
      border: '1px solid var(--input-border)',
      borderRadius: 12,
      padding: '16px 16px',
      boxShadow: '0 2px 8px #0001'
    }}>
      <p style={{ margin: 0 }}>No se encontró una rutina activa.</p>
      <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Pedile a tu coach una nueva rutina o creá una desde tu perfil.</p>
    </div>
  );
  if (!ejercicios.length) return (
    <div style={{
      background: 'var(--card-background)',
      border: '1px solid var(--input-border)',
      borderRadius: 12,
      padding: '16px 16px',
      boxShadow: '0 2px 8px #0001'
    }}>
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
          <FaFire style={{ marginRight: 6 }} />
          {mensajeMotivacional}
        </div>
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
                {isOpen && <ExerciseLogCard ejercicio={ej} sessionId={sessionId} />}
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
      {toast && <ToastOptimized type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RoutineToday; 