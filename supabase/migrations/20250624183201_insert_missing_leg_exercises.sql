-- Insertar ejercicios de piernas faltantes (evitando duplicados)
-- Este script inserta solo los ejercicios que no existen

-- Insertar ejercicios de Cuádriceps (solo si no existen)
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Prensa', 'Cuádriceps', 'Ejercicio en máquina que permite manejar mucho peso de forma segura.',
 ARRAY['Siéntate en la máquina con espalda apoyada', 'Coloca pies en plataforma al ancho de hombros', 'Baja controladamente flexionando rodillas', 'Empuja hasta casi extensión completa'],
 ARRAY['No bloquees completamente las rodillas', 'Mantén core activado', 'Controla la bajada'],
 ARRAY['Cuádriceps', 'Glúteos'], 'principiante', 'Máquina de prensa', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Prensa');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Zancadas', 'Cuádriceps', 'Ejercicio unilateral excelente para cuádriceps y equilibrio.',
 ARRAY['De pie, da un paso largo hacia adelante', 'Baja flexionando ambas rodillas', 'Rodilla trasera casi toca el suelo', 'Empuja con pierna delantera para volver'],
 ARRAY['Mantén torso erguido', 'No dejes que rodilla delantera pase la punta del pie', 'Alterna piernas o haz series completas'],
 ARRAY['Cuádriceps', 'Glúteos', 'Core'], 'intermedio', 'Peso corporal o mancuernas', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Zancadas');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Extensiones de pierna', 'Cuádriceps', 'Ejercicio de aislamiento puro para cuádriceps.',
 ARRAY['Siéntate en la máquina con espalda apoyada', 'Coloca tobillos bajo las almohadillas', 'Extiende las piernas hasta arriba', 'Baja controladamente'],
 ARRAY['No uses impulso', 'Contrae fuertemente al final', 'Controla especialmente la bajada'],
 ARRAY['Cuádriceps'], 'principiante', 'Máquina de extensiones', false
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Extensiones de pierna');

-- Insertar ejercicios de Isquiotibiales (solo si no existen)
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Peso muerto rumano', 'Isquiotibiales', 'Variante del peso muerto que enfatiza isquiotibiales y glúteos.',
 ARRAY['De pie con barra, rodillas ligeramente flexionadas', 'Inclínate hacia adelante desde las caderas', 'Baja hasta sentir estiramiento en isquiotibiales', 'Vuelve extendiendo caderas'],
 ARRAY['Mantén espalda recta siempre', 'Empuja caderas hacia atrás', 'Siente el estiramiento en la parte posterior'],
 ARRAY['Isquiotibiales', 'Glúteos', 'Espalda baja'], 'intermedio', 'Barra', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Peso muerto rumano');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Curl femoral', 'Isquiotibiales', 'Ejercicio de aislamiento para la parte posterior del muslo.',
 ARRAY['Acuéstate boca abajo en la máquina', 'Coloca tobillos bajo las almohadillas', 'Flexiona llevando talones hacia glúteos', 'Baja controladamente'],
 ARRAY['No arquees la espalda', 'Controla todo el rango de movimiento', 'Mantén caderas pegadas al banco'],
 ARRAY['Isquiotibiales'], 'principiante', 'Máquina de curl femoral', false
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Curl femoral');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Good mornings', 'Isquiotibiales', 'Ejercicio que trabaja isquiotibiales y fortalece la espalda baja.',
 ARRAY['Barra en trapecios como en sentadilla', 'Inclínate hacia adelante desde caderas', 'Mantén rodillas ligeramente flexionadas', 'Vuelve a posición erguida'],
 ARRAY['Mantén espalda recta', 'No uses mucho peso inicialmente', 'Movimiento lento y controlado'],
 ARRAY['Isquiotibiales', 'Glúteos', 'Espalda baja'], 'avanzado', 'Barra', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Good mornings');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Hip thrust', 'Isquiotibiales', 'Ejercicio excelente para glúteos e isquiotibiales.',
 ARRAY['Espalda apoyada en banco, barra sobre caderas', 'Pies firmes en el suelo', 'Empuja caderas hacia arriba', 'Contrae glúteos al final'],
 ARRAY['Mantén barbilla hacia abajo', 'Empuja a través de los talones', 'Contrae fuertemente los glúteos'],
 ARRAY['Glúteos', 'Isquiotibiales'], 'intermedio', 'Barra y banco', true
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Hip thrust');

-- Insertar ejercicios de Gemelos (solo si no existen)
INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Elevaciones de talón', 'Gemelos', 'Ejercicio básico para el desarrollo de los gemelos.',
 ARRAY['De pie con antepié en plataforma elevada', 'Baja los talones lo más posible', 'Elévate sobre las puntas de los pies', 'Contrae al final del movimiento'],
 ARRAY['Usa rango completo de movimiento', 'Mantén equilibrio', 'Puedes agregar peso con mancuernas'],
 ARRAY['Gemelos'], 'principiante', 'Plataforma o escalón', false
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Elevaciones de talón');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Press de pantorrilla', 'Gemelos', 'Ejercicio en máquina para gemelos con mayor carga.',
 ARRAY['Siéntate en máquina de prensa', 'Coloca antepié en parte baja de plataforma', 'Empuja con las puntas de los pies', 'Baja controladamente'],
 ARRAY['Usa rango completo', 'No bloquees las rodillas', 'Mantén tensión constante'],
 ARRAY['Gemelos'], 'principiante', 'Máquina de prensa', false
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Press de pantorrilla');

INSERT INTO exercises (nombre, grupo_muscular, descripcion, instrucciones, consejos, musculos_trabajados, dificultad, equipamiento, es_compuesto) 
SELECT 'Saltos de cuerda', 'Gemelos', 'Ejercicio cardiovascular que también fortalece gemelos.',
 ARRAY['Mantén cuerda a altura adecuada', 'Salta con antepié', 'Mantén rodillas ligeramente flexionadas', 'Ritmo constante'],
 ARRAY['Aterriza suavemente', 'Mantén codos cerca del cuerpo', 'Empieza con intervalos cortos'],
 ARRAY['Gemelos', 'Cardiovascular'], 'principiante', 'Cuerda', false
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE nombre = 'Saltos de cuerda'); 