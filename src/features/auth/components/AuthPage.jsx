import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import '@/styles/components/auth/Auth.css'

/**
 * Componente de página de autenticación que alterna entre login y registro
 * @param {Object} props
 * @param {'login'|'register'} props.initialMode - Modo inicial del formulario
 */
const AuthPage = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-logo">
            <img
              src={"/src/assets/images/GB-LOGONEGRO.png"}
              alt="Get Big logo"
              className="auth-logo"
            />
            <h1 className="brand-title">Get Big</h1>
          </div>
          <p className="brand-subtitle">
            Tu guía personalizada para el gimnasio
          </p>
        </div>

        <div className="auth-forms">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginForm key="login" onToggleMode={toggleMode} />
            ) : (
              <RegisterForm key="register" onToggleMode={toggleMode} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

AuthPage.propTypes = {
	initialMode: PropTypes.oneOf(['login', 'register'])
}

export default AuthPage