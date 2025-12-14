import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import LoadingSpinnerOptimized from '@/features/common/components/LoadingSpinnerOptimized'

/**
 * Formulario de inicio de sesión con recuperación de contraseña
 * @param {Object} props
 * @param {Function} props.onToggleMode - Callback para cambiar a modo registro
 */
const LoginForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { signIn, error } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.key.length === 1) {
      setCapsLock(e.getModifierState('CapsLock'))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback('');
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setFeedback(error);
    }
    
    setIsLoading(false);
  };

  return (
    <motion.div
      className="auth-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-header">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido de vuelta a Get Big</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content" autoComplete="on">
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <div className="input-with-icon">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {capsLock && (
            <small className="caps-indicator">Mayúsculas activadas</small>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {feedback && !error && (
          <div className="error-message">
            {feedback}
          </div>
        )}

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinnerOptimized 
              message={null}
              ariaLabel="Iniciando sesión..."
              size="small"
              variant="simple"
              className="loading-button"
            />
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={onToggleMode}
          >
            Regístrate aquí
          </button>
        </p>
        <p>
          ¿Olvidaste tu contraseña?{' '}
          <ResetPasswordInline email={formData.email} />
        </p>
      </div>
    </motion.div>
  )
}

LoginForm.propTypes = {
	onToggleMode: PropTypes.func.isRequired
}

export default LoginForm

/**
 * Componente inline para recuperación de contraseña
 * @param {Object} props
 * @param {string} props.email - Email del usuario
 */
function ResetPasswordInline ({ email }) {
  const { requestPasswordReset, requestMagicLink } = useAuth()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const normalized = useMemo(() => (email || '').trim().toLowerCase(), [email])

  const handleReset = async () => {
    if (!normalized) return
    setBusy(true)
    const { error } = await requestPasswordReset(normalized)
    setBusy(false)
    if (!error) setSent(true)
  }

  if (sent) return <span>Te enviamos un email para recuperar tu contraseña</span>

  return (
    <button
      type="button"
      className="auth-link"
      onClick={handleReset}
      disabled={busy || !normalized}
    >
      {busy ? 'Enviando…' : 'Recuperarla ahora'}
    </button>
  )
}

ResetPasswordInline.propTypes = {
	email: PropTypes.string
}