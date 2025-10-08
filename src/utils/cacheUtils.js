/**
 * Utilidades para manejo de caché y refresh de datos
 */

/**
 * Limpia el caché de datos de progreso para un usuario específico
 * @param {string} userId - ID del usuario
 */
export const clearProgressCache = (userId) => {
  if (!userId) return;
  
  try {
    const userKey = (k) => `u:${userId}:${k}`;
    
    // Lista de claves a limpiar
    const keysToRemove = [
      'progressDateFrom',
      'progressDateTo', 
      'historyDateFrom',
      'historyDateTo',
      'selectedExercise',
      'metric',
      'bodyMetric',
      'histExercise'
    ];
    
    // Limpiar claves específicas del usuario
    keysToRemove.forEach(key => {
      localStorage.removeItem(userKey(key));
    });
    
    // También limpiar claves globales obsoletas
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🧹 Caché de progreso limpiado para usuario:', userId);
  } catch (error) {
    console.warn('Error limpiando caché de progreso:', error);
  }
};

/**
 * Dispara un evento personalizado para forzar refresh de componentes de progreso
 * @param {string} userId - ID del usuario
 * @param {string} source - Fuente del refresh (ej: 'navigation', 'manual')
 */
export const triggerProgressRefresh = (userId, source = 'navigation') => {
  if (!userId) return;
  
  try {
    window.dispatchEvent(new CustomEvent('progreso-page-refresh', { 
      detail: { 
        userId, 
        source,
        timestamp: Date.now()
      } 
    }));
    
    console.log(`🔄 Evento de refresh disparado desde ${source} para usuario:`, userId);
  } catch (error) {
    console.warn('Error disparando evento de refresh:', error);
  }
};

/**
 * Limpia caché y dispara refresh en una sola operación
 * @param {string} userId - ID del usuario
 * @param {string} source - Fuente del refresh
 */
export const forceProgressRefresh = (userId, source = 'navigation') => {
  clearProgressCache(userId);
  triggerProgressRefresh(userId, source);
};

/**
 * Verifica si hay datos cacheados obsoletos
 * @param {string} userId - ID del usuario
 * @returns {boolean} - true si hay caché obsoleto
 */
export const hasStaleProgressCache = (userId) => {
  if (!userId) return false;
  
  try {
    const userKey = (k) => `u:${userId}:${k}`;
    const lastRefresh = localStorage.getItem(userKey('lastProgressRefresh'));
    
    if (!lastRefresh) return true;
    
    const now = Date.now();
    const lastRefreshTime = parseInt(lastRefresh, 10);
    const maxAge = 5 * 60 * 1000; // 5 minutos
    
    return (now - lastRefreshTime) > maxAge;
  } catch (error) {
    console.warn('Error verificando caché obsoleto:', error);
    return true;
  }
};

/**
 * Marca el último refresh de progreso
 * @param {string} userId - ID del usuario
 */
export const markProgressRefresh = (userId) => {
  if (!userId) return;
  
  try {
    const userKey = (k) => `u:${userId}:${k}`;
    localStorage.setItem(userKey('lastProgressRefresh'), Date.now().toString());
  } catch (error) {
    console.warn('Error marcando refresh de progreso:', error);
  }
};
