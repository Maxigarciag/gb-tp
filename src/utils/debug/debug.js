export const debugLog = (...args) => {
  // Solo loguea en desarrollo
  try {
    if (!import.meta.env || !import.meta.env.PROD) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  } catch (_) {
    // En caso de que import.meta no exista, no hacer nada
  }
};



