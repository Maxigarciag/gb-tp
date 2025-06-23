/**
 * validaciones.js
 * 
 * Este archivo contiene funciones de validación para asegurar que los datos ingresados
 * por el usuario sean correctos y estén dentro de rangos razonables.
 * Se usa en formularios para validar altura, peso y edad antes de procesar la información.
 */

const RANGO_VALIDACIONES = {
  altura: { min: 100, max: 250 },
  peso: { min: 30, max: 300 },
  edad: { min: 12, max: 120 }
};

/**
 * Valida los datos ingresados en el formulario.
 * @param {Object} datos - Objeto con altura, peso y edad.
 * @returns {Object} - Retorna un objeto con errores si hay fallos, o { success: true } si es válido.
 */
export const validarDatos = (datos) => {
  const errores = {};

  for (const key in RANGO_VALIDACIONES) {
    const valor = datos[key];
    const { min, max } = RANGO_VALIDACIONES[key];

    if (isNaN(valor)) {
      errores[key] = `El valor de ${key} debe ser un número válido.`;
      continue;
    }

    if (valor < min || valor > max) {
      errores[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} fuera de rango (${min}-${max}).`;
    }
  }

  return Object.keys(errores).length > 0 ? { success: false, errores } : { success: true };
};