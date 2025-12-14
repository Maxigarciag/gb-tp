import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userProgress, exerciseLogs, workoutSessions, bodyCompositionStudies } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import UnifiedBodyChart from './UnifiedBodyChart';
import ExerciseProgressChart from './ExerciseProgressChart';
import HeaderTabs from '@/features/navigation/components/HeaderTabs';

import '@/styles/components/progreso/Evolution.css';
import { FaTrash, FaEdit, FaWeight, FaChartLine, FaHistory, FaDumbbell } from 'react-icons/fa';
import ConfirmDialogOptimized from '@/features/common/components/ConfirmDialogOptimized';

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

const Evolution = ({ defaultSection = null, hideGuide = false, onShowNavigation = null, isInternalNavigation = false, navigationTabs = null }) => {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [weightData, setWeightData] = useState([])
  const [exerciseData, setExerciseData] = useState([])
  const [allExercises, setAllExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ peso: '', grasa: '', musculo: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', data: null })
  const isMobile = useIsMobile()

  // Manejar body overflow cuando el modal está abierto
  useEffect(() => {
    if (confirmModal.show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [confirmModal.show])

  // Refs para navegación guiada
  const chartsRef = useRef(null)
  const exerciseChartsRef = useRef(null)
  const historialRef = useRef(null)
  const weightFormRef = useRef(null)

  const [activeSection, setActiveSection] = useState(defaultSection)

  // Sincronizar activeSection cuando cambia defaultSection
  useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection)
    }
  }, [defaultSection])

  // Filtros
  const [searchParams, setSearchParams] = useSearchParams()
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '')
  const [metric, setMetric] = useState('peso')
  const [bodyMetric, setBodyMetric] = useState('all')
  const [sesiones, setSesiones] = useState([])
  const [historialTab, setHistorialTab] = useState('progreso')
  const [histExercise, setHistExercise] = useState('')
  const [progressSort, setProgressSort] = useState({ key: 'fecha', dir: 'desc' })
  const [logsSort, setLogsSort] = useState({ key: 'created_at', dir: 'desc' })
  const [historialDateFrom, setHistorialDateFrom] = useState(searchParams.get('histFrom') || '')
  const [historialDateTo, setHistorialDateTo] = useState(searchParams.get('histTo') || '')
  const [studyDates, setStudyDates] = useState([])

  // Helpers para persistencia por usuario
  const userKey = (k) => `u:${userProfile?.id || 'anon'}:${k}`

  // Debounce helper
  function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay)
      return () => clearTimeout(t)
    }, [value, delay])
    return debounced
  }

  const debouncedFrom = useDebouncedValue(dateFrom, 250);
  const debouncedTo = useDebouncedValue(dateTo, 250);
  const debouncedHistFrom = useDebouncedValue(historialDateFrom, 250);
  const debouncedHistTo = useDebouncedValue(historialDateTo, 250);

  // Cargar último rango de fechas guardado (si no viene en URL) y resto de filtros
  useEffect(() => {
    try {
      if (!searchParams.get('from') && !searchParams.get('to')) {
        const savedFrom = localStorage.getItem(userKey('progressDateFrom')) || localStorage.getItem('progressDateFrom') || '';
        const savedTo = localStorage.getItem(userKey('progressDateTo')) || localStorage.getItem('progressDateTo') || '';
        if (savedFrom || savedTo) {
          setDateFrom(savedFrom);
          setDateTo(savedTo);
        }
      }
      if (!searchParams.get('histFrom') && !searchParams.get('histTo')) {
        const savedHistFrom = localStorage.getItem(userKey('historyDateFrom')) || localStorage.getItem('historyDateFrom') || '';
        const savedHistTo = localStorage.getItem(userKey('historyDateTo')) || localStorage.getItem('historyDateTo') || '';
        if (savedHistFrom || savedHistTo) {
          setHistorialDateFrom(savedHistFrom);
          setHistorialDateTo(savedHistTo);
        }
      }
      const savedExercise = localStorage.getItem(userKey('selectedExercise'))
      if (savedExercise) setSelectedExercise(savedExercise)
      const savedMetric = localStorage.getItem(userKey('metric'))
      if (savedMetric) setMetric(savedMetric)
      const savedBodyMetric = localStorage.getItem(userKey('bodyMetric'))
      if (savedBodyMetric) setBodyMetric(savedBodyMetric)
      const savedHistExercise = localStorage.getItem(userKey('histExercise'))
      if (savedHistExercise) setHistExercise(savedHistExercise)
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar filtros con la URL (solo si no es navegación interna)
  useEffect(() => {
    if (isInternalNavigation) return; // No sincronizar URL si es navegación interna

    const next = new URLSearchParams(searchParams);
    if (debouncedFrom) next.set('from', debouncedFrom); else next.delete('from');
    // Solo sincronizar URL si NO estamos dentro de una card (hideGuide = false)
    if (!hideGuide) {
      if (debouncedTo) next.set('to', debouncedTo); else next.delete('to');
      if (historialTab) next.set('histTab', historialTab);
      if (debouncedHistFrom) next.set('histFrom', debouncedHistFrom); else next.delete('histFrom');
      if (debouncedHistTo) next.set('histTo', debouncedHistTo); else next.delete('histTo');
      if (selectedExercise) next.set('exercise', selectedExercise); else next.delete('exercise');
      if (metric) next.set('metric', metric);
      if (bodyMetric) next.set('bodyMetric', bodyMetric);

      const currentTab = searchParams.get('tab');
      const isInternalNavigationFromURL = ['evolucion', 'logros', 'graficos', 'peso', 'grasa', 'musculo'].includes(currentTab);

      if (!isInternalNavigationFromURL) {
        next.set('tab', 'evolucion');
      }
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFrom, debouncedTo, historialTab, debouncedHistFrom, debouncedHistTo, selectedExercise, metric, bodyMetric, isInternalNavigation]);

  // Guardar en localStorage el último rango elegido
  useEffect(() => {
    try {
      if (debouncedFrom != null) localStorage.setItem(userKey('progressDateFrom'), debouncedFrom);
      if (debouncedTo != null) localStorage.setItem(userKey('progressDateTo'), debouncedTo);
    } catch (_) { }
  }, [debouncedFrom, debouncedTo, userProfile?.id]);
  useEffect(() => {
    try {
      if (debouncedHistFrom != null) localStorage.setItem(userKey('historyDateFrom'), debouncedHistFrom);
      if (debouncedHistTo != null) localStorage.setItem(userKey('historyDateTo'), debouncedHistTo);
    } catch (_) { }
  }, [debouncedHistFrom, debouncedHistTo, userProfile?.id]);

  // Persistir ejercicio/metric/histExercise
  useEffect(() => {
    if (selectedExercise != null) localStorage.setItem(userKey('selectedExercise'), selectedExercise)
  }, [selectedExercise, userProfile?.id])
  useEffect(() => {
    if (metric != null) localStorage.setItem(userKey('metric'), metric)
  }, [metric, userProfile?.id])
  useEffect(() => {
    if (bodyMetric != null) localStorage.setItem(userKey('bodyMetric'), bodyMetric)
  }, [bodyMetric, userProfile?.id])
  useEffect(() => {
    if (histExercise != null) localStorage.setItem(userKey('histExercise'), histExercise)
  }, [histExercise, userProfile?.id])
  const [editModal, setEditModal] = useState({ open: false, registro: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, registro: null });
  const [editForm, setEditForm] = useState({ peso: '', grasa: '', musculo: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editLogModal, setEditLogModal] = useState({ open: false, log: null });
  const [deleteLogConfirm, setDeleteLogConfirm] = useState({ open: false, log: null });
  const [editLogForm, setEditLogForm] = useState({ peso: '', reps: '', rpe: '' });
  const pesoInputRef = useRef(null);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Si es un refresh forzado, limpiar datos antes de cargar
      if (forceRefresh) {
        setWeightData([]);
        setExerciseData([]);
      }

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

      // Obtener fechas de estudios para marcadores en gráficos
      const { data: dates, error: datesError } = await bodyCompositionStudies.getStudyDates();
      if (!datesError && dates) setStudyDates(dates);
    } catch (err) {
      setWeightData([]);
      setExerciseData([]);
      setAllExercises([]);
      setSesiones([]);
      setStudyDates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) fetchData();
    // eslint-disable-next-line
  }, [userProfile]);

  // Escuchar eventos de refresh desde la página de progreso
  useEffect(() => {
    const handleProgresoRefresh = (event) => {
      if (event.detail?.userId === userProfile?.id) {
        fetchData(true)
      }
    }

    window.addEventListener('progreso-page-refresh', handleProgresoRefresh)

    return () => {
      window.removeEventListener('progreso-page-refresh', handleProgresoRefresh)
    }
  }, [userProfile?.id])

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar registro (se llama tras confirmación si corresponde)
  const persistProgress = async (dataToSave) => {
    setFormLoading(true);
    setToast(null);
    try {
      const payload = {
        user_id: userProfile.id,
        fecha: new Date().toISOString().slice(0, 10),
        peso: Number(dataToSave.peso),
        grasa: dataToSave.grasa !== '' ? Number(dataToSave.grasa) : null,
        musculo: dataToSave.musculo !== '' ? Number(dataToSave.musculo) : null
      };

      const { error } = await userProgress.create(payload);
      if (error) throw error;

      setToast({ type: 'success', message: '¡Progreso registrado exitosamente!' });
      setForm({ peso: '', grasa: '', musculo: '' });

      // Refrescar datos y luego navegar
      await fetchData();

      // Navegar después de un breve delay para mostrar el toast
      setTimeout(() => {
        // Forzar navegación usando window.location si React Router no funciona
        window.location.href = '/progreso';
      }, 1000);
    } catch (err) {
      setToast({ type: 'error', message: 'Error al guardar. Intenta de nuevo.' })
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async e => {
    e.preventDefault();

    if (!form.peso) {
      setToast({ type: 'error', message: 'El peso es obligatorio.' });
      return;
    }

    // Validar rango de peso (30-300 kg según la base de datos)
    const peso = Number(form.peso);
    if (peso < 30 || peso > 300) {
      setToast({ type: 'error', message: 'El peso debe estar entre 30 y 300 kg.' });
      return;
    }

    // Validaciones suaves de rango (0–100) para porcentajes
    const grasaNum = form.grasa !== '' ? Number(form.grasa) : null;
    const musculoNum = form.musculo !== '' ? Number(form.musculo) : null;

    if (grasaNum != null && (grasaNum < 0 || grasaNum > 100)) {
      setToast({ type: 'error', message: '% grasa debe estar entre 0 y 100.' });
      return;
    }
    if (musculoNum != null && (musculoNum < 0 || musculoNum > 100)) {
      setToast({ type: 'error', message: '% músculo debe estar entre 0 y 100.' });
      return;
    }

    // Siempre mostrar confirmación cuando hay datos previos
    let needsConfirm = false;
    const alerts = [];

    if (ultimo) {
      const lastDate = new Date(ultimo.fecha + 'T00:00:00');
      const now = new Date();
      const hours = Math.abs(now - lastDate) / 36e5;

      // Siempre confirmar si hay datos previos
      needsConfirm = true;

      if (ultimo.peso && Number(ultimo.peso) > 0) {
        const delta = Math.abs(Number(form.peso) - Number(ultimo.peso));
        const rel = (delta / Number(ultimo.peso)) * 100;
        if (rel > 0) {
          alerts.push(`Peso: cambio de ${rel.toFixed(1)}% respecto a hace ${Math.round(hours)}h`);
        }
      }
      if (ultimo.grasa != null && ultimo.grasa > 0 && grasaNum != null) {
        const delta = Math.abs(grasaNum - Number(ultimo.grasa));
        const rel = (delta / Number(ultimo.grasa)) * 100;
        if (rel > 0) {
          alerts.push(`% Grasa: cambio de ${rel.toFixed(1)}% respecto a hace ${Math.round(hours)}h`);
        }
      }
      if (ultimo.musculo != null && ultimo.musculo > 0 && musculoNum != null) {
        const delta = Math.abs(musculoNum - Number(ultimo.musculo));
        const rel = (delta / Number(ultimo.musculo)) * 100;
        if (rel > 0) {
          alerts.push(`% Músculo: cambio de ${rel.toFixed(1)}% respecto a hace ${Math.round(hours)}h`);
        }
      }

      // Si no hay cambios detectados, mostrar mensaje genérico
      if (alerts.length === 0) {
        alerts.push(`Registrando datos para el ${new Date().toLocaleDateString()}`);
      }
    }

    if (needsConfirm) {
      const message = `Confirmar registro de progreso:\n\n${alerts.map(alert => `• ${alert}`).join('\n')}\n\n¿Confirmás que los valores son correctos?`;

      // Mostrar modal profesional usando portal
      setConfirmModal({
        show: true,
        message,
        data: { ...form }
      });
      return;
    }

    // Si no hay cambios inusuales, guardar directamente
    persistProgress(form);
  };


  // Manejar confirmación del modal profesional
  const handleModalConfirm = async () => {
    if (confirmModal.data) {
      // Cerrar el modal primero
      setConfirmModal({ show: false, message: '', data: null });
      // Luego guardar y navegar
      await persistProgress(confirmModal.data);
    }
  };

  const handleModalCancel = () => {
    setConfirmModal({ show: false, message: '', data: null });
    setToast({ type: 'info', message: 'Registro cancelado por el usuario.' });
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
    const base = weightData.filter(r => {
      if (debouncedHistFrom && r.fecha < debouncedHistFrom) return false;
      if (debouncedHistTo && r.fecha > debouncedHistTo) return false;
      return true;
    });
    const sorted = [...base].sort((a, b) => {
      const dir = progressSort.dir === 'asc' ? 1 : -1;
      if (progressSort.key === 'fecha') {
        return (a.fecha > b.fecha ? 1 : -1) * dir;
      }
      return 0;
    });
    return sorted;
  }, [weightData, debouncedHistFrom, debouncedHistTo, progressSort]);
  const filteredLogs = useMemo(() => {
    const base = exerciseData.filter(l => {
      const fecha = l.created_at?.slice(0, 10);
      if (debouncedHistFrom && fecha < debouncedHistFrom) return false;
      if (debouncedHistTo && fecha > debouncedHistTo) return false;
      if (histExercise && l.exercises?.nombre !== histExercise) return false;
      return true;
    });
    const sorted = [...base].sort((a, b) => {
      const dir = logsSort.dir === 'asc' ? 1 : -1;
      if (logsSort.key === 'created_at') {
        const da = a.created_at || ''
        const db = b.created_at || ''
        return (da > db ? 1 : -1) * dir;
      }
      if (['peso', 'reps', 'rpe'].includes(logsSort.key)) {
        const av = a[logsSort.key] ?? 0
        const bv = b[logsSort.key] ?? 0
        return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
      }
      if (logsSort.key === 'ejercicio') {
        const av = a.exercises?.nombre || ''
        const bv = b.exercises?.nombre || ''
        return (av > bv ? 1 : -1) * dir;
      }
      return 0;
    });
    return sorted;
  }, [exerciseData, debouncedHistFrom, debouncedHistTo, histExercise, logsSort]);

  const primerUso = (!weightData || weightData.length === 0) && (!exerciseData || exerciseData.length === 0);
  const showGuide = true;
  const handleDismissGuide = () => { };

  const irARutina = () => {
    const next = new URLSearchParams(searchParams);
    // Limpiar parámetros internos y navegar al tab principal
    next.delete('histTab');
    next.delete('histFrom');
    next.delete('histTo');
    next.delete('exercise');
    next.delete('metric');
    next.delete('bodyMetric');
    next.delete('from');
    next.delete('to');
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
        } catch (_) { }
      })
    }
  }

  // Función para manejar el botón "Volver" - ocultar contenido y mostrar navegación
  const handleBackToNavigation = () => {
    // Si hideGuide es true, significa que estamos en una página con rutas, navegar a /progreso
    if (hideGuide) {
      navigate('/progreso');
    } else if (onShowNavigation) {
      onShowNavigation(); // Mostrar el panel de navegación
      setActiveSection(null); // Ocultar el contenido de la sección
    } else {
      setActiveSection(null); // Fallback al comportamiento original
    }
  };

  // (Atajos removidos a pedido: el usuario ingresará manualmente los valores)

  // Export helpers
  const exportProgressCSV = () => {
    const header = ['Fecha', 'Peso', '% Grasa', '% Músculo']
    const rows = filteredProgress.map(r => [r.fecha, r.peso ?? '', r.grasa ?? '', r.musculo ?? ''])
    const csv = [header, ...rows].map(cols => cols.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'progreso_corporal.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  const exportLogsCSV = () => {
    const header = ['Fecha', 'Ejercicio', 'Peso', 'Reps', 'RPE']
    const rows = filteredLogs.map(l => [l.created_at?.slice(0, 10) || '', l.exercises?.nombre || '', l.peso ?? '', l.reps ?? '', l.rpe ?? ''])
    const csv = [header, ...rows].map(cols => cols.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'logs_ejercicios.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const progressCount = filteredProgress.length
  const logsCount = filteredLogs.length
  const toggleProgressSort = (key) => {
    setProgressSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }
  const toggleLogsSort = (key) => {
    setLogsSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  // --- Cálculo de resumen visual ---
  // Último registro (memoizado)
  const ultimo = useMemo(() => (weightData && weightData.length > 0 ? weightData[0] : null), [weightData]);

  // Autocompletar con último valor al abrir la sección de registro
  useEffect(() => {
    if (activeSection === 'weight' && ultimo) {
      setForm(prev => ({
        peso: prev.peso !== '' ? prev.peso : (ultimo.peso != null ? String(ultimo.peso) : ''),
        grasa: prev.grasa !== '' ? prev.grasa : (ultimo.grasa != null ? String(ultimo.grasa) : ''),
        musculo: prev.musculo !== '' ? prev.musculo : (ultimo.musculo != null ? String(ultimo.musculo) : ''),
      }));
    }
  }, [activeSection, ultimo]);

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
      {/* HeaderTabs integrado dentro de la card - Oculto en móviles */}
      {navigationTabs && navigationTabs.length > 0 && !isMobile && (
        <div className="evolution-header-tabs">
          <HeaderTabs items={navigationTabs} className="evolution-tabs-inline" />
        </div>
      )}

      {activeSection === null && !hideGuide && (
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
                <div className="action-title">Gráficos Corporales</div>
                <div className="action-desc">Peso, % grasa y % músculo</div>
              </div>
            </button>
            <button type="button" className={`guide-action-card ${activeSection === 'exerciseCharts' ? 'is-active' : ''}`} onClick={() => { const next = activeSection === 'exerciseCharts' ? null : 'exerciseCharts'; setActiveSection(next); if (next === 'exerciseCharts') { requestAnimationFrame(() => exerciseChartsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); } }}>
              <div className="action-icon"><FaDumbbell /></div>
              <div className="action-content">
                <div className="action-title">Gráficos de ejercicios</div>
                <div className="action-desc">Evolución por ejercicio: peso, reps y RPE</div>
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
              <button type="button" className="btn-secondary" onClick={handleBackToNavigation} disabled={formLoading}>Cancelar</button>
              <button type="submit" disabled={formLoading} className="btn-primary">{formLoading ? 'Guardando...' : 'Registrar'}</button>
            </div>
          </form>
        </div>
      )}

      {activeSection === 'charts' && (
        <div className="card-section" ref={chartsRef}>
          <div className="card-section-header">
            <div className="card-section-title">Evolución Corporal</div>
            <p className="helper-text">
              Visualizá tu progreso con gráficos de peso, grasa y músculo a lo largo del tiempo.
            </p>
          </div>

          <div className="evolution-charts-section">
            <div className="filters-row" aria-label="Filtros de período" role="group">
              <div>
                <label>Desde: </label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="evolution-select" />
              </div>
              <div>
                <label>Hasta: </label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="evolution-select" />
              </div>
              <div>
                <label>Métrica: </label>
                <select value={bodyMetric} onChange={e => setBodyMetric(e.target.value)} className="evolution-select">
                  <option value="all">Todas</option>
                  <option value="peso">Peso</option>
                  <option value="grasa">% Grasa</option>
                  <option value="musculo">% Músculo</option>
                  <option value="grasaCalculada">% Grasa Corporal (US Navy)</option>
                </select>
              </div>
              <div className="inline-actions">
                <button type="button" className="btn-secondary" onClick={() => { setDateFrom(''); setDateTo(''); }}>Limpiar filtros</button>
              </div>
            </div>
            <div className="evolution-charts">
              <div className="evolution-chart-card" style={{ gridColumn: '1 / -1' }}>
                <UnifiedBodyChart data={filteredWeightData} metric={bodyMetric} studyDates={studyDates} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'exerciseCharts' && (
        <div className="card-section" ref={exerciseChartsRef}>
          <div className="card-section-header">
            <div className="card-section-title">Gráficos de ejercicios</div>
          </div>
          <p className="helper-text">Elegí el ejercicio y la métrica a visualizar. Podés acotar el período.</p>
          <div className="filters-row" aria-label="Filtros de ejercicio" role="group">
            <div>
              <label>Ejercicio: </label>
              <select value={selectedExercise || ''} onChange={e => setSelectedExercise(e.target.value)} className="evolution-select">
                {allExercises.length === 0 && <option value="">(Sin ejercicios)</option>}
                {allExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Métrica: </label>
              <select value={metric} onChange={e => setMetric(e.target.value)} className="evolution-select">
                <option value="peso">Peso (kg)</option>
                <option value="reps">Reps</option>
                <option value="rpe">RPE</option>
              </select>
            </div>
            <div>
              <label>Desde: </label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="evolution-select" />
            </div>
            <div>
              <label>Hasta: </label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="evolution-select" />
            </div>
          </div>
          <ExerciseProgressChart data={filteredExerciseLogs} ejercicio={selectedExercise} metric={metric} />
        </div>
      )}



      {activeSection === 'historial' && (
        <div className="card-section" ref={historialRef}>
          <div className="card-section-header">
            <div className="card-section-title">Historial</div>
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
            <div>
              <label>Ejercicio: </label>
              <select value={histExercise} onChange={e => setHistExercise(e.target.value)} className="evolution-select">
                <option value="">(Todos)</option>
                {allExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            {(historialDateFrom || historialDateTo || histExercise) && (
              <div className="active-filters" aria-label="Filtros activos">
                {(historialDateFrom || historialDateTo) && (
                  <button type="button" className="chip" onClick={() => { setHistorialDateFrom(''); setHistorialDateTo(''); }}>
                    Fechas: {historialDateFrom || '—'} → {historialDateTo || '—'} <span className="close">×</span>
                  </button>
                )}
                {histExercise && (
                  <button type="button" className="chip" onClick={() => setHistExercise('')}>
                    Ejercicio: {histExercise} <span className="close">×</span>
                  </button>
                )}
              </div>
            )}

            <div className="inline-actions">
              <button type="button" className="btn-danger" onClick={() => { setHistorialDateFrom(''); setHistorialDateTo(''); }}>Limpiar filtros</button>
              <button type="button" className="btn-secondary" onClick={exportProgressCSV} title="Exportar progreso a CSV">Exportar progreso</button>
              <button type="button" className="btn-secondary" onClick={exportLogsCSV} title="Exportar logs a CSV">Exportar logs</button>
            </div>
          </div>

          <div className="section-divider">Progreso corporal</div>
          <div className="table-wrapper">
            <table className="historial-table">
              <thead>
                <tr>
                  <th onClick={() => toggleProgressSort('fecha')} className="sortable">Fecha {progressSort.key === 'fecha' ? (progressSort.dir === 'desc' ? '▼' : '▲') : ''}</th>
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
                        <button onClick={e => { e.stopPropagation(); handleDelete(r); }} className="icon-btn danger" title="Eliminar" aria-label="Eliminar registro">
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="table-footnote">Total: {progressCount}</div>
          </div>

          <div className="section-divider">Logs de ejercicios</div>
          <div className="table-wrapper">
            <table className="historial-table">
              <thead>
                <tr>
                  <th onClick={() => toggleLogsSort('created_at')} className="sortable">Fecha {logsSort.key === 'created_at' ? (logsSort.dir === 'desc' ? '▼' : '▲') : ''}</th>
                  <th onClick={() => toggleLogsSort('ejercicio')} className="sortable">Ejercicio {logsSort.key === 'ejercicio' ? (logsSort.dir === 'desc' ? '▼' : '▲') : ''}</th>
                  <th onClick={() => toggleLogsSort('peso')} className="sortable">Peso (kg) {logsSort.key === 'peso' ? (logsSort.dir === 'desc' ? '▼' : '▲') : ''}</th>
                  <th onClick={() => toggleLogsSort('reps')} className="sortable">Reps {logsSort.key === 'reps' ? (logsSort.dir === 'desc' ? '▼' : '▲') : ''}</th>
                  <th onClick={() => toggleLogsSort('rpe')} className="sortable">RPE {logsSort.key === 'rpe' ? (logsSort.dir === 'desc' ? '▼' : '▲') : ''}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state">No hay logs en el período seleccionado.</td></tr>
                ) : (
                  filteredLogs.map((l, i) => (
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => handleEditLog(l)}>
                      <td>{l.created_at?.slice(0, 10)}</td>
                      <td>{l.exercises?.nombre}</td>
                      <td>{l.peso}</td>
                      <td>{l.reps}</td>
                      <td>{l.rpe}</td>
                      <td>
                        <button onClick={e => { e.stopPropagation(); handleDeleteLog(l); }} className="icon-btn danger" title="Eliminar" aria-label="Eliminar log">
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="table-footnote">Total: {logsCount}</div>
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
                <h4>Editar log ({editLogModal.log.created_at?.slice(0, 10)} - {editLogModal.log.exercises?.nombre})</h4>
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
                <h4>¿Eliminar log de {deleteLogConfirm.log.created_at?.slice(0, 10)} - {deleteLogConfirm.log.exercises?.nombre}?</h4>
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

      {/* Modal profesional usando portal */}
      {confirmModal.show && createPortal(
        <div
          className="modal-overlay"
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleModalCancel();
            }
          }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '500px',
              width: '90%',
              backgroundColor: 'var(--bg-primary)',
              padding: '32px',
              borderRadius: '16px',
              border: '2px solid var(--border-light)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              animation: 'modalSlideIn 0.3s ease-out',
              opacity: 0,
              transform: 'translateY(-20px) scale(0.95)',
              animationFillMode: 'forwards',
              position: 'relative'
            }}
          >
            <h4 style={{
              marginBottom: '16px',
              color: 'var(--text-primary)',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Confirmar registro
            </h4>
            <p style={{
              whiteSpace: 'pre-line',
              marginBottom: '24px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              fontSize: '0.95rem'
            }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={handleModalCancel}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Revisar
              </button>
              <button
                className="btn-primary"
                onClick={handleModalConfirm}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

Evolution.propTypes = {
  defaultSection: PropTypes.string,
  hideGuide: PropTypes.bool,
  onShowNavigation: PropTypes.func,
  isInternalNavigation: PropTypes.bool,
  navigationTabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      icon: PropTypes.elementType
    })
  )
}

export default Evolution 