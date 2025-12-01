import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Smartphone, Download } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import '../../styles/components/pwa/PWAStatusIndicator.css'

/**
 * Indicador visual del estado de la PWA en el navbar
 * Muestra si está instalada, disponible para instalar, o el estado de conexión
 */
const PWAStatusIndicator = () => {
  const { isInstalled, isOnline, showInstallPrompt } = usePWA();

  if (isInstalled) {
    return (
      <motion.div
        className="pwa-status installed"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        title="App instalada"
        data-tooltip="App instalada"
      >
        <Smartphone size={16} />
      </motion.div>
    );
  }

  if (showInstallPrompt) {
    return (
      <motion.div
        className="pwa-status install-available"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        title="¡Instalar app!"
        data-tooltip="¡Instalar app!"
      >
        <Download size={16} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`pwa-status connection ${isOnline ? 'online' : 'offline'}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      title={isOnline ? 'Conectado' : 'Sin conexión'}
      data-tooltip={isOnline ? 'Conectado' : 'Sin conexión'}
    >
      {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
    </motion.div>
  )
}

export default PWAStatusIndicator
