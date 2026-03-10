/*
  ============================================================
  ESQUEMA COMPLETO — Aplicación de Fitness
  Migración: 20260310000000_schema_completo.sql
  ============================================================

  Este archivo es la fuente de verdad del esquema de base de
  datos. Reemplaza todas las migraciones anteriores y refleja
  el estado final correcto con todas las mejoras aplicadas.

  TABLAS:
    1.  user_profiles       — Perfil del usuario (extiende auth.users)
    2.  exercises           — Catálogo global + ejercicios personalizados
    3.  workout_routines    — Rutinas de entrenamiento del usuario
    4.  routine_days        — Días específicos de cada rutina
    5.  routine_exercises   — Ejercicios asignados a cada día
    6.  workout_sessions    — Sesiones de entrenamiento realizadas
    7.  exercise_logs       — Registro de series por sesión
    8.  user_progress       — Seguimiento de progreso corporal
    9.  meals_log           — Registro de comidas diarias
    10. routine_day_notes   — Notas por día de rutina
    11. user_streaks        — Racha de días entrenados

  SEGURIDAD:
    - RLS habilitado en todas las tablas
    - Cada usuario solo puede ver y modificar sus propios datos
    - El catálogo global de ejercicios es de solo lectura para usuarios
    - Solo el dueño puede crear/editar/borrar sus ejercicios personalizados

  INTEGRIDAD:
    - Todas las FK hacia auth.users tienen ON DELETE CASCADE
    - Una sola rutina activa por usuario (índice único parcial)
    - Nombre de usuario cambiable máximo 2 veces
    - RPE es opcional (0-10)

  ÍNDICES:
    - Índices compuestos en columnas de filtro frecuente
    - Índice único parcial para rutina activa
    - Índice parcial en estudios corporales
*/


-- ============================================================
-- FUNCIÓN HELPER: actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLA 1: user_profiles
-- Extiende auth.users con datos del perfil físico y objetivos.
-- El id es el mismo UUID de auth.users (relación 1:1).
-- nombre es opcional y solo se puede cambiar 2 veces.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre                text,
  nombre_changed_count  integer DEFAULT 0 CHECK (nombre_changed_count >= 0 AND nombre_changed_count <= 2),
  altura                integer NOT NULL CHECK (altura >= 100 AND altura <= 250),        -- en cm
  peso                  decimal(5,2) NOT NULL CHECK (peso >= 30 AND peso <= 300),        -- en kg
  edad                  integer NOT NULL CHECK (edad >= 12 AND edad <= 120),
  sexo                  text NOT NULL CHECK (sexo IN ('masculino', 'femenino')),
  objetivo              text NOT NULL CHECK (objetivo IN ('ganar_musculo', 'perder_grasa', 'mantener')),
  experiencia           text NOT NULL CHECK (experiencia IN ('principiante', 'intermedio', 'avanzado')),
  tiempo_entrenamiento  text NOT NULL CHECK (tiempo_entrenamiento IN ('30_min', '1_hora', '2_horas')),
  dias_semana           text NOT NULL CHECK (dias_semana IN ('3_dias', '4_dias', '6_dias')),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

COMMENT ON COLUMN user_profiles.nombre IS 'Nombre de usuario personalizado (opcional). Máximo 2 cambios permitidos.';
COMMENT ON COLUMN user_profiles.nombre_changed_count IS 'Contador de cambios de nombre. Máximo 2.';


-- ============================================================
-- TABLA 2: exercises
-- Catálogo de ejercicios. Incluye tanto los ejercicios globales
-- del sistema (es_personalizado = false, creado_por = NULL)
-- como los ejercicios creados por usuarios (es_personalizado = true,
-- creado_por = user.id). Ambos tipos conviven en la misma tabla.
-- ============================================================

CREATE TABLE IF NOT EXISTS exercises (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre              text NOT NULL UNIQUE,
  grupo_muscular      text NOT NULL,
  descripcion         text,
  instrucciones       text[],
  consejos            text[],
  musculos_trabajados text[],
  dificultad          text CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado')) DEFAULT 'principiante',
  equipamiento        text,
  es_compuesto        boolean DEFAULT false,
  es_personalizado    boolean DEFAULT false,                                      -- true = creado por un usuario
  creado_por          uuid REFERENCES auth.users(id) ON DELETE CASCADE,           -- NULL = ejercicio global del sistema
  created_at          timestamptz DEFAULT now()
);

COMMENT ON COLUMN exercises.es_personalizado IS 'false = ejercicio global del catálogo. true = creado por un usuario específico.';
COMMENT ON COLUMN exercises.creado_por IS 'NULL para ejercicios globales. UUID del usuario para ejercicios personalizados.';


-- ============================================================
-- TABLA 3: workout_routines
-- Rutinas de entrenamiento personalizadas del usuario.
-- Solo puede haber una rutina activa por usuario a la vez
-- (garantizado por índice único parcial más abajo).
-- ============================================================

