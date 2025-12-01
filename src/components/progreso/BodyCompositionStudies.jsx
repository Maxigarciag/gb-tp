import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { FaFlask, FaPercentage, FaUtensils, FaCalendar, FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa'

import { bodyCompositionStudies } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import MacroDistributionChart from './MacroDistributionChart'
import StudyComparison from './StudyComparison'
import StudyExportButton from './StudyExportButton'

import '../../styles/BodyCompositionStudies.css'

const BodyCompositionStudies = ({ 
  compact = false, 
  showLatest = true, 
  showHistory = true,
  maxHistoryItems = 5,
  showNewStudyButton = false,
  onNewStudyClick = null
}) => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  useEffect(() => {
    loadStudies()
  }, [userProfile?.id])

  const loadStudies = async () => {
    setLoading(true)
    const { data, error } = await bodyCompositionStudies.getUserStudies()
    if (!error && data) {
      setStudies(data)
    }
    setLoading(false)
  }

  const latestStudy = useMemo(() => studies[0] || null, [studies])
  const previousStudy = useMemo(() => studies[1] || null, [studies])
  const historyStudies = useMemo(() => studies.slice(1), [studies])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return null
  }

  if (studies.length === 0) {
    return (
      <div className="studies-empty">
        <FaFlask className="empty-icon" />
        <h3>No hay estudios registrados</h3>
        <p>Realiza tu primer estudio de composición corporal para comenzar a trackear tu progreso.</p>
        <button 
          className="btn-primary"
          onClick={() => {
            if (onNewStudyClick) {
              onNewStudyClick()
            } else {
              navigate('/progreso/composicion')
            }
          }}
        >
          Crear Primer Estudio
        </button>
      </div>
    )
  }

  return (
    <div className={`body-composition-studies ${compact ? 'compact' : ''}`}>
      {/* Último estudio destacado */}
      {showLatest && latestStudy && (
        <div id="latest-study-card" className="latest-study-card">
          <div className="study-header">
            <div className="study-header-left">
              <FaFlask className="study-icon" />
              <div>
                <h3>Último Estudio</h3>
                <span className="study-date">{formatDate(latestStudy.fecha)}</span>
              </div>
            </div>
            <StudyExportButton 
              studyData={latestStudy} 
              elementId="latest-study-card"
              className="study-export-btn-wrapper"
            />
          </div>
          
          <div className="study-content">
            {latestStudy.bodyfat && (
              <div className="study-section bodyfat-section">
                <h4>
                  <FaPercentage /> Grasa Corporal
                </h4>
                <div className="study-metrics">
                  <div className="metric-main">
                    <span className="metric-value-large" style={{ color: latestStudy.bodyfat.color }}>
                      {latestStudy.bodyfat.percentage.toFixed(1)}%
                    </span>
                    <span className="metric-badge" style={{ backgroundColor: latestStudy.bodyfat.color }}>
                      {latestStudy.bodyfat.category}
                    </span>
                  </div>
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">Masa Grasa</span>
                      <span className="metric-value">{latestStudy.bodyfat.fatMass.toFixed(1)} kg</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Masa Magra</span>
                      <span className="metric-value">{latestStudy.bodyfat.leanMass.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {latestStudy.macros && (
              <div className="study-section macros-section">
                <h4>
                  <FaUtensils /> Macronutrientes
                </h4>
                <div className="macros-summary">
                  <div className="macro-summary-item">
                    <span className="macro-summary-label">TMB</span>
                    <span className="macro-summary-value">{latestStudy.macros.bmr} kcal</span>
                  </div>
                  <div className="macro-summary-item">
                    <span className="macro-summary-label">TDEE</span>
                    <span className="macro-summary-value">{latestStudy.macros.tdee} kcal</span>
                  </div>
                  <div className="macro-summary-item">
                    <span className="macro-summary-label">Objetivo</span>
                    <span className="macro-summary-value highlight">{latestStudy.macros.targetCalories} kcal</span>
                  </div>
                </div>
                <MacroDistributionChart macros={latestStudy.macros} />
                <div className="macros-breakdown">
                  <div className="macro-item">
                    <span className="macro-label">Proteínas</span>
                    <span className="macro-value">{latestStudy.macros.protein}g</span>
                  </div>
                  <div className="macro-item">
                    <span className="macro-label">Carbohidratos</span>
                    <span className="macro-value">{latestStudy.macros.carbs}g</span>
                  </div>
                  <div className="macro-item">
                    <span className="macro-label">Grasas</span>
                    <span className="macro-value">{latestStudy.macros.fats}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comparación con estudio anterior - Siempre visible si hay un estudio anterior */}
          {previousStudy && latestStudy && (
            <div className="study-comparison-wrapper">
              <StudyComparison latestStudy={latestStudy} previousStudy={previousStudy} />
            </div>
          )}
        </div>
      )}

      {/* Historial de estudios */}
      {showHistory && studies.length > 1 && (
        <div className="studies-history">
          <button
            className="history-header"
            onClick={() => setHistoryExpanded(!historyExpanded)}
          >
            <div className="history-header-left">
              <FaHistory />
              <h3>Historial de Estudios</h3>
              <span className="history-count">({studies.length - 1} estudios anteriores)</span>
            </div>
            {historyExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          
          {historyExpanded && (
            <div className="studies-list">
              {historyStudies.length > 0 ? (
                historyStudies.map((study, index) => (
                  <div key={index} className="study-item">
                    <div className="study-item-header">
                      <FaCalendar />
                      <span>{formatDate(study.fecha)}</span>
                    </div>
                    <div className="study-item-content">
                      {study.bodyfat && (
                        <span className="study-badge">
                          <FaPercentage /> {study.bodyfat.percentage.toFixed(1)}%
                        </span>
                      )}
                      {study.macros && (
                        <span className="study-badge">
                          <FaUtensils /> {study.macros.targetCalories} kcal
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="history-empty">
                  <span>No hay estudios anteriores</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showNewStudyButton && (
        <button 
          className="btn-new-study"
          onClick={() => {
            if (onNewStudyClick) {
              onNewStudyClick()
            } else {
              navigate('/progreso/composicion')
            }
          }}
        >
          <FaFlask /> Nuevo Estudio
        </button>
      )}
    </div>
  )
}

BodyCompositionStudies.propTypes = {
  compact: PropTypes.bool,
  showLatest: PropTypes.bool,
  showHistory: PropTypes.bool,
  maxHistoryItems: PropTypes.number,
  showNewStudyButton: PropTypes.bool,
  onNewStudyClick: PropTypes.func
}

export default BodyCompositionStudies

