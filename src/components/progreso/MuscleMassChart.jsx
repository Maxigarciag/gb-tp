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

const MuscleMassChart = ({ data }) => {
  let chartData = (data || []).filter(d => d.musculo !== null && d.musculo !== undefined).map(d => ({
    fecha: d.fecha,
    musculo: d.musculo
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  chartData = movingAverage(chartData, 'musculo', 3);

  if (!chartData.length) {
    return <div style={{ padding: 24, borderRadius: 12, background: '#f8fafd', border: '1px solid #e3e8ee', textAlign: 'center' }}>
      <h4 style={{ marginBottom: 8 }}>Evolución de % masa muscular</h4>
      <p style={{ color: '#888' }}>Aún no hay registros de masa muscular.</p>
    </div>;
  }

  return (
    <div style={{ width: '100%', height: 300, borderRadius: 12, background: '#f8fafd', border: '1px solid #e3e8ee', padding: 12, marginTop: 24 }}>
      <h4 style={{ marginBottom: 8 }}>Evolución de % masa muscular</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis dataKey="fecha" tickFormatter={f => f.slice(5)} />
          <YAxis domain={['auto', 'auto']} unit=" %" />
          <Tooltip formatter={(value, name) => name === 'musculo_trend' ? [`${value} % (tendencia)`, '% Músculo tendencia'] : [`${value} %`, '% Músculo']} labelFormatter={l => `Fecha: ${l}`} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="musculo" stroke="#43a047" strokeWidth={2} dot={{ r: 4 }} name="% Músculo" />
          <Line type="monotone" dataKey="musculo_trend" stroke="#43a047" strokeDasharray="5 5" strokeWidth={2} dot={false} name="% Músculo (tendencia)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MuscleMassChart; 