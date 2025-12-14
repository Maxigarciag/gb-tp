import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeartbeat } from 'react-icons/fa'
import AuthOnly from '@/features/layout/components/AuthOnly'
import '@/styles/components/nutricion/NutricionPage.css'

const NutricionPage = () => {
  const navigate = useNavigate()

  const actionCards = useMemo(() => ([
    {
      id: 'macros',
      title: 'Calculadora de Macronutrientes',
      description: 'Obtén tu distribución óptima de calorías y macros a partir de tus datos actuales.',
      cta: 'Abrir calculadora',
      to: '/nutricion/macros',
      badge: 'Optimizada'
    },
    {
      id: 'food-calculator',
      title: 'Calculadora por Alimento',
      description: 'Calcula macros y calorías para un alimento concreto según la porción.',
      cta: 'Abrir calculadora',
      to: '/nutricion/calculadora-alimento',
      badge: 'Nuevo'
    },
    {
      id: 'registro',
      title: 'Registro de Comidas',
      description: 'Prepara tu diario alimenticio y seguimiento de hábitos. Integración lista para los archivos próximos.',
      cta: 'Ir al registro',
      to: '/nutricion/registro-comidas',
      badge: 'Preparado'
    }
  ]), [])

  return (
    <AuthOnly>
      <div className="nutricion-page">
        <div className="nutricion-hero">
          <div className="nutricion-hero-content">
            <p className="nutricion-eyebrow">Nueva sección</p>
            <h1>Nutrición</h1>
            <p className="nutricion-hero-text">
              Gestiona tus macros y prepara el registro diario de tus comidas.
            </p>
          </div>
          <div className="nutricion-hero-badge">
            <FaHeartbeat aria-hidden="true" />
            <span>Integrado con tu perfil de progreso</span>
          </div>
        </div>

        <div className="nutricion-grid">
          {actionCards.map(card => (
            <div className="nutricion-card" key={card.id}>
              <h3 className="nutricion-card-title">{card.title}</h3>
              <p className="nutricion-card-text">{card.description}</p>
              <button
                type="button"
                className="nutricion-btn primary"
                onClick={() => navigate(card.to)}
                aria-label={card.title}
              >
                {card.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AuthOnly>
  )
}

export default NutricionPage

