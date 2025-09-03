import React, { useEffect, useState, lazy, Suspense, useMemo, useCallback } from 'react';
import AuthOnly from '../components/AuthOnly';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaChartLine, FaDumbbell, FaCalculator } from 'react-icons/fa';

const RoutineToday = lazy(() => import('../components/progreso/RoutineToday'));
const Evolution = lazy(() => import('../components/progreso/Evolution'));
const BodyFatCalculator = lazy(() => import('../components/progreso/BodyFatCalculator.jsx'));

const ProgresoPage = () => {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialTab = urlTab === 'evolucion' || urlTab === 'rutina' || urlTab === 'composicion' ? urlTab : null;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sincronizar pestaña con la URL
  useEffect(() => {
    const current = searchParams.get('tab');
    const next = new URLSearchParams(searchParams);
    if (!activeTab && current) {
      next.delete('tab');
      setSearchParams(next, { replace: true });
    } else if (activeTab && current !== activeTab) {
      next.set('tab', activeTab);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Escuchar cambios en la URL para permitir cambiar pestañas vía enlaces externos (?tab=)
  useEffect(() => {
    const param = searchParams.get('tab');
    const normalized = param === 'evolucion' || param === 'rutina' || param === 'composicion' ? param : null;
    if (normalized !== activeTab) {
      setActiveTab(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const nombre = userProfile?.nombre || userProfile?.username || 'usuario';

  // Función para manejar el guardado de mediciones de grasa corporal
  const handleBodyFatMeasurement = useCallback((data) => {
    console.log('Nueva medición de grasa corporal:', data);
  }, []);

  return (
      <AuthOnly>
      <div className="progreso-container" style={{ maxWidth: 950, margin: '0 auto', padding: '32px 0' }}>
        <div
          role="button"
          tabIndex={0}
          title="Ir a Registro de progreso"
          aria-label="Ir a Registro de progreso"
          onClick={() => setActiveTab(activeTab === 'evolucion' ? null : 'evolucion')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab(activeTab === 'evolucion' ? null : 'evolucion');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 18,
            background: activeTab === 'evolucion' ? 'rgba(25,118,210,0.06)' : 'var(--card-background)',
            borderRadius: 16,
            boxShadow: activeTab === 'evolucion' ? '0 4px 12px #0003' : '0 2px 8px #0002',
            padding: '22px 28px',
            border: activeTab === 'evolucion' ? '1px solid var(--accent-blue)' : '1px solid var(--input-border)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            outline: 'none'
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25), 0 2px 8px #0002'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px #0002'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px #0003'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px #0002'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <FaChartLine style={{ fontSize: 36, color: 'var(--accent-blue)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 23, color: 'var(--text-primary)' }}>Registro de progreso</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 2 }}>
              Visualiza tu evolución y registra cambios en peso, medidas y rendimiento.
            </div>
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          title="Ir a Rutina de hoy"
          aria-label="Ir a Rutina de hoy"
          onClick={() => setActiveTab(activeTab === 'rutina' ? null : 'rutina')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab(activeTab === 'rutina' ? null : 'rutina');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 18,
            background: activeTab === 'rutina' ? 'rgba(25,118,210,0.06)' : 'var(--card-background)',
            borderRadius: 16,
            boxShadow: activeTab === 'rutina' ? '0 4px 12px #0003' : '0 2px 8px #0002',
            padding: '22px 28px',
            border: activeTab === 'rutina' ? '1px solid var(--accent-blue)' : '1px solid var(--input-border)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            outline: 'none'
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25), 0 2px 8px #0002'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px #0002'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px #0003'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px #0002'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <FaDumbbell style={{ fontSize: 36, color: 'var(--accent-blue)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 23, color: 'var(--text-primary)' }}>Rutina de hoy</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 2 }}>
              Comienza tu sesión, registra series y pesos, y marca tu entrenamiento como completado.
            </div>
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          title="Ir a Calculadora de Composición Corporal"
          aria-label="Ir a Calculadora de Composición Corporal"
          onClick={() => setActiveTab(activeTab === 'composicion' ? null : 'composicion')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab(activeTab === 'composicion' ? null : 'composicion');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 18,
            background: activeTab === 'composicion' ? 'rgba(25,118,210,0.06)' : 'var(--card-background)',
            borderRadius: 16,
            boxShadow: activeTab === 'composicion' ? '0 4px 12px #0003' : '0 2px 8px #0002',
            padding: '22px 28px',
            border: activeTab === 'composicion' ? '1px solid var(--accent-blue)' : '1px solid var(--input-border)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            outline: 'none'
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25), 0 2px 8px #0002'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px #0002'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px #0003'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px #0002'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <FaCalculator style={{ fontSize: 36, color: 'var(--accent-blue)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 23, color: 'var(--text-primary)' }}>Composición Corporal</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 2 }}>
              Calcula tu porcentaje de grasa corporal usando el método US Navy y registra tu evolución.
            </div>
          </div>
        </div>
        {activeTab && (
          <div style={{ marginTop: '2rem' }}>
            <Suspense fallback={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px',
                fontSize: '18px',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}>
                {activeTab === 'rutina' ? 'Cargando tu rutina...' : 
                 activeTab === 'evolucion' ? 'Cargando tu evolución...' : 
                 'Cargando calculadora...'}
              </div>
            }>
              {activeTab === 'rutina' ? <RoutineToday /> : 
               activeTab === 'evolucion' ? <Evolution /> : 
               <BodyFatCalculator onSaveMeasurement={handleBodyFatMeasurement} />}
            </Suspense>
          </div>
        )}
      </div>
      </AuthOnly>
  );
};

export default ProgresoPage; 