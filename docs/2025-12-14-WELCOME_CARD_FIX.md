## Resumen diario 2025-12-14

- Se eliminó la animación CSS global en las tarjetas del dashboard para evitar solaparse con las variantes de Framer Motion.
- Se centralizó la carga de estilos de `HomeDashboard` removiendo el import duplicado en `MotivationCard` para garantizar orden consistente de hojas de estilo.
- Impacto esperado: la card de bienvenida/motivación deja de presentar estilos residuales al navegar entre componentes.
- Rediseño de la card de racha en gestión de rutina: nueva badge de nivel, stats reorganizados y barra de progreso hacia el siguiente nivel para reflejar el sistema de rachas actualizado.
- La sección de gestión de rutina ya no muestra la card de racha (StreakCard), para mantener el foco solo en métricas de la rutina activa y evitar mezclar información de sesiones/rachas en ese bloque.
- Se añadió un bloque de “Objetivo del usuario” en la rutina activa: muestra el objetivo principal (perder grasa / ganar músculo / mantener) tomado del perfil y un hint breve.
- Motivación: la barra de progreso ahora usa un porcentaje clamped para evitar valores NaN/undefined y asegurar que siempre se renderice correctamente.

