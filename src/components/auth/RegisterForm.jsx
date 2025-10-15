import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import LoadingSpinnerOptimized from '../LoadingSpinnerOptimized'

/**
 * Formulario de registro de nuevos usuarios
 * @param {Object} props
 * @param {Function} props.onToggleMode - Callback para cambiar a modo login
 */
const RegisterForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { signUp, error } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    
    await signUp(formData.email, formData.password)
    
    setIsLoading(false)
  };

  return (
    <motion.div
      className="auth-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-header">
        <h2>Crear Cuenta</h2>
        <p>Únete a Get Big y comienza tu transformación</p>
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
              required
              placeholder="••••••••"
              minLength={6}
              autoComplete="new-password"
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
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <div className="input-with-icon">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="new-password"
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
        </div>

        {(error || localError) && (
          <div className="error-message">
            {localError || error}
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
              ariaLabel="Creando cuenta..."
              size="small"
              variant="simple"
              className="loading-button"
            />
          ) : (
            'Crear Cuenta'
          )}
        </button>
        <button
          type="button"
          className="auth-link"
          onClick={() => setShowPassword(v => !v)}
        >
          {showPassword ? 'Ocultar' : 'Mostrar'} contraseñas
        </button>
      </form>

      <div className="auth-footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={onToggleMode}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </motion.div>
  )
}

RegisterForm.propTypes = {
	onToggleMode: PropTypes.func.isRequired
}

export default RegisterForm