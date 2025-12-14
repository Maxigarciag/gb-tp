# Resumen de cambios – 2025-12-14

- Se reescribió por completo el componente de Resumen de Progreso para basarlo únicamente en datos reales de peso, % de grasa, sesiones y objetivo activo.
- Se añadió comportamiento colapsable con persistencia por usuario, expandido por defecto para perfiles nuevos.
- Se rediseñó la experiencia mobile-first: layout vertical, métricas una por fila y CTAs con alto contraste; en desktop se organiza en grid compacto.
- Se implementaron estados vacíos explícitos y CTAs únicos cuando falta peso, % grasa o entrenamientos, evitando cualquier dato supuesto.
- La lógica de cálculo se separó y documentó dentro del componente (sin heredar la implementación previa) para mantener claridad y mantenibilidad.

