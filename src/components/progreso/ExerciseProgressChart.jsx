import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const metricColors = {
  peso: '#1976d2',
  reps: '#43a047',
  rpe: '#e65100',
};

const metricNames = {
  peso: 'Peso (kg)',
  reps: 'Reps',
  rpe: 'RPE',
};

// Calcular media móvil simple
function movingAverage(arr, key, windowSize = 3) {
  if (!arr || arr.length === 0) return [];
  return arr.map((d, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = arr.slice(start, i + 1);
    const values = window
      .map(v => v[key])
      .filter(v => typeof v === 'number' && Number.isFinite(v));
    const avg = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
    return { ...d, [`${key}_trend`]: avg != null ? +avg.toFixed(2) : null };
  });
}

const ExerciseProgressChart = ({ data, ejercicio, metric = 'peso' }) => {
  const [secondaryMetric, setSecondaryMetric] = useState('');

  // Formatear datos para el gráfico
  let chartData = (data || []).map(d => ({
    fecha: d.created_at?.slice(0, 10),
    reps: d.reps ?? d.repeticiones ?? null,
    peso: d.peso,
    rpe: d.rpe
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Añadir media móvil para la métrica principal
  chartData = movingAverage(chartData, metric, 3);
  if (secondaryMetric) {
    chartData = movingAverage(chartData, secondaryMetric, 3);
  }

  if (!ejercicio) return null;
  if (!chartData.length) {
    return <div style={{ padding: 24, borderRadius: 12, background: '#f8fafd', border: '1px solid #e3e8ee', textAlign: 'center', marginTop: 24 }}>
      <h4 style={{ marginBottom: 8 }}>{`Evolución en ${ejercicio}`}</h4>
      <p style={{ color: '#888' }}>Aún no hay registros para este ejercicio.</p>
    </div>;
  }

  return (
    <div style={{ width: '100%', height: 340, borderRadius: 12, background: '#f8fafd', border: '1px solid #e3e8ee', padding: 12, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h4 style={{ marginBottom: 0 }}>{`Evolución en ${ejercicio}`}</h4>
        <label style={{ fontWeight: 500, marginLeft: 16 }}>Comparar con: </label>
        <select
          value={secondaryMetric}
          onChange={e => setSecondaryMetric(e.target.value)}
          style={{ fontSize: 14, padding: '2px 8px', borderRadius: 6, border: '1px solid #e3e8ee', background: '#fff', color: '#333' }}
        >
          <option value="">(Ninguna)</option>
          {Object.keys(metricNames).filter(m => m !== metric).map(m => (
            <option key={m} value={m}>{metricNames[m]}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis dataKey="fecha" tickFormatter={f => f.slice(5)} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value, name) => {
              if (name.endsWith('_trend')) return [`${value} (tendencia)`, metricNames[name.replace('_trend', '')]];
              return [value, metricNames[name] || name];
            }}
          />
          <Legend verticalAlign="top" height={36} />
          {/* Línea principal */}
          <Line type="monotone" dataKey={metric} stroke={metricColors[metric]} strokeWidth={2} dot={{ r: 4 }} name={metricNames[metric]} />
          {/* Línea de tendencia principal */}
          <Line type="monotone" dataKey={`${metric}_trend`} stroke={metricColors[metric]} strokeDasharray="5 5" strokeWidth={2} dot={false} name={`${metricNames[metric]} (tendencia)`} />
          {/* Línea secundaria si aplica */}
          {secondaryMetric && (
            <Line type="monotone" dataKey={secondaryMetric} stroke={metricColors[secondaryMetric]} strokeWidth={2} dot={{ r: 4 }} name={metricNames[secondaryMetric]} />
          )}
          {secondaryMetric && (
            <Line type="monotone" dataKey={`${secondaryMetric}_trend`} stroke={metricColors[secondaryMetric]} strokeDasharray="5 5" strokeWidth={2} dot={false} name={`${metricNames[secondaryMetric]} (tendencia)`} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExerciseProgressChart; 