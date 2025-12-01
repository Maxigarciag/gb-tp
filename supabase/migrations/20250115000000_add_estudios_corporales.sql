-- Migración: Agregar campo para estudios corporales
-- Permite guardar datos de calculadoras de grasa corporal y macronutrientes

ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS estudios_corporales jsonb;

-- Índice para búsquedas eficientes de estudios
CREATE INDEX IF NOT EXISTS idx_user_progress_estudios 
ON user_progress(user_id, fecha DESC) 
WHERE estudios_corporales IS NOT NULL;

-- Comentario descriptivo
COMMENT ON COLUMN user_progress.estudios_corporales IS 
'Array de estudios corporales: [{ bodyfat: {...}, macros: {...}, fecha_estudio: timestamp }]';

