import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Dumbbell, ArrowRight, ChevronLeft, Info } from 'lucide-react'
import FormularioOptimized from '../FormularioOptimized'
import '../../styles/RoutineSelector.css'

function RoutineSelector () {
  const [mode, setMode] = useState(null) // 'auto' | 'custom' | null
  const navigate = useNavigate()

  if (mode === 'auto') {
    return (
      <div className="routine-selector auto-mode">
        <button className="back-link" onClick={() => setMode(null)}>
          <ChevronLeft size={16} /> Volver
        </button>
        <FormularioOptimized />
      </div>
    )
  }

  return (
    <div className="routine-selector">
      <div className="selector-hero">
        <div className="stepper" aria-label="Pasos">
          <div className="step is-active">
            <span className="step-index">1</span>
            <span className="step-label">Elegí el método</span>
          </div>
          <div className="step">
            <span className="step-index">2</span>
            <span className="step-label">Completar datos</span>
          </div>
          <div className="step">
            <span className="step-index">3</span>
            <span className="step-label">Guardar y entrenar</span>
          </div>
        </div>
        <h1>¿Cómo querés crear tu rutina?</h1>
        <p className="subtitle">Podés generarla automáticamente según tu perfil o armarla a tu gusto.
        </p>
        <div className="helper-tip">
          <Info size={14} />
          <span>Si es tu primera vez, te recomendamos la opción automática.</span>
        </div>
      </div>

      <div className="selector-grid">
        <button
          className="selector-card"
          onClick={() => setMode('auto')}
          aria-label="Generar rutina automática"
        >
          <div className="icon-circle auto"><Target size={22} /></div>
          <div className="selector-card-title">Generar rutina automática</div>
          <div className="selector-card-desc">
            Obtené una rutina optimizada según tu objetivo, tiempo y días disponibles.
          </div>
          <ul className="card-features">
            <li>Configuración rápida</li>
            <li>Selección de ejercicios inteligente</li>
            <li>Se integra con tu progreso</li>
          </ul>
          <div className="selector-card-cta">Comenzar <ArrowRight size={16} /></div>
        </button>

        <button
          className="selector-card"
          onClick={() => navigate('/rutina-personalizada')}
          aria-label="Crear rutina personalizada"
        >
          <div className="icon-circle custom"><Dumbbell size={22} /></div>
          <div className="selector-card-title">Crear rutina personalizada</div>
          <div className="selector-card-desc">
            Diseñá tu rutina desde cero: días, ejercicios y objetivos por serie.
          </div>
          <ul className="card-features">
            <li>Control total por día</li>
            <li>Series, repeticiones y peso objetivo</li>
            <li>Guardado en cuenta o dispositivo</li>
          </ul>
          <div className="selector-card-cta">Diseñar rutina <ArrowRight size={16} /></div>
        </button>
      </div>
    </div>
  )
}

export default RoutineSelector


