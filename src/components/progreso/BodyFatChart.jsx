import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function movingAverage(arr, key, windowSize = 3) {
  if (!arr || arr.length === 0) return [];
  return arr.map((d, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = arr.slice(start, i + 1);
    const avg = window.reduce((sum, v) => sum + (v[key] || 0), 0) / window.length;
    return { ...d, [`${key}_trend`]: +avg.toFixed(2) };
  });
}

const BodyFatChart = ({ data }) => {
  let chartData = (data || []).filter(d => d.grasa !== null && d.grasa !== undefined).map(d => ({
    fecha: d.fecha,
    grasa: d.grasa
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  chartData = movingAverage(chartData, 'grasa', 3);

  if (!chartData.length) {
    return <div style={{ padding: 24, borderRadius: 12, background: '#f8fafd', border: '1px solid #e3e8ee', textAlign: 'center' }}>
      <h4 style={{ marginBottom: 8 }}>Evolución de % grasa corporal</h4>
      <p style={{ color: '#888' }}>Aún no hay registros de grasa.</p>
    </div>;
  }

  return (
    <div style={{ width: '100%', height: 300, borderRadius: 12, background: '#f8fafd', border: '1px solid #e3e8ee', padding: 12, marginTop: 24 }}>
      <h4 style={{ marginBottom: 8 }}>Evolución de % grasa corporal</h4>
      <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
};

export default BodyFatChart; 