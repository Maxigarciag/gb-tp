/**
 * Calculadora de grasa corporal usando método US Navy
 * @param {Object} props
 * @param {Function} props.onSaveMeasurement - Callback al guardar medición
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { FaCalculator, FaInfoCircle, FaExclamationTriangle, FaSave, FaHistory } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { bodyCompositionStudies } from '@/lib/supabase'
import '@/styles/components/progreso/BodyFatCalculator.css'

// Constantes para validación y cálculos
const VALIDATION_RANGES = {
	height: { min: 100, max: 250 },
	weight: { min: 30, max: 300 },
	neck: { min: 20, max: 80 },
	waist: { min: 50, max: 200 },
	hip: { min: 60, max: 200 }
}

const BODY_FAT_CATEGORIES = {
	male: [
		{ max: 6, category: 'Grasa Esencial', color: '#ef5350' },
		{ max: 14, category: 'Atlético', color: '#43a047' },
		{ max: 18, category: 'Fitness', color: '#1976d2' },
		{ max: 25, category: 'Aceptable', color: '#ff9800' },
		{ max: Infinity, category: 'Obesidad', color: '#ef5350' }
	],
	female: [
		{ max: 12, category: 'Grasa Esencial', color: '#ef5350' },
		{ max: 21, category: 'Atlético', color: '#43a047' },
		{ max: 25, category: 'Fitness', color: '#1976d2' },
		{ max: 32, category: 'Aceptable', color: '#ff9800' },
		{ max: Infinity, category: 'Obesidad', color: '#ef5350' }
	]
}

const BodyFatCalculator = ({ onSaveMeasurement }) => {
	const { userProfile } = useAuth()
	const navigate = useNavigate()
	
	// Auto-completar género basado en el perfil del usuario
	const defaultGender = userProfile?.sexo === 'femenino' ? 'female' : 'male'
	
	const [gender, setGender] = useState(defaultGender)
	const [formData, setFormData] = useState({
		height: userProfile?.altura || '',
		weight: userProfile?.peso || '',
		neck: '',
		waist: '',
		hip: ''
	})
	const [errors, setErrors] = useState({})
	const [result, setResult] = useState(null)
	const [hasStudies, setHasStudies] = useState(false)
	const [saving, setSaving] = useState(false)

	// Actualizar datos del formulario cuando cambie el perfil del usuario
	useEffect(() => {
		if (userProfile) {
			setFormData(prev => ({
				...prev,
				height: userProfile.altura || '',
				weight: userProfile.peso || ''
			}))
			
			// Actualizar género si cambia
			const newGender = userProfile.sexo === 'femenino' ? 'female' : 'male'
			setGender(newGender)
		}
	}, [userProfile])

	// Verificar si hay estudios previos
	useEffect(() => {
		const checkStudies = async () => {
			if (userProfile?.id) {
				const { data } = await bodyCompositionStudies.getLatestStudy()
				setHasStudies(!!data)
			}
		}
		checkStudies()
	}, [userProfile?.id])

	// Validación optimizada
	const validateData = useCallback((data) => {
		const newErrors = {}
		
		Object.entries(VALIDATION_RANGES).forEach(([field, range]) => {
			if (field === 'hip' && gender === 'male') return // Skip hip for males
			
			const value = parseFloat(data[field])
			if (!value || value < range.min || value > range.max) {
				newErrors[field] = `${field === 'height' ? 'Altura' : 
					field === 'weight' ? 'Peso' : 
					field === 'neck' ? 'Cuello' : 
					field === 'waist' ? 'Cintura' : 'Cadera'} debe estar entre ${range.min} y ${range.max} ${field === 'height' || field === 'neck' || field === 'waist' || field === 'hip' ? 'cm' : 'kg'}`
			}
		})
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}, [gender])

	// Cálculo de grasa corporal optimizado
	const calculateBodyFat = useCallback((data) => {
		const height = parseFloat(data.height)
		const weight = parseFloat(data.weight)
		const neck = parseFloat(data.neck)
		const waist = parseFloat(data.waist)
		const hip = parseFloat(data.hip)

		let bodyFatPercentage = 0

		if (gender === 'male') {
			// Fórmula para hombres: %GC = 495 / (1.0324 - 0.19077 × log10(cintura - cuello) + 0.15456 × log10(altura)) - 450
			bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450
		} else {
			// Fórmula para mujeres: %GC = 495 / (1.29579 - 0.35004 × log10(cintura + cadera - cuello) + 0.22100 × log10(altura)) - 450
			bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450
		}

		// Validar que el resultado esté en un rango lógico
		if (bodyFatPercentage < 2 || bodyFatPercentage > 50) {
			throw new Error('Resultado fuera del rango esperado. Verifica las mediciones.')
		}

		return bodyFatPercentage
	}, [gender])

	// Determinar categoría y color optimizado
	const getCategoryAndColor = useCallback((percentage) => {
		const categories = BODY_FAT_CATEGORIES[gender]
		const category = categories.find(cat => percentage <= cat.max)
		return { category: category.category, color: category.color }
	}, [gender])

	// Obtener rango saludable
	const getHealthyRange = useCallback(() => {
		return gender === 'male' ? '6-18%' : '12-25%'
	}, [gender])

	// Manejar cambio de género
	const handleGenderChange = useCallback((newGender) => {
		setGender(newGender)
		setResult(null)
		setErrors({})
	}, [])

	// Manejar cambio de input optimizado
	const handleInputChange = useCallback((field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		
		// Limpiar error del campo cuando el usuario empiece a escribir
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
		
		// Limpiar resultado cuando cambien los datos
		if (result) {
			setResult(null)
		}
	}, [errors, result])

	// Manejar envío del formulario optimizado
	const handleSubmit = useCallback((e) => {
		e.preventDefault()
		
		if (!validateData(formData)) {
			return
		}

		try {
			const bodyFatPercentage = calculateBodyFat(formData)
			const { category, color } = getCategoryAndColor(bodyFatPercentage)
			const fatMass = (parseFloat(formData.weight) * bodyFatPercentage) / 100
			const leanMass = parseFloat(formData.weight) - fatMass

			setResult({
				percentage: bodyFatPercentage,
				fatMass,
				leanMass,
				category,
				color
			})

			// Llamar callback si existe
			if (onSaveMeasurement) {
				onSaveMeasurement({
					percentage: bodyFatPercentage,
					fatMass,
					leanMass,
					category,
					date: new Date().toISOString()
				})
			}
		} catch (error) {
			setErrors({ general: error.message })
		}
	}, [formData, validateData, calculateBodyFat, getCategoryAndColor, onSaveMeasurement])

	// Resetear formulario optimizado
	const handleReset = useCallback(() => {
		setFormData({
			height: userProfile?.altura || '',
			weight: userProfile?.peso || '',
			neck: '',
			waist: '',
			hip: ''
		})
		setErrors({})
		setResult(null)
	}, [userProfile])

	// Guardar estudio
	const handleSaveStudy = useCallback(async () => {
		if (!result || !userProfile?.id) return

		setSaving(true)
		try {
			const studyData = {
				fecha: new Date().toISOString().slice(0, 10),
				peso: parseFloat(formData.weight),
				bodyfat: {
					percentage: result.percentage,
					fatMass: result.fatMass,
					leanMass: result.leanMass,
					category: result.category,
					color: result.color
				}
			}

			const { error } = await bodyCompositionStudies.saveStudy(studyData)
			if (error) throw error

			// Redirigir al tab de estudios después de guardar
			setTimeout(() => {
				navigate('/progreso/composicion?tab=studies')
			}, 500)
		} catch (error) {
			console.error('Error al guardar estudio:', error)
			alert('❌ Error al guardar el estudio. Intenta de nuevo.')
		} finally {
			setSaving(false)
		}
	}, [result, formData, userProfile])

	// Renderizar campo de input reutilizable
	const renderInputField = useCallback((field, label, unit, placeholder) => (
		<div className="input-group">
			<label htmlFor={field}>{label}</label>
			<input
				type="number"
				id={field}
				value={formData[field]}
				onChange={(e) => handleInputChange(field, e.target.value)}
				placeholder={placeholder}
				className={errors[field] ? 'error' : ''}
			/>
			<span className="unit">{unit}</span>
			{errors[field] && <span className="error-message">{errors[field]}</span>}
		</div>
	), [formData, errors, handleInputChange])

	// Memoizar el rango saludable
	const healthyRange = useMemo(() => getHealthyRange(), [getHealthyRange])

	return (
		<div className="body-fat-calculator">
			{/* Título mejorado - ya no parece un botón */}
			<div className="calculator-header">
				<div className="calculator-title">
					<FaCalculator className="title-icon" />
					<h2>Calculadora de Grasa Corporal</h2>
				</div>
				<p className="calculator-description">
					Método US Navy - Cálculo preciso de composición corporal
				</p>
				{hasStudies && (
					<button 
						className="btn-view-studies"
						onClick={() => navigate('/progreso/composicion?tab=studies')}
					>
						<FaHistory /> Ver Mis Estudios
					</button>
				)}
			</div>

			{/* Selector de género */}
			<div className="gender-switch-container">
				<label className="gender-switch-label">Selecciona tu género:</label>
				<div className="gender-buttons">
					<button
						type="button"
						className={`gender-btn ${gender === 'male' ? 'gender-btn-active' : 'gender-btn-inactive'}`}
						onClick={() => handleGenderChange('male')}
					>
						Hombre
					</button>
					<button
						type="button"
						className={`gender-btn ${gender === 'female' ? 'gender-btn-active' : 'gender-btn-inactive'}`}
						onClick={() => handleGenderChange('female')}
					>
						Mujer
					</button>
				</div>
			</div>

			{/* Formulario */}
			<form onSubmit={handleSubmit} className="calculator-form">
				<div className="form-grid">
					{renderInputField('height', 'Altura', 'cm', 'Ej: 175')}
					{renderInputField('weight', 'Peso', 'kg', 'Ej: 70')}
					{renderInputField('neck', 'Cuello', 'cm', 'Ej: 35')}
					{renderInputField('waist', 'Cintura', 'cm', 'Ej: 80')}
					{gender === 'female' && renderInputField('hip', 'Cadera', 'cm', 'Ej: 95')}
				</div>

				{errors.general && (
					<div className="error-banner">
						<FaExclamationTriangle />
						<span>{errors.general}</span>
					</div>
				)}

				<div className="form-actions">
					<button type="submit" className="calculate-btn">
						Calcular Grasa Corporal
					</button>
					<button type="button" onClick={handleReset} className="reset-btn">
						Limpiar
					</button>
				</div>
			</form>

			{/* Resultados */}
			{result && (
				<div className="results-section">
					<div className="result-header">
						<h3>Resultados del Cálculo</h3>
						<div className="result-category" style={{ color: result.color }}>
							{result.category}
						</div>
					</div>

					<div className="result-grid">
						<div className="result-item">
							<span className="result-label">Porcentaje de Grasa:</span>
							<span className="result-value">{result.percentage.toFixed(1)}%</span>
						</div>
						<div className="result-item">
							<span className="result-label">Masa Grasa:</span>
							<span className="result-value">{result.fatMass.toFixed(1)} kg</span>
						</div>
						<div className="result-item">
							<span className="result-label">Masa Magra:</span>
							<span className="result-value">{result.leanMass.toFixed(1)} kg</span>
						</div>
					</div>

					<div className="healthy-range-info">
						<FaInfoCircle />
						<span>Rango saludable para {gender === 'male' ? 'hombres' : 'mujeres'}: <strong>{healthyRange}</strong></span>
					</div>

					{userProfile?.id && (
						<button 
							className="btn-save-study"
							onClick={handleSaveStudy}
							disabled={saving}
						>
							<FaSave /> {saving ? 'Guardando...' : 'Guardar Estudio'}
						</button>
					)}
				</div>
			)}
		</div>
	)
}

BodyFatCalculator.propTypes = {
	onSaveMeasurement: PropTypes.func
}

export default BodyFatCalculator