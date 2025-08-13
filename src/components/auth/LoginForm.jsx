import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import LoadingSpinnerOptimized from '../LoadingSpinnerOptimized';
import '../../styles/Auth.css';

const LoginForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      console.error('Login error:', error);
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

      <form onSubmit={handleSubmit} className="auth-form-content">
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
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
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
      </div>
    </motion.div>
  );
};

export default LoginForm;