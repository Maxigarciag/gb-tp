### Ajuste de experiencia móvil para el calendario semanal

Se corrigió el comportamiento visual del componente WeeklyCalendar en móviles:
- Se mantuvo la cuadrícula en tres columnas aun en pantallas pequeñas, ajustando los mínimos para que las tarjetas permanezcan estiradas y desplazables sin agruparse.
- Se estabilizaron los indicadores de página, evitando la deformación de los puntos activos y manteniendo proporciones uniformes en todos los breakpoints.
- Se reforzó el ancho efectivo del modo swipe para ocupar todo el contenedor sin desbordes inesperados.

Impacto esperado: navegación táctil más clara, tarjetas distribuidas de forma pareja en móviles y marcadores de página consistentes. No se modificó la lógica de datos ni la funcionalidad de arrastre con los dedos.

### Destacado de próximo entrenamiento corrige día completado

- El banner de “Próximo Entrenamiento” ahora omite el día actual si la sesión de hoy ya fue completada y muestra el siguiente día con entrenamiento programado.
- Se priorizan días con ejercicios (no descanso) respetando el orden semanal, evitando que se repita el día de hoy cuando ya se registró como completado.

### Barra de progreso en motivación a ancho completo

- La barra de progreso en la tarjeta de motivación ocupa ahora el 100% del contenedor, evitando encogimientos intermitentes en navegación o cambios de layout.

### Leyenda del calendario alineada con estados visuales

- Los estados “Programado” y “Descanso” ahora tienen tonos visibles y coherentes entre la leyenda y las tarjetas del calendario (azul suave para programado, gris tenue para descanso), facilitando distinguirlos igual que “Completado” y “Hoy”.
- Se actualizó “Programado” a un tono amarillo (var(--color-warning)) para diferenciarlo con claridad de los estados en cian.

### Resumen de progreso se refresca al completar entrenamientos

- `ProgressDashboard` ahora escucha el evento `progreso-page-refresh`, recargando las sesiones y pesos al finalizar un entrenamiento, evitando que la actividad semanal quede en 0 tras completar la sesión del día.
- Se corrigió el conteo semanal usando fechas locales (sin desfase por zona horaria) para que las sesiones completadas hoy se contabilicen de inmediato.
- Se deduplican sesiones por fecha al contar la actividad semanal/mensual, evitando sumar múltiples registros del mismo día.

