import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import {
	FaBullseye,
	FaChevronDown,
	FaChevronUp,
	FaArrowDown,
	FaArrowUp,
	FaMinus,
	FaExclamationCircle,
	FaRegCalendarCheck,
	FaEye,
	FaEyeSlash
} from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { userProgress, workoutSessions } from '@/lib/supabase'
import '@/styles/components/progreso/ProgressDashboard.css'

const STORAGE_PREFIX = 'progress-summary-expanded'
const GOAL_LABELS = {
	perder_grasa: 'Perder grasa',
	ganar_musculo: 'Ganar músculo',
	mantener: 'Mantener'
}

const daysAgo = (days) => {
	const date = new Date()
	date.setDate(date.getDate() - days)
	date.setHours(0, 0, 0, 0)
	return date
}

const getWeekWindows = () => {
	const now = new Date()
	const day = now.getDay()
	const diff = day === 0 ? -6 : 1 - day // Lunes como inicio

	const start = new Date(now)
	start.setDate(now.getDate() + diff)
	start.setHours(0, 0, 0, 0)

	const end = new Date(start)
	end.setDate(start.getDate() + 6)
	end.setHours(23, 59, 59, 999)

	const startLast = new Date(start)
	startLast.setDate(start.getDate() - 7)
	startLast.setHours(0, 0, 0, 0)

	const endLast = new Date(startLast)
	endLast.setDate(startLast.getDate() + 6)
	endLast.setHours(23, 59, 59, 999)

	return { start, end, startLast, endLast }
}

const sortByDateDesc = (items = []) =>
	[...items].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

const findRecordBefore = (records, limitDate) =>
	records.find((record) => new Date(record.fecha) <= limitDate)

const evaluateGoal = (goal, weightChange, fatChange, sessionsThisWeek) => {
	if (!goal) {
		return {
			label: 'Sin objetivo definido',
			status: 'neutral',
			message: 'Configura tu objetivo para ver el avance real'
		}
	}

	if (weightChange === null && fatChange === null) {
		return {
			label: GOAL_LABELS[goal] || 'Objetivo activo',
			status: 'neutral',
			message: 'Necesitas al menos dos registros con 7 días de diferencia'
		}
	}

	const threshold = 0.2
	let status = 'neutral'
	let message = ''

	if (goal === 'perder_grasa') {
		if (weightChange !== null && weightChange < -threshold) {
			status = 'success'
			message = `Has bajado ${Math.abs(weightChange).toFixed(1)} kg en 7 días`
		} else if (fatChange !== null && fatChange < -0.2) {
			status = 'success'
			message = `Tu % de grasa bajó ${Math.abs(fatChange).toFixed(1)} pts`
		} else if (weightChange !== null && weightChange > threshold) {
			status = 'warning'
			message = `Subiste ${weightChange.toFixed(1)} kg en 7 días`
		} else {
			status = 'info'
			message = 'Mantén constancia para ver tendencia clara'
		}
	} else if (goal === 'ganar_musculo') {
		if (weightChange !== null && weightChange > threshold) {
			status = 'success'
			message = `Has sumado ${weightChange.toFixed(1)} kg en 7 días`
		} else if (weightChange !== null && weightChange < -threshold) {
			status = 'warning'
			message = `Bajaste ${Math.abs(weightChange).toFixed(1)} kg en 7 días`
		} else {
			status = 'info'
			message = 'Aún sin cambio relevante de peso'
		}
	} else if (goal === 'mantener') {
		if (weightChange !== null && Math.abs(weightChange) <= threshold) {
			status = 'success'
			message = 'Peso estable en la última semana'
		} else {
			status = 'warning'
			message = `Variación de ${weightChange ? weightChange.toFixed(1) : '0.0'} kg`
		}
	}

	if (sessionsThisWeek === 0 && status === 'neutral') {
		status = 'info'
		message = 'Sin entrenamientos esta semana'
	}

	return {
		label: GOAL_LABELS[goal] || 'Objetivo activo',
		status,
		message
	}
}

