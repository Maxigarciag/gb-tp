-- Actualizar campo RPE en exercise_logs
-- Hacer el campo opcional y permitir valores de 0 a 10

-- Eliminar la restricción anterior
ALTER TABLE exercise_logs 
DROP CONSTRAINT IF EXISTS exercise_logs_rpe_check;

-- Agregar nueva restricción: 0-10 y permitir NULL
ALTER TABLE exercise_logs 
ADD CONSTRAINT exercise_logs_rpe_check 
CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10));

-- Comentario descriptivo
COMMENT ON COLUMN exercise_logs.rpe IS 'Rate of Perceived Exertion (0-10): Opcional. 0=Sin esfuerzo, 1-3=Muy fácil, 4-6=Moderado, 7-8=Difícil, 9-10=Máximo esfuerzo';

