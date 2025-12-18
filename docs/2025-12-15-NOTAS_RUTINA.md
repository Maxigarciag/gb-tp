# Resumen de cambios - 2025-12-15

- Agregada tabla `routine_day_notes` con RLS para notas por día de rutina (favoritas y rotación de no favoritas, trigger de `updated_at`).
- Extendida librería Supabase con CRUD de notas y poda automática de no favoritas para mantener solo 3.
- Nuevo store `useRoutineNotesStore` para cargar panel, historial y aplicar rotación en el cliente.
- Componentes de notas: panel principal, ítem, modal de creación/edición e historial, con estilos dedicados.
- Integrado el panel de notas en `CalendarioRutina`, ahora muestra notas del día seleccionado.

