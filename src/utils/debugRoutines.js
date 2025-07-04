/**
 * debugRoutines.js
 * 
 * Utilidades de debug para limpiar y recrear rutinas
 */

import { supabase } from '../lib/supabase.js';
import { rutinas } from './rutinas.js';
import { obtenerConfiguracionEjercicios, obtenerConfiguracionObjetivo } from './rutinas.js';

// Función para limpiar completamente la rutina actual del usuario
export const limpiarRutinaActual = async () => {
  try {
    console.log('🧹 Iniciando limpieza de rutina actual...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    // 1. Obtener rutinas activas del usuario
    const { data: rutinasActivas, error: fetchError } = await supabase
      .from('workout_routines')
      .select('id')
      .eq('user_id', user.id)
      .eq('es_activa', true);

    if (fetchError) {
      console.error('❌ Error obteniendo rutinas activas:', fetchError);
      return { success: false, error: fetchError };
    }

    if (!rutinasActivas || rutinasActivas.length === 0) {
      console.log('ℹ️ No hay rutinas activas para limpiar');
      return { success: true, message: 'No hay rutinas activas' };
    }

    const routineIds = rutinasActivas.map(r => r.id);
    console.log('📋 Rutinas a eliminar:', routineIds);

    // 2. Obtener días de rutina
    const { data: diasRutina, error: diasError } = await supabase
      .from('routine_days')
      .select('id')
      .in('routine_id', routineIds);

    if (diasError) {
      console.error('❌ Error obteniendo días de rutina:', diasError);
      return { success: false, error: diasError };
    }

    const dayIds = diasRutina?.map(d => d.id) || [];
    console.log('📅 Días de rutina a eliminar:', dayIds);

    // 3. Eliminar ejercicios de rutina
    if (dayIds.length > 0) {
      const { error: ejerciciosError } = await supabase
        .from('routine_exercises')
        .delete()
        .in('routine_day_id', dayIds);

      if (ejerciciosError) {
        console.error('❌ Error eliminando ejercicios:', ejerciciosError);
        return { success: false, error: ejerciciosError };
      }
      console.log('✅ Ejercicios eliminados');
    }

    // 4. Eliminar días de rutina
    if (dayIds.length > 0) {
      const { error: diasDeleteError } = await supabase
        .from('routine_days')
        .delete()
        .in('id', dayIds);

      if (diasDeleteError) {
        console.error('❌ Error eliminando días:', diasDeleteError);
        return { success: false, error: diasDeleteError };
      }
      console.log('✅ Días de rutina eliminados');
    }

    // 5. Eliminar rutinas
    const { error: rutinasError } = await supabase
      .from('workout_routines')
      .delete()
      .in('id', routineIds);

    if (rutinasError) {
      console.error('❌ Error eliminando rutinas:', rutinasError);
      return { success: false, error: rutinasError };
    }

    console.log('✅ Rutinas eliminadas');
    console.log('🎉 Limpieza completada exitosamente');

    return { success: true, message: 'Rutina eliminada completamente' };

  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return { success: false, error: error.message };
  }
};

// Función para recrear rutina con la lógica corregida
export const recrearRutinaCorregida = async (userProfile) => {
  try {
    console.log('🔄 Iniciando recreación de rutina con lógica corregida...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (!userProfile) {
      console.error('❌ No hay perfil de usuario');
      return { success: false, error: 'No hay perfil de usuario' };
    }

    // 1. Determinar tipo de rutina
    const rutinasPosibles = {
      ganar_musculo: {
        "30_min": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "PUSH PULL LEGS"
        },
        "1_hora": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "PUSH PULL LEGS" 
        },
        "2_horas": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "ARNOLD SPLIT" 
        }
      },
      perder_grasa: {
        "30_min": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "PUSH PULL LEGS"
        },
        "1_hora": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "PUSH PULL LEGS" 
        },
        "2_horas": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "PUSH PULL LEGS", 
          "6_dias": "ARNOLD SPLIT" 
        }
      },
      mantener: {
        "30_min": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "PUSH PULL LEGS"
        },
        "1_hora": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "PUSH PULL LEGS" 
        },
        "2_horas": { 
          "3_dias": "PUSH PULL LEGS 3D", 
          "4_dias": "UPPER LOWER", 
          "6_dias": "UPPER LOWER" 
        }
      }
    };

    const tipoRutina = rutinasPosibles[userProfile.objetivo]?.[userProfile.tiempo_entrenamiento]?.[userProfile.dias_semana];
    
    if (!tipoRutina) {
      console.error('❌ No se pudo determinar el tipo de rutina');
      return { success: false, error: 'No se pudo determinar el tipo de rutina' };
    }

    console.log('🏋️ Tipo de rutina:', tipoRutina);

    // 2. Crear rutina
    const routineData = {
      user_id: user.id,
      nombre: `Mi Rutina Personalizada - ${tipoRutina}`,
      tipo_rutina: tipoRutina,
      dias_por_semana: parseInt(userProfile.dias_semana.split('_')[0]),
      es_activa: true
    };

    const { data: newRoutine, error: routineError } = await supabase
      .from('workout_routines')
      .insert([routineData])
      .select()
      .single();

    if (routineError) {
      console.error('❌ Error creando rutina:', routineError);
      return { success: false, error: routineError };
    }

    console.log('✅ Rutina creada:', newRoutine.id);

    // 3. Crear días de rutina
    const rutinaPredefinida = rutinas[tipoRutina];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const diasRutina = [];
    let orden = 1;

    diasSemana.forEach((dia) => {
      const descripcionDia = rutinaPredefinida[dia];
      const esDescanso = descripcionDia.toLowerCase().includes('descanso') || 
                        descripcionDia.toLowerCase().includes('cardio');
      
      const nombreCorto = crearNombreCorto(descripcionDia, dia);
      
      diasRutina.push({
        routine_id: newRoutine.id,
        dia_semana: dia,
        nombre_dia: nombreCorto,
        descripcion: descripcionDia,
        es_descanso: esDescanso,
        orden: orden++
      });
    });

    const { data: diasCreados, error: diasError } = await supabase
      .from('routine_days')
      .insert(diasRutina)
      .select();

    if (diasError) {
      console.error('❌ Error creando días:', diasError);
      return { success: false, error: diasError };
    }

    console.log('✅ Días creados:', diasCreados.length);

    // 4. Asignar ejercicios a cada día
    for (const dia of diasCreados) {
      if (!dia.es_descanso) {
        await asignarEjerciciosCorregidos(dia.id, dia.descripcion, userProfile);
      }
    }

    console.log('🎉 Rutina recreada exitosamente');
    return { success: true, message: 'Rutina recreada con lógica corregida' };

  } catch (error) {
    console.error('❌ Error recreando rutina:', error);
    return { success: false, error: error.message };
  }
};

// Función corregida para asignar ejercicios
const asignarEjerciciosCorregidos = async (dayId, descripcionDia, userProfile) => {
  try {
    console.log('🏋️ Asignando ejercicios corregidos para:', descripcionDia);
    
    // Extraer grupos musculares con lógica corregida
    const gruposMusculares = extraerGruposMuscularesCorregido(descripcionDia);
    console.log('💪 Grupos musculares:', gruposMusculares);
    
    if (gruposMusculares.length === 0) {
      console.log('⚠️ No se encontraron grupos musculares');
      return;
    }
    
    // Obtener configuración
    const configEjercicios = obtenerConfiguracionEjercicios(
      userProfile.tiempo_entrenamiento, 
      userProfile.experiencia || 'principiante'
    );
    const configObjetivo = obtenerConfiguracionObjetivo(userProfile.objetivo);
    
    // Obtener ejercicios de la base de datos
    const { data: ejerciciosBasicos, error: ejerciciosError } = await supabase
      .from('exercises')
      .select('*');
    
    if (ejerciciosError) {
      console.error('❌ Error obteniendo ejercicios:', ejerciciosError);
      return;
    }
    
    // Mapear grupos musculares a ejercicios
    const ejerciciosPorGrupo = {};
    gruposMusculares.forEach(grupo => {
      const ejerciciosDelGrupo = ejerciciosBasicos.filter(ejercicio => 
        ejercicio.grupo_muscular === grupo
      );
      if (ejerciciosDelGrupo.length > 0) {
        ejerciciosPorGrupo[grupo] = ejerciciosDelGrupo;
      }
    });
    
    // Seleccionar ejercicios de manera equilibrada
    const ejerciciosSeleccionados = [];
    const ejerciciosPorDia = configEjercicios.ejerciciosPorDia;
    const ejerciciosBasePorGrupo = Math.floor(ejerciciosPorDia / gruposMusculares.length);
    const ejerciciosExtra = ejerciciosPorDia % gruposMusculares.length;
    
    gruposMusculares.forEach((grupo, index) => {
      if (ejerciciosPorGrupo[grupo]) {
        let ejerciciosATomar = ejerciciosBasePorGrupo;
        if (index < ejerciciosExtra) {
          ejerciciosATomar += 1;
        }
        
        const ejerciciosDelGrupo = ejerciciosPorGrupo[grupo]
          .sort((a, b) => {
            if (configObjetivo.prioridad === "compuestos") {
              if (a.es_compuesto && !b.es_compuesto) return -1;
              if (!a.es_compuesto && b.es_compuesto) return 1;
            }
            return 0;
          })
          .slice(0, ejerciciosATomar);
        
        ejerciciosSeleccionados.push(...ejerciciosDelGrupo);
      }
    });
    
    const ejerciciosFinales = ejerciciosSeleccionados.slice(0, ejerciciosPorDia);
    console.log('🏋️ Ejercicios seleccionados:', ejerciciosFinales.length);

    // Asignar ejercicios al día
    for (let i = 0; i < ejerciciosFinales.length; i++) {
      const ejercicio = ejerciciosFinales[i];
      const [min, max] = configEjercicios.repeticiones.split('-').map(Number);
      
      const exerciseData = {
        routine_day_id: dayId,
        exercise_id: ejercicio.id,
        series: configEjercicios.series,
        repeticiones_min: min,
        repeticiones_max: max,
        peso_sugerido: calcularPesoSugerido(ejercicio, userProfile.peso),
        tiempo_descanso: configEjercicios.descanso,
        orden: i + 1
      };

      const { error: exerciseError } = await supabase
        .from('routine_exercises')
        .insert(exerciseData);

      if (exerciseError) {
        console.error(`❌ Error asignando ejercicio ${i + 1}:`, exerciseError);
      }
    }
    
    console.log('✅ Ejercicios asignados al día');
  } catch (error) {
    console.error('❌ Error asignando ejercicios:', error);
  }
};

