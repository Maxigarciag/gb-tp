import { useState, useEffect } from 'react'

/**
 * Hook para detectar si el dispositivo es móvil (≤768px)
 * Optimizado para evitar re-renders innecesarios
 * Consistente con los media queries del proyecto
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' && window.innerWidth <= 768
  )

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Throttle para mejorar rendimiento
    let timeoutId = null
    const handleResize = () => {
      if (timeoutId) return
      timeoutId = setTimeout(() => {
        checkMobile()
        timeoutId = null
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return isMobile
}

