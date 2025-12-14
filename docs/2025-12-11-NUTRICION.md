# Resumen de cambios (2025-12-11)

- Se creó el dominio de nutrición con hub principal, páginas de macros y registro de comidas, respetando el layout y lazy loading existentes.
- La Calculadora de Macronutrientes se movió desde progreso a nutrición manteniendo diseño, lógica y estilos, eliminando duplicados.
- Se agregaron las nuevas rutas `/nutricion`, `/nutricion/macros` y `/nutricion/registro-comidas`, junto con la pestaña “Nutrición” en los HeaderTabs por defecto.
- Se preparó el módulo de Registro de Comidas con estructura JSX lista para integrar los archivos TS y reutilizar hooks/utilidades.
- Se organizaron nuevos estilos en `src/styles/components/nutricion/` para las vistas y componentes creados.
- Se integró la nueva calculadora de macros por alimento (con Supabase y búsqueda online) dentro de `registro-comidas`, lista para extender el flujo de diario alimenticio.
- Se añadió el tracker de comidas diario (MealsTracker) con búsqueda/bandeja de alimentos, altas/bajas por comida y totales diarios, usando Supabase y estilos propios del dominio nutrición.
- Se retiró el stub `src/pages/nutricion.jsx` para unificar el patrón: las páginas se cargan directamente desde `features/.../pages`.
- Se refinó la tarjeta principal de la calculadora de macros con borde, fondo degradado y sombra para separar visualmente el módulo del resto de la página.
- Se eliminó el submenú de tabs en la landing de nutrición para evitar redundancia con los CTA principales, manteniendo navegación mediante botones y tarjetas.