CREATE TABLE IF NOT EXISTS workout_routines (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre              text NOT NULL,
  tipo_rutina         text NOT NULL CHECK (tipo_rutina IN (
                        'FULL BODY',
                        'UPPER LOWER',
                        'PUSH PULL LEGS',
                        'PUSH PULL LEGS 3D',
                        'ARNOLD SPLIT'
                      )),
  descripcion         text,
  dias_por_semana     integer NOT NULL CHECK (dias_por_semana >= 1 AND dias_por_semana <= 7),
  duracion_estimada   text,
  es_activa           boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);


-- ============================================================
-- TABLA 4: routine_days
-- Días específicos que componen una rutina.
-- nombre_dia es descriptivo: "Push Day", "Pierna", etc.
-- es_descanso indica días de recuperación activa.
-- ============================================================

CREATE TABLE IF NOT EXISTS routine_days (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id    uuid NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  dia_semana    text NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
  nombre_dia    text NOT NULL,   -- ej: "Push Day", "Pull Day", "Leg Day"
  descripcion   text,
  es_descanso   boolean DEFAULT false,
  orden         integer NOT NULL,
  created_at    timestamptz DEFAULT now()
);


-- ============================================================
-- TABLA 5: routine_exercises
-- Ejercicios asignados a un día de rutina específico.
-- Define series, rango de repeticiones y peso sugerido.
-- Un ejercicio no puede repetirse en el mismo día (UNIQUE).
-- ============================================================

CREATE TABLE IF NOT EXISTS routine_exercises (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id    uuid NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id       uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  series            integer NOT NULL DEFAULT 3 CHECK (series >= 1 AND series <= 10),
  repeticiones_min  integer CHECK (repeticiones_min >= 1),
  repeticiones_max  integer CHECK (repeticiones_max >= repeticiones_min),
  peso_sugerido     decimal(5,2),
  tiempo_descanso   integer,    -- en segundos
  notas             text,
  orden             integer NOT NULL,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(routine_day_id, exercise_id)
);


-- ============================================================
-- TABLA 6: workout_sessions
-- Registro de sesiones de entrenamiento realizadas.
-- duracion_minutos es una columna calculada automáticamente
-- a partir de hora_inicio y hora_fin.
-- ============================================================

CREATE TABLE IF NOT EXISTS workout_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id        uuid REFERENCES workout_routines(id) ON DELETE SET NULL,
  routine_day_id    uuid REFERENCES routine_days(id) ON DELETE SET NULL,
  fecha             date NOT NULL DEFAULT CURRENT_DATE,
  hora_inicio       timestamptz,
  hora_fin          timestamptz,
  duracion_minutos  integer GENERATED ALWAYS AS (
                      CASE
                        WHEN hora_inicio IS NOT NULL AND hora_fin IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 60
                        ELSE NULL
                      END
                    ) STORED,
  notas             text,
  calificacion      integer CHECK (calificacion >= 1 AND calificacion <= 5),
  completada        boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);


-- ============================================================
-- TABLA 7: exercise_logs
-- Registro detallado de cada serie realizada en una sesión.
-- rpe (Rate of Perceived Exertion) es opcional, escala 0-10:
--   0 = sin esfuerzo, 1-3 = muy fácil, 4-6 = moderado,
--   7-8 = difícil, 9-10 = máximo esfuerzo.
-- ============================================================

CREATE TABLE IF NOT EXISTS exercise_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id      uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  serie_numero     integer NOT NULL CHECK (serie_numero >= 1),
  repeticiones     integer NOT NULL CHECK (repeticiones >= 0),
  peso             decimal(5,2) CHECK (peso >= 0),           -- en kg, NULL = peso corporal
  tiempo_segundos  integer CHECK (tiempo_segundos >= 0),     -- para ejercicios por tiempo
  rpe              integer CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10)),
  notas            text,
  completada       boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

COMMENT ON COLUMN exercise_logs.rpe IS 'Rate of Perceived Exertion (0-10): Opcional. 0=Sin esfuerzo, 1-3=Muy fácil, 4-6=Moderado, 7-8=Difícil, 9-10=Máximo esfuerzo.';


-- ============================================================
-- TABLA 8: user_progress
-- Seguimiento del progreso corporal del usuario a lo largo
-- del tiempo. Una sola entrada por usuario por fecha.
-- estudios_corporales guarda resultados de calculadoras de
-- grasa corporal y macronutrientes en formato JSON.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_progress (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha                 date NOT NULL DEFAULT CURRENT_DATE,
  peso_corporal         decimal(5,2) CHECK (peso_corporal >= 30 AND peso_corporal <= 300),
  porcentaje_grasa      decimal(4,2) CHECK (porcentaje_grasa >= 0 AND porcentaje_grasa <= 100),
  masa_muscular         decimal(5,2),
  medidas               jsonb,             -- {"pecho": 100, "brazo": 35, "cintura": 80, ...}
  fotos                 text[],            -- URLs de fotos de progreso
  notas                 text,
  estudios_corporales   jsonb,             -- [{ bodyfat: {...}, macros: {...}, fecha_estudio: timestamp }]
  created_at            timestamptz DEFAULT now(),
  UNIQUE(user_id, fecha)
);

