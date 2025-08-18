import React from 'react'
import { Zap } from 'lucide-react'

function LandingHero ({ onOpenAuth }) {
  return (
    <section className="landing-hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-icon"><Zap size={28} /></div>
          <h1>
            ¡Comienza tu <span className="gradient-text">transformación</span>!
          </h1>
          <p>
            Crea tu cuenta gratis y obtené una rutina personalizada
            de entrenamiento diseñada para vos.
          </p>
          <div className="hero-ctas">
            <button className="hero-btn hero-btn-primary" onClick={() => onOpenAuth('login')}>
              Iniciar sesión
            </button>
            <button className="hero-btn hero-btn-secondary" onClick={() => onOpenAuth('register')}>
              Crear cuenta
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="wave-bg" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHero


