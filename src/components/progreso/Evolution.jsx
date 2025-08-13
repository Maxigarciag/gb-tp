import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userProgress, exerciseLogs, workoutSessions } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import BodyWeightChart from './BodyWeightChart';
import ToastOptimized from '../ToastOptimized';
import BodyFatChart from './BodyFatChart';
import MuscleMassChart from './MuscleMassChart';
import ResumenProgreso from './ResumenProgreso';
import LogrosProgreso from './LogrosProgreso';
import '../../styles/Evolution.css';
import { FaTrash, FaEdit, FaWeight, FaChartLine, FaHistory } from 'react-icons/fa';

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
  // Refs para navegación guiada
  const chartsRef = useRef(null);
  const historialRef = useRef(null);
  const weightFormRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null); // 'weight' | 'charts' | 'historial' | null

  // Filtros
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');
  const [metric, setMetric] = useState('peso');
  const [sesiones, setSesiones] = useState([]);
  const [historialTab, setHistorialTab] = useState('progreso');
  const [historialDateFrom, setHistorialDateFrom] = useState(searchParams.get('histFrom') || '');
  const [historialDateTo, setHistorialDateTo] = useState(searchParams.get('histTo') || '');

  // Debounce helper
  function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
  }

  const debouncedFrom = useDebouncedValue(dateFrom, 250);
  const debouncedTo = useDebouncedValue(dateTo, 250);
  const debouncedHistFrom = useDebouncedValue(historialDateFrom, 250);
  const debouncedHistTo = useDebouncedValue(historialDateTo, 250);

  // Cargar último rango de fechas guardado (si no viene en URL)
  useEffect(() => {
    try {
      if (!searchParams.get('from') && !searchParams.get('to')) {
        const savedFrom = localStorage.getItem('progressDateFrom') || '';
        const savedTo = localStorage.getItem('progressDateTo') || '';
        if (savedFrom || savedTo) {
          setDateFrom(savedFrom);
          setDateTo(savedTo);
        }
      }
      if (!searchParams.get('histFrom') && !searchParams.get('histTo')) {
        const savedHistFrom = localStorage.getItem('historyDateFrom') || '';
        const savedHistTo = localStorage.getItem('historyDateTo') || '';
        if (savedHistFrom || savedHistTo) {
          setHistorialDateFrom(savedHistFrom);
          setHistorialDateTo(savedHistTo);
        }
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar filtros con la URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedFrom) next.set('from', debouncedFrom); else next.delete('from');
    if (debouncedTo) next.set('to', debouncedTo); else next.delete('to');
    if (historialTab) next.set('histTab', historialTab);
    if (debouncedHistFrom) next.set('histFrom', debouncedHistFrom); else next.delete('histFrom');
    if (debouncedHistTo) next.set('histTo', debouncedHistTo); else next.delete('histTo');
    if (selectedExercise) next.set('exercise', selectedExercise); else next.delete('exercise');
    if (metric) next.set('metric', metric);
    // Asegurar que permanecemos en la pestaña 'evolucion' al estar en este componente
    next.set('tab', 'evolucion');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, debouncedFrom, debouncedTo, historialTab, debouncedHistFrom, debouncedHistTo, selectedExercise, metric]);

  // Guardar en localStorage el último rango elegido
  useEffect(() => {
    try {
      if (debouncedFrom != null) localStorage.setItem('progressDateFrom', debouncedFrom);
      if (debouncedTo != null) localStorage.setItem('progressDateTo', debouncedTo);
    } catch (_) {}
  }, [debouncedFrom, debouncedTo]);
  useEffect(() => {
    try {
      if (debouncedHistFrom != null) localStorage.setItem('historyDateFrom', debouncedHistFrom);
      if (debouncedHistTo != null) localStorage.setItem('historyDateTo', debouncedHistTo);
    } catch (_) {}
  }, [debouncedHistFrom, debouncedHistTo]);
  const [editModal, setEditModal] = useState({ open: false, registro: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, registro: null });
  const [editForm, setEditForm] = useState({ peso: '', grasa: '', musculo: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editLogModal, setEditLogModal] = useState({ open: false, log: null });
  const [deleteLogConfirm, setDeleteLogConfirm] = useState({ open: false, log: null });
  const [editLogForm, setEditLogForm] = useState({ peso: '', reps: '', rpe: '' });
  const pesoInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener evolución de peso corporal
      const { data: weight, error: weightError } = await userProgress.getByUser(userProfile.id, 120);
      if (!weightError && weight) setWeightData(weight);
      // Obtener logs de ejercicios
      const { data: logsData, error: logsError } = await exerciseLogs.getByUser(userProfile.id);
      if (logsError) throw logsError;
      // Normalizar claves por compatibilidad (repeticiones vs reps)
      const normalizedLogs = (logsData || []).map(l => ({
        ...l,
        reps: l.reps ?? l.repeticiones ?? null,
      }));
      setExerciseData(normalizedLogs);
      const uniqueExercises = Array.from(new Set((normalizedLogs || []).map(l => l.exercises?.nombre))).filter(Boolean);
      setAllExercises(uniqueExercises);
      if (!selectedExercise && uniqueExercises.length > 0) setSelectedExercise(uniqueExercises[0]);
      // Obtener sesiones de entrenamiento
      const { data: sesionesData, error: sesionesError } = await workoutSessions.getUserSessions(50);
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
        grasa: form.grasa !== '' ? Number(form.grasa) : null,
        musculo: form.musculo !== '' ? Number(form.musculo) : null
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
      const fecha = d.fecha || d.created_at?.slice(0, 10);
      if (!fecha) return false;
      if (dateFrom && fecha < dateFrom) return false;
      if (dateTo && fecha > dateTo) return false;
      return true;
    });
  };

  // Filtrar logs de ejercicios por fecha (memoizados)
  const filteredExerciseLogs = useMemo(() => {
    const byExercise = exerciseData.filter(l => l.exercises?.nombre === selectedExercise);
    return filterByDate(byExercise);
  }, [exerciseData, selectedExercise, debouncedFrom, debouncedTo]);

  // Filtrar datos de progreso corporal por fecha (memoizado)
  const filteredWeightData = useMemo(() => filterByDate(weightData), [weightData, debouncedFrom, debouncedTo]);

  // Filtrar datos para historial (memoizados)
  const filteredProgress = useMemo(() => {
    return weightData.filter(r => {
      if (debouncedHistFrom && r.fecha < debouncedHistFrom) return false;
      if (debouncedHistTo && r.fecha > debouncedHistTo) return false;
      return true;
    });
  }, [weightData, debouncedHistFrom, debouncedHistTo]);
  const filteredLogs = useMemo(() => {
    return exerciseData.filter(l => {
      const fecha = l.created_at?.slice(0, 10);
      if (debouncedHistFrom && fecha < debouncedHistFrom) return false;
      if (debouncedHistTo && fecha > debouncedHistTo) return false;
      return true;
    });
  }, [exerciseData, debouncedHistFrom, debouncedHistTo]);

  const primerUso = (!weightData || weightData.length === 0) && (!exerciseData || exerciseData.length === 0);
  const showGuide = true;
  const handleDismissGuide = () => {};

  const irARutina = () => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'rutina');
    setSearchParams(next, { replace: true });
  };

  const enfocarPeso = () => {
    if (historialTab !== 'progreso') setHistorialTab('progreso')
    const next = activeSection === 'weight' ? null : 'weight'
    setActiveSection(next)
    if (next === 'weight') {
      requestAnimationFrame(() => {
        try {
          weightFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          pesoInputRef.current?.focus()
        } catch (_) {}
      })
    }
  }

  // --- Cálculo de resumen visual ---
  // Último registro (memoizado)
  const ultimo = useMemo(() => (weightData && weightData.length > 0 ? weightData[0] : null), [weightData]);

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
      {activeSection === null && (
        <div className="quick-guide menu-only" aria-label="Guía rápida" role="region">
          <div className="guide-header">
            <h3>Guía rápida</h3>
          </div>
          <div className="guide-actions">
            <button type="button" className={`guide-action-card ${activeSection === 'weight' ? 'is-active' : ''}`} onClick={enfocarPeso}>
              <div className="action-icon"><FaWeight /></div>
              <div className="action-content">
                <div className="action-title">Registrar peso</div>
                <div className="action-desc">Peso de hoy y, si querés, % grasa y % músculo</div>
              </div>
            </button>
            <button type="button" className={`guide-action-card ${activeSection === 'charts' ? 'is-active' : ''}`} onClick={() => { const next = activeSection === 'charts' ? null : 'charts'; setActiveSection(next); if (next === 'charts') { requestAnimationFrame(() => chartsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); } }}>
              <div className="action-icon"><FaChartLine /></div>
              <div className="action-content">
                <div className="action-title">Ver gráficos</div>
                <div className="action-desc">Tu evolución semanal y mensual</div>
              </div>
            </button>
            <button type="button" className={`guide-action-card ${activeSection === 'historial' ? 'is-active' : ''}`} onClick={() => { const next = activeSection === 'historial' ? null : 'historial'; setActiveSection(next); if (next === 'historial') { setHistorialTab('historial'); requestAnimationFrame(() => historialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); } }}>
              <div className="action-icon"><FaHistory /></div>
              <div className="action-content">
                <div className="action-title">Ver historial</div>
                <div className="action-desc">Revisá o editá tus registros anteriores</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {activeSection === 'weight' && (
        <div ref={weightFormRef} className="card-section" role="region" aria-label="Registrar progreso">
          <div className="card-section-header">
            <div className="card-section-title">Registrar progreso de hoy</div>
            <button type="button" className="back-link" onClick={() => setActiveSection(null)}>Volver</button>
          </div>
          <p className="helper-text">Completá al menos tu peso. % grasa y % músculo son opcionales.</p>
          <form onSubmit={handleFormSubmit} className="weight-register-form" id="registro-progreso-form">
            <div className="field">
              <label>Peso (kg)</label>
              <input ref={pesoInputRef} type="number" name="peso" value={form.peso} onChange={handleFormChange} min={0} step={0.1} required disabled={formLoading} className="evolution-select" />
            </div>
            <div className="field">
              <label>% Grasa (opcional)</label>
              <input type="number" name="grasa" value={form.grasa} onChange={handleFormChange} min={0} max={100} step={0.1} disabled={formLoading} className="evolution-select" />
            </div>
            <div className="field">
              <label>% Músculo (opcional)</label>
              <input type="number" name="musculo" value={form.musculo} onChange={handleFormChange} min={0} max={100} step={0.1} disabled={formLoading} className="evolution-select" />
            </div>
            <div className="actions">
              <button type="button" className="btn-secondary" onClick={() => setActiveSection(null)} disabled={formLoading}>Cancelar</button>
              <button type="submit" disabled={formLoading} className="btn-primary">{formLoading ? 'Guardando...' : 'Registrar'}</button>
            </div>
          </form>
        </div>
      )}

      {activeSection === 'charts' && (
        <div className="card-section" ref={chartsRef}>
          <div className="card-section-header">
            <div className="card-section-title">Gráficos de evolución</div>
            <button type="button" className="back-link" onClick={() => setActiveSection(null)}>Volver</button>
          </div>
          <p className="helper-text">Elegí el rango de fechas y revisá tu tendencia. Usá 7, 30 o 90 días para accesos rápidos.</p>
          <div className="filters-row" aria-label="Filtros de período" role="group">
            <div>
              <label>Desde: </label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="evolution-select" />
            </div>
            <div>
              <label>Hasta: </label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="evolution-select" />
            </div>
            <div className="inline-actions">
              <button type="button" className="btn-secondary" onClick={() => { setDateFrom(new Date(Date.now()-7*86400000).toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)); }}>7d</button>
              <button type="button" className="btn-secondary" onClick={() => { setDateFrom(new Date(Date.now()-30*86400000).toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)); }}>30d</button>
              <button type="button" className="btn-secondary" onClick={() => { setDateFrom(new Date(Date.now()-90*86400000).toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)); }}>90d</button>
              <button type="button" className="btn-secondary" onClick={() => { setDateFrom(''); setDateTo(''); }}>Todo</button>
              <button type="button" className="btn-danger" onClick={() => { setDateFrom(''); setDateTo(''); }}>Limpiar</button>
            </div>
          </div>
          <LogrosProgreso weightData={weightData} exerciseData={exerciseData} sesiones={sesiones} metric={metric} />
          <ResumenProgreso ultimo={ultimo} semanal={semanal} mensual={mensual} />
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
        </div>
      )}

      {activeSection === 'historial' && (
        <div className="card-section" ref={historialRef}>
          <div className="card-section-header">
            <div className="card-section-title">Historial</div>
            <button type="button" className="back-link" onClick={() => { setActiveSection(null); setHistorialTab('progreso'); }}>Volver</button>
          </div>
          <p className="helper-text">Filtrá por fechas, tocá un registro para editar o usá el ícono para eliminar.</p>
          <div className="filters-row">
            <div>
              <label>Desde: </label>
              <input type="date" value={historialDateFrom} onChange={e => setHistorialDateFrom(e.target.value)} className="evolution-select" />
            </div>
            <div>
              <label>Hasta: </label>
              <input type="date" value={historialDateTo} onChange={e => setHistorialDateTo(e.target.value)} className="evolution-select" />
            </div>
            <div className="inline-actions">
              <button type="button" className="btn-secondary" onClick={() => { setHistorialDateFrom(new Date(Date.now()-7*86400000).toISOString().slice(0,10)); setHistorialDateTo(new Date().toISOString().slice(0,10)); }}>7d</button>
              <button type="button" className="btn-secondary" onClick={() => { setHistorialDateFrom(new Date(Date.now()-30*86400000).toISOString().slice(0,10)); setHistorialDateTo(new Date().toISOString().slice(0,10)); }}>30d</button>
              <button type="button" className="btn-secondary" onClick={() => { setHistorialDateFrom(new Date(Date.now()-90*86400000).toISOString().slice(0,10)); setHistorialDateTo(new Date().toISOString().slice(0,10)); }}>90d</button>
              <button type="button" className="btn-secondary" onClick={() => { setHistorialDateFrom(''); setHistorialDateTo(''); }}>Todo</button>
              <button type="button" className="btn-danger" onClick={() => { setHistorialDateFrom(''); setHistorialDateTo(''); }}>Limpiar filtros</button>
            </div>
          </div>

          <div className="section-divider">Progreso corporal</div>
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
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
                {filteredProgress.length === 0 ? (
                  <tr><td colSpan="5" className="empty-state">No hay registros en el período seleccionado.</td></tr>
                ) : (
                  filteredProgress.map((r, i) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="section-divider">Logs de ejercicios</div>
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
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state">No hay logs en el período seleccionado.</td></tr>
                ) : (
                  filteredLogs.map((l, i) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modales */}
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

      {toast && <ToastOptimized type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Evolution; 