COMMENT ON COLUMN user_progress.medidas IS 'Medidas corporales en cm: {"pecho": 100, "brazo": 35, "cintura": 80, ...}';
COMMENT ON COLUMN user_progress.estudios_corporales IS 'Array de estudios: [{ bodyfat: {...}, macros: {...}, fecha_estudio: timestamp }]';


-- ============================================================
-- TABLA 9: meals_log
-- Registro de comidas diarias del usuario.
-- meal_type sigue los nombres usados por el frontend.
-- La FK a auth.users garantiza eliminación en cascada al
-- borrar una cuenta.
-- ============================================================

CREATE TABLE IF NOT EXISTS meals_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type       text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'merienda', 'dinner', 'snack')),
  food_name       text NOT NULL,
  quantity_grams  numeric NOT NULL,
  calories        numeric NOT NULL,
  protein         numeric NOT NULL,
  carbs           numeric NOT NULL,
  fats            numeric NOT NULL,
  date            date DEFAULT CURRENT_DATE,
  created_at      timestamptz DEFAULT now()
);

COMMENT ON COLUMN meals_log.meal_type IS 'Tipo de comida: breakfast=desayuno, lunch=almuerzo, merienda, dinner=cena, snack=colación.';


-- ============================================================
-- TABLA 10: routine_day_notes
-- Notas del usuario para un día de rutina específico.
-- es_favorita permite destacar notas importantes.
-- Máximo 4 notas por día (limitado en la capa de aplicación).
-- ============================================================

CREATE TABLE IF NOT EXISTS routine_day_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id  uuid NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenido       text NOT NULL,
  es_favorita     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- TABLA 11: user_streaks
-- Racha de días de entrenamiento consecutivos del usuario.
-- Se actualiza desde triggers o funciones server-side.
-- El frontend solo lee esta tabla, no escribe directamente.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak    integer DEFAULT 0,    -- días consecutivos actuales
  longest_streak    integer DEFAULT 0,    -- racha más larga histórica
  last_completed_day date,                -- último día que entrenó
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

COMMENT ON COLUMN user_streaks.current_streak IS 'Días de entrenamiento consecutivos actuales.';
COMMENT ON COLUMN user_streaks.longest_streak IS 'Racha más larga registrada históricamente.';
COMMENT ON COLUMN user_streaks.last_completed_day IS 'Fecha del último día de entrenamiento registrado.';


-- ============================================================
-- ÍNDICES
-- Optimizan las consultas más frecuentes de la aplicación.
-- ============================================================

-- user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_objetivo ON user_profiles(objetivo);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nombre ON user_profiles(nombre);

-- exercises
CREATE INDEX IF NOT EXISTS idx_exercises_grupo_muscular ON exercises(grupo_muscular);
CREATE INDEX IF NOT EXISTS idx_exercises_creado_por ON exercises(creado_por);   -- para filtrar ejercicios personalizados por usuario

-- workout_routines
CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_es_activa ON workout_routines(user_id, es_activa);

-- routine_days
CREATE INDEX IF NOT EXISTS idx_routine_days_routine_id ON routine_days(routine_id);

-- routine_exercises
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_day_id ON routine_exercises(routine_day_id);

-- workout_sessions
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id_fecha ON workout_sessions(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_routine_day ON workout_sessions(routine_day_id);

-- exercise_logs
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);   -- para historial por ejercicio

