import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'
import { exerciseLogs } from '../../lib/supabase'
import { useUIStore } from '../../stores/uiStore'
import '../../styles/components/progreso/ExerciseLog.css'

const MIN_SERIES = 1;
const MAX_SERIES = 8;
const DEFAULT_SERIES = 3;

// Configuración de niveles de RPE con descripciones
const RPE_LEVELS = [
	{ value: 0, label: '0 - Sin esfuerzo', description: 'Descanso o estiramiento', color: '#94a3b8' },
	{ value: 1, label: '1 - Muy fácil', description: 'Apenas se siente', color: '#22c55e' },
	{ value: 2, label: '2 - Fácil', description: 'Ligero esfuerzo', color: '#22c55e' },
	{ value: 3, label: '3 - Moderado bajo', description: 'Se puede mantener conversación', color: '#84cc16' },
	{ value: 4, label: '4 - Moderado', description: 'Algo desafiante', color: '#eab308' },
	{ value: 5, label: '5 - Moderado alto', description: 'Esfuerzo notable', color: '#eab308' },
	{ value: 6, label: '6 - Difícil bajo', description: 'Conversación difícil', color: '#f59e0b' },
	{ value: 7, label: '7 - Difícil', description: 'Muy desafiante', color: '#f97316' },
	{ value: 8, label: '8 - Muy difícil', description: '2-3 reps en reserva', color: '#ef4444' },
	{ value: 9, label: '9 - Casi máximo', description: '1 rep en reserva', color: '#dc2626' },
	{ value: 10, label: '10 - Máximo', description: 'Fallo muscular', color: '#991b1b' }
]

