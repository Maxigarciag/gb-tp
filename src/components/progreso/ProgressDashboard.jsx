import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { 
	FaChartLine, 
	FaWeight, 
	FaDumbbell, 
	FaFire, 
	FaArrowUp, 
	FaArrowDown,
	FaMinus,
	FaCalendarAlt,
	FaTrophy,
	FaBullseye,
	FaExclamationTriangle,
	FaCheckCircle,
	FaClock
} from 'react-icons/fa'
import { userProgress, exerciseLogs, workoutSessions } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/ProgressDashboard.css'

const ProgressDashboard = ({ isVisible = true }) => {
	const { userProfile } = useAuth()
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState({
		weightData: [],
		exerciseData: [],
		sessions: []
	})

	// Función para cargar datos
	const fetchDashboardData = async (forceRefresh = false) => {
		if (!userProfile?.id) return
		
		// Solo mostrar loading si no hay datos previos o es un refresh forzado
		if (!data.weightData.length && !data.exerciseData.length && !data.sessions.length || forceRefresh) {
			setLoading(true)
		}
		
		try {
			const [weightResult, exerciseResult, sessionsResult] = await Promise.all([
				userProgress.getByUser(userProfile.id, 30),
				exerciseLogs.getByUser(userProfile.id, 100),
				workoutSessions.getUserSessions(30)
			])

			setData({
				weightData: weightResult.data || [],
				exerciseData: exerciseResult.data || [],
				sessions: (sessionsResult.data || []).filter(s => s.user_id === userProfile.id)
				})
			} catch (error) {
				console.error('Error loading dashboard data:', error)
			} finally {
				setLoading(false)
			}
	}

	// Cargar datos iniciales
	useEffect(() => {
		fetchDashboardData()
	}, [userProfile?.id])

	// Escuchar eventos de refresh desde la página de progreso
	useEffect(() => {
		const handleProgresoRefresh = (event) => {
			if (event.detail?.userId === userProfile?.id) {
				fetchDashboardData(true)
			}
		}

		window.addEventListener('progreso-page-refresh', handleProgresoRefresh)
		
		return () => {
			window.removeEventListener('progreso-page-refresh', handleProgresoRefresh)
		}
	}, [userProfile?.id])

	// Calcular métricas y estadísticas
	const metrics = useMemo(() => {
		if (loading || !data.weightData.length) return null

		const now = new Date()
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
		const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
		const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

		// Datos de peso
		const latestWeight = data.weightData[0]
		const weekAgoWeight = data.weightData.find(w => new Date(w.fecha) <= oneWeekAgo)
		const monthAgoWeight = data.weightData.find(w => new Date(w.fecha) <= oneMonthAgo)

		// Sesiones de esta semana
		const thisWeekSessions = data.sessions.filter(s => 
			new Date(s.fecha) >= oneWeekAgo && s.completada
		)

		// Sesiones de la semana anterior
		const lastWeekSessions = data.sessions.filter(s => {
			const sessionDate = new Date(s.fecha)
			return sessionDate >= twoWeeksAgo && sessionDate < oneWeekAgo && s.completada
		})

		// Ejercicios únicos esta semana
		const thisWeekExercises = new Set(
			thisWeekSessions.flatMap(s => 
				s.exercise_logs?.map(log => log.exercises?.nombre).filter(Boolean) || []
			)
		)

		// Calcular tendencias
		const weightTrend = latestWeight && weekAgoWeight ? 
			latestWeight.peso - weekAgoWeight.peso : 0

		const fatTrend = latestWeight && weekAgoWeight ? 
			latestWeight.grasa - weekAgoWeight.grasa : 0

		const muscleTrend = latestWeight && weekAgoWeight ? 
			latestWeight.musculo - weekAgoWeight.musculo : 0

		// Calcular insights automáticos
		const insights = []
		
		if (thisWeekSessions.length >= 4) {
			insights.push({
				type: 'success',
				icon: <FaTrophy />,
				title: '¡Excelente consistencia!',
				message: `Has completado ${thisWeekSessions.length} sesiones esta semana`
			})
		} else if (thisWeekSessions.length === 0) {
			insights.push({
				type: 'warning',
				icon: <FaExclamationTriangle />,
				title: 'Sin entrenamientos esta semana',
				message: 'Es hora de retomar tu rutina de ejercicios'
			})
		}

		if (weightTrend < -0.5) {
			insights.push({
				type: 'success',
				icon: <FaArrowDown />,
				title: '¡Baja de peso!',
				message: `Has perdido ${Math.abs(weightTrend).toFixed(1)}kg esta semana`
			})
		} else if (weightTrend > 0.5) {
			insights.push({
				type: 'info',
				icon: <FaArrowUp />,
				title: 'Aumento de peso',
				message: `Has ganado ${weightTrend.toFixed(1)}kg esta semana`
			})
		}

		if (muscleTrend > 0.5) {
			insights.push({
				type: 'success',
				icon: <FaDumbbell />,
				title: 'Ganancia muscular',
				message: `Has ganado ${muscleTrend.toFixed(1)}% de músculo`
			})
		}

		// Comparar con semana anterior
		const sessionImprovement = thisWeekSessions.length - lastWeekSessions.length

		return {
			latest: {
				weight: latestWeight?.peso || null,
				fat: latestWeight?.grasa || null,
				muscle: latestWeight?.musculo || null,
				date: latestWeight?.fecha || null
			},
			trends: {
				weight: weightTrend,
				fat: fatTrend,
				muscle: muscleTrend
			},
			activity: {
				thisWeekSessions: thisWeekSessions.length,
				lastWeekSessions: lastWeekSessions.length,
				improvement: sessionImprovement,
				uniqueExercises: thisWeekExercises.size
			},
			insights
		}
	}, [data, loading])

	// Si está cargando, mostrar contenido básico sin mensaje confuso
	if (!metrics && loading) {
		return (
			<div className="progress-dashboard">
				<div className="dashboard-header">
					<div className="dashboard-title">
						<FaChartLine className="title-icon" />
						<h2>Resumen de Progreso</h2>
					</div>
					<div className="dashboard-subtitle">
						Preparando tu análisis...
					</div>
				</div>
				<div className="dashboard-grid">
					<div className="metrics-grid">
						<div className="metric-card placeholder">
							<div className="metric-header">
								<FaWeight className="metric-icon" />
								<span className="metric-title">Peso</span>
							</div>
							<div className="metric-value">--</div>
						</div>
						<div className="metric-card placeholder">
							<div className="metric-header">
								<FaChartLine className="metric-icon" />
								<span className="metric-title">% Grasa</span>
							</div>
							<div className="metric-value">--</div>
						</div>
						<div className="metric-card placeholder">
							<div className="metric-header">
								<FaDumbbell className="metric-icon" />
								<span className="metric-title">% Músculo</span>
							</div>
							<div className="metric-value">--</div>
						</div>
						<div className="metric-card placeholder activity">
							<div className="metric-header">
								<FaFire className="metric-icon" />
								<span className="metric-title">Sesiones esta semana</span>
							</div>
							<div className="metric-value">--</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Si no hay métricas pero tampoco está cargando, mostrar contenido vacío
	if (!metrics) {
		return (
			<div className="progress-dashboard">
				<div className="dashboard-empty">
					<FaChartLine className="empty-icon" />
					<h3>¡Comienza tu seguimiento!</h3>
					<p>Registra tu primera medición para ver tu progreso aquí</p>
				</div>
			</div>
		)
	}

	const getTrendIcon = (trend) => {
		if (trend > 0.1) return <FaArrowUp className="trend-up" />
		if (trend < -0.1) return <FaArrowDown className="trend-down" />
		return <FaMinus className="trend-neutral" />
	}

	const getTrendColor = (trend) => {
		if (trend > 0.1) return 'trend-up'
		if (trend < -0.1) return 'trend-down'
		return 'trend-neutral'
	}

	return (
		<div className={`progress-dashboard ${isVisible ? 'visible' : 'hidden'}`}>
			<div className="dashboard-header">
				<div className="dashboard-title">
					<FaChartLine className="title-icon" />
					<h2>Resumen de Progreso</h2>
				</div>
				<div className="dashboard-subtitle">
					Última actualización: {metrics.latest.date ? 
						new Date(metrics.latest.date).toLocaleDateString('es-ES') : 
						'No disponible'
					}
				</div>
			</div>

			<div className="dashboard-grid">
				{/* Métricas principales */}
				<div className="metrics-grid">
					{metrics.latest.weight && (
						<div className="metric-card">
							<div className="metric-header">
								<FaWeight className="metric-icon" />
								<span className="metric-title">Peso</span>
								{getTrendIcon(metrics.trends.weight)}
							</div>
							<div className="metric-value">
								{metrics.latest.weight} kg
							</div>
							<div className={`metric-trend ${getTrendColor(metrics.trends.weight)}`}>
								{metrics.trends.weight > 0 ? '+' : ''}{metrics.trends.weight.toFixed(1)} kg
							</div>
						</div>
					)}

					{metrics.latest.fat && (
						<div className="metric-card">
							<div className="metric-header">
								<FaChartLine className="metric-icon" />
								<span className="metric-title">% Grasa</span>
								{getTrendIcon(metrics.trends.fat)}
							</div>
							<div className="metric-value">
								{metrics.latest.fat}%
							</div>
							<div className={`metric-trend ${getTrendColor(metrics.trends.fat)}`}>
								{metrics.trends.fat > 0 ? '+' : ''}{metrics.trends.fat.toFixed(1)}%
							</div>
						</div>
					)}

					{metrics.latest.muscle && (
						<div className="metric-card">
							<div className="metric-header">
								<FaDumbbell className="metric-icon" />
								<span className="metric-title">% Músculo</span>
								{getTrendIcon(metrics.trends.muscle)}
							</div>
							<div className="metric-value">
								{metrics.latest.muscle}%
							</div>
							<div className={`metric-trend ${getTrendColor(metrics.trends.muscle)}`}>
								{metrics.trends.muscle > 0 ? '+' : ''}{metrics.trends.muscle.toFixed(1)}%
							</div>
						</div>
					)}

					<div className="metric-card activity">
						<div className="metric-header">
							<FaFire className="metric-icon" />
							<span className="metric-title">Sesiones esta semana</span>
							{metrics.activity.improvement > 0 ? 
								<FaArrowUp className="trend-up" /> : 
								metrics.activity.improvement < 0 ? 
								<FaArrowDown className="trend-down" /> :
								<FaMinus className="trend-neutral" />
							}
						</div>
						<div className="metric-value">
							{metrics.activity.thisWeekSessions}
						</div>
						<div className="metric-trend">
							{metrics.activity.improvement > 0 ? '+' : ''}{metrics.activity.improvement} vs semana anterior
						</div>
					</div>
				</div>

				{/* Insights automáticos */}
				{metrics.insights.length > 0 && (
					<div className="insights-section">
						<h3 className="insights-title">
							<FaBullseye className="insights-icon" />
							Insights Automáticos
						</h3>
						<div className="insights-grid">
							{metrics.insights.map((insight, index) => (
								<div key={index} className={`insight-card ${insight.type}`}>
									<div className="insight-icon">{insight.icon}</div>
									<div className="insight-content">
										<div className="insight-title">{insight.title}</div>
										<div className="insight-message">{insight.message}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

ProgressDashboard.propTypes = {
	isVisible: PropTypes.bool
}

export default ProgressDashboard