-- user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_fecha ON user_progress(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_estudios ON user_progress(user_id, fecha DESC) WHERE estudios_corporales IS NOT NULL;

-- meals_log
CREATE INDEX IF NOT EXISTS idx_meals_log_date ON meals_log(date);
CREATE INDEX IF NOT EXISTS idx_meals_log_user_date ON meals_log(user_id, date);   -- índice compuesto para filtros frecuentes

-- routine_day_notes
CREATE INDEX IF NOT EXISTS idx_routine_day_notes_day_created_desc ON routine_day_notes(routine_day_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routine_day_notes_user_day ON routine_day_notes(user_id, routine_day_id);

-- Garantiza que solo exista una rutina activa por usuario.
-- Si se intenta activar una segunda, la BD rechaza el INSERT/UPDATE.
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_routine_per_user
  ON workout_routines(user_id) WHERE es_activa = true;


-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_routines_updated_at
  BEFORE UPDATE ON workout_routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_routine_day_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_routine_day_notes_updated_at ON routine_day_notes;
CREATE TRIGGER trg_routine_day_notes_updated_at
  BEFORE UPDATE ON routine_day_notes
  FOR EACH ROW EXECUTE FUNCTION set_routine_day_notes_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY: habilitar en todas las tablas
-- ============================================================

ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days        ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises   ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_day_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- POLÍTICAS RLS: user_profiles
-- Los usuarios solo pueden acceder a su propio perfil.
-- DELETE es necesario para el flujo de eliminación de cuenta.
-- ============================================================

CREATE POLICY "Perfil: leer propio"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Perfil: crear propio"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Perfil: actualizar propio"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Perfil: eliminar propio"
  ON user_profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);


-- ============================================================
-- POLÍTICAS RLS: exercises
-- Lectura: cualquier usuario autenticado puede leer todos los
--          ejercicios (globales + propios personalizados).
-- Escritura: solo el dueño puede crear/editar/borrar sus propios
--            ejercicios personalizados. El catálogo global es
--            inmutable desde el frontend.
-- ============================================================

CREATE POLICY "Ejercicios: leer todos (autenticado)"
  ON exercises FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Ejercicios: leer todos (público)"
  ON exercises FOR SELECT TO public
  USING (true);

CREATE POLICY "Ejercicios: crear propios"
  ON exercises FOR INSERT TO authenticated
  WITH CHECK (es_personalizado = true AND creado_por = auth.uid());

CREATE POLICY "Ejercicios: editar propios"
  ON exercises FOR UPDATE TO authenticated
  USING (es_personalizado = true AND creado_por = auth.uid())
  WITH CHECK (es_personalizado = true AND creado_por = auth.uid());

CREATE POLICY "Ejercicios: eliminar propios"
  ON exercises FOR DELETE TO authenticated
  USING (es_personalizado = true AND creado_por = auth.uid());


-- ============================================================
-- POLÍTICAS RLS: workout_routines
-- ============================================================

CREATE POLICY "Rutinas: gestión propia"
  ON workout_routines FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- POLÍTICAS RLS: routine_days
-- Acceso verificado por la cadena: routine_day → workout_routine → user_id
-- ============================================================

CREATE POLICY "Días de rutina: gestión propia"
  ON routine_days FOR ALL TO authenticated
  USING (
    routine_id IN (SELECT id FROM workout_routines WHERE user_id = auth.uid())
  )
  WITH CHECK (
    routine_id IN (SELECT id FROM workout_routines WHERE user_id = auth.uid())
  );


-- ============================================================
-- POLÍTICAS RLS: routine_exercises
-- Acceso verificado por la cadena: routine_exercise → routine_day → workout_routine → user_id
-- ============================================================

CREATE POLICY "Ejercicios de rutina: gestión propia"
  ON routine_exercises FOR ALL TO authenticated
  USING (
    routine_day_id IN (
      SELECT rd.id FROM routine_days rd
      JOIN workout_routines wr ON rd.routine_id = wr.id
      WHERE wr.user_id = auth.uid()
    )
  )
  WITH CHECK (
    routine_day_id IN (
      SELECT rd.id FROM routine_days rd
      JOIN workout_routines wr ON rd.routine_id = wr.id
      WHERE wr.user_id = auth.uid()
    )
  );


-- ============================================================
-- POLÍTICAS RLS: workout_sessions
-- ============================================================

CREATE POLICY "Sesiones: gestión propia"
  ON workout_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- POLÍTICAS RLS: exercise_logs
-- Acceso verificado por la cadena: exercise_log → workout_session → user_id
-- ============================================================

CREATE POLICY "Logs de ejercicio: gestión propia"
  ON exercise_logs FOR ALL TO authenticated
  USING (
    session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
  )
  WITH CHECK (
    session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
  );


-- ============================================================
-- POLÍTICAS RLS: user_progress
-- ============================================================

CREATE POLICY "Progreso: gestión propio"
  ON user_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- POLÍTICAS RLS: meals_log
-- ============================================================

CREATE POLICY "Comidas: insertar propias"
  ON meals_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Comidas: leer propias"
  ON meals_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Comidas: actualizar propias"
  ON meals_log FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Comidas: eliminar propias"
  ON meals_log FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- POLÍTICAS RLS: routine_day_notes
-- ============================================================

CREATE POLICY "Notas de rutina: gestión propia"
  ON routine_day_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- POLÍTICAS RLS: user_streaks
-- El frontend solo lee. La escritura la hacen funciones/triggers.
-- ============================================================

CREATE POLICY "Rachas: leer propias"
  ON user_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Rachas: insertar propias"
  ON user_streaks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Rachas: actualizar propias"
  ON user_streaks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Rachas: eliminar propias"
  ON user_streaks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- DATOS SEMILLA: Catálogo de ejercicios
-- Ejercicios globales del sistema. es_personalizado = false,
-- creado_por = NULL. No deben ser modificados por usuarios.
-- ============================================================

-- PECHO
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Press banca plano', 'Pecho', 'Ejercicio compuesto fundamental para el desarrollo del pecho, también trabaja tríceps y hombros delanteros.',
 ARRAY['Acuéstate boca arriba en un banco plano', 'Agarra la barra con manos separadas al ancho de los hombros', 'Baja la barra al pecho de manera controlada', 'Empuja la barra hacia arriba hasta extender los brazos'],
 ARRAY['Mantén los pies firmes en el suelo', 'No arquees demasiado la espalda', 'Controla el movimiento en ambas fases', 'Respira correctamente: inhala al bajar, exhala al subir'],
 ARRAY['Pecho', 'Tríceps', 'Hombros delanteros'], 'intermedio', 'Barra y banco', true),

