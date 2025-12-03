/**
 * Constantes centralizadas de la aplicación
 * Facilita mantenimiento y evita magic numbers/strings
 */

// ===== SERIES Y REPETICIONES =====
export const MIN_SERIES = 1
export const MAX_SERIES = 8
export const DEFAULT_SERIES = 3

// ===== RPE (Rate of Perceived Exertion) =====
export const RPE_MIN = 0
export const RPE_MAX = 10

export const RPE_LEVELS = [
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

// ===== VALIDACIÓN DE MEDICIONES CORPORALES =====
export const VALIDATION_RANGES = {
	height: { min: 100, max: 250, unit: 'cm' },
	weight: { min: 30, max: 300, unit: 'kg' },
	neck: { min: 20, max: 80, unit: 'cm' },
	waist: { min: 50, max: 200, unit: 'cm' },
	hip: { min: 60, max: 200, unit: 'cm' },
	age: { min: 13, max: 100, unit: 'años' }
}

// ===== CATEGORÍAS DE GRASA CORPORAL =====
export const BODY_FAT_CATEGORIES = {
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

// ===== DÍAS DE LA SEMANA =====
export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const DIAS_ABREVIADOS = {
	'Lunes': 'L',
	'Martes': 'M',
	'Miércoles': 'M',
	'Jueves': 'J',
	'Viernes': 'V',
	'Sábado': 'S',
	'Domingo': 'D'
}

// ===== ESTADOS DE TRACKING =====
export const TRACKING_STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	ACTIVE: 'active',
	PAUSED: 'paused',
	COMPLETED: 'completed',
	ERROR: 'error'
}

export const EXERCISE_STATES = {
	PENDING: 'pending',
	IN_PROGRESS: 'in_progress',
	COMPLETED: 'completed',
	SKIPPED: 'skipped'
}

// ===== TABS Y NAVEGACIÓN =====
export const VALID_PROGRESS_TABS = ['progreso', 'rutina', 'composicion']
export const INTERNAL_TABS = ['evolucion', 'logros', 'graficos', 'peso', 'grasa', 'musculo']

// ===== TIEMPOS Y DELAYS =====
export const DEBOUNCE_DELAY = 300
export const PROFILE_UPDATE_DELAY = 1000
export const SESSION_CHECK_INTERVAL = 60000 // 1 minuto

// ===== LÍMITES Y MÁXIMOS =====
export const MAX_NOTIFICATIONS = 5
export const MAX_EXERCISES_PER_DAY = 12
export const MAX_ROUTINES = 10
export const CACHE_STALE_TIME = 5 * 60 * 1000 // 5 minutos

// ===== PATRONES DE VALIDACIÓN =====
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PASSWORD_MIN_LENGTH = 6

// ===== ROLES Y PERMISOS =====
export const USER_ROLES = {
	USER: 'user',
	ADMIN: 'admin'
}

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
	DELETE_USER: '/api/delete-user'
}

// ===== MENSAJES DE ERROR COMUNES =====
export const ERROR_MESSAGES = {
	NETWORK: 'Error de conexión. Verifica tu internet.',
	AUTH_REQUIRED: 'Debes iniciar sesión para continuar.',
	PROFILE_REQUIRED: 'Debes completar tu perfil primero.',
	ROUTINE_REQUIRED: 'Debes tener una rutina activa.',
	GENERIC: 'Ocurrió un error. Intenta de nuevo.',
	VALIDATION: 'Por favor, corrige los errores en el formulario.',
	DELETE_ACCOUNT: 'Error al eliminar la cuenta. Intenta de nuevo.'
}

// ===== MENSAJES DE ÉXITO COMUNES =====
export const SUCCESS_MESSAGES = {
	PROFILE_SAVED: 'Perfil guardado exitosamente',
	ROUTINE_CREATED: 'Rutina creada exitosamente',
	SESSION_COMPLETED: 'Sesión completada exitosamente',
	EXERCISE_SAVED: 'Ejercicio guardado exitosamente',
	ACCOUNT_DELETED: 'Cuenta eliminada exitosamente'
}

// ===== CONFIGURACIÓN DE ANIMACIONES =====
export const ANIMATION_DURATION = {
	FAST: 0.2,
	NORMAL: 0.3,
	SLOW: 0.5
}

export const EASING = {
	SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
	BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	EASE_OUT: 'ease-out'
}

// ===== BREAKPOINTS RESPONSIVE =====
export const BREAKPOINTS = {
	MOBILE: 480,
	TABLET: 768,
	DESKTOP: 1024,
	WIDE: 1440
}

// ===== Z-INDEX LAYERS =====
export const Z_INDEX = {
	BASE: 1,
	DROPDOWN: 10,
	MODAL: 100,
	TOOLTIP: 1100
}

