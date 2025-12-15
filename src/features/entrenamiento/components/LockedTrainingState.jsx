import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Lock, CalendarX } from 'lucide-react'
import { Link } from 'react-router-dom'

const LockedTrainingState = ({ title, description, ctaHref }) => {
  return (
    <motion.div
      className="locked-training-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="locked-training-icon">
        <Lock size={32} />
      </div>
      <div className="locked-training-body">
        <h3>{title}</h3>
        <p className="muted-text">{description}</p>
        {ctaHref && (
          <Link to={ctaHref} className="btn-ghost">
            <CalendarX size={16} />
            <span>Ver o editar rutina</span>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

LockedTrainingState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  ctaHref: PropTypes.string
}

export default LockedTrainingState

