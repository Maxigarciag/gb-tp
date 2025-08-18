import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../../styles/Auth.css';

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
              src="/src/assets/logo-azul-osc.png"
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
  );
};

export default AuthPage;