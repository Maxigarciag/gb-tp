-- Agregar campos para nombre personalizado del usuario
-- Migración: 20250624183200_add_nombre_fields.sql

-- Agregar columna para nombre personalizado
ALTER TABLE user_profiles 
ADD COLUMN nombre text;

-- Agregar columna para contar cambios de nombre (máximo 2 cambios)
ALTER TABLE user_profiles 
ADD COLUMN nombre_changed_count integer DEFAULT 0 CHECK (nombre_changed_count >= 0 AND nombre_changed_count <= 2);

-- Crear índice para optimizar búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_user_profiles_nombre ON user_profiles(nombre);

-- Comentario sobre el uso de las nuevas columnas
COMMENT ON COLUMN user_profiles.nombre IS 'Nombre personalizado del usuario (opcional)';
COMMENT ON COLUMN user_profiles.nombre_changed_count IS 'Contador de cambios de nombre (máximo 2 cambios permitidos)'; 