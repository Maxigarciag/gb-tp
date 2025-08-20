import React from 'react';
import { FaDumbbell, FaChartLine, FaCalculator } from 'react-icons/fa';
import '../../styles/ProgressTabs.css';

const ProgressTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="progress-tabs">
      <button
        className={activeTab === 'rutina' ? 'tab-active' : ''}
        aria-selected={activeTab === 'rutina'}
        aria-label="Ver rutina de hoy"
        onClick={() => setActiveTab('rutina')}
      >
        <FaDumbbell className="tab-icon" /> Rutina de hoy
      </button>
      <button
        className={activeTab === 'evolucion' ? 'tab-active' : ''}
        aria-selected={activeTab === 'evolucion'}
        aria-label="Ver mi evolución"
        onClick={() => setActiveTab('evolucion')}
      >
        <FaChartLine className="tab-icon" /> Mi evolución
      </button>
      <button
        className={activeTab === 'composicion' ? 'tab-active' : ''}
        aria-selected={activeTab === 'composicion'}
        aria-label="Calculadora de composición corporal"
        onClick={() => setActiveTab('composicion')}
      >
        <FaCalculator className="tab-icon" /> Composición Corporal
      </button>
    </div>
  );
};

export default ProgressTabs; 