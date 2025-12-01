import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Loader2, Check, AlertCircle, Info } from 'lucide-react'
import { useUIStore } from '../../stores'
import '../../styles/components/common/Button.css'

/**
 * Botón optimizado con múltiples variantes, estados y efectos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'|'warning'|'info'} props.variant - Variante visual
 * @param {'small'|'medium'|'large'} props.size - Tamaño del botón
 * @param {boolean} props.loading - Si mostrar estado de carga
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 * @param {Function} props.onClick - Callback al hacer click
 * @param {'button'|'submit'|'reset'} props.type - Tipo de botón HTML
 * @param {string} props.className - Clases CSS adicionales
 * @param {React.ReactNode} props.icon - Icono opcional
 * @param {'left'|'right'} props.iconPosition - Posición del icono
 * @param {boolean} props.success - Si mostrar estado de éxito
 * @param {boolean} props.error - Si mostrar estado de error
 * @param {boolean} props.info - Si mostrar estado informativo
 * @param {boolean} props.fullWidth - Si ocupar todo el ancho
 * @param {boolean} props.rounded - Si aplicar bordes redondeados
 * @param {'none'|'low'|'medium'|'high'} props.elevation - Nivel de elevación/sombra
 * @param {boolean} props.ripple - Si mostrar efecto ripple
 */
const ButtonOptimized = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  success = false,
  error = false,
  info = false,
  fullWidth = false,
  rounded = false,
  elevation = 'medium',
  ripple = true,
  ...props 
}) => {
  const { showSuccess, showError, showInfo } = useUIStore();

  // Memoizar las clases CSS para evitar recálculos
  const buttonClasses = useMemo(() => {
    const baseClasses = ['btn'];
    
    // Variantes
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
      warning: 'btn-warning',
      info: 'btn-info'
    };
    
    baseClasses.push(variantClasses[variant] || variantClasses.primary);
    
    // Tamaños
    const sizeClasses = {
      small: 'btn-small',
      medium: 'btn-medium',
      large: 'btn-large'
    };
    
    baseClasses.push(sizeClasses[size] || sizeClasses.medium);
    
    // Estados
    if (success) baseClasses.push('btn-success-state');
    if (error) baseClasses.push('btn-error-state');
    if (info) baseClasses.push('btn-info-state');
    if (fullWidth) baseClasses.push('btn-full-width');
    if (rounded) baseClasses.push('btn-rounded');
    
    // Elevación
    const elevationClasses = {
      none: 'btn-elevation-none',
      low: 'btn-elevation-low',
      medium: 'btn-elevation-medium',
      high: 'btn-elevation-high'
    };
    
    baseClasses.push(elevationClasses[elevation] || elevationClasses.medium);
    
    // Clases adicionales
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  }, [variant, size, success, error, info, fullWidth, rounded, elevation, className]);

  // Memoizar el icono de estado
  const stateIcon = useMemo(() => {
    if (success) return <Check size={16} />;
    if (error) return <AlertCircle size={16} />;
    if (info) return <Info size={16} />;
    return null;
  }, [success, error, info]);

  // Manejar clic con callback optimizado
  const handleClick = useCallback((e) => {
    if (loading || disabled) return;
    
    // Efecto ripple si está habilitado
    if (ripple && !disabled && !loading) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    // Llamar al onClick original
    if (onClick) {
      onClick(e);
    }
  }, [loading, disabled, ripple, onClick]);

  // Animaciones optimizadas
  const buttonVariants = useMemo(() => ({
    initial: { scale: 1 },
    hover: !disabled && !loading ? { 
      scale: 1.01,
      transition: { duration: 0.2, ease: "easeOut" }
    } : {},
    tap: !disabled && !loading ? { 
      scale: 0.99,
      transition: { duration: 0.1, ease: "easeIn" }
    } : {},
    disabled: disabled || loading ? {
      opacity: 0.6,
      cursor: 'not-allowed'
    } : {}
  }), [disabled, loading]);

  const contentVariants = {
    initial: { opacity: 1 },
    loading: { opacity: 0.8 },
    success: { 
      opacity: 1,
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    },
    error: { 
      opacity: 1,
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.3 }
    }
  };

  // Determinar el estado de animación
  const animationState = useMemo(() => {
    if (loading) return 'loading';
    if (success) return 'success';
    if (error) return 'error';
    return 'initial';
  }, [loading, success, error]);

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={disabled || loading ? "disabled" : "initial"}
      {...props}
    >
      <motion.div
        className="btn-content"
        variants={contentVariants}
        animate={animationState}
      >
        {loading ? (
          <div className="btn-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={16} className="loading-icon" />
            </motion.div>
            <span>Cargando...</span>
          </div>
        ) : (
          <>
            {stateIcon && (
              <motion.span 
                className="btn-state-icon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {stateIcon}
              </motion.span>
            )}
            
            {icon && iconPosition === 'left' && (
              <motion.span 
                className="btn-icon btn-icon-left"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.span>
            )}
            
            <span className="btn-text">{children}</span>
            
            {icon && iconPosition === 'right' && (
              <motion.span 
                className="btn-icon btn-icon-right"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.span>
            )}
          </>
        )}
      </motion.div>
    </motion.button>
  )
}

ButtonOptimized.propTypes = {
	children: PropTypes.node,
	variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'info']),
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	loading: PropTypes.bool,
	disabled: PropTypes.bool,
	onClick: PropTypes.func,
	type: PropTypes.oneOf(['button', 'submit', 'reset']),
	className: PropTypes.string,
	icon: PropTypes.node,
	iconPosition: PropTypes.oneOf(['left', 'right']),
	success: PropTypes.bool,
	error: PropTypes.bool,
	info: PropTypes.bool,
	fullWidth: PropTypes.bool,
	rounded: PropTypes.bool,
	elevation: PropTypes.oneOf(['none', 'low', 'medium', 'high']),
	ripple: PropTypes.bool
}

export default ButtonOptimized 