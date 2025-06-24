/*
  # Datos iniciales para el catálogo de ejercicios

  1. Ejercicios por grupo muscular
    - Pecho, Hombros, Tríceps, Espalda, Bíceps
    - Cuádriceps, Isquiotibiales, Gemelos, Core

  2. Información detallada
    - Instrucciones paso a paso
    - Consejos de ejecución
    - Músculos trabajados
    - Nivel de dificultad
*/

-- Insertar ejercicios de Pecho
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

-- Insertar ejercicios de Hombros
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

-- Insertar ejercicios de Tríceps
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

-- Insertar ejercicios de Espalda
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

-- Insertar ejercicios de Bíceps
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

-- Insertar ejercicios de Cuádriceps
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

-- Insertar ejercicios de Isquiotibiales
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

-- Insertar ejercicios de Gemelos
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

-- Insertar ejercicios de Core
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