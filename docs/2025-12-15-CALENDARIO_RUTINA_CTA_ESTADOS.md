## Contexto
Se ajustó el botón de llamado a la acción del componente `CalendarioRutina` para que refleje el estado real del entrenamiento diario. El objetivo es evitar mensajes genéricos y mostrar al usuario si la sesión ya fue completada, si está pendiente para hoy o, en su defecto, cuándo es el próximo entrenamiento agendado.

## Alcance
- Vista: `CalendarioRutina` (rutinas v2).
- Botón: `cta primary cta-entrenar`.

## Cambios realizados
1) **Detección de sesión del día**  
   - Se consulta `workout_sessions` en Supabase usando el usuario autenticado, la rutina activa y el `routine_day_id` del día actual.  
   - Se obtiene el registro de la fecha de hoy; si existe y está marcado como `completada`, se considera la sesión finalizada.
   - Se intenta primero con la fecha en UTC (`toISOString().split('T')[0]`) y, si no hay sesión, se reintenta con la fecha local (zona horaria del dispositivo) para evitar desfaces.  
   - Fallback: si el `routine_day_id` cambió recientemente, se busca sesión por rutina + fecha para no perder el estado completado.

2) **Estado del botón**  
   - Día de entrenamiento pendiente: muestra “Entrenar ahora” con ícono de pesas.  
   - Día de entrenamiento completado: muestra “Sesión de entrenamiento terminada”, ícono de check y estado deshabilitado con estilo de completado.  
   - Durante la comprobación remota: texto “Comprobando estado...” mientras se resuelve la consulta.

3) **Mensajes cuando hoy no se entrena**  
   - Si no hay entrenamiento hoy, se informa el siguiente entrenamiento disponible con su nombre de día y el tiempo relativo (hoy, mañana o número de días).  
   - Si la rutina no tiene días de entrenamiento configurados, se aclara que no hay entrenamientos programados.

## Resultado esperado
- El CTA refleja el estado real de la sesión del día sin requerir navegación a la pantalla de entrenamiento.  
- Los usuarios evitan iniciar una sesión ya completada y reciben feedback claro sobre la próxima fecha de entrenamiento cuando hoy no corresponde entrenar.