// Función corregida para extraer grupos musculares
const extraerGruposMuscularesCorregido = (descripcion) => {
  const descripcionLower = descripcion.toLowerCase();
  const gruposEncontrados = [];
  
  // Mapeo directo de grupos musculares específicos
  const mapeoDirecto = {
    'pecho': 'Pecho',
    'espalda': 'Espalda',
    'hombros': 'Hombros',
    'bíceps': 'Brazos',
    'tríceps': 'Brazos',
    'brazos': 'Brazos',
    'cuádriceps': 'Cuádriceps',
    'isquiotibiales': 'Isquiotibiales',
    'gemelos': 'Gemelos',
    'core': 'Core',
    'abdomen': 'Core',
    'abdominales': 'Core'
  };
  
  // Primero buscar grupos musculares específicos
  Object.keys(mapeoDirecto).forEach(grupoDescripcion => {
    if (descripcionLower.includes(grupoDescripcion)) {
      gruposEncontrados.push(mapeoDirecto[grupoDescripcion]);
    }
  });
  
  // Si no se encontraron grupos específicos, usar categorías generales
  if (gruposEncontrados.length === 0) {
    const mapeoCategorias = {
      'push': ['Pecho', 'Hombros', 'Brazos'],
      'pull': ['Espalda', 'Brazos'],
      'upper': ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
      'lower': ['Cuádriceps', 'Isquiotibiales', 'Gemelos', 'Core'],
      'piernas': ['Cuádriceps', 'Isquiotibiales', 'Gemelos'],
      'full body': ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Cuádriceps', 'Isquiotibiales', 'Gemelos', 'Core']
    };
    
    Object.keys(mapeoCategorias).forEach(categoria => {
      if (descripcionLower.includes(categoria)) {
        gruposEncontrados.push(...mapeoCategorias[categoria]);
      }
    });
  }
  
  // Eliminar duplicados
  const gruposUnicos = [...new Set(gruposEncontrados)];
  
  if (gruposUnicos.length === 0) {
    if (descripcionLower.includes('descanso') || descripcionLower.includes('cardio')) {
      return ['Core'];
    }
  }
  
  return gruposUnicos;
};

