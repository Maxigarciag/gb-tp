/*
  # Esquema completo para aplicación de fitness

  1. Nuevas Tablas
    - `user_profiles` - Perfiles de usuario con datos del formulario
    - `workout_routines` - Rutinas de entrenamiento personalizadas
    - `exercises` - Catálogo de ejercicios disponibles
    - `routine_exercises` - Relación entre rutinas y ejercicios
    - `workout_sessions` - Sesiones de entrenamiento realizadas
    - `exercise_logs` - Registro detallado de cada ejercicio en una sesión
    - `user_progress` - Seguimiento del progreso del usuario

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para que usuarios solo accedan a sus propios datos
    - Políticas de lectura pública para el catálogo de ejercicios

  3. Características
    - UUIDs como claves primarias
    - Timestamps automáticos
    - Campos calculados y triggers
    - Índices para optimizar consultas
*/

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  altura integer NOT NULL CHECK (altura >= 100 AND altura <= 250),
  peso decimal(5,2) NOT NULL CHECK (peso >= 30 AND peso <= 300),
  edad integer NOT NULL CHECK (edad >= 12 AND edad <= 120),
  sexo text NOT NULL CHECK (sexo IN ('masculino', 'femenino')),
  objetivo text NOT NULL CHECK (objetivo IN ('ganar_musculo', 'perder_grasa', 'mantener')),
  experiencia text NOT NULL CHECK (experiencia IN ('principiante', 'intermedio', 'avanzado')),
  tiempo_entrenamiento text NOT NULL CHECK (tiempo_entrenamiento IN ('30_min', '1_hora', '2_horas')),
  dias_semana text NOT NULL CHECK (dias_semana IN ('3_dias', '4_dias', '6_dias')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Catálogo de ejercicios (datos maestros)
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  grupo_muscular text NOT NULL,
  descripcion text,
  instrucciones text[],
  consejos text[],
  musculos_trabajados text[],
  dificultad text CHECK (dificultad IN ('principiante', 'intermedio', 'avanzado')) DEFAULT 'principiante',
  equipamiento text,
  es_compuesto boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Rutinas de entrenamiento personalizadas
CREATE TABLE IF NOT EXISTS workout_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  tipo_rutina text NOT NULL CHECK (tipo_rutina IN ('FULL BODY', 'UPPER LOWER', 'PUSH PULL LEGS', 'ARNOLD SPLIT')),
  descripcion text,
  dias_por_semana integer NOT NULL CHECK (dias_por_semana >= 1 AND dias_por_semana <= 7),
  duracion_estimada text,
  es_activa boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Días específicos de una rutina
CREATE TABLE IF NOT EXISTS routine_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
  dia_semana text NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
  nombre_dia text NOT NULL, -- ej: "Push Day", "Pull Day", "Leg Day"
  descripcion text,
  es_descanso boolean DEFAULT false,
  orden integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ejercicios asignados a cada día de rutina
CREATE TABLE IF NOT EXISTS routine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_day_id uuid NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  series integer NOT NULL DEFAULT 3 CHECK (series >= 1 AND series <= 10),
  repeticiones_min integer CHECK (repeticiones_min >= 1),
  repeticiones_max integer CHECK (repeticiones_max >= repeticiones_min),
  peso_sugerido decimal(5,2),
  tiempo_descanso integer, -- en segundos
  notas text,
  orden integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(routine_day_id, exercise_id)
);

-- Sesiones de entrenamiento realizadas
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id uuid REFERENCES workout_routines(id) ON DELETE SET NULL,
  routine_day_id uuid REFERENCES routine_days(id) ON DELETE SET NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora_inicio timestamptz,
  hora_fin timestamptz,
  duracion_minutos integer GENERATED ALWAYS AS (
    CASE 
      WHEN hora_inicio IS NOT NULL AND hora_fin IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 60
      ELSE NULL 
    END
  ) STORED,
  notas text,
  calificacion integer CHECK (calificacion >= 1 AND calificacion <= 5),
  completada boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Registro detallado de ejercicios en cada sesión
CREATE TABLE IF NOT EXISTS exercise_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  serie_numero integer NOT NULL CHECK (serie_numero >= 1),
  repeticiones integer NOT NULL CHECK (repeticiones >= 0),
  peso decimal(5,2) CHECK (peso >= 0),
  tiempo_segundos integer CHECK (tiempo_segundos >= 0),
  rpe integer CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  notas text,
  completada boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seguimiento del progreso del usuario
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  peso_corporal decimal(5,2) CHECK (peso_corporal >= 30 AND peso_corporal <= 300),
  porcentaje_grasa decimal(4,2) CHECK (porcentaje_grasa >= 0 AND porcentaje_grasa <= 100),
  masa_muscular decimal(5,2),
  medidas jsonb, -- {"pecho": 100, "brazo": 35, "cintura": 80, etc.}
  fotos text[], -- URLs de fotos de progreso
  notas text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, fecha)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_objetivo ON user_profiles(objetivo);
CREATE INDEX IF NOT EXISTS idx_exercises_grupo_muscular ON exercises(grupo_muscular);
CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_es_activa ON workout_routines(user_id, es_activa);
CREATE INDEX IF NOT EXISTS idx_routine_days_routine_id ON routine_days(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_day_id ON routine_exercises(routine_day_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id_fecha ON workout_sessions(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_fecha ON user_progress(user_id, fecha DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_routines_updated_at 
  BEFORE UPDATE ON workout_routines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para exercises (lectura pública, escritura solo admin)
CREATE POLICY "Anyone can read exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas RLS para workout_routines
CREATE POLICY "Users can manage own routines"
  ON workout_routines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para routine_days
CREATE POLICY "Users can manage own routine days"
  ON routine_days
  FOR ALL
  TO authenticated
  USING (
    routine_id IN (
      SELECT id FROM workout_routines WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    routine_id IN (
      SELECT id FROM workout_routines WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para routine_exercises
CREATE POLICY "Users can manage own routine exercises"
  ON routine_exercises
  FOR ALL
  TO authenticated
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

-- Políticas RLS para workout_sessions
CREATE POLICY "Users can manage own sessions"
  ON workout_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para exercise_logs
CREATE POLICY "Users can manage own exercise logs"
  ON exercise_logs
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para user_progress
CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);