('Press inclinado', 'Pecho', 'Variante del press de banca que enfatiza la parte superior del pecho.',
 ARRAY['Ajusta el banco a 30-45 grados', 'Agarra la barra con grip ligeramente más ancho', 'Baja controladamente hacia la parte superior del pecho', 'Empuja hacia arriba siguiendo el ángulo del banco'],
 ARRAY['No uses un ángulo muy pronunciado', 'Mantén los omóplatos retraídos', 'Controla la trayectoria de la barra'],
 ARRAY['Pecho superior', 'Hombros delanteros', 'Tríceps'], 'intermedio', 'Barra y banco inclinado', true),

('Aperturas con mancuernas', 'Pecho', 'Ejercicio de aislamiento que proporciona un gran estiramiento al pecho.',
 ARRAY['Acuéstate en banco plano con mancuernas', 'Extiende brazos con ligera flexión en codos', 'Baja las mancuernas en arco amplio', 'Sube contrayendo el pecho'],
 ARRAY['Mantén ligera flexión en codos siempre', 'Siente el estiramiento en la parte baja', 'No bajes demasiado para evitar lesiones'],
 ARRAY['Pecho', 'Hombros delanteros'], 'principiante', 'Mancuernas y banco', false),

('Flexiones', 'Pecho', 'Ejercicio básico de peso corporal para desarrollar fuerza en el pecho.',
 ARRAY['Posición de plancha con manos al ancho de hombros', 'Baja el cuerpo manteniendo línea recta', 'Empuja hacia arriba hasta extensión completa', 'Mantén core activado'],
 ARRAY['Mantén el cuerpo rígido como tabla', 'No dejes caer las caderas', 'Controla la velocidad de ejecución'],
 ARRAY['Pecho', 'Tríceps', 'Core', 'Hombros'], 'principiante', 'Peso corporal', true);

-- HOMBROS
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Press militar', 'Hombros', 'Ejercicio compuesto fundamental para el desarrollo de los hombros.',
 ARRAY['De pie con barra a la altura de los hombros', 'Agarre al ancho de hombros', 'Empuja la barra verticalmente por encima de la cabeza', 'Baja controladamente a posición inicial'],
 ARRAY['Mantén el core activado', 'No arquees excesivamente la espalda', 'Empuja la cabeza ligeramente hacia adelante al final'],
 ARRAY['Hombros', 'Tríceps', 'Core'], 'intermedio', 'Barra', true),

('Elevaciones laterales', 'Hombros', 'Ejercicio de aislamiento para el deltoides medio.',
 ARRAY['De pie con mancuernas a los lados', 'Eleva los brazos lateralmente hasta altura de hombros', 'Baja controladamente', 'Mantén ligera flexión en codos'],
 ARRAY['No uses impulso', 'Controla especialmente la fase excéntrica', 'No subas más allá de la horizontal'],
 ARRAY['Deltoides medio'], 'principiante', 'Mancuernas', false),

('Deltoides posterior', 'Hombros', 'Ejercicio para la parte posterior del hombro, crucial para el equilibrio muscular.',
 ARRAY['Inclínate hacia adelante con mancuernas', 'Abre los brazos hacia los lados y atrás', 'Contrae los omóplatos', 'Baja controladamente'],
 ARRAY['Mantén el pecho hacia afuera', 'No uses demasiado peso', 'Enfócate en la contracción'],
 ARRAY['Deltoides posterior', 'Romboides'], 'principiante', 'Mancuernas', false),

('Face pulls', 'Hombros', 'Excelente ejercicio para deltoides posterior y salud del hombro.',
 ARRAY['Ajusta polea a altura del pecho', 'Agarra con ambas manos', 'Tira hacia la cara separando las manos', 'Contrae omóplatos al final'],
 ARRAY['Mantén codos altos', 'Separa bien las manos al final', 'Controla el movimiento'],
 ARRAY['Deltoides posterior', 'Romboides', 'Trapecio medio'], 'principiante', 'Polea', false);

