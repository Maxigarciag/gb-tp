import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import '@/styles/components/progreso/MacroDistributionChart.css'

const MacroDistributionChart = memo(function MacroDistributionChart({ macros }) {
  const chartData = useMemo(() => {
    if (!macros) return []
    
    const { protein, carbs, fats, targetCalories } = macros
    
    // Calcular porcentajes y calorías
    const proteinCal = protein * 4
    const carbsCal = carbs * 4
    const fatsCal = fats * 9
    const totalCal = proteinCal + carbsCal + fatsCal
    
    return [
      {
        name: 'Proteínas',
        gramos: protein,
        calorias: proteinCal,
        porcentaje: totalCal > 0 ? ((proteinCal / totalCal) * 100).toFixed(1) : 0,
        color: '#1976d2'
      },
      {
        name: 'Carbohidratos',
        gramos: carbs,
        calorias: carbsCal,
        porcentaje: totalCal > 0 ? ((carbsCal / totalCal) * 100).toFixed(1) : 0,
        color: '#43a047'
      },
      {
        name: 'Grasas',
        gramos: fats,
        calorias: fatsCal,
        porcentaje: totalCal > 0 ? ((fatsCal / totalCal) * 100).toFixed(1) : 0,
        color: '#ff9800'
      }
    ]
  }, [macros])

  if (!macros || chartData.length === 0) {
    return (
      <div className="macro-chart-empty">
        No hay datos de macronutrientes para mostrar
      </div>
    )
  }

  return (
    <div className="macro-distribution-chart">
      <div className="macro-chart-header">
        <h4>Distribución de Macronutrientes</h4>
        <span className="macro-chart-total">
          Total: {macros.targetCalories} kcal
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value === 'Carbohidratos') return 'Carbs'
              return value
            }}
          />
          <YAxis 
            unit=" g" 
            tick={{ fontSize: 12 }}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const data = props.payload
              if (name === 'gramos') {
                return [
                  `${value}g (${data.porcentaje}%)`,
                  'Gramos'
                ]
              }
              return [value, name]
            }}
            labelFormatter={(label) => label}
            contentStyle={{
              backgroundColor: 'var(--card-background)',
              border: '1px solid var(--input-border)',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="gramos" fill="#8884d8" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="macro-chart-legend">
        {chartData.map((item, index) => (
          <div key={index} className="macro-legend-item">
            <div 
              className="macro-legend-color" 
              style={{ backgroundColor: item.color }}
            />
            <span className="macro-legend-label">{item.name}:</span>
            <span className="macro-legend-value">{item.gramos}g</span>
            <span className="macro-legend-percentage">({item.porcentaje}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
})

MacroDistributionChart.propTypes = {
  macros: PropTypes.shape({
    protein: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fats: PropTypes.number.isRequired,
    targetCalories: PropTypes.number.isRequired
  })
}

export default MacroDistributionChart

