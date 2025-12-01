import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { FaInfoCircle } from 'react-icons/fa'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import '../../styles/components/progreso/UnifiedBodyChart.css'

function movingAverage (arr, key, windowSize = 3) {
  if (!arr || arr.length === 0) return []
  return arr.map((d, i) => {
    const start = Math.max(0, i - windowSize + 1)
    const window = arr.slice(start, i + 1)
    const values = window
      .map(v => v[key])
      .filter(v => typeof v === 'number' && Number.isFinite(v))
    const avg = values.length
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : null
    return { ...d, [`${key}_trend`]: avg != null ? +avg.toFixed(2) : null }
  })
}

const UnifiedBodyChart = ({ data, metric = 'all', studyDates = [] }) => {
  const [visible, setVisible] = useState({ peso: true, grasa: true, musculo: true, grasaCalculada: true })

  // Reset visibilidad según la métrica seleccionada
  useEffect(() => {
    if (metric === 'all') {
      setVisible({ peso: true, grasa: true, musculo: true, grasaCalculada: true })
    } else if (metric === 'peso') {
      setVisible({ peso: true, grasa: false, musculo: false, grasaCalculada: false })
    } else if (metric === 'grasa') {
      setVisible({ peso: false, grasa: true, musculo: false, grasaCalculada: true })
    } else if (metric === 'musculo') {
      setVisible({ peso: false, grasa: false, musculo: true, grasaCalculada: false })
    } else if (metric === 'grasaCalculada') {
      setVisible({ peso: false, grasa: false, musculo: false, grasaCalculada: true })
    }
  }, [metric])
  const chartData = useMemo(() => {
    const prepared = (data || [])
      .map(d => ({
        fecha: d.fecha,
        peso: d.peso ?? null,
        grasa: d.grasa ?? null,
        musculo: d.musculo ?? null,
        grasaCalculada: d.porcentaje_grasa ?? null,
      }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

    // Agregar tendencias sólo para la métrica seleccionada o para todas si metric === 'all'
    let withTrends = prepared
    if (metric === 'all' || metric === 'peso') withTrends = movingAverage(withTrends, 'peso', 3)
    if (metric === 'all' || metric === 'grasa') withTrends = movingAverage(withTrends, 'grasa', 3)
    if (metric === 'all' || metric === 'musculo') withTrends = movingAverage(withTrends, 'musculo', 3)
    if (metric === 'all' || metric === 'grasaCalculada') withTrends = movingAverage(withTrends, 'grasaCalculada', 3)
    return withTrends
  }, [data, metric])

  const hasAny = chartData && chartData.length > 0 && (
    chartData.some(d => d.peso != null) ||
    chartData.some(d => d.grasa != null) ||
    chartData.some(d => d.musculo != null) ||
    chartData.some(d => d.grasaCalculada != null)
  )

  if (!hasAny) {
    return (
      <div className='unified-empty'>
        Aún no hay registros de progreso corporal.
      </div>
    )
  }

  const showPeso = (metric === 'all' || metric === 'peso') && visible.peso
  const showGrasa = (metric === 'all' || metric === 'grasa') && visible.grasa
  const showMusculo = (metric === 'all' || metric === 'musculo') && visible.musculo
  const showGrasaCalculada = (metric === 'all' || metric === 'grasa' || metric === 'grasaCalculada') && visible.grasaCalculada

  const usingDualAxis = metric === 'all' && ((showPeso ? 1 : 0) + (showGrasa || showMusculo || showGrasaCalculada ? 1 : 0) > 1)
  const yAxisUnit = metric === 'peso' ? ' kg' : metric === 'all' ? '' : ' %'

  const toggleSeries = (key) => {
    setVisible(v => ({ ...v, [key]: !v[key] }))
  }

  return (
    <div className='unified-chart-wrapper'>
      {/* Leyenda fuera del gráfico para evitar superposición */}
      <div className='unified-legend' role='group' aria-label='Series del gráfico'>
        {(metric === 'all' || metric === 'peso') && (
          <button
            type='button'
            className={`legend-pill legend-peso ${showPeso ? 'is-active' : ''}`}
            onClick={() => toggleSeries('peso')}
          >
            <span className='legend-dot legend-dot-peso' />
            Peso
          </button>
        )}
        {(metric === 'all' || metric === 'grasa') && (
          <button
            type='button'
            className={`legend-pill legend-grasa ${showGrasa ? 'is-active' : ''}`}
            onClick={() => toggleSeries('grasa')}
          >
            <span className='legend-dot legend-dot-grasa' />
            % Grasa
          </button>
        )}
        {(metric === 'all' || metric === 'musculo') && (
          <button
            type='button'
            className={`legend-pill legend-musculo ${showMusculo ? 'is-active' : ''}`}
            onClick={() => toggleSeries('musculo')}
          >
            <span className='legend-dot legend-dot-musculo' />
            % Músculo
          </button>
        )}
        {(metric === 'all' || metric === 'grasaCalculada') && (
          <button
            type='button'
            className={`legend-pill legend-grasa-calculada ${showGrasaCalculada ? 'is-active' : ''}`}
            onClick={() => toggleSeries('grasaCalculada')}
          >
            <span className='legend-dot legend-dot-grasa-calculada' />
            % Grasa Corporal
          </button>
        )}
        <span className='legend-hint'>Tocá para mostrar/ocultar</span>
      </div>

      <ResponsiveContainer width='100%' height={320}>
        <LineChart data={chartData} margin={{ top: 6, right: 24, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#e3e8ee' />
          <XAxis dataKey='fecha' tickFormatter={f => (f ? String(f).slice(5) : '')} />
          {usingDualAxis ? (
            <>
              <YAxis yAxisId='left' domain={['auto', 'auto']} unit=' kg' />
              <YAxis yAxisId='right' orientation='right' domain={['auto', 'auto']} unit=' %' />
            </>
          ) : (
            <YAxis domain={['auto', 'auto']} unit={yAxisUnit} />
          )}
          <Tooltip
            labelFormatter={l => `Fecha: ${l}`}
            formatter={(value, name) => {
              if (name.endsWith('_trend')) {
                const base = name.replace('_trend', '')
                const label = base === 'peso' ? 'Peso (kg) tendencia' : base === 'grasa' ? '% Grasa tendencia' : base === 'musculo' ? '% Músculo tendencia' : '% Grasa Corporal tendencia'
                const unit = base === 'peso' ? ' kg' : ' %'
                return [`${value}${unit}`, label]
              }
              const label = name === 'peso' ? 'Peso (kg)' : name === 'grasa' ? '% Grasa' : name === 'musculo' ? '% Músculo' : '% Grasa Corporal'
              const unit = name === 'peso' ? ' kg' : ' %'
              return [`${value}${unit}`, label]
            }}
          />
          {showPeso && (
            <>
              <Line yAxisId={usingDualAxis ? 'left' : undefined} type='monotone' dataKey='peso' stroke='#1976d2' strokeWidth={2} dot={{ r: 3 }} name='peso' />
              <Line yAxisId={usingDualAxis ? 'left' : undefined} type='monotone' dataKey='peso_trend' stroke='#1976d2' strokeDasharray='5 5' strokeWidth={2} dot={false} opacity={0.7} name='peso_trend' />
            </>
          )}
          {showGrasa && (
            <>
              <Line yAxisId={usingDualAxis ? 'right' : undefined} type='monotone' dataKey='grasa' stroke='#e65100' strokeWidth={2} dot={{ r: 3 }} name='grasa' />
              <Line yAxisId={usingDualAxis ? 'right' : undefined} type='monotone' dataKey='grasa_trend' stroke='#e65100' strokeDasharray='5 5' strokeWidth={2} dot={false} opacity={0.7} name='grasa_trend' />
            </>
          )}
          {showMusculo && (
            <>
              <Line yAxisId={usingDualAxis ? 'right' : undefined} type='monotone' dataKey='musculo' stroke='#43a047' strokeWidth={2} dot={{ r: 3 }} name='musculo' />
              <Line yAxisId={usingDualAxis ? 'right' : undefined} type='monotone' dataKey='musculo_trend' stroke='#43a047' strokeDasharray='5 5' strokeWidth={2} dot={false} opacity={0.7} name='musculo_trend' />
            </>
          )}
          {showGrasaCalculada && (
            <>
              <Line yAxisId={usingDualAxis ? 'right' : undefined} type='monotone' dataKey='grasaCalculada' stroke='#9c27b0' strokeWidth={2} dot={{ r: 3 }} name='grasaCalculada' />
              <Line yAxisId={usingDualAxis ? 'right' : undefined} type='monotone' dataKey='grasaCalculada_trend' stroke='#9c27b0' strokeDasharray='5 5' strokeWidth={2} dot={false} opacity={0.7} name='grasaCalculada_trend' />
            </>
          )}
          {/* Marcadores de fechas de estudios */}
          {studyDates && studyDates.length > 0 && studyDates.map((date, index) => {
            // Verificar si la fecha está en el rango de datos
            const dateInData = chartData.some(d => d.fecha === date)
            if (!dateInData) return null
            
            return (
              <ReferenceLine
                key={`study-${date}-${index}`}
                x={date}
                stroke='#ff9800'
                strokeWidth={2}
                strokeDasharray='2 2'
                opacity={0.6}
                label={{ 
                  value: '📊', 
                  position: 'top',
                  fontSize: 12,
                  fill: '#ff9800'
                }}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
      <div className='unified-hint'>
        <FaInfoCircle aria-hidden='true' />
        <span>
          La línea punteada representa la tendencia (media móvil de 3 registros).
          {studyDates && studyDates.length > 0 && ' Las líneas naranjas marcan fechas de estudios corporales.'}
        </span>
      </div>
    </div>
  )
}

UnifiedBodyChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	metric: PropTypes.oneOf(['all', 'peso', 'grasa', 'musculo', 'grasaCalculada']),
	studyDates: PropTypes.arrayOf(PropTypes.string)
}

export default UnifiedBodyChart


