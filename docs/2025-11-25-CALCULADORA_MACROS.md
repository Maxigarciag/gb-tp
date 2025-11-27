# Calculadora de Macronutrientes - 25 de Noviembre 2025

## Resumen del trabajo

Se implementó una nueva calculadora de macronutrientes integrada en la sección de Composición Corporal, junto con mejoras visuales y de rendimiento.

## Cambios realizados

### Nueva funcionalidad
- Calculadora de macronutrientes completa con cálculo de BMR, TDEE y distribución de macros
- Sistema de tabs para alternar entre calculadora US Navy y Macros
- Integración con perfil de usuario (auto-completa peso, altura, edad, género)

### Archivos creados
- `src/components/MacroCalculator/` - 7 componentes optimizados con memo
- `src/utils/macroCalculations.js` - Lógica de cálculos separada
- `src/styles/MacroCalculator.css` - Estilos unificados
- `src/styles/ComposicionTabs.css` - Estilos para tabs

### Archivos modificados
- `src/components/progreso/ComposicionCorporalCard.jsx` - Integración de tabs
- `src/styles/BodyFatCalculator.css` - Unificación visual con MacroCalculator
- `src/styles/ProgresoCards.css` - Botón volver reubicado

### Mejoras visuales
- Estilos unificados entre ambas calculadoras
- Botón "Volver" reubicado a esquina superior izquierda (fixed)
- Tabs centrados y responsive
- Optimización móvil completa

### Optimizaciones de rendimiento
- Todos los componentes con `memo()`
- Uso de `useCallback` y `useMemo` donde corresponde
- Lazy loading para ambas calculadoras
- Constantes extraídas fuera de componentes