// Función para crear nombres cortos
const crearNombreCorto = (descripcion, diaSemana) => {
  if (descripcion.toLowerCase().includes('descanso')) {
    return 'Descanso';
  }
  
  const grupos = extraerGruposMuscularesCorregido(descripcion);
  if (grupos.length > 0) {
    const gruposCapitalizados = grupos.map(grupo => 
      grupo.charAt(0).toUpperCase() + grupo.slice(1)
    );
    return gruposCapitalizados.join(', ');
  }
  
  return diaSemana;
};

// Función para calcular peso sugerido
const calcularPesoSugerido = (ejercicio, pesoUsuario) => {
  if (!pesoUsuario) return 0;
  
  const porcentajes = {
    'Pecho': 0.6,
    'Espalda': 0.5,
    'Piernas': 0.8,
    'Hombros': 0.3,
    'Brazos': 0.2,
    'Core': 0.1,
  };
  
  const porcentaje = porcentajes[ejercicio.grupo_muscular] || 0.3;
  return Math.round(pesoUsuario * porcentaje);
};

// Función principal para limpiar y recrear
export const limpiarYRecrearRutina = async (userProfile) => {
  console.log('🚀 Iniciando proceso de limpieza y recreación...');
  
  // 1. Limpiar rutina actual
  const limpieza = await limpiarRutinaActual();
  if (!limpieza.success) {
    console.error('❌ Error en limpieza:', limpieza.error);
    return limpieza;
  }
  
  // 2. Recrear rutina con lógica corregida
  const recreacion = await recrearRutinaCorregida(userProfile);
  if (!recreacion.success) {
    console.error('❌ Error en recreación:', recreacion.error);
    return recreacion;
  }
  
  console.log('🎉 Proceso completado exitosamente');
  return { success: true, message: 'Rutina limpiada y recreada exitosamente' };
};

// Función para verificar el estado actual
export const verificarEstadoRutina = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ Usuario no autenticado');
      return;
    }

    const { data: rutinas, error } = await supabase
      .from('workout_routines')
      .select(`
        *,
        routine_days (
          *,
          routine_exercises (
            *,
            exercises (*)
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('es_activa', true);

    if (error) {
      console.error('❌ Error obteniendo rutinas:', error);
      return;
    }

    console.log('📊 Estado actual de rutinas:');
    console.log('Rutinas activas:', rutinas?.length || 0);
    
    rutinas?.forEach((rutina, index) => {
      console.log(`\n🏋️ Rutina ${index + 1}:`);
      console.log('- ID:', rutina.id);
      console.log('- Tipo:', rutina.tipo_rutina);
      console.log('- Días:', rutina.routine_days?.length || 0);
      
      rutina.routine_days?.forEach((dia, diaIndex) => {
        console.log(`  📅 Día ${diaIndex + 1} (${dia.dia_semana}):`);
        console.log('  - Nombre:', dia.nombre_dia);
        console.log('  - Descripción:', dia.descripcion);
        console.log('  - Es descanso:', dia.es_descanso);
        console.log('  - Ejercicios:', dia.routine_exercises?.length || 0);
        
        if (dia.routine_exercises && dia.routine_exercises.length > 0) {
          const gruposPorEjercicio = dia.routine_exercises.map(re => re.exercises?.grupo_muscular);
          console.log('  - Grupos musculares:', gruposPorEjercicio);
        }
      });
    });

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
}; 