-- TRÍCEPS
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Fondos', 'Tríceps', 'Ejercicio compuesto excelente para tríceps y pecho inferior.',
 ARRAY['Agárrate a las barras paralelas', 'Baja el cuerpo flexionando los codos', 'Empuja hacia arriba hasta extensión completa', 'Mantén el torso ligeramente inclinado'],
 ARRAY['No bajes demasiado para evitar lesiones', 'Mantén codos cerca del cuerpo', 'Controla la velocidad'],
 ARRAY['Tríceps', 'Pecho inferior', 'Hombros delanteros'], 'intermedio', 'Barras paralelas', true),

('Extensiones en polea', 'Tríceps', 'Ejercicio de aislamiento clásico para tríceps.',
 ARRAY['Agarra la barra o cuerda en polea alta', 'Mantén codos fijos a los lados', 'Extiende los antebrazos hacia abajo', 'Contrae al final del movimiento'],
 ARRAY['No muevas los codos', 'Mantén el torso erguido', 'Controla la fase excéntrica'],
 ARRAY['Tríceps'], 'principiante', 'Polea', false),

('Press francés', 'Tríceps', 'Ejercicio de aislamiento que proporciona gran estiramiento al tríceps.',
 ARRAY['Acostado con barra o mancuernas', 'Brazos perpendiculares al suelo', 'Baja flexionando solo los codos', 'Extiende hasta posición inicial'],
 ARRAY['Mantén codos fijos', 'No uses demasiado peso inicialmente', 'Controla especialmente la bajada'],
 ARRAY['Tríceps'], 'intermedio', 'Barra o mancuernas', false),

('Fondos en banco', 'Tríceps', 'Ejercicio de peso corporal para tríceps.',
 ARRAY['Siéntate en borde del banco con manos a los lados', 'Desliza el cuerpo hacia adelante', 'Baja flexionando los codos', 'Empuja hacia arriba'],
 ARRAY['Mantén codos cerca del cuerpo', 'No bajes demasiado', 'Puedes flexionar rodillas para facilitar'],
 ARRAY['Tríceps', 'Hombros delanteros'], 'principiante', 'Banco', false);

-- ESPALDA
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Dominadas', 'Espalda', 'Ejercicio fundamental de peso corporal para el desarrollo de la espalda.',
 ARRAY['Agarra la barra con palmas hacia adelante', 'Cuelga con brazos completamente extendidos', 'Tira del cuerpo hacia arriba hasta que la barbilla supere la barra', 'Baja controladamente'],
 ARRAY['Mantén el core activado', 'No uses impulso', 'Concéntrate en usar los músculos de la espalda', 'Si no puedes hacer una completa, usa banda elástica'],
 ARRAY['Espalda', 'Bíceps', 'Hombros'], 'avanzado', 'Barra de dominadas', true),

('Remo con barra', 'Espalda', 'Ejercicio compuesto fundamental para el grosor de la espalda.',
 ARRAY['Inclínate hacia adelante con barra en manos', 'Mantén espalda recta', 'Tira la barra hacia el abdomen', 'Contrae omóplatos al final'],
 ARRAY['Mantén rodillas ligeramente flexionadas', 'No redondees la espalda', 'Tira hacia el ombligo, no al pecho'],
 ARRAY['Espalda', 'Bíceps', 'Hombros posteriores'], 'intermedio', 'Barra', true),

('Jalón al pecho', 'Espalda', 'Ejercicio en máquina que simula las dominadas.',
 ARRAY['Siéntate en la máquina con muslos fijos', 'Agarra la barra con grip amplio', 'Tira hacia el pecho superior', 'Baja controladamente'],
 ARRAY['Inclínate ligeramente hacia atrás', 'No tires detrás del cuello', 'Contrae omóplatos'],
 ARRAY['Espalda', 'Bíceps'], 'principiante', 'Máquina de jalones', false),

('Peso muerto', 'Espalda', 'Ejercicio compuesto fundamental que trabaja toda la cadena posterior.',
 ARRAY['Barra en el suelo, pies al ancho de caderas', 'Agáchate manteniendo espalda recta', 'Levanta la barra extendiendo caderas y rodillas', 'Mantén la barra cerca del cuerpo'],
 ARRAY['Mantén pecho hacia afuera', 'No redondees la espalda', 'Empuja el suelo con los pies', 'Termina con caderas completamente extendidas'],
 ARRAY['Espalda', 'Glúteos', 'Isquiotibiales', 'Trapecios'], 'avanzado', 'Barra', true);

-- BÍCEPS
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Curl con barra', 'Bíceps', 'Ejercicio básico y fundamental para el desarrollo de los bíceps.',
 ARRAY['De pie con barra en manos, brazos extendidos', 'Flexiona los codos llevando la barra hacia arriba', 'Contrae los bíceps al final', 'Baja controladamente'],
 ARRAY['No uses impulso del cuerpo', 'Mantén codos fijos a los lados', 'Controla especialmente la bajada'],
 ARRAY['Bíceps'], 'principiante', 'Barra', false),

