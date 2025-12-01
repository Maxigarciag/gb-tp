import React from 'react'
import { createPortal } from 'react-dom'

/**
 * Diálogo de confirmación de logout completamente independiente
 * Se renderiza directamente en document.body usando Portal
 */
const LogoutConfirmDialog = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      style={{ 
        zIndex: 10000, 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        style={{
          background: 'var(--card-background)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '480px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--input-border)'
        }}>
          <div style={{ fontSize: '24px', color: 'var(--color-error)' }}>⚠️</div>
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 'var(--spacing-xs)',
              borderRadius: '6px',
              fontSize: '20px',
              lineHeight: '1',
              transition: 'all 0.2s ease'
            }}
            onClick={onCancel}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--gray-medium)';
              e.target.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = 'var(--text-secondary)';
            }}
          >
            ×
          </button>
        </div>
        <div style={{
          padding: 'var(--spacing-xl)',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-md)',
            lineHeight: '1.3',
            margin: '0 0 var(--spacing-md) 0'
          }}>¿Cerrar sesión?</h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-base)',
            lineHeight: '1.6',
            margin: '0'
          }}>¿Estás seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
        </div>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-lg)',
          borderTop: '1px solid var(--input-border)',
          justifyContent: 'flex-end'
        }}>
          <button 
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: '8px',
              fontSize: 'var(--font-size-base)',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid var(--input-border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              minWidth: '100px'
            }}
            onClick={onCancel}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = 'var(--bg-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = 'var(--bg-secondary)';
              }
            }}
          >
            Cancelar
          </button>
          <button 
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: '8px',
              fontSize: 'var(--font-size-base)',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              border: 'none',
              background: 'var(--color-error)',
              color: 'white',
              minWidth: '100px',
              opacity: isLoading ? '0.6' : '1'
            }}
            onClick={onConfirm}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = '#dc2626';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = 'var(--color-error)';
              }
            }}
          >
            {isLoading ? "Cerrando..." : "Cerrar Sesión"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmDialog;
