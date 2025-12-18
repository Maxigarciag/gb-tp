## Rediseño del carrusel de rutina

- Se actualizó `CalendarioRutina.jsx` para que el stack muestre solo la tarjeta principal y dos vistas previas desplazadas hacia la derecha (roles current, next, upcoming), eliminando la previa izquierda.
- Se ajustaron los estilos en `src/styles/components/rutinas/CalendarioRutina.css` para alinear el stack a la izquierda, ampliar la tarjeta principal y apilar las previas con desplazamientos y escalas decrecientes.
- El comportamiento de selección se mantiene: al hacer clic en cualquier tarjeta visible se navega al índice absoluto correspondiente.
- Se quitó el loop infinito: ahora el stack se clampa entre 0 y `len - 1`, evitando saltar de domingo a lunes y viceversa.
- Se comprimió la vista de previas: se aumentó el solape y se redujo la escala/opacidad de las tarjetas next/upcoming para que se vea menos contenido adelantado.
- Se añadió una flecha minimalista a la izquierda del stack para retroceder al día anterior; se desactiva automáticamente al estar en el primer día.
- La flecha ahora vive dentro de la tarjeta actual (esquina inferior izquierda) y se simplificó a un glifo sin fondo ni borde.
- Se reposicionó la flecha debajo de la línea punteada inferior y se eliminaron efectos de “lift” al hover/active.
- Se elevó ligeramente la línea punteada inferior para dejar más aire sobre la flecha.
- Se removió cualquier estilo por defecto de foco/hover que generara círculos de fondo en la flecha (appearance/outline reset).
- Se añadieron resets extra (hover/active/focus + tap highlight) para evitar cualquier círculo o fondo en la flecha.
- Se redujo más la escala/opacidad de las tarjetas next/upcoming para que pierdan protagonismo a medida que se alejan.
- Días de descanso: título fijo “Descanso” y mensaje por defecto invitando a recuperar energía; los días sin datos ahora muestran “Día no configurado”.

### Impacto esperado
- Mayor foco en el día actual sin perder contexto de los siguientes dos días.
- Transiciones y alturas conservan consistencia con el resto de la vista pasiva de rutina.

### Próximos pasos sugeridos
- Validar en móvil que los solapes laterales no corten contenido clave.
- Probar con rutinas de 1 y 2 días para confirmar degradación ordenada de las vistas previas.

