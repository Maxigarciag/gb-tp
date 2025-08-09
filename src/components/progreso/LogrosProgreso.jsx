import React from 'react';
import { FaMedal, FaFire, FaTrophy, FaCalendarCheck, FaSmile } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './LogrosProgreso.css';

// Utilidades para calcular logros
function calcularRachaDias(weightData) {
  if (!weightData || weightData.length === 0) return 0;
  let racha = 1;
  for (let i = 1; i < weightData.length; i++) {
    const prev = new Date(weightData[i - 1].fecha);
    const curr = new Date(weightData[i].fecha);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) racha++;
    else break;
  }
  return racha;
}

function calcularSesionesCompletadas(sesiones) {
  if (!sesiones) return 0;
  return sesiones.filter(s => s.completada).length;
}

function calcularRecordPersonal(exerciseData, metric) {
  if (!exerciseData || exerciseData.length === 0) return null;
  if (metric === 'peso') return Math.max(...exerciseData.map(l => l.peso || 0));
  if (metric === 'reps') return Math.max(...exerciseData.map(l => l.reps || 0));
  if (metric === 'rpe') return Math.max(...exerciseData.map(l => l.rpe || 0));
  return null;
}

const mensajes = [
  {
    condicion: ({ racha }) => racha >= 7,
    texto: '¡Increíble! Llevas una racha de 7 días registrando tu progreso. ¡Sigue así!',
    icono: <FaFire className="logro-icono" style={{ color: '#e65100' }} />
  },
  {
    condicion: ({ sesiones }) => sesiones >= 20,
    texto: '¡Felicidades! Has completado 20 sesiones de entrenamiento. ¡Constancia es clave!',
    icono: <FaCalendarCheck className="logro-icono" style={{ color: '#1976d2' }} />
  },
  {
    condicion: ({ record }) => record && record > 100,
    texto: '¡Nuevo récord personal! Superaste los 100 kg en un ejercicio. ¡Eres una máquina!',
    icono: <FaTrophy className="logro-icono" style={{ color: '#ffd700' }} />
  },
  {
    condicion: () => true,
    texto: '¡Sigue registrando tu progreso y alcanza nuevos logros cada semana!',
    icono: <FaSmile className="logro-icono" style={{ color: '#43a047' }} />
  }
];

const LogrosProgreso = ({ weightData, exerciseData, sesiones, metric }) => {
  const racha = calcularRachaDias(weightData);
  const sesionesCompletadas = calcularSesionesCompletadas(sesiones);
  const record = calcularRecordPersonal(exerciseData, metric);

  // Seleccionar el mensaje motivacional más relevante
  const mensaje = mensajes.find(m => m.condicion({ racha, sesiones: sesionesCompletadas, record })) || mensajes[mensajes.length - 1];

  // Logros visuales
  const logros = [
    racha >= 3 && { icono: <FaFire />, label: `Racha ${racha} días` },
    sesionesCompletadas >= 10 && { icono: <FaCalendarCheck />, label: `${sesionesCompletadas} sesiones` },
    record && record > 0 && { icono: <FaTrophy />, label: `Récord: ${record} ${metric}` }
  ].filter(Boolean);

  return (
    <section className="logros-progreso-container" aria-label="Logros y motivación de progreso">
      <AnimatePresence>
        <motion.div
          className="mensaje-motivacional"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          key={mensaje.texto}
          role="status"
          aria-live="polite"
          tabIndex={0}
        >
          {React.cloneElement(mensaje.icono, { 'aria-hidden': true })}
          <span>{mensaje.texto}</span>
        </motion.div>
      </AnimatePresence>
      <div className="logros-lista" role="list" aria-label="Lista de logros">
        {logros.length === 0 ? (
          <motion.div
            className="logro-item logro-vacio"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            role="listitem"
            tabIndex={0}
            aria-label="Aún sin logros, pero vas por buen camino"
          >
            <FaMedal aria-hidden="true" /> ¡Aún sin logros, pero vas por buen camino!
          </motion.div>
        ) : (
          logros.map((l, i) => (
            <motion.div
              className="logro-item"
              key={i}
              title={l.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
              role="listitem"
              tabIndex={0}
              aria-label={l.label}
            >
              {React.cloneElement(l.icono, { 'aria-hidden': true })} <span>{l.label}</span>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default LogrosProgreso; 