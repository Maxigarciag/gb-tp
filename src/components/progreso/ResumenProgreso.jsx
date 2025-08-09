import React from 'react';
import { FaWeight, FaArrowUp, FaArrowDown, FaDumbbell, FaPercentage, FaRegCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './ResumenProgreso.css';

function getDeltaIcon(delta) {
  if (delta > 0) return <FaArrowUp style={{ color: '#e65100', marginLeft: 4 }} title="Aumento" />;
  if (delta < 0) return <FaArrowDown style={{ color: '#43a047', marginLeft: 4 }} title="Disminución" />;
  return null;
}

function formatDelta(value) {
  if (value === null || value === undefined) return '';
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
}

const ResumenProgreso = ({ ultimo, semanal, mensual, mejorMarca, ejercicio, metrica }) => {
  return (
    <section className="resumen-progreso-container" aria-label="Resumen visual de progreso">
      <motion.div
        className="resumen-card resumen-peso"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        key={ultimo?.peso}
        title="Último peso registrado"
        role="region"
        aria-label={`Último peso registrado: ${ultimo?.peso ? ultimo.peso + ' kg' : 'sin datos'}`}
        tabIndex={0}
      >
        <FaWeight className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">Peso</div>
        <motion.div
          className="resumen-valor"
          key={ultimo?.peso}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de peso: ${ultimo?.peso ? ultimo.peso + ' kilogramos' : 'sin datos'}`}
        >
          {ultimo?.peso ? `${ultimo.peso} kg` : '--'}
        </motion.div>
        <div className="resumen-delta">
          <span title="Cambio semanal">{formatDelta(semanal?.peso)} kg {getDeltaIcon(semanal?.peso)}</span>
          <span title="Cambio mensual" style={{ marginLeft: 8 }}>{formatDelta(mensual?.peso)} kg {getDeltaIcon(mensual?.peso)}</span>
        </div>
      </motion.div>
      <motion.div
        className="resumen-card resumen-grasa"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        key={ultimo?.grasa}
        title="Último % grasa registrado"
        role="region"
        aria-label={`Último porcentaje de grasa: ${ultimo?.grasa !== null && ultimo?.grasa !== undefined ? ultimo.grasa + ' %' : 'sin datos'}`}
        tabIndex={0}
      >
        <FaPercentage className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">% Grasa</div>
        <motion.div
          className="resumen-valor"
          key={ultimo?.grasa}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de porcentaje de grasa: ${ultimo?.grasa !== null && ultimo?.grasa !== undefined ? ultimo.grasa + ' por ciento' : 'sin datos'}`}
        >
          {ultimo?.grasa !== null && ultimo?.grasa !== undefined ? `${ultimo.grasa} %` : '--'}
        </motion.div>
        <div className="resumen-delta">
          <span title="Cambio semanal">{formatDelta(semanal?.grasa)}% {getDeltaIcon(semanal?.grasa)}</span>
          <span title="Cambio mensual" style={{ marginLeft: 8 }}>{formatDelta(mensual?.grasa)}% {getDeltaIcon(mensual?.grasa)}</span>
        </div>
      </motion.div>
      <motion.div
        className="resumen-card resumen-musculo"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        key={ultimo?.musculo}
        title="Último % músculo registrado"
        role="region"
        aria-label={`Último porcentaje de músculo: ${ultimo?.musculo !== null && ultimo?.musculo !== undefined ? ultimo.musculo + ' %' : 'sin datos'}`}
        tabIndex={0}
      >
        <FaDumbbell className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">% Músculo</div>
        <motion.div
          className="resumen-valor"
          key={ultimo?.musculo}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de porcentaje de músculo: ${ultimo?.musculo !== null && ultimo?.musculo !== undefined ? ultimo.musculo + ' por ciento' : 'sin datos'}`}
        >
          {ultimo?.musculo !== null && ultimo?.musculo !== undefined ? `${ultimo.musculo} %` : '--'}
        </motion.div>
        <div className="resumen-delta">
          <span title="Cambio semanal">{formatDelta(semanal?.musculo)}% {getDeltaIcon(semanal?.musculo)}</span>
          <span title="Cambio mensual" style={{ marginLeft: 8 }}>{formatDelta(mensual?.musculo)}% {getDeltaIcon(mensual?.musculo)}</span>
        </div>
      </motion.div>
      <motion.div
        className="resumen-card resumen-marca"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        key={mejorMarca}
        title={`Mejor marca reciente en ${ejercicio || 'ejercicio'}`}
        role="region"
        aria-label={`Mejor marca reciente en ${ejercicio || 'ejercicio'}: ${mejorMarca !== null && mejorMarca !== undefined ? mejorMarca + (metrica === 'peso' ? ' kg' : ' ' + metrica) : 'sin datos'}`}
        tabIndex={0}
      >
        <FaRegCalendarAlt className="resumen-icon" aria-hidden="true" />
        <div className="resumen-label">Mejor marca</div>
        <motion.div
          className="resumen-valor"
          key={mejorMarca}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={`Valor de mejor marca: ${mejorMarca !== null && mejorMarca !== undefined ? mejorMarca + (metrica === 'peso' ? ' kilogramos' : ' ' + metrica) : 'sin datos'}`}
        >
          {mejorMarca !== null && mejorMarca !== undefined ? `${mejorMarca} ${metrica === 'peso' ? 'kg' : metrica}` : '--'}
        </motion.div>
        <div className="resumen-delta" style={{ opacity: 0.7, fontSize: 13 }}>{ejercicio || 'Ejercicio'}</div>
      </motion.div>
    </section>
  );
};

export default ResumenProgreso; 