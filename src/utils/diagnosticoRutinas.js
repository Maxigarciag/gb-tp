/**
 * diagnosticoRutinas.js
 * 
 * Script de diagnóstico para verificar problemas en la asignación de rutinas
 */

import { rutinas } from './rutinas.js';

export const diagnosticarRutinas = () => {
  // Función de diagnóstico silenciosa para producción
  // Los logs se han removido para limpiar la consola
};

// Función para extraer grupos musculares (copiada del Formulario)
const extraerGruposMusculares = (descripcion) => {
  // Mapeo de grupos musculares en las descripciones a grupos musculares en la base de datos
  const mapeoGrupos = {
    'pecho': 'Pecho',
    'espalda': 'Espalda',
    'hombros': 'Hombros',
    'bíceps': 'Brazos',
    'tríceps': 'Brazos',
    'brazos': 'Brazos',
    'cuádriceps': 'Cuádriceps',
    'isquiotibiales': 'Isquiotibiales',
    'gemelos': 'Gemelos',
    'piernas': ['Cuádriceps', 'Isquiotibiales', 'Gemelos'], // Piernas incluye múltiples grupos
    'core': 'Core'
  };
  
  const descripcionLower = descripcion.toLowerCase();
  const gruposEncontrados = [];
  
  // Buscar grupos musculares en la descripción
  Object.keys(mapeoGrupos).forEach(grupoDescripcion => {
    if (descripcionLower.includes(grupoDescripcion)) {
      const grupoDB = mapeoGrupos[grupoDescripcion];
      if (Array.isArray(grupoDB)) {
        // Si es un array (como "piernas"), agregar todos los grupos
        gruposEncontrados.push(...grupoDB);
      } else {
        // Si es un string, agregar el grupo
        gruposEncontrados.push(grupoDB);
      }
    }
  });
  
  // Eliminar duplicados
  const gruposUnicos = [...new Set(gruposEncontrados)];
  
  return gruposUnicos;
};

// Función para crear nombres cortos (copiada del Formulario)
const crearNombreCorto = (descripcion, diaSemana) => {
  if (descripcion.toLowerCase().includes('descanso')) {
    return 'Descanso';
  }
  
  // Extraer grupos musculares para crear un nombre corto
  const grupos = extraerGruposMusculares(descripcion);
  if (grupos.length > 0) {
    // Capitalizar la primera letra de cada grupo
    const gruposCapitalizados = grupos.map(grupo => 
      grupo.charAt(0).toUpperCase() + grupo.slice(1)
    );
    return gruposCapitalizados.join(', ');
  }
  
  // Si no se pueden extraer grupos, usar el día de la semana
  return diaSemana;
};

// Función para verificar datos de la base de datos
export const diagnosticarBaseDeDatos = async (userRoutine) => {
  // Función de diagnóstico silenciosa para producción
  // Los logs se han removido para limpiar la consola
}; 