-- Actualizar la restricción de tipos de rutina para incluir "PUSH PULL LEGS 3D"
-- Primero eliminamos la restricción existente
ALTER TABLE workout_routines DROP CONSTRAINT IF EXISTS workout_routines_tipo_rutina_check;

-- Luego agregamos la nueva restricción con el tipo adicional
ALTER TABLE workout_routines ADD CONSTRAINT workout_routines_tipo_rutina_check 
CHECK (tipo_rutina IN ('FULL BODY', 'UPPER LOWER', 'PUSH PULL LEGS', 'PUSH PULL LEGS 3D', 'ARNOLD SPLIT')); 