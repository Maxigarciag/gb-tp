import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark } = useTheme();

  // Resolver colores según el tema actual usando CSS variables del documento
  const chartPalette = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    const cardBg = css.getPropertyValue('--card-background').trim() || '#ffffff';
    const border = css.getPropertyValue('--input-border').trim() || '#e3e8ee';
    const text = css.getPropertyValue('--text-primary').trim() || '#1e293b';
    const grid = border;
    const tooltipBg = cardBg;
    const tooltipText = text;
    return { cardBg, border, text, grid, tooltipBg, tooltipText };
  }, [isDark]);

  // Formatear datos para el gráfico
  let chartData = (data || []).map(d => ({
    fecha: d.created_at?.slice(0, 10),
    reps: d.reps ?? d.repeticiones ?? null,
    peso: d.peso,
    rpe: d.rpe
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Añadir media móvil para la métrica principal
  chartData = movingAverage(chartData, metric, 7);
  if (secondaryMetric) {
    chartData = movingAverage(chartData, secondaryMetric, 7);
  }

  if (!ejercicio) return null;
  if (!chartData.length) {
    return <div className="exercise-chart-card" style={{ borderColor: chartPalette.border, background: chartPalette.cardBg, color: chartPalette.text }}>
      <div className="exercise-chart-header">
        <h4>{`Evolución en ${ejercicio}`}</h4>
      </div>
      <div className="exercise-chart-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: chartPalette.text, opacity: 0.7 }}>Aún no hay registros para este ejercicio.</p>
      </div>
    </div>;
  }

  return (
    <div className="exercise-chart-card" style={{ borderColor: chartPalette.border, background: chartPalette.cardBg, color: chartPalette.text }}>
      <div className="exercise-chart-header">
        <h4>{`Evolución en ${ejercicio}`}</h4>
        <span className="exercise-chart-hint">(línea punteada = media móvil 7)</span>
        <label className="exercise-chart-label">Comparar con: </label>
        <select
          value={secondaryMetric}
          onChange={e => setSecondaryMetric(e.target.value)}
          className="exercise-chart-select"
        >
          <option value="">(Ninguna)</option>
          {Object.keys(metricNames).filter(m => m !== metric).map(m => (
            <option key={m} value={m}>{metricNames[m]}</option>
          ))}
        </select>
      </div>
      <div className="exercise-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
            <XAxis dataKey="fecha" tickFormatter={f => f.slice(5)} tick={{ fill: chartPalette.text }} stroke={chartPalette.border} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: chartPalette.text }} stroke={chartPalette.border} />
            <Tooltip
              contentStyle={{ background: chartPalette.tooltipBg, border: `1px solid ${chartPalette.border}`, color: chartPalette.tooltipText }}
              labelStyle={{ color: chartPalette.tooltipText }}
              formatter={(value, name) => {
                if (name.endsWith('_trend')) return [`${value} (tendencia)`, metricNames[name.replace('_trend', '')]];
                return [value, metricNames[name] || name];
              }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ color: chartPalette.text }} />
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
    </div>
  )
}

ExerciseProgressChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	ejercicio: PropTypes.object,
	metric: PropTypes.oneOf(['peso', 'reps', 'rpe'])
}

export default ExerciseProgressChart 