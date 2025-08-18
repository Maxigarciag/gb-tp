import React from 'react';
import { FaDumbbell, FaChartLine } from 'react-icons/fa';
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
    </div>
  );
};

export default ProgressTabs; 