const ExerciseLogCard = ({ ejercicio, sessionId, onSaved }) => {
	const [numSeries, setNumSeries] = useState(DEFAULT_SERIES);
	const [series, setSeries] = useState(
		Array.from({ length: DEFAULT_SERIES }, (_, i) => ({ reps: '', peso: '', rpe: '', serie_numero: i + 1 }))
	);
	const [loading, setLoading] = useState(false);
	const [showRpeTooltip, setShowRpeTooltip] = useState(null)
	const [isRpeGuideOpen, setIsRpeGuideOpen] = useState(false)
	const { showError, showSuccess } = useUIStore();

	// Función para convertir número a texto ordinal en español
	const getSerieText = (numero) => {
		const ordinals = {
			1: 'Primera serie',
			2: 'Segunda serie', 
			3: 'Tercera serie',
			4: 'Cuarta serie',
			5: 'Quinta serie',
			6: 'Sexta serie',
			7: 'Séptima serie',
			8: 'Octava serie'
		};
		return ordinals[numero] || `${numero}ª serie`;
	};

  // Actualizar el número de series y resetear/ajustar el array
  const handleNumSeriesChange = (e) => {
    const n = Number(e.target.value);
    setNumSeries(n);
    setSeries((prev) => {
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, (_, i) => ({ reps: '', peso: '', rpe: '', serie_numero: prev.length + i + 1 }))
        ];
      } else {
        return prev.slice(0, n).map((s, i) => ({ ...s, serie_numero: i + 1 }));
      }
    });
  };

  const handleChange = (idx, field, value) => {
    setSeries(series => series.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

	// Obtener información del nivel de RPE
	const getRpeInfo = (rpeValue) => {
		if (rpeValue === '' || rpeValue === null || rpeValue === undefined) return null
		const numValue = Number(rpeValue)
		return RPE_LEVELS.find(level => level.value === numValue)
	}

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId) {
      showError('Sesión no iniciada. Intenta recargar.');
      return;
    }
    for (const s of series) {
      // RPE ahora es opcional, solo validar reps y peso
      if (!s.reps || !s.peso) {
        showError('Completa repeticiones y peso de cada serie.');
        return;
      }
      // Validar rangos
      if (s.reps <= 0 || s.peso < 0) {
        showError('Repeticiones y peso deben ser positivos.');
        return;
      }
      // Validar RPE solo si fue proporcionado
      if (s.rpe !== '' && s.rpe !== null && s.rpe !== undefined) {
        const rpeNum = Number(s.rpe)
        if (rpeNum < 0 || rpeNum > 10) {
          showError('El RPE debe estar entre 0 y 10.');
          return;
        }
      }
    }
    setLoading(true);
    try {
      const logs = series.map(s => ({
        session_id: sessionId,
        exercise_id: ejercicio.id,
        serie_numero: s.serie_numero,
        repeticiones: Number(s.reps),
        peso: Number(s.peso),
        // RPE es opcional: enviar null si está vacío
        rpe: (s.rpe === '' || s.rpe === null || s.rpe === undefined) ? null : Number(s.rpe),
        created_at: new Date().toISOString(),
      }));
      for (const log of logs) {
        const { error } = await exerciseLogs.create(log);
        if (error) throw error;
      }
      // Series registradas exitosamente
			showSuccess(`${numSeries} ${numSeries === 1 ? 'serie guardada' : 'series guardadas'} exitosamente`)
      if (onSaved) onSaved();
      setSeries(Array.from({ length: numSeries }, (_, i) => ({ reps: '', peso: '', rpe: '', serie_numero: i + 1 })));
    } catch (err) {
			console.error('Error al guardar series:', err)
      showError('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exercise-log-card">
      <div className="ejercicio-item">
        <div className="ejercicio-info">
          <div className="ejercicio-nombre">{ejercicio?.nombre || 'Ejercicio'}</div>
        </div>
        <div className="ejercicio-series">
          <label>Series:</label>
          <select value={numSeries} onChange={handleNumSeriesChange} disabled={loading}>
            {Array.from({ length: MAX_SERIES - MIN_SERIES + 1 }, (_, i) => MIN_SERIES + i).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

			{/* Leyenda de RPE - Desplegable */}
			<div className="rpe-guide">
				<button 
					className="rpe-guide-header"
					onClick={() => setIsRpeGuideOpen(!isRpeGuideOpen)}
					type="button"
					aria-expanded={isRpeGuideOpen}
					aria-label={`${isRpeGuideOpen ? 'Ocultar' : 'Mostrar'} guía de RPE`}
				>
					<span>RPE (Escala de Esfuerzo Percibido) - Opcional</span>
					<motion.div
						animate={{ rotate: isRpeGuideOpen ? 180 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<ChevronDown size={14} />
					</motion.div>
				</button>
				
				<AnimatePresence>
					{isRpeGuideOpen && (
						<motion.div 
							className="rpe-guide-content"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: 'easeInOut' }}
						>
							<div className="rpe-guide-grid">
								<div className="rpe-guide-item">
									<span className="rpe-guide-value">0</span>
									<span className="rpe-guide-desc">Sin esfuerzo</span>
								</div>
								<div className="rpe-guide-item">
									<span className="rpe-guide-value">1-3</span>
									<span className="rpe-guide-desc">Muy fácil</span>
								</div>
								<div className="rpe-guide-item">
									<span className="rpe-guide-value">4-6</span>
									<span className="rpe-guide-desc">Moderado</span>
								</div>
								<div className="rpe-guide-item">
									<span className="rpe-guide-value">7-8</span>
									<span className="rpe-guide-desc">Difícil</span>
								</div>
								<div className="rpe-guide-item">
									<span className="rpe-guide-value">9-10</span>
									<span className="rpe-guide-desc">Máximo</span>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

      <form onSubmit={handleSubmit} autoComplete="off" className={loading ? 'is-loading' : ''}>
        <ul className="ejercicios-lista">
          {series.map((s, idx) => {
						const rpeInfo = getRpeInfo(s.rpe)
						return (
            <li key={idx} className="serie-item">
							{/* Botón de serie */}
							<button type="button" className="serie-button">
								{getSerieText(s.serie_numero)}
							</button>
							
							{/* Input de repeticiones */}
							<div className="input-field">
								<label className="field-label">REPETICIONES</label>
								<input 
									type="number" 
									min={0} 
									value={s.reps} 
									onChange={e => handleChange(idx, 'reps', e.target.value)} 
									disabled={loading} 
									className="field-input" 
									required 
								/>
							</div>

							{/* Input de peso */}
							<div className="input-field">
								<label className="field-label">PESO (KG)</label>
								<input 
									type="number" 
									min={0} 
									step="0.5"
									value={s.peso} 
									onChange={e => handleChange(idx, 'peso', e.target.value)} 
									disabled={loading} 
									className="field-input" 
									required 
								/>
							</div>

							{/* Input de RPE */}
							<div className="input-field">
								<label className="field-label">RPE (OPCIONAL)</label>
								<select
									value={s.rpe}
									onChange={e => handleChange(idx, 'rpe', e.target.value)}
									disabled={loading}
									className="field-input"
								>
									<option value="">Sin RPE</option>
									{RPE_LEVELS.map(level => (
										<option 
											key={level.value} 
											value={level.value}
										>
											{level.label}
										</option>
									))}
								</select>
							</div>
            </li>
					)})}
        </ul>
        <button type="submit" className="save-series-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar todas las series'}
        </button>
      </form>
    </div>
  )
}

ExerciseLogCard.propTypes = {
	ejercicio: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.shape({
			id: PropTypes.string,
			nombre: PropTypes.string,
			grupo_muscular: PropTypes.string
		})
	]).isRequired,
	sessionId: PropTypes.string.isRequired,
	onSaved: PropTypes.func.isRequired
}

export default ExerciseLogCard 