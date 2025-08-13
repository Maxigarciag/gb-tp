import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/Global.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

// Importar utilidades de debug (solo en desarrollo)
if (import.meta.env.DEV) {
  import('./utils/debugProfile.js')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
