-- Migración: Habilitar RLS y políticas de seguridad para user_streaks
-- Garantiza que los usuarios solo puedan acceder a sus propias rachas

-- Habilitar RLS en user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuarios solo pueden leer sus propias rachas
CREATE POLICY "Users can select own streaks"
  ON public.user_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política INSERT: Usuarios solo pueden insertar rachas para sí mismos
CREATE POLICY "Users can insert own streaks"
  ON public.user_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política UPDATE: Usuarios solo pueden actualizar sus propias rachas
CREATE POLICY "Users can update own streaks"
  ON public.user_streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política DELETE: Usuarios solo pueden eliminar sus propias rachas
CREATE POLICY "Users can delete own streaks"
  ON public.user_streaks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

