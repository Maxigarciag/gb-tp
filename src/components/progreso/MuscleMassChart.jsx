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

const MuscleMassChart = ({ data }) => {
  let chartData = (data || []).filter(d => d.musculo !== null && d.musculo !== undefined).map(d => ({
    fecha: d.fecha,
    musculo: d.musculo
  })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  chartData = movingAverage(chartData, 'musculo', 3);

  if (!chartData.length) {
    return <div className="chart-empty">Aún no hay registros de masa muscular.</div>;
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={280}>
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
      <div className="chart-hint">
        <FaInfoCircle aria-hidden="true" />
        <span>La línea punteada suaviza el ruido con media móvil de 3 registros para ver tendencia real.</span>
      </div>
    </div>
  );
};

export default MuscleMassChart; 