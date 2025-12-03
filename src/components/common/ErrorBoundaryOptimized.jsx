import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, X } from 'lucide-react'
import { useUIStore } from '../../stores'
import ButtonOptimized from './ButtonOptimized'

/**
 * Error Boundary optimizado para capturar errores de React
 * @class
 */
class ErrorBoundaryOptimized extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now().toString()
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Reportar error al store si está disponible
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // En producción, podrías enviar el error a un servicio de monitoreo
    if (import.meta.env.PROD) {
      // this.reportErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          fallback={this.props.fallback}
          showDetails={this.props.showDetails !== false}
        />
      );
    }

    return this.props.children;
  }
}

// Componente funcional para el fallback
const ErrorFallback = ({ 
  error, 
  errorInfo, 
  errorId, 
  retryCount,
  onRetry, 
  onReload, 
  onGoHome,
  fallback,
  showDetails = true
}) => {
  const { showError } = useUIStore();

  // Si hay un fallback personalizado, usarlo
  if (fallback) {
    return fallback({ error, errorInfo, retry: onRetry });
  }

  const handleRetry = () => {
    // Removed notification: showInfo("Reintentando...");
    onRetry();
  };

  const handleReload = () => {
    // Removed notification: showInfo("Recargando página...");
    onReload();
  };

  const handleGoHome = () => {
    // Removed notification: showInfo("Redirigiendo al inicio...");
    onGoHome();
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        delay: 0.3
      }
    }
  };

  const actionsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        delay: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="error-boundary"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="error-container">
        {/* Icono de error */}
        <motion.div 
          className="error-icon"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          <AlertTriangle size={48} />
        </motion.div>

        {/* Contenido principal */}
        <motion.div 
          className="error-content"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="error-title">¡Ups! Algo salió mal</h2>
          <p className="error-message">
            Ha ocurrido un error inesperado. No te preocupes, no es tu culpa.
          </p>
          
          {errorId && (
            <p className="error-id">
              ID del error: <code>{errorId}</code>
            </p>
          )}
          
          {retryCount > 0 && (
            <p className="retry-count">
              Intentos de recuperación: {retryCount}
            </p>
          )}
        </motion.div>

        {/* Acciones */}
        <motion.div 
          className="error-actions"
          variants={actionsVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={buttonVariants}>
            <ButtonOptimized
              variant="primary"
              onClick={handleRetry}
              icon={<RefreshCw size={16} />}
              size="medium"
            >
              Reintentar
            </ButtonOptimized>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <ButtonOptimized
              variant="secondary"
              onClick={handleReload}
              icon={<RefreshCw size={16} />}
              size="medium"
            >
              Recargar página
            </ButtonOptimized>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <ButtonOptimized
              variant="ghost"
              onClick={handleGoHome}
              icon={<Home size={16} />}
              size="medium"
            >
              Ir al inicio
            </ButtonOptimized>
          </motion.div>
        </motion.div>

        {/* Detalles del error (solo en desarrollo) */}
        {import.meta.env.DEV && showDetails && error && (
          <motion.div 
            className="error-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.5 }}
          >
            <details>
              <summary className="error-details-summary">
                <Bug size={16} />
                Detalles del error (solo desarrollo)
              </summary>
              <div className="error-details-content">
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{error.toString()}</pre>
                </div>
                {errorInfo && (
                  <div className="error-stack">
                    <h4>Stack trace:</h4>
                    <pre>{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

ErrorFallback.propTypes = {
	error: PropTypes.object,
	errorInfo: PropTypes.object,
	errorId: PropTypes.string,
	retryCount: PropTypes.number,
	onRetry: PropTypes.func.isRequired,
	onReload: PropTypes.func.isRequired,
	onGoHome: PropTypes.func.isRequired,
	fallback: PropTypes.func,
	showDetails: PropTypes.bool
}

ErrorBoundaryOptimized.propTypes = {
	children: PropTypes.node.isRequired,
	fallback: PropTypes.func,
	onError: PropTypes.func,
	showDetails: PropTypes.bool
}

export default ErrorBoundaryOptimized 