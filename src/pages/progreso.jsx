import React, { useState, lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProgressTabs from '../components/progreso/ProgressTabs';
import { FaChartLine } from 'react-icons/fa';
import LoadingSpinnerOptimized from '../components/LoadingSpinnerOptimized';

const RoutineToday = lazy(() => import('../components/progreso/RoutineToday'));
const Evolution = lazy(() => import('../components/progreso/Evolution'));

const ProgresoPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('rutina');

  const nombre = userProfile?.nombre || userProfile?.username || 'usuario';

  return (
    <Layout>
      <div className="progreso-container" style={{ maxWidth: 950, margin: '0 auto', padding: '32px 0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 18,
          background: 'var(--card-background)',
          borderRadius: 16,
          boxShadow: '0 2px 8px #0002',
          padding: '22px 28px',
          border: '1px solid var(--input-border)'
        }}>
          <FaChartLine style={{ fontSize: 36, color: 'var(--accent-blue)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 23, color: 'var(--text-primary)' }}>Mi Progreso</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 2 }}>
              {`¡Bienvenido${nombre && nombre.slice(-1) === 'a' ? 'a' : ''} ${nombre}! Gestiona tu rutina, registra tus logros y visualiza tu evolución de forma profesional y motivadora.`}
            </div>
          </div>
        </div>
        <ProgressTabs activeTab={activeTab} setActiveTab={setActiveTab} />
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
              Cargando tu rutina...
            </div>
          }>
            {activeTab === 'rutina' ? <RoutineToday /> : <Evolution />}
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default ProgresoPage; 