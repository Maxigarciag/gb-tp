import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const BodyFatChart = ({ data }) => {
  let chartData = (data || []).filter(d => d.grasa !== null && d.grasa !== undefined).map(d => ({
    fecha: d.fecha,
    grasa: d.grasa
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  chartData = movingAverage(chartData, 'grasa', 3);

  if (!chartData.length) {
    return <div style={{ padding: 8, textAlign: 'center', color: '#888' }}>Aún no hay registros de grasa.</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis dataKey="fecha" tickFormatter={f => f.slice(5)} />
          <YAxis domain={['auto', 'auto']} unit=" %" />
          <Tooltip formatter={(value, name) => name === 'grasa_trend' ? [`${value} % (tendencia)`, '% Grasa tendencia'] : [`${value} %`, '% Grasa']} labelFormatter={l => `Fecha: ${l}`} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="grasa" stroke="#e65100" strokeWidth={2} dot={{ r: 4 }} name="% Grasa" />
          <Line type="monotone" dataKey="grasa_trend" stroke="#e65100" strokeDasharray="5 5" strokeWidth={2} dot={false} name="% Grasa (tendencia)" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#667085', fontSize: 12, marginTop: 8 }}>
        <FaInfoCircle aria-hidden="true" />
        <span>La tendencia es una media móvil de 3 registros. Si medís con balanza, intentá hacerlo en condiciones similares.</span>
      </div>
    </div>
  );
};

export default BodyFatChart; 