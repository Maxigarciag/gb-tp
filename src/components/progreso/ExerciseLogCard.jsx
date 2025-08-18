import React, { useState } from 'react';
import { exerciseLogs } from '../../lib/supabase';
import { useUIStore } from '../../stores/uiStore';
import '../../styles/ExerciseLog.css'; // Para usar los estilos de .ejercicio-item

const MIN_SERIES = 1;
const MAX_SERIES = 8;
const DEFAULT_SERIES = 3;

const ExerciseLogCard = ({ ejercicio, sessionId, onSaved }) => {
  const [numSeries, setNumSeries] = useState(DEFAULT_SERIES);
  const [series, setSeries] = useState(
    Array.from({ length: DEFAULT_SERIES }, (_, i) => ({ reps: '', peso: '', rpe: '', serie_numero: i + 1 }))
  );
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useUIStore();

  // Actualizar el número de series y resetear/ajustar el array
  const handleNumSeriesChange = (e) => {
    const n = Number(e.target.value);
    setNumSeries(n);
    setSeries((prev) => {
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, (_, i) => ({ reps: '', peso: '', rpe: '', serie_numero: prev.length + i + 1 }))
        ];
      } else {
        return prev.slice(0, n).map((s, i) => ({ ...s, serie_numero: i + 1 }));
      }
    });
  };

  const handleChange = (idx, field, value) => {
    setSeries(series => series.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId) {
      showError('Sesión no iniciada. Intenta recargar.');
      return;
    }
    for (const s of series) {
      if (!s.reps || !s.peso || !s.rpe) {
        showError('Completa todos los campos de cada serie.');
        return;
      }
      if (s.reps <= 0 || s.peso < 0 || s.rpe < 1 || s.rpe > 10) {
        showError('Valores inválidos en alguna serie.');
        return;
      }
    }
    setLoading(true);
    try {
      const logs = series.map(s => ({
        session_id: sessionId,
        exercise_id: ejercicio.id,
        serie_numero: s.serie_numero,
        repeticiones: Number(s.reps),
        peso: Number(s.peso),
        rpe: Number(s.rpe),
        created_at: new Date().toISOString(),
      }));
      for (const log of logs) {
        const { error } = await exerciseLogs.create(log);
        if (error) throw error;
      }
      showSuccess('¡Series registradas!');
      if (onSaved) onSaved();
      setSeries(Array.from({ length: numSeries }, (_, i) => ({ reps: '', peso: '', rpe: '', serie_numero: i + 1 })));
    } catch (err) {
      showError('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exercise-log-card">
      <div className="ejercicio-item">
        <div className="ejercicio-info">
          <div className="ejercicio-nombre">{ejercicio?.nombre || 'Ejercicio'}</div>
        </div>
        <div className="ejercicio-series">
          <label>Series:</label>
          <select value={numSeries} onChange={handleNumSeriesChange} disabled={loading}>
            {Array.from({ length: MAX_SERIES - MIN_SERIES + 1 }, (_, i) => MIN_SERIES + i).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
      <form onSubmit={handleSubmit} autoComplete="off" className={loading ? 'is-loading' : ''}>
        <ul className="ejercicios-lista">
          {series.map((s, idx) => (
            <li key={idx} className="serie-item">
              <span className="serie-numero">#{s.serie_numero}</span>
              <input type="number" min={0} value={s.reps} onChange={e => handleChange(idx, 'reps', e.target.value)} disabled={loading} placeholder="Reps" className="serie-input" required />
              <input type="number" min={0} value={s.peso} onChange={e => handleChange(idx, 'peso', e.target.value)} disabled={loading} placeholder="Peso (kg)" className="serie-input peso-input" required />
              <input type="number" min={1} max={10} value={s.rpe} onChange={e => handleChange(idx, 'rpe', e.target.value)} disabled={loading} placeholder="RPE" className="serie-input" required />
            </li>
          ))}
        </ul>
        <button type="submit" className="save-series-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar todas las series'}
        </button>
      </form>
      {/* Notificaciones globales gestionadas por NotificationSystemOptimized */}
    </div>
  );
};

export default ExerciseLogCard; 