('Curl martillo', 'Bíceps', 'Variante que trabaja bíceps y antebrazo con grip neutro.',
 ARRAY['De pie con mancuernas, palmas enfrentadas', 'Flexiona alternando o simultáneamente', 'Mantén grip neutro durante todo el movimiento', 'Baja controladamente'],
 ARRAY['No rotes las muñecas', 'Mantén codos estables', 'Puedes hacer alternado o simultáneo'],
 ARRAY['Bíceps', 'Braquial', 'Antebrazo'], 'principiante', 'Mancuernas', false),

('Curl concentrado', 'Bíceps', 'Ejercicio de aislamiento que permite gran concentración en el bíceps.',
 ARRAY['Sentado, codo apoyado en muslo interno', 'Flexiona el brazo llevando mancuerna hacia arriba', 'Contrae fuertemente al final', 'Baja muy controladamente'],
 ARRAY['Mantén el codo fijo', 'No uses impulso', 'Enfócate en la contracción máxima'],
 ARRAY['Bíceps'], 'principiante', 'Mancuerna', false),

('Curl en banco Scott', 'Bíceps', 'Ejercicio que elimina el impulso y aísla completamente el bíceps.',
 ARRAY['Siéntate en banco Scott con pecho contra el pad', 'Agarra barra o mancuernas', 'Flexiona controladamente', 'Baja sin extender completamente'],
 ARRAY['No extiendas completamente al bajar', 'Controla especialmente la fase excéntrica', 'Mantén muñecas firmes'],
 ARRAY['Bíceps'], 'intermedio', 'Banco Scott y barra/mancuernas', false);

-- CUÁDRICEPS
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Sentadillas', 'Cuádriceps', 'El rey de los ejercicios de piernas, fundamental para el desarrollo de cuádriceps y glúteos.',
 ARRAY['Barra en trapecios, pies al ancho de hombros', 'Baja flexionando caderas y rodillas', 'Desciende hasta que muslos estén paralelos', 'Empuja el suelo para subir'],
 ARRAY['Mantén pecho hacia afuera', 'Rodillas en línea con pies', 'No dejes que rodillas se vayan hacia adentro', 'Distribuye peso en todo el pie'],
 ARRAY['Cuádriceps', 'Glúteos', 'Core'], 'intermedio', 'Barra y rack', true),

('Prensa', 'Cuádriceps', 'Ejercicio en máquina que permite manejar mucho peso de forma segura.',
 ARRAY['Siéntate en la máquina con espalda apoyada', 'Coloca pies en plataforma al ancho de hombros', 'Baja controladamente flexionando rodillas', 'Empuja hasta casi extensión completa'],
 ARRAY['No bloquees completamente las rodillas', 'Mantén core activado', 'Controla la bajada'],
 ARRAY['Cuádriceps', 'Glúteos'], 'principiante', 'Máquina de prensa', true),

('Zancadas', 'Cuádriceps', 'Ejercicio unilateral excelente para cuádriceps y equilibrio.',
 ARRAY['De pie, da un paso largo hacia adelante', 'Baja flexionando ambas rodillas', 'Rodilla trasera casi toca el suelo', 'Empuja con pierna delantera para volver'],
 ARRAY['Mantén torso erguido', 'No dejes que rodilla delantera pase la punta del pie', 'Alterna piernas o haz series completas'],
 ARRAY['Cuádriceps', 'Glúteos', 'Core'], 'intermedio', 'Peso corporal o mancuernas', true),

('Extensiones de pierna', 'Cuádriceps', 'Ejercicio de aislamiento puro para cuádriceps.',
 ARRAY['Siéntate en la máquina con espalda apoyada', 'Coloca tobillos bajo las almohadillas', 'Extiende las piernas hasta arriba', 'Baja controladamente'],
 ARRAY['No uses impulso', 'Contrae fuertemente al final', 'Controla especialmente la bajada'],
 ARRAY['Cuádriceps'], 'principiante', 'Máquina de extensiones', false);

-- ISQUIOTIBIALES
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Peso muerto rumano', 'Isquiotibiales', 'Variante del peso muerto que enfatiza isquiotibiales y glúteos.',
 ARRAY['De pie con barra, rodillas ligeramente flexionadas', 'Inclínate hacia adelante desde las caderas', 'Baja hasta sentir estiramiento en isquiotibiales', 'Vuelve extendiendo caderas'],
 ARRAY['Mantén espalda recta siempre', 'Empuja caderas hacia atrás', 'Siente el estiramiento en la parte posterior'],
 ARRAY['Isquiotibiales', 'Glúteos', 'Espalda baja'], 'intermedio', 'Barra', true),

('Curl femoral', 'Isquiotibiales', 'Ejercicio de aislamiento para la parte posterior del muslo.',
 ARRAY['Acuéstate boca abajo en la máquina', 'Coloca tobillos bajo las almohadillas', 'Flexiona llevando talones hacia glúteos', 'Baja controladamente'],
 ARRAY['No arquees la espalda', 'Controla todo el rango de movimiento', 'Mantén caderas pegadas al banco'],
 ARRAY['Isquiotibiales'], 'principiante', 'Máquina de curl femoral', false),

