# Esquema de Base de Datos - GetBig Fitness App

## Resumen del Esquema

Este esquema está diseñado para una aplicación de fitness que permite a los usuarios crear rutinas personalizadas, registrar entrenamientos y hacer seguimiento de su progreso.

## Tablas Principales

### 1. user_profiles
Extiende la tabla `auth.users` de Supabase con información específica del formulario de fitness.

**Campos principales:**
- `id` (uuid) - Referencia a auth.users
- `altura`, `peso`, `edad` - Datos físicos del usuario
- `sexo` - Masculino/Femenino
- `objetivo` - ganar_musculo, perder_grasa, mantener
- `experiencia` - principiante, intermedio, avanzado
- `tiempo_entrenamiento` - 30_min, 1_hora, 2_horas
- `dias_semana` - 3_dias, 4_dias, 6_dias

### 2. exercises
Catálogo maestro de ejercicios disponibles.

**Campos principales:**
- `nombre` - Nombre del ejercicio
- `grupo_muscular` - Pecho, Espalda, Piernas, etc.
- `descripcion` - Descripción del ejercicio
- `instrucciones` - Array de pasos para ejecutar
- `consejos` - Array de consejos de ejecución
- `musculos_trabajados` - Array de músculos que trabaja
- `es_compuesto` - Boolean para ejercicios compuestos

### 3. workout_routines
Rutinas de entrenamiento creadas por los usuarios.

**Campos principales:**
- `user_id` - Propietario de la rutina
- `nombre` - Nombre de la rutina
- `tipo_rutina` - FULL BODY, UPPER LOWER, PUSH PULL LEGS, ARNOLD SPLIT
- `dias_por_semana` - Número de días de entrenamiento
- `es_activa` - Boolean para rutina actualmente en uso

### 4. routine_days
Días específicos dentro de una rutina.

**Campos principales:**
- `routine_id` - Rutina a la que pertenece
- `dia_semana` - Lunes, Martes, etc.
- `nombre_dia` - "Push Day", "Pull Day", etc.
- `es_descanso` - Boolean para días de descanso
- `orden` - Orden del día en la rutina

### 5. routine_exercises
Ejercicios asignados a cada día de rutina.

**Campos principales:**
- `routine_day_id` - Día al que pertenece
- `exercise_id` - Ejercicio asignado
- `series` - Número de series
- `repeticiones_min/max` - Rango de repeticiones
- `peso_sugerido` - Peso recomendado
- `tiempo_descanso` - Descanso entre series

### 6. workout_sessions
Sesiones de entrenamiento realizadas por el usuario.

**Campos principales:**
- `user_id` - Usuario que realizó la sesión
- `routine_id` - Rutina utilizada (opcional)
- `fecha` - Fecha del entrenamiento
- `hora_inicio/fin` - Timestamps de inicio y fin
- `duracion_minutos` - Campo calculado automáticamente
- `completada` - Boolean de sesión completada
- `calificacion` - Calificación del 1-5

### 7. exercise_logs
Registro detallado de cada ejercicio en una sesión.

**Campos principales:**
- `session_id` - Sesión a la que pertenece
- `exercise_id` - Ejercicio realizado
- `serie_numero` - Número de serie
- `repeticiones` - Repeticiones realizadas
- `peso` - Peso utilizado
- `rpe` - Rate of Perceived Exertion (1-10)

### 8. user_progress
Seguimiento del progreso físico del usuario.

**Campos principales:**
- `user_id` - Usuario
- `fecha` - Fecha del registro
- `peso_corporal` - Peso corporal
- `porcentaje_grasa` - Porcentaje de grasa corporal
- `masa_muscular` - Masa muscular
- `medidas` - JSONB con medidas corporales
- `fotos` - Array de URLs de fotos de progreso

## Características del Esquema

### Seguridad (RLS)
- Todas las tablas tienen Row Level Security habilitado
- Los usuarios solo pueden acceder a sus propios datos
- El catálogo de ejercicios es de lectura pública

### Optimización
- Índices en campos frecuentemente consultados
- Campos calculados automáticamente (duración de sesiones)
- Triggers para actualizar timestamps

### Integridad de Datos
- Constraints para validar rangos de valores
- Claves foráneas para mantener relaciones
- Campos únicos donde corresponde

## Relaciones Principales

```
auth.users (1) → (1) user_profiles
auth.users (1) → (N) workout_routines
workout_routines (1) → (N) routine_days
routine_days (1) → (N) routine_exercises
exercises (1) → (N) routine_exercises
auth.users (1) → (N) workout_sessions
workout_sessions (1) → (N) exercise_logs
exercises (1) → (N) exercise_logs
auth.users (1) → (N) user_progress
```

## Migración desde Datos Hardcodeados

Para migrar tus datos actuales:

1. **Ejercicios**: Los datos de `src/utils/ejercicios.js` se migran a la tabla `exercises`
2. **Rutinas**: Los datos de `src/utils/rutinas.js` se convierten en plantillas para crear rutinas personalizadas
3. **Formularios**: Los datos del formulario se guardan en `user_profiles`
4. **Sesiones**: Los entrenamientos realizados se registran en `workout_sessions` y `exercise_logs`

## Próximos Pasos

1. Ejecutar las migraciones en Supabase
2. Configurar las variables de entorno
3. Implementar la autenticación en la aplicación
4. Migrar los componentes para usar la base de datos
5. Implementar funcionalidades de seguimiento de progreso