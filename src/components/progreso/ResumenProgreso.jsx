import React from 'react';
import { FaWeight, FaArrowUp, FaArrowDown, FaDumbbell, FaPercentage } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../../styles/ResumenProgreso.css';

function getDeltaIcon(delta) {
  if (delta > 0) return <FaArrowUp className="delta-icon delta-up" title="Aumento" />;
  if (delta < 0) return <FaArrowDown className="delta-icon delta-down" title="Disminución" />;
  return null;
}

function formatDelta(value) {
  if (value === null || value === undefined) return '';
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
}

const ResumenProgreso = ({ ultimo, semanal, mensual }) => {
  return (
    <section className="resumen-progreso-container" aria-label="Resumen visual de progreso">
      <motion.div
        className="resumen-card resumen-peso"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        title="Último peso registrado"
        role="region"
        aria-label={`Último peso registrado: ${ultimo?.peso ? ultimo.peso + ' kg' : 'sin datos'}`}
        tabIndex={0}
      >
        <FaWeight className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">Peso</div>
        <motion.div
          className="resumen-valor"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de peso: ${ultimo?.peso ? ultimo.peso + ' kilogramos' : 'sin datos'}`}
        >
          {ultimo?.peso ? `${ultimo.peso} kg` : '--'}
        </motion.div>
        {(semanal?.peso != null || mensual?.peso != null) && (
          <div className="resumen-delta">
            {semanal?.peso != null && (
              <span title="Cambio semanal">{formatDelta(semanal.peso)} kg {getDeltaIcon(semanal.peso)}</span>
            )}
            {mensual?.peso != null && (
              <span title="Cambio mensual">{formatDelta(mensual.peso)} kg {getDeltaIcon(mensual.peso)}</span>
            )}
          </div>
        )}
      </motion.div>
      <motion.div
        className="resumen-card resumen-grasa"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        title="Último % grasa registrado"
        role="region"
        aria-label={`Último porcentaje de grasa: ${ultimo?.grasa !== null && ultimo?.grasa !== undefined ? ultimo.grasa + ' %' : 'sin datos'}`}
        tabIndex={0}
      >
        <FaPercentage className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">% Grasa</div>
        <motion.div
          className="resumen-valor"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de porcentaje de grasa: ${ultimo?.grasa !== null && ultimo?.grasa !== undefined ? ultimo.grasa + ' por ciento' : 'sin datos'}`}
        >
          {ultimo?.grasa !== null && ultimo?.grasa !== undefined ? `${ultimo.grasa} %` : '--'}
        </motion.div>
        {(semanal?.grasa != null || mensual?.grasa != null) && (
          <div className="resumen-delta">
            {semanal?.grasa != null && (
              <span title="Cambio semanal">{formatDelta(semanal.grasa)}% {getDeltaIcon(semanal.grasa)}</span>
            )}
            {mensual?.grasa != null && (
              <span title="Cambio mensual">{formatDelta(mensual.grasa)}% {getDeltaIcon(mensual.grasa)}</span>
            )}
          </div>
        )}
      </motion.div>
      <motion.div
        className="resumen-card resumen-musculo"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        title="Último % músculo registrado"
        role="region"
        aria-label={`Último porcentaje de músculo: ${ultimo?.musculo !== null && ultimo?.musculo !== undefined ? ultimo.musculo + ' %' : 'sin datos'}`}
        tabIndex={0}
      >
        <FaDumbbell className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">% Músculo</div>
        <motion.div
          className="resumen-valor"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de porcentaje de músculo: ${ultimo?.musculo !== null && ultimo?.musculo !== undefined ? ultimo.musculo + ' por ciento' : 'sin datos'}`}
        >
          {ultimo?.musculo !== null && ultimo?.musculo !== undefined ? `${ultimo.musculo} %` : '--'}
        </motion.div>
        {(semanal?.musculo != null || mensual?.musculo != null) && (
          <div className="resumen-delta">
            {semanal?.musculo != null && (
              <span title="Cambio semanal">{formatDelta(semanal.musculo)}% {getDeltaIcon(semanal.musculo)}</span>
            )}
            {mensual?.musculo != null && (
              <span title="Cambio mensual">{formatDelta(mensual.musculo)}% {getDeltaIcon(mensual.musculo)}</span>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ResumenProgreso; 