('Good mornings', 'Isquiotibiales', 'Ejercicio que trabaja isquiotibiales y fortalece la espalda baja.',
 ARRAY['Barra en trapecios como en sentadilla', 'Inclínate hacia adelante desde caderas', 'Mantén rodillas ligeramente flexionadas', 'Vuelve a posición erguida'],
 ARRAY['Mantén espalda recta', 'No uses mucho peso inicialmente', 'Movimiento lento y controlado'],
 ARRAY['Isquiotibiales', 'Glúteos', 'Espalda baja'], 'avanzado', 'Barra', true),

('Hip thrust', 'Isquiotibiales', 'Ejercicio excelente para glúteos e isquiotibiales.',
 ARRAY['Espalda apoyada en banco, barra sobre caderas', 'Pies firmes en el suelo', 'Empuja caderas hacia arriba', 'Contrae glúteos al final'],
 ARRAY['Mantén barbilla hacia abajo', 'Empuja a través de los talones', 'Contrae fuertemente los glúteos'],
 ARRAY['Glúteos', 'Isquiotibiales'], 'intermedio', 'Barra y banco', true);

-- GEMELOS
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Elevaciones de talón', 'Gemelos', 'Ejercicio básico para el desarrollo de los gemelos.',
 ARRAY['De pie con antepié en plataforma elevada', 'Baja los talones lo más posible', 'Elévate sobre las puntas de los pies', 'Contrae al final del movimiento'],
 ARRAY['Usa rango completo de movimiento', 'Mantén equilibrio', 'Puedes agregar peso con mancuernas'],
 ARRAY['Gemelos'], 'principiante', 'Plataforma o escalón', false),

('Press de pantorrilla', 'Gemelos', 'Ejercicio en máquina para gemelos con mayor carga.',
 ARRAY['Siéntate en máquina de prensa', 'Coloca antepié en parte baja de plataforma', 'Empuja con las puntas de los pies', 'Baja controladamente'],
 ARRAY['Usa rango completo', 'No bloquees las rodillas', 'Mantén tensión constante'],
 ARRAY['Gemelos'], 'principiante', 'Máquina de prensa', false),

('Saltos de cuerda', 'Gemelos', 'Ejercicio cardiovascular que también fortalece gemelos.',
 ARRAY['Mantén cuerda a altura adecuada', 'Salta con antepié', 'Mantén rodillas ligeramente flexionadas', 'Ritmo constante'],
 ARRAY['Aterriza suavemente', 'Mantén codos cerca del cuerpo', 'Empieza con intervalos cortos'],
 ARRAY['Gemelos', 'Cardiovascular'], 'principiante', 'Cuerda', false);

-- CORE
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) VALUES
('Plancha', 'Core', 'Ejercicio isométrico fundamental para el fortalecimiento del core.',
 ARRAY['Posición de flexión pero apoyado en antebrazos', 'Mantén cuerpo recto como tabla', 'Contrae abdomen y glúteos', 'Respira normalmente'],
 ARRAY['No dejes caer caderas', 'No levantes demasiado los glúteos', 'Mantén cuello neutro'],
 ARRAY['Core', 'Hombros', 'Glúteos'], 'principiante', 'Peso corporal', false),

('Russian twists', 'Core', 'Ejercicio dinámico para oblicuos y core.',
 ARRAY['Sentado con rodillas flexionadas', 'Inclínate ligeramente hacia atrás', 'Rota el torso de lado a lado', 'Puedes levantar pies del suelo'],
 ARRAY['Mantén pecho hacia afuera', 'Controla el movimiento', 'Puedes usar peso adicional'],
 ARRAY['Oblicuos', 'Core'], 'principiante', 'Peso corporal', false),

('Elevaciones de piernas', 'Core', 'Ejercicio que trabaja la parte baja del abdomen.',
 ARRAY['Acostado boca arriba, manos a los lados', 'Eleva piernas hasta 90 grados', 'Baja controladamente sin tocar suelo', 'Mantén espalda baja pegada'],
 ARRAY['No uses impulso', 'Controla especialmente la bajada', 'Mantén rodillas ligeramente flexionadas'],
 ARRAY['Abdomen inferior', 'Hip flexores'], 'intermedio', 'Peso corporal', false),

('Abdominales en rueda', 'Core', 'Ejercicio avanzado que trabaja todo el core intensamente.',
 ARRAY['Arrodillado con rueda abdominal', 'Rueda hacia adelante manteniendo core activado', 'Extiende lo más posible sin arquear espalda', 'Vuelve a posición inicial'],
 ARRAY['Mantén core muy activado', 'No arquees la espalda', 'Empieza con rango corto'],
 ARRAY['Core completo', 'Hombros'], 'avanzado', 'Rueda abdominal', false);
