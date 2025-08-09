import React, { useEffect, useState, useContext } from 'react';
import { userProgress, exerciseLogs } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import BodyWeightChart from './BodyWeightChart';
import ExerciseProgressChart from './ExerciseProgressChart';
import ToastOptimized from '../ToastOptimized';
import BodyFatChart from './BodyFatChart';
import MuscleMassChart from './MuscleMassChart';
import ResumenProgreso from './ResumenProgreso';
import LogrosProgreso from './LogrosProgreso';
import '../../styles/Evolution.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

const Evolution = () => {
  const { userProfile } = useAuth();
  const [weightData, setWeightData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ peso: '', grasa: '', musculo: '' });
  const [formLoading, setFormLoading] = useState(false);
  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [metric, setMetric] = useState('peso');
  const [sesiones, setSesiones] = useState([]);
  const [historialTab, setHistorialTab] = useState('progreso');
  const [historialDateFrom, setHistorialDateFrom] = useState('');
  const [historialDateTo, setHistorialDateTo] = useState('');
  const [editModal, setEditModal] = useState({ open: false, registro: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, registro: null });
  const [editForm, setEditForm] = useState({ peso: '', grasa: '', musculo: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editLogModal, setEditLogModal] = useState({ open: false, log: null });
  const [deleteLogConfirm, setDeleteLogConfirm] = useState({ open: false, log: null });
  const [editLogForm, setEditLogForm] = useState({ peso: '', reps: '', rpe: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener evolución de peso corporal
      const { data: weight, error: weightError } = await userProgress.getUserProgress(120);
      if (!weightError && weight) {
        setWeightData(weight.filter(w => w.user_id === userProfile?.id));
      }
      // Obtener logs de ejercicios
      const { data: logs, error: logsError } = await exerciseLogs.getByUser?.(userProfile?.id) || { data: [], error: null };
      let logsData = logs;
      if (!logs && exerciseLogs.getBySession) {
        logsData = [];
      }
      setExerciseData(logsData || []);
      const uniqueExercises = Array.from(new Set((logsData || []).map(l => l.exercises?.nombre))).filter(Boolean);
      setAllExercises(uniqueExercises);
      if (!selectedExercise && uniqueExercises.length > 0) setSelectedExercise(uniqueExercises[0]);
      // Obtener sesiones de entrenamiento
      const { data: sesionesData, error: sesionesError } = await import('../../lib/supabase').then(m => m.workoutSessions.getUserSessions(50));
      if (!sesionesError && sesionesData) setSesiones(sesionesData.filter(s => s.user_id === userProfile?.id));
    } catch (err) {
      setWeightData([]);
      setExerciseData([]);
      setAllExercises([]);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) fetchData();
    // eslint-disable-next-line
  }, [userProfile]);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!form.peso) {
      setToast({ type: 'error', message: 'El peso es obligatorio.' });
      return;
    }
    setFormLoading(true);
    setToast(null);
    try {
      const { error } = await userProgress.create({
        user_id: userProfile.id,
        fecha: new Date().toISOString().slice(0, 10),
        peso: Number(form.peso),
        grasa: form.grasa ? Number(form.grasa) : null,
        musculo: form.musculo ? Number(form.musculo) : null
      });
      if (error) throw error;
      setToast({ type: 'success', message: '¡Progreso registrado!' });
      setForm({ peso: '', grasa: '', musculo: '' });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir modal de edición
  const handleEdit = (registro) => {
    setEditForm({ peso: registro.peso, grasa: registro.grasa, musculo: registro.musculo });
    setEditModal({ open: true, registro });
  };
  // Guardar edición
  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const { error } = await userProgress.update(editModal.registro.fecha, {
        peso: Number(editForm.peso),
        grasa: editForm.grasa !== '' ? Number(editForm.grasa) : null,
        musculo: editForm.musculo !== '' ? Number(editForm.musculo) : null
      });
      if (error) throw error;
      setToast({ type: 'success', message: 'Registro actualizado correctamente.' });
      setEditModal({ open: false, registro: null });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: 'Error al actualizar el registro.' });
    } finally {
      setEditLoading(false);
    }
  };
  // Abrir confirmación de eliminación
  const handleDelete = (registro) => {
    setDeleteConfirm({ open: true, registro });
  };
  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    setEditLoading(true);
    try {
      const { error } = await userProgress.update(deleteConfirm.registro.fecha, {
        peso: null, grasa: null, musculo: null
      });
      if (error) throw error;
      setToast({ type: 'success', message: 'Registro eliminado correctamente.' });
      setDeleteConfirm({ open: false, registro: null });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: 'Error al eliminar el registro.' });
    } finally {
      setEditLoading(false);
    }
  };

  // Abrir modal de edición de log
  const handleEditLog = (log) => {
    setEditLogForm({ peso: log.peso, reps: log.reps, rpe: log.rpe });
    setEditLogModal({ open: true, log });
  };
  // Guardar edición de log
  const handleEditLogSave = async () => {
    setEditLoading(true);
    try {
      const { error } = await exerciseLogs.update(editLogModal.log.id, {
        peso: Number(editLogForm.peso),
        reps: Number(editLogForm.reps),
        rpe: Number(editLogForm.rpe)
      });
      if (error) throw error;
      setToast({ type: 'success', message: 'Log actualizado correctamente.' });
      setEditLogModal({ open: false, log: null });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: 'Error al actualizar el log.' });
    } finally {
      setEditLoading(false);
    }
  };
  // Abrir confirmación de eliminación de log
  const handleDeleteLog = (log) => {
    setDeleteLogConfirm({ open: true, log });
  };
  // Confirmar eliminación de log
  const handleDeleteLogConfirm = async () => {
    setEditLoading(true);
    try {
      const { error } = await exerciseLogs.update(deleteLogConfirm.log.id, {
        peso: null, reps: null, rpe: null
      });
      if (error) throw error;
      setToast({ type: 'success', message: 'Log eliminado correctamente.' });
      setDeleteLogConfirm({ open: false, log: null });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: 'Error al eliminar el log.' });
    } finally {
      setEditLoading(false);
    }
  };

  // Filtrar datos por fecha
  const filterByDate = (arr) => {
    return arr.filter(d => {
      if (dateFrom && d.fecha < dateFrom) return false;
      if (dateTo && d.fecha > dateTo) return false;
      return true;
    });
  };

  // Filtrar logs de ejercicios por fecha
  const filteredExerciseLogs = filterByDate(
    exerciseData.filter(l => l.exercises?.nombre === selectedExercise)
  );

  // Filtrar datos de progreso corporal por fecha
  const filteredWeightData = filterByDate(weightData);

  // Filtrar datos para historial
  const filteredProgress = weightData.filter(r => {
    if (historialDateFrom && r.fecha < historialDateFrom) return false;
    if (historialDateTo && r.fecha > historialDateTo) return false;
    return true;
  });
  const filteredLogs = exerciseData.filter(l => {
    const fecha = l.created_at?.slice(0, 10);
    if (historialDateFrom && fecha < historialDateFrom) return false;
    if (historialDateTo && fecha > historialDateTo) return false;
    return true;
  });

  // --- Cálculo de resumen visual ---
  // Último registro
  const ultimo = weightData && weightData.length > 0 ? weightData[0] : null;

  // Buscar registro más cercano a hace 7 y 30 días
  function findClosestByDays(data, days) {
    if (!data || data.length === 0) return null;
    const target = new Date();
    target.setDate(target.getDate() - days);
    let closest = data[0];
    let minDiff = Math.abs(new Date(data[0].fecha) - target);
    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(new Date(data[i].fecha) - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = data[i];
      }
    }
    return closest;
  }
  const semanal = (() => {
    const prev = findClosestByDays(weightData, 7);
    if (!ultimo || !prev || prev === ultimo) return { peso: null, grasa: null, musculo: null };
    return {
      peso: ultimo.peso && prev.peso ? +(ultimo.peso - prev.peso).toFixed(1) : null,
      grasa: ultimo.grasa != null && prev.grasa != null ? +(ultimo.grasa - prev.grasa).toFixed(1) : null,
      musculo: ultimo.musculo != null && prev.musculo != null ? +(ultimo.musculo - prev.musculo).toFixed(1) : null,
    };
  })();
  const mensual = (() => {
    const prev = findClosestByDays(weightData, 30);
    if (!ultimo || !prev || prev === ultimo) return { peso: null, grasa: null, musculo: null };
    return {
      peso: ultimo.peso && prev.peso ? +(ultimo.peso - prev.peso).toFixed(1) : null,
      grasa: ultimo.grasa != null && prev.grasa != null ? +(ultimo.grasa - prev.grasa).toFixed(1) : null,
      musculo: ultimo.musculo != null && prev.musculo != null ? +(ultimo.musculo - prev.musculo).toFixed(1) : null,
    };
  })();
  // Mejor marca reciente en el ejercicio y métrica seleccionados
  const mejorMarca = (() => {
    if (!selectedExercise || !exerciseData || exerciseData.length === 0) return null;
    const logs = exerciseData.filter(l => l.exercises?.nombre === selectedExercise);
    if (!logs.length) return null;
    if (metric === 'peso') return Math.max(...logs.map(l => l.peso || 0));
    if (metric === 'reps') return Math.max(...logs.map(l => l.reps || 0));
    if (metric === 'rpe') return Math.max(...logs.map(l => l.rpe || 0));
    return null;
  })();

  // No mostrar spinner aquí, solo el contenido o mensajes de error

  return (
    <div className="evolution-container">
      {/* Tabs de sección */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          className={historialTab === 'progreso' ? 'tab-active' : ''}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: historialTab === 'progreso' ? '#1976d2' : '#eee', color: historialTab === 'progreso' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => setHistorialTab('progreso')}
        >
          Progreso
        </button>
        <button
          className={historialTab === 'historial' ? 'tab-active' : ''}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: historialTab === 'historial' ? '#1976d2' : '#eee', color: historialTab === 'historial' ? '#fff' : '#333', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => setHistorialTab('historial')}
        >
          Historial
        </button>
      </div>
      {historialTab === 'progreso' && (
        <>
          <LogrosProgreso
            weightData={weightData}
            exerciseData={exerciseData}
            sesiones={sesiones}
            metric={metric}
          />
          <ResumenProgreso
            ultimo={ultimo}
            semanal={semanal}
            mensual={mensual}
            mejorMarca={mejorMarca}
            ejercicio={selectedExercise}
            metrica={metric}
          />
          <h3 className="evolution-title">Mi evolución</h3>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
            <div>
              <label>Peso (kg):</label><br />
              <input type="number" name="peso" value={form.peso} onChange={handleFormChange} min={0} step={0.1} required disabled={formLoading} className="evolution-select" style={{ width: 80 }} />
            </div>
            <div>
              <label>% Grasa:</label><br />
              <input type="number" name="grasa" value={form.grasa} onChange={handleFormChange} min={0} max={100} step={0.1} disabled={formLoading} className="evolution-select" style={{ width: 80 }} />
            </div>
            <div>
              <label>% Músculo:</label><br />
              <input type="number" name="musculo" value={form.musculo} onChange={handleFormChange} min={0} max={100} step={0.1} disabled={formLoading} className="evolution-select" style={{ width: 80 }} />
            </div>
            <button type="submit" disabled={formLoading} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 'bold', cursor: formLoading ? 'not-allowed' : 'pointer' }}>
              {formLoading ? 'Guardando...' : 'Registrar'}
            </button>
          </form>
          {toast && <ToastOptimized type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
            <div>
              <label>Desde: </label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="evolution-select" />
            </div>
            <div>
              <label>Hasta: </label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="evolution-select" />
            </div>
          </div>
          <div className="evolution-charts">
            <div className="evolution-chart-card">
              <div className="evolution-chart-title">Peso corporal</div>
              <BodyWeightChart data={filteredWeightData} />
            </div>
            <div className="evolution-chart-card">
              <div className="evolution-chart-title">% Grasa</div>
              <BodyFatChart data={filteredWeightData} />
            </div>
            <div className="evolution-chart-card">
              <div className="evolution-chart-title">% Músculo</div>
              <MuscleMassChart data={filteredWeightData} />
            </div>
          </div>
          <div style={{ marginBottom: 16, marginTop: 32 }}>
            <label style={{ fontWeight: 'bold' }}>Ejercicio: </label>
            <select value={selectedExercise || ''} onChange={e => setSelectedExercise(e.target.value)} className="evolution-select">
              {allExercises.map((ex, idx) => (
                <option key={idx} value={ex}>{ex}</option>
              ))}
            </select>
            <label style={{ fontWeight: 'bold', marginLeft: 16 }}>Métrica: </label>
            <select value={metric} onChange={e => setMetric(e.target.value)} className="evolution-select">
              <option value="peso">Peso (kg)</option>
              <option value="reps">Reps</option>
              <option value="rpe">RPE</option>
            </select>
          </div>
          <div className="evolution-chart-card" style={{ margin: '0 auto', maxWidth: 600 }}>
            <div className="evolution-chart-title">Progreso del ejercicio</div>
            <ExerciseProgressChart data={filteredExerciseLogs} ejercicio={selectedExercise} metric={metric} />
          </div>
        </>
      )}
      {historialTab === 'historial' && (
        <div className="historial-section">
          <h3 style={{ marginBottom: 16 }}>Historial de Progreso y Ejercicios</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div>
              <label>Desde: </label>
              <input type="date" value={historialDateFrom} onChange={e => setHistorialDateFrom(e.target.value)} />
            </div>
            <div>
              <label>Hasta: </label>
              <input type="date" value={historialDateTo} onChange={e => setHistorialDateTo(e.target.value)} />
            </div>
          </div>
          <div style={{ overflowX: 'auto', marginBottom: 32 }}>
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>% Grasa</th>
                  <th>% Músculo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProgress.map((r, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => handleEdit(r)}>
                    <td>{r.fecha}</td>
                    <td>{r.peso}</td>
                    <td>{r.grasa}</td>
                    <td>{r.musculo}</td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); handleDelete(r); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e65100' }} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Modal de edición */}
          {editModal.open && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h4>Editar registro ({editModal.registro.fecha})</h4>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label>Peso (kg):</label>
                    <input type="number" value={editForm.peso} onChange={e => setEditForm(f => ({ ...f, peso: e.target.value }))} min={0} step={0.1} />
                  </div>
                  <div>
                    <label>% Grasa:</label>
                    <input type="number" value={editForm.grasa} onChange={e => setEditForm(f => ({ ...f, grasa: e.target.value }))} min={0} max={100} step={0.1} />
                  </div>
                  <div>
                    <label>% Músculo:</label>
                    <input type="number" value={editForm.musculo} onChange={e => setEditForm(f => ({ ...f, musculo: e.target.value }))} min={0} max={100} step={0.1} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setEditModal({ open: false, registro: null })} disabled={editLoading}>Cancelar</button>
                  <button className="btn-primary" onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </div>
            </div>
          )}
          {/* Modal de confirmación de eliminación */}
          {deleteConfirm.open && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h4>¿Eliminar registro de {deleteConfirm.registro.fecha}?</h4>
                <p>Esta acción no se puede deshacer.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setDeleteConfirm({ open: false, registro: null })} disabled={editLoading}>Cancelar</button>
                  <button className="btn-danger" onClick={handleDeleteConfirm} disabled={editLoading}>{editLoading ? 'Eliminando...' : 'Eliminar'}</button>
                </div>
              </div>
            </div>
          )}
          {toast && <ToastOptimized type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
          <div style={{ overflowX: 'auto' }}>
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ejercicio</th>
                  <th>Peso (kg)</th>
                  <th>Reps</th>
                  <th>RPE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => handleEditLog(l)}>
                    <td>{l.created_at?.slice(0,10)}</td>
                    <td>{l.exercises?.nombre}</td>
                    <td>{l.peso}</td>
                    <td>{l.reps}</td>
                    <td>{l.rpe}</td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); handleDeleteLog(l); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e65100' }} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Modal de edición de log */}
          {editLogModal.open && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h4>Editar log ({editLogModal.log.created_at?.slice(0,10)} - {editLogModal.log.exercises?.nombre})</h4>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label>Peso (kg):</label>
                    <input type="number" value={editLogForm.peso} onChange={e => setEditLogForm(f => ({ ...f, peso: e.target.value }))} min={0} step={0.1} />
                  </div>
                  <div>
                    <label>Reps:</label>
                    <input type="number" value={editLogForm.reps} onChange={e => setEditLogForm(f => ({ ...f, reps: e.target.value }))} min={0} />
                  </div>
                  <div>
                    <label>RPE:</label>
                    <input type="number" value={editLogForm.rpe} onChange={e => setEditLogForm(f => ({ ...f, rpe: e.target.value }))} min={1} max={10} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setEditLogModal({ open: false, log: null })} disabled={editLoading}>Cancelar</button>
                  <button className="btn-primary" onClick={handleEditLogSave} disabled={editLoading}>{editLoading ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </div>
            </div>
          )}
          {/* Modal de confirmación de eliminación de log */}
          {deleteLogConfirm.open && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h4>¿Eliminar log de {deleteLogConfirm.log.created_at?.slice(0,10)} - {deleteLogConfirm.log.exercises?.nombre}?</h4>
                <p>Esta acción no se puede deshacer.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setDeleteLogConfirm({ open: false, log: null })} disabled={editLoading}>Cancelar</button>
                  <button className="btn-danger" onClick={handleDeleteLogConfirm} disabled={editLoading}>{editLoading ? 'Eliminando...' : 'Eliminar'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Evolution; 