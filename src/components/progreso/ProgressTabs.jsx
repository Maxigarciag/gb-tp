import React from 'react';
import { FaDumbbell, FaChartLine } from 'react-icons/fa';

const ProgressTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="progress-tabs" style={{ display: 'flex', gap: '1.5rem', borderBottom: 'none', justifyContent: 'center', marginBottom: 18 }}>
      <button
        className={activeTab === 'rutina' ? 'tab-active' : ''}
        style={{
          background: activeTab === 'rutina' ? 'var(--accent-blue)' : 'var(--card-background)',
          border: 'none',
          boxShadow: activeTab === 'rutina' ? '0 2px 8px #1976d233' : '0 1px 4px #0001',
          color: activeTab === 'rutina' ? '#fff' : 'var(--text-primary)',
          fontWeight: 'bold',
          fontSize: '1.08rem',
          padding: '0.9rem 2.2rem',
          borderRadius: 14,
          cursor: 'pointer',
          transition: 'all 0.18s',
          outline: activeTab === 'rutina' ? '2px solid #1976d2' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
        aria-selected={activeTab === 'rutina'}
        aria-label="Ver rutina de hoy"
        onClick={() => setActiveTab('rutina')}
      >
        <FaDumbbell style={{ fontSize: 20 }} /> Rutina de hoy
      </button>
      <button
        className={activeTab === 'evolucion' ? 'tab-active' : ''}
        style={{
          background: activeTab === 'evolucion' ? 'var(--accent-blue)' : 'var(--card-background)',
          border: 'none',
          boxShadow: activeTab === 'evolucion' ? '0 2px 8px #1976d233' : '0 1px 4px #0001',
          color: activeTab === 'evolucion' ? '#fff' : 'var(--text-primary)',
          fontWeight: 'bold',
          fontSize: '1.08rem',
          padding: '0.9rem 2.2rem',
          borderRadius: 14,
          cursor: 'pointer',
          transition: 'all 0.18s',
          outline: activeTab === 'evolucion' ? '2px solid #1976d2' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
        aria-selected={activeTab === 'evolucion'}
        aria-label="Ver mi evolución"
        onClick={() => setActiveTab('evolucion')}
      >
        <FaChartLine style={{ fontSize: 20 }} /> Mi evolución
      </button>
    </div>
  );
};

export default ProgressTabs; 