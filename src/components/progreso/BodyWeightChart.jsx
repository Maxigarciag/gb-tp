import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Calcular media móvil simple ignorando nulos/indefinidos
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

const BodyWeightChart = ({ data }) => {
  // Formatear datos para el gráfico
  let chartData = (data || []).map(d => ({
    fecha: d.fecha,
    peso: d.peso
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  chartData = movingAverage(chartData, 'peso', 3);

  if (!chartData.length) {
    return <div className="chart-empty">Aún no hay registros de peso.</div>;
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis dataKey="fecha" tickFormatter={f => f.slice(5)} />
          <YAxis domain={['auto', 'auto']} unit=" kg" />
          <Tooltip formatter={(value, name) => name === 'peso_trend' ? [`${value} kg (tendencia)`, 'Peso (kg) (media móvil)'] : [`${value} kg`, 'Peso (kg)']} labelFormatter={l => `Fecha: ${l}`} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="peso" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} name="Peso (kg)" />
          <Line type="monotone" dataKey="peso_trend" stroke="#1976d2" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Peso (kg) (tendencia)" />
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-hint">
        <FaInfoCircle aria-hidden="true" />
        <span>La línea punteada es la tendencia (media móvil de 3 registros). Registrá tu peso 2-3 veces por semana para ver una curva clara.</span>
      </div>
    </div>
  );
};

export default BodyWeightChart; 