const buildInsights = (
	weightChange,
	fatChange,
	sessionsThisWeek,
	sessionsLastWeek,
	goal
) => {
	const insights = []

	if (sessionsThisWeek !== null && sessionsLastWeek !== null) {
		const delta = sessionsThisWeek - sessionsLastWeek
		if (delta > 0) {
			insights.push({
				type: 'success',
				title: 'Más constancia',
				body: `Completaste ${delta} sesión(es) más que la semana pasada`
			})
		} else if (delta < 0) {
			insights.push({
				type: 'warning',
				title: 'Menos entrenamientos',
				body: `Hiciste ${Math.abs(delta)} menos que la semana anterior`
			})
		}
	}

	if (weightChange !== null && Math.abs(weightChange) >= 0.1) {
		const direction = weightChange < 0 ? 'bajó' : 'subió'
		insights.push({
			type: weightChange < 0 ? 'info' : 'info',
			title: 'Cambio semanal de peso',
			body: `Tu peso ${direction} ${Math.abs(weightChange).toFixed(1)} kg en 7 días`
		})
	}

	if (fatChange !== null && Math.abs(fatChange) >= 0.1) {
		const direction = fatChange < 0 ? 'disminuyó' : 'aumentó'
		insights.push({
			type: fatChange < 0 ? 'success' : 'warning',
			title: '% de grasa',
			body: `Tu % de grasa ${direction} ${Math.abs(fatChange).toFixed(1)} pts`
		})
	}

	if (goal === 'perder_grasa' && weightChange !== null && weightChange < -0.2) {
		insights.push({
			type: 'success',
			title: 'Dirección correcta',
			body: 'La tendencia de peso acompaña tu objetivo de perder grasa'
		})
	}

	return insights
}

const computeSummary = (weights, sessions, goal) => {
	const orderedWeights = sortByDateDesc(weights)
	const latestWeight = orderedWeights[0] || null
	const weekMark = daysAgo(7)
	const monthMark = daysAgo(30)

	const weekWeight = latestWeight ? findRecordBefore(orderedWeights, weekMark) : null
	const monthWeight = latestWeight ? findRecordBefore(orderedWeights, monthMark) : null

	const weightChangeWeek =
		latestWeight && weekWeight ? latestWeight.peso - weekWeight.peso : null
	const weightChangeMonth =
		latestWeight && monthWeight ? latestWeight.peso - monthWeight.peso : null

	const fatRecords = orderedWeights.filter(
		(record) => record.grasa !== null && record.grasa !== undefined
	)
	const latestFat = fatRecords[0] || null
	const weekFat = latestFat ? findRecordBefore(fatRecords, weekMark) : null
	const fatChangeWeek = latestFat && weekFat ? latestFat.grasa - weekFat.grasa : null

	const { start, end, startLast, endLast } = getWeekWindows()
	const completedSessions = (sessions || []).filter((session) => session.completada)

	const thisWeekSessions = completedSessions.filter((session) => {
		const date = new Date(session.fecha)
		return date >= start && date <= end
	})

	const lastWeekSessions = completedSessions.filter((session) => {
		const date = new Date(session.fecha)
		return date >= startLast && date <= endLast
	})

	const sessions30 = completedSessions.filter(
		(session) => new Date(session.fecha) >= daysAgo(30)
	)
	const weeklyAvg =
		sessions30.length > 0 ? Number((sessions30.length / 4).toFixed(1)) : null

	return {
		latestWeight,
		weightChangeWeek,
		weightChangeMonth,
		latestFat,
		fatChangeWeek,
		sessions: {
			thisWeek: thisWeekSessions.length,
			lastWeek: lastWeekSessions.length,
			weeklyAvg
		},
		goal: evaluateGoal(goal, weightChangeWeek, fatChangeWeek, thisWeekSessions.length),
		insights: buildInsights(
			weightChangeWeek,
			fatChangeWeek,
			thisWeekSessions.length,
			lastWeekSessions.length,
			goal
		),
		hasAnyData: Boolean(latestWeight || completedSessions.length)
	}
}

const MetricCard = ({ title, value, helper, state, children }) => (
	<div className={`summary-card ${state}`}>
		<div className="summary-card__title">{title}</div>
		<div className="summary-card__value">{value ?? '—'}</div>
		{helper && <div className="summary-card__helper">{helper}</div>}
		{children}
	</div>
)

MetricCard.propTypes = {
	title: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	helper: PropTypes.string,
	state: PropTypes.string,
	children: PropTypes.node
}

const ProgressDashboard = ({ isVisible = true }) => {
	const { userProfile } = useAuth()
	const [summaryData, setSummaryData] = useState({ weights: [], sessions: [] })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [lastUpdated, setLastUpdated] = useState(null)
	const [isExpanded, setIsExpanded] = useState(true)

	const storageKey = useMemo(
		() => (userProfile?.id ? `${STORAGE_PREFIX}-${userProfile.id}` : null),
		[userProfile?.id]
	)

	useEffect(() => {
		if (!storageKey) {
			setIsExpanded(true)
			return
		}

		const saved = localStorage.getItem(storageKey)
		setIsExpanded(saved !== 'collapsed')
	}, [storageKey])

	useEffect(() => {
		let isMounted = true
		const load = async () => {
			if (!userProfile?.id) {
				setLoading(false)
				return
			}

			setLoading(true)
			setError(null)

			try {
				const [weightsRes, sessionsRes] = await Promise.all([
					userProgress.getByUser(userProfile.id, 120),
					workoutSessions.getUserSessions(90)
				])

				if (!isMounted) return

				setSummaryData({
					weights: weightsRes.data || [],
					sessions: (sessionsRes.data || []).filter(
						(session) => session.user_id === userProfile.id
					)
				})
				setLastUpdated(new Date().toISOString())
			} catch (err) {
				if (!isMounted) return
				setError('No pudimos cargar tus datos en este momento')
				setSummaryData({ weights: [], sessions: [] })
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		load()
		return () => {
			isMounted = false
		}
	}, [userProfile?.id])

	const computed = useMemo(
		() =>
			computeSummary(summaryData.weights, summaryData.sessions, userProfile?.objetivo),
		[summaryData.weights, summaryData.sessions, userProfile?.objetivo]
	)

	const interpretedInsight = useMemo(() => {
		const goal = userProfile?.objetivo
		const weight30 = computed.weightChangeMonth
		const sessionsWeek = computed.sessions.thisWeek

		if (goal && weight30 !== null) {
			if (goal === 'perder_grasa') {
				if (weight30 <= -0.2) return { title: 'En línea con perder grasa', body: `Bajaste ${Math.abs(weight30).toFixed(1)} kg en 30 días.` }
				if (weight30 > 0.3) return { title: 'Revisa tu plan de pérdida', body: `Subiste ${weight30.toFixed(1)} kg en 30 días.` }
			}
			if (goal === 'ganar_musculo') {
				if (weight30 >= 0.3) return { title: 'Progreso para ganar músculo', body: `Subiste ${weight30.toFixed(1)} kg en 30 días.` }
				if (weight30 < -0.2) return { title: 'Peso bajando', body: `Bajaste ${Math.abs(weight30).toFixed(1)} kg en 30 días; refuerza ingesta y entrenos.` }
			}
			if (goal === 'mantener') {
				if (Math.abs(weight30) <= 0.3) return { title: 'Peso estable', body: 'Te mantuviste estable en 30 días.' }
				return { title: 'Variación en mantenimiento', body: `Cambio de ${weight30 > 0 ? '+' : ''}${weight30.toFixed(1)} kg en 30 días; ajusta si no era intencional.` }
			}
		}

		if (sessionsWeek === 0) {
			return { title: 'Sin entrenamientos esta semana', body: 'Agenda una sesión para retomar el ritmo.' }
		}

		return null
	}, [computed.weightChangeMonth, computed.sessions.thisWeek, userProfile?.objetivo])

	const toggleExpanded = () => {
		const next = !isExpanded
		setIsExpanded(next)
		if (storageKey) {
			localStorage.setItem(storageKey, next ? 'expanded' : 'collapsed')
		}
	}

	const renderCollapsedBar = () => (
		<div className="progress-summary__collapsed">
			<div className="collapsed-main">
				<p className="collapsed-title">Peso actual</p>
				<div className="collapsed-value">
					<span className="collapsed-weight">
						{computed.latestWeight ? `${computed.latestWeight.peso} kg` : 'Sin dato'}
					</span>
					{computed.weightChangeWeek !== null && (
						<span
							className={`collapsed-delta ${
								computed.weightChangeWeek > 0
									? 'delta-up'
									: computed.weightChangeWeek < 0
									? 'delta-down'
									: 'delta-neutral'
							}`}
						>
							{computed.weightChangeWeek > 0 ? <FaArrowUp /> : computed.weightChangeWeek < 0 ? <FaArrowDown /> : <FaMinus />}
							{computed.weightChangeWeek > 0 ? '+' : ''}
							{computed.weightChangeWeek.toFixed(1)} kg vs 7d
						</span>
					)}
				</div>
			</div>
		</div>
	)

	const renderEmptyState = () => (
		<div className="progress-summary__empty">
			<div className="empty-icon">
				<FaExclamationCircle />
			</div>
			<div className="empty-text">
				<h3>Sin datos todavía</h3>
				<p>Registra tu primer peso para generar el resumen automáticamente.</p>
			</div>
			<Link to="/progreso/registrar" className="summary-cta">
				Registrar peso
			</Link>
		</div>
	)

	const renderBody = () => {
		if (loading) {
			return (
				<div className="progress-summary__skeleton">
					<div className="skeleton-line" />
					<div className="skeleton-grid">
						<div className="skeleton-card" />
						<div className="skeleton-card" />
						<div className="skeleton-card" />
					</div>
				</div>
			)
		}

		if (!computed.hasAnyData) {
			return renderEmptyState()
		}

		return (
			<div className="progress-summary__content">
				<div className="summary-grid slim">
					<div className="summary-main">
						<MetricCard
							title="Peso actual"
							value={computed.latestWeight ? `${computed.latestWeight.peso} kg` : null}
							helper={
								computed.latestWeight
									? `Última medición: ${new Date(
											computed.latestWeight.fecha
									  ).toLocaleDateString('es-ES')}`
									: 'Registra tu peso para iniciar'
							}
							state="neutral"
						>
							{computed.weightChangeMonth !== null && (
								<div
									className={`chip chip-main ${
										computed.weightChangeMonth > 0
											? 'chip-up'
											: computed.weightChangeMonth < 0
											? 'chip-down'
											: 'chip-neutral'
									}`}
									title="Variación en 30 días"
								>
									30d: {computed.weightChangeMonth > 0 ? '+' : ''}
									{computed.weightChangeMonth.toFixed(1)} kg
								</div>
							)}
							{computed.weightChangeWeek !== null && (
								<div
									className={`chip chip-secondary ${
										computed.weightChangeWeek > 0
											? 'chip-up'
											: computed.weightChangeWeek < 0
											? 'chip-down'
											: 'chip-neutral'
									}`}
								>
									7d: {computed.weightChangeWeek > 0 ? '+' : ''}
									{computed.weightChangeWeek.toFixed(1)} kg
								</div>
							)}
							<div
								className={`goal-inline ${
									computed.goal.status === 'success'
										? 'goal-success'
										: computed.goal.status === 'warning'
										? 'goal-warning'
										: 'goal-neutral'
								}`}
							>
								<FaBullseye />
								<span>
									{computed.goal.label}
									{computed.goal.status === 'success'
										? ' — en buen camino'
										: computed.goal.status === 'warning'
										? ' — revisar'
										: ''}
								</span>
							</div>
						</MetricCard>
					</div>

					<div className="summary-secondary">
						<MetricCard
							title="Actividad semanal"
							value={`${computed.sessions.thisWeek} entrenamientos`}
							helper={
								computed.sessions.thisWeek === 0
									? 'Aún no registraste entrenamientos esta semana'
									: 'Contamos solo sesiones completadas'
							}
							state={
								computed.sessions.thisWeek === 0
									? 'muted warning-soft'
									: 'neutral'
							}
						>
							{computed.sessions.thisWeek === 0 && (
								<Link to="/progreso/rutina-hoy" className="summary-cta ghost warning">
									Rutina de hoy
								</Link>
							)}
						</MetricCard>

						{interpretedInsight && (
							<div className="summary-insights single">
								<div className="summary-insights__header">
									<FaRegCalendarCheck />
									<span>{interpretedInsight.title}</span>
								</div>
								<p className="insight-body">{interpretedInsight.body}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div
			className={`progress-summary ${isExpanded ? 'expanded' : 'collapsed'} ${
				isVisible ? 'visible' : 'hidden'
			}`}
		>
			<div className="progress-summary__header">
				<div>
					<p className="eyebrow">Resumen de progreso</p>
					<h2>Tu avance real</h2>
					<p className="timestamp">
						{lastUpdated
							? `Actualizado ${new Date(lastUpdated).toLocaleString('es-ES', {
									dateStyle: 'medium',
									timeStyle: 'short'
							  })}`
							: 'Sin actualizaciones todavía'}
					</p>
				</div>
				<button
					type="button"
					onClick={toggleExpanded}
					className="toggle-button toggle-eye"
					aria-expanded={isExpanded}
					aria-label={isExpanded ? 'Ocultar resumen' : 'Mostrar resumen'}
					title={isExpanded ? 'Ocultar resumen' : 'Mostrar resumen'}
				>
					{isExpanded ? <FaEyeSlash /> : <FaEye />}
				</button>
			</div>

			{renderCollapsedBar()}

			<div className="progress-summary__panel">{error ? renderEmptyState() : renderBody()}</div>
		</div>
	)
}

ProgressDashboard.propTypes = {
	isVisible: PropTypes.bool
}

export default ProgressDashboard
