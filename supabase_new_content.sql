-- ============================================================
-- StoiComunication - Seed Script for Premium Educational Content
-- Schema: stoic
-- ============================================================

-- 1. DAILY HABITS (15 Habits: 5 per Phase)
-- Categories: 'stoic', 'communication', 'social'
-- Phase 1 (Foundations): Days 1-30, Weeks 1-4
-- Phase 2 (Persuasion & Storytelling): Days 31-60, Weeks 5-8
-- Phase 3 (Leadership & Connection): Days 61-90, Weeks 9-12

-- PHASE 1: Foundations (Adrian Sola Pastor, Julian Treasure, Marcus Aurelius)
INSERT INTO stoic.habits (name, description, category, phase, week, sort_order) VALUES
  (
    'Calentamiento vocal matutino',
    'Realizar una secuencia de calentamiento vocal antes de comenzar las interacciones profesionales del día. Basado en las técnicas de Julian Treasure, este ejercicio consta de cuatro pasos para preparar la voz: primero, respirar profundamente expandiendo el diafragma; segundo, realizar vibraciones labiales (lip trills) emitiendo un sonido suave para relajar las cuerdas vocales; tercero, masajear suavemente la mandíbula y hacer sonidos con la lengua (burbujas y chasquidos); cuarto, articular sílabas claras variando el tono desde el más grave hasta el más agudo. Esto mejora la resonancia, reduce la tensión vocal y proyecta una voz más segura y autoritaria en las reuniones.',
    'communication',
    1,
    1,
    1
  ),
  (
    'Ajuste consciente de filtros de escucha',
    'Identificar y ajustar activamente los filtros de escucha en cada conversación. Julian Treasure describe que escuchamos a través de filtros como la cultura, el lenguaje, los valores, las creencias y las expectativas. Este hábito consiste en pausar al inicio de una reunión y hacer el esfuerzo consciente de desactivar las expectativas preestablecidas o el juicio hacia el interlocutor. Para lograrlo, preste atención exclusiva a los hechos y al tono de la persona, absteniéndose de planificar su respuesta mientras el otro habla. Esto permite una comprensión profunda de la perspectiva del interlocutor, reduciendo los malentendidos.',
    'communication',
    1,
    2,
    2
  ),
  (
    'Examen estoico matutino de control',
    'Dedicar diez minutos al iniciar el día para realizar la reflexión matutina basada en las Meditaciones de Marco Aurelio. El ejercicio consiste en escribir en un cuaderno los posibles obstáculos y comportamientos difíciles que podría encontrar durante la jornada (personas hostiles, retrasos, críticas). Aplique el principio de la dicotomía del control: identifique claramente qué elementos están bajo su control directo (sus opiniones, sus intenciones, sus reacciones) y cuáles no (las acciones de los demás, el clima, los resultados finales). Escriba cómo decidirá responder de forma racional y calmada ante estas situaciones incontrolables, preparándose mentalmente para no tomar las ofensas de manera personal.',
    'stoic',
    1,
    3,
    3
  ),
  (
    'Alineamiento corporal y presencia no verbal',
    'Monitorear y ajustar el lenguaje corporal tres veces al día para proyectar apertura y seguridad, utilizando las pautas de dinámica social de Adrián Solá Pastor. El hábito requiere mantener una postura erguida pero relajada, con los hombros hacia atrás y hacia abajo, evitando cruzar los brazos o piernas en señal de defensa. Al interactuar con otros, alinee su torso directamente con el de ellos y mantenga las manos visibles sobre la mesa o a los costados, utilizando gestos ilustrativos abiertos. La presencia no verbal sólida influye directamente en los niveles hormonales de estrés y aumenta la percepción de autoconfianza y liderazgo ante los demás.',
    'social',
    1,
    4,
    4
  ),
  (
    'Implementación de la pausa vocal deliberada',
    'Insertar pausas deliberadas de dos a tres segundos antes de responder a preguntas clave o durante transiciones en su discurso. Esta técnica combina la recomendación de Julian Treasure para combatir las muletillas verbales y la de Adrián Solá Pastor sobre el control del ritmo social. En lugar de rellenar los silencios con sonidos como "eh", "este" o "bueno", permanezca en silencio mientras organiza su próxima idea. La pausa deliberada transmite control emocional, genera expectación en la audiencia y demuestra que está procesando la información de manera analítica y no meramente reactiva.',
    'communication',
    1,
    4,
    5
  );

-- PHASE 2: Persuasion & Storytelling (Chris Voss, Carmine Gallo)
INSERT INTO stoic.habits (name, description, category, phase, week, sort_order) VALUES
  (
    'Uso sistemático del espejo táctico',
    'Aplicar la técnica del espejo táctico durante negociaciones o conversaciones de alta relevancia. Basado en la metodología de Chris Voss, este hábito consiste en repetir las últimas una a tres palabras clave que el interlocutor acaba de pronunciar, formulándolas con un tono de voz inquisitivo (de abajo hacia arriba). Al hacer esto, usted no opina ni confronta, sino que invita de manera natural al interlocutor a profundizar en su idea y aclarar su posición. El espejo táctico genera una sensación de sintonía inconsciente en el otro, permitiendo obtener información valiosa sin que el interlocutor se sienta interrogado.',
    'communication',
    2,
    5,
    6
  ),
  (
    'Etiquetado racional de emociones',
    'Identificar y verbalizar los sentimientos u obstáculos invisibles del interlocutor utilizando el etiquetado emocional de Chris Voss. Cuando note tensión, resistencia o duda, formule una etiqueta neutral comenzando estrictamente con frases como: "Parece que hay cierta preocupación sobre...", "Suena a que sientes que...", o "Parece que esto te resulta injusto". Evite usar el pronombre "Yo" para no sonar egocéntrico (no diga "Yo escucho que..."). Permanezca en silencio absoluto inmediatamente después de lanzar la etiqueta para permitir que el otro confirme o aclare su estado emocional. Esta técnica disipa las emociones negativas y fortalece la confianza mutua.',
    'communication',
    2,
    6,
    7
  ),
  (
    'Estructuración de argumentos bajo el modelo Sparkline',
    'Estructurar cada propuesta de proyecto o actualización de estado comparando el estado actual con el estado futuro deseado, utilizando el modelo Sparkline analizado por Carmine Gallo. Al redactar correos o preparar presentaciones, divida su contenido en contrastes continuos: primero describa "lo que es" (la situación problemática actual con datos precisos) y luego contraste inmediatamente con "lo que podría ser" (la solución propuesta y sus beneficios a largo plazo). Finalice siempre con una llamada a la acción clara. Esta estructura de tensión narrativa mantiene la atención del equipo y facilita la persuasión al hacer evidente el valor del cambio.',
    'communication',
    2,
    7,
    8
  ),
  (
    'Síntesis de mensajes clave mediante la regla de tres',
    'Limitar a un máximo de tres puntos principales cualquier mensaje importante, correo ejecutivo o intervención en reuniones. Carmine Gallo resalta que el cerebro humano está diseñado para recordar información organizada en tríadas de manera óptima. Antes de hablar o escribir, organice sus ideas en tres pilares conceptuales y menciónelos explícitamente al inicio (por ejemplo: "Hoy abordaremos tres aspectos: el diagnóstico, las opciones y la recomendación"). Esto evita la sobrecarga cognitiva del receptor, asegura la retención de los puntos clave y proyecta una gran capacidad de síntesis y claridad ejecutiva.',
    'communication',
    2,
    8,
    9
  ),
  (
    'Formulación de preguntas calibradas de control',
    'Sustituir las sugerencias directas o las preguntas cerradas por preguntas calibradas de tipo abierto, usando la metodología de Chris Voss. En lugar de preguntar "¿Está de acuerdo con esto?" o decir "Debemos hacer esto de esta manera", formule preguntas que inicien con "Cómo" o "Qué" (evitando el "Por qué", el cual genera actitud defensiva). Ejemplos útiles son: "¿Cómo podemos resolver este problema de manera conjunta?" o "¿Qué es lo que nos está impidiendo avanzar en esta dirección?". Estas preguntas eliminan la confrontación directa, obligan al interlocutor a reflexionar de manera activa y le otorgan una ilusión de control, facilitando la colaboración.',
    'communication',
    2,
    8,
    10
  );

-- PHASE 3: Leadership & Connection (Brene Brown, Lewis Howes, Seneca)
INSERT INTO stoic.habits (name, description, category, phase, week, sort_order) VALUES
  (
    'Establecimiento de límites claros y asertivos',
    'Practicar la delimitación de límites de forma honesta y directa sin recurrir a disculpas excesivas o justificaciones defensivas, implementando el concepto de vulnerabilidad y coraje de Brené Brown. Cuando deba rechazar una solicitud que exceda su capacidad laboral o deba solicitar un cambio de comportamiento a un colega, exprese la situación de forma neutral y directa: "No tengo la capacidad de asumir este proyecto en este momento debido a las prioridades X e Y" o "Para realizar un trabajo de calidad, necesito que la información me sea entregada con dos días de anticipación". Brené Brown resalta que ser claro es ser compasivo; esto fomenta relaciones basadas en la honestidad y el respeto mutuo.',
    'social',
    3,
    9,
    11
  ),
  (
    'Validación y reconocimiento específico de otros',
    'Reconocer públicamente una contribución específica de un colega o colaborador una vez al día, utilizando el enfoque de inteligencia emocional y liderazgo de Lewis Howes. Evite los cumplidos genéricos como "Buen trabajo". En su lugar, describa detalladamente la acción y el impacto positivo que tuvo: "Quiero destacar tu análisis en el reporte de ayer, la forma en que estructuraste los gráficos facilitó que el cliente tomara la decisión de inmediato". Este hábito fortalece la relación profesional, aumenta la motivación del equipo y posiciona al practicante como un líder enfocado en el desarrollo colaborativo.',
    'social',
    3,
    10,
    12
  ),
  (
    'Examen estoico nocturno de Séneca',
    'Realizar una evaluación de la jornada antes de dormir, basada en las Cartas a Lucilio de Séneca. Dedique diez minutos en silencio a responder por escrito tres preguntas clave en su bitácora: Primero, ¿qué acción incorrecta cometí hoy y cómo afectó mi paz mental o mis relaciones?; segundo, ¿qué hice bien y cómo apliqué la razón y la templanza en mis interacciones?; tercero, ¿qué habría podido hacer de manera diferente para mejorar mi comunicación o mis reacciones emocionales? Este examen honesto y libre de autoconmiseración fomenta la mejora continua, cierra el ciclo del día y promueve un descanso libre de ansiedad.',
    'stoic',
    3,
    11,
    13
  ),
  (
    'Alineación y transparencia de expectativas',
    'Alinearse activamente con su equipo o socios al inicio de cualquier tarea mediante la definición explícita de qué constituye el éxito de la misma, aplicando el modelo de transparencia radical de Brené Brown. Al delegar o iniciar un proyecto conjunto, pregunte y defina de forma verbal y escrita: "¿Cómo luce el éxito de este entregable para nosotros?" y "¿Qué obstáculos podrían impedir que alcancemos este estándar?". Esto evita supuestos no verbalizados que suelen derivar en resentimiento, fricciones o reproches, asegurando que todos los involucrados compartan una visión común y clara de la meta.',
    'communication',
    3,
    12,
    14
  ),
  (
    'Exposición voluntaria al disconfort de opinión',
    'Practicar la incomodidad voluntaria expresando su postura honesta o asumiendo el liderazgo en situaciones de incertidumbre, inspirado en las prácticas estoicas de Séneca. Este hábito consiste en intervenir activamente en situaciones donde habitualmente guardaría silencio por timidez o por temor a la desaprobación (por ejemplo, expresar una duda básica en una junta con altos directivos, o dar una opinión técnica divergente en un debate grupal). Al tolerar la incomodidad física del nerviosismo momentáneo, usted desensibiliza su respuesta al estrés social, fortaleciendo su resiliencia psicológica y su identidad de líder auténtico.',
    'stoic',
    3,
    12,
    15
  );


-- 2. PROGRESSIVE SOCIAL CHALLENGES (16 Challenges: 4 per Level)
-- Categories: 'social_ladder', 'communication', 'stoic'
-- Levels: 1 (Micro-interactions), 2 (Short interactions), 3 (Short conversations), 4 (Active/High Stakes)

-- LEVEL 1: Micro-interactions (almost zero friction) - Phase 1
INSERT INTO stoic.challenges (title, description, category, level, phase, week, sort_order) VALUES
  (
    'La sonrisa del ascensor',
    'Qué hacer: Al subir a un ascensor o pasar por una recepción, establezca contacto visual con la persona presente durante un segundo completo, ofrezca una sonrisa ligera pero sincera y diga "buenos días" o "buenas tardes" con un tono de voz audible y claro.
Por qué funciona: Esta microinteracción reduce el sesgo cognitivo de amenaza ante desconocidos y desensibiliza el miedo primario al rechazo. Requiere un esfuerzo mínimo y demuestra al cerebro de manera práctica que el contacto social básico es seguro y correspondido de manera positiva en la gran mayoría de las ocasiones.',
    'social_ladder',
    1,
    1,
    1,
    1
  ),
  (
    'Agradecimiento visual al cajero',
    'Qué hacer: Cuando esté pagando en el supermercado, cafetería o peaje, evite mirar su teléfono celular. En lugar de eso, espere a recibir el cambio o el producto, mire directamente a los ojos del cajero, sonría levemente y diga "muchas gracias, que tenga un excelente día" llamándolo por su nombre si lleva un gafete visible.
Por qué funciona: Humaniza una transacción rutinaria y entrena la atención plena en el entorno inmediato. Al romper el patrón de desconexión digital habitual, se desarrolla presencia social y se practica el contacto visual directo en una situación de bajísima fricción social.',
    'social_ladder',
    1,
    1,
    1,
    2
  ),
  (
    'El saludo con afirmación física',
    'Qué hacer: Al cruzarse en el pasillo, gimnasio o calle con un conocido lejano o colega con el que no habla habitualmente, mantenga el contacto visual, realice un asentimiento firme de cabeza (movimiento ascendente o descendente según la formalidad) y diga un "hola" enérgico mientras continúa su camino sin detenerse.
Por qué funciona: Permite establecer reconocimiento social mutuo sin la presión de iniciar una conversación. Ayuda a expandir su zona de confort no verbal y reduce la incomodidad de ignorar a personas conocidas en entornos compartidos.',
    'social_ladder',
    1,
    1,
    2,
    3
  ),
  (
    'El micro-reconocimiento al personal de servicio',
    'Qué hacer: Al ingresar a su edificio comercial, residencial o al pasar por el área de limpieza, detenga su marcha por un segundo, mire directamente a la persona de seguridad o de servicios generales, salúdela de manera asertiva y exprese un agradecimiento específico por su labor (por ejemplo: "buenos días, gracias por mantener el espacio tan ordenado").
Por qué funciona: Refuerza la empatía estoica al reconocer la igual dignidad de todas las personas, independientemente de su rol. Este acto de validación reduce la autoconsciencia egoísta del practicante y genera una sensación de conexión comunitaria.',
    'social_ladder',
    1,
    1,
    2,
    4
  );

-- LEVEL 2: Short interactions (directions, barista small talk) - Phase 1/2
INSERT INTO stoic.challenges (title, description, category, level, phase, week, sort_order) VALUES
  (
    'La consulta de orientación intencional',
    'Qué hacer: Detenga a un transeúnte o acuda a un empleado en la calle o centro comercial para pedirle indicaciones específicas sobre cómo llegar a un lugar o el horario de un establecimiento, incluso si ya conoce la respuesta o dispone de GPS. Escuche con atención, asienta y agradezca de manera cordial al finalizar.
Por qué funciona: Obliga al cerebro a iniciar una interacción verbal con un desconocido con un propósito funcional claro, lo cual reduce la fricción mental de iniciar una conversación. La estructura utilitaria de la pregunta reduce la ansiedad y proporciona una experiencia de éxito social inmediato.',
    'social_ladder',
    2,
    1,
    3,
    5
  ),
  (
    'El cumplido espontáneo y breve',
    'Qué hacer: Encuentre un elemento singular e impersonal en alguien en un entorno comercial o laboral (por ejemplo, un diseño de zapatos, un reloj, un libro que lleve en la mano) y expréselo en forma de cumplido rápido y sincero: "disculpe, qué buena elección de diseño tiene su reloj". Retírese o vuelva a su actividad inmediatamente después de recibir el agradecimiento.
Por qué funciona: Entrena la capacidad de observación de detalles positivos en el entorno. Al retirarse inmediatamente, se elimina la presión de mantener una charla, demostrando que es posible brindar valor social de forma gratuita y sin segundas intenciones.',
    'social_ladder',
    2,
    1,
    3,
    6
  ),
  (
    'La recomendación personalizada',
    'Qué hacer: Al realizar su pedido en un restaurante, cafetería o panadería, pida la recomendación directa del barista o mesero utilizando una pregunta abierta: "¿cuál es el producto que más recomiendas preparar aquí y por qué?". Escuche su explicación y, en la medida de lo posible, ordene lo sugerido por él.
Por qué funciona: Genera una relación de colaboración asimétrica rápida. El interlocutor se siente valorado en su rol de experto y usted practica la cesión de control y la escucha activa en un contexto informal y cotidiano.',
    'social_ladder',
    2,
    1,
    4,
    7
  ),
  (
    'El comentario situacional compartido',
    'Qué hacer: Estando en una fila (banco, supermercado, cafetería) o esperando en una sala de reuniones, realice una observación breve sobre el contexto compartido en un tono neutro y amable (por ejemplo: "parece que hoy el tráfico de datos en el sistema está más lento de lo normal" o "vaya clima tan cambiante hemos tenido hoy").
Por qué funciona: Rompe el hielo utilizando el entorno común, que es el terreno más seguro para ambas partes. Permite testear la receptividad social del otro sin invadir su espacio personal, entrenando la lectura de la disposición ajena.',
    'social_ladder',
    2,
    1,
    4,
    8
  );

-- LEVEL 3: Short conversations (2-3 min, finding common ground) - Phase 2
INSERT INTO stoic.challenges (title, description, category, level, phase, week, sort_order) VALUES
  (
    'Búsqueda de afinidades en el entorno de trabajo',
    'Qué hacer: Entable una conversación de dos a tres minutos con un colega de otra área durante la pausa de café o almuerzo. Utilice la observación para encontrar un punto de afinidad: "¿cómo ha estado tu ritmo de trabajo esta semana con el nuevo proyecto?" o preguntando sobre algún interés visible (un termo de agua con logos, llavero, etc.).
Por qué funciona: Enseña al cerebro a buscar activamente la similitud en lugar de la diferencia. Encontrar un terreno común (hobbies, proyectos, opiniones sobre el sector) reduce la distancia percibida entre las personas y asienta las bases de la confianza interpersonal en el ámbito laboral.',
    'social_ladder',
    3,
    2,
    5,
    9
  ),
  (
    'La pregunta de conexión contextual',
    'Qué hacer: En un evento, taller, curso o sala de espera compartida con profesionales del sector, acérquese a alguien y pregunte de manera directa pero cálida: "¿qué te trajo por este evento el día de hoy?". A partir de su respuesta, indague con una pregunta de seguimiento basada en lo que escuche.
Por qué funciona: Desvía el enfoque de la charla superficial ("small talk" vacío) hacia las motivaciones y propósitos de la persona. Esto facilita una transición rápida hacia temas sustanciales y permite practicar la escucha activa y la curiosidad genuina.',
    'social_ladder',
    3,
    2,
    5,
    10
  ),
  (
    'El puente de conversación diferida',
    'Qué hacer: Retome un tema mencionado por un colega en una interacción ocurrida días atrás (por ejemplo: una mudanza, la salud de un familiar, un examen o un pasatiempo). Inicie la interacción diciendo: "la semana pasada mencionaste que ibas a realizar X, ¿cómo te fue con eso?". Escuche con total atención la respuesta.
Por qué funciona: Demuestra de manera inequívoca un alto nivel de consideración e interés genuino hacia la vida del otro. Es una de las técnicas de conexión más potentes de Lewis Howes para crear lazos duraderos, ya que la mayoría de las personas aprecian ser escuchadas e importantes para los demás.',
    'social_ladder',
    3,
    2,
    6,
    11
  ),
  (
    'La indagación de perspectivas del fin de semana',
    'Qué hacer: Al iniciar la semana de trabajo, pregunte a un miembro de su equipo o departamento sobre sus actividades de descanso, pero enfocándose en la experiencia y no solo en la lista de actividades. Use preguntas como: "¿cuál fue la mejor parte de tu fin de semana?" o "¿qué tal estuvo ese tiempo de desconexión?".
Por qué funciona: Rompe la monotonía de las respuestas automáticas como "bien, todo normal". Invita al interlocutor a rememorar emociones positivas y abre un espacio de vulnerabilidad controlada y empatía en el entorno profesional.',
    'social_ladder',
    3,
    2,
    6,
    12
  );

-- LEVEL 4: Active/High Stakes (holding eye contact, setting boundaries, handling minor conflict) - Phase 3
INSERT INTO stoic.challenges (title, description, category, level, phase, week, sort_order) VALUES
  (
    'Sostenimiento visual en silencio directivo',
    'Qué hacer: Durante una reunión de equipo o negociación, tras emitir una propuesta, respuesta importante o al escuchar la opinión de otro, sostenga el contacto visual directo de manera ininterrumpida y en total silencio físico por tres a cinco segundos después de que cese la voz. No desvíe la mirada ni asienta compulsivamente.
Por qué funciona: El contacto visual sostenido comunica un alto estatus, convicción y compostura emocional. Permite procesar la información de manera analítica y evita la sumisión social reflexiva de desviar la mirada por timidez, entrenando la tolerancia a la tensión social en momentos de alta relevancia.',
    'social_ladder',
    4,
    3,
    9,
    13
  ),
  (
    'Negociación de plazos y límites',
    'Qué hacer: Cuando le asignen un entregable o solicitud con un plazo irrazonable, evite aceptar sumisamente o quejarse de manera pasiva. Proponga una negociación asertiva: "comprendo la urgencia de este reporte. Para garantizar la calidad y precisión de los datos, requiero entregar la primera parte el viernes y el consolidado final el lunes a primera hora. ¿Cómo afectaría esto sus planes?".
Por qué funciona: Aplica los principios de negociación de Chris Voss al establecer un límite claro sin romper la relación de colaboración. Transforma la exigencia en un problema conjunto a resolver y consolida su autoridad profesional y autocontrol estoico.',
    'social_ladder',
    4,
    3,
    10,
    14
  ),
  (
    'Aclaración directa de malentendidos',
    'Qué hacer: Si detecta una actitud hostil, un correo con tono cortante o un aparente malentendido con un colega, solicite una breve llamada o reunión individual. Exponga el hecho de manera neutral: "observé que en el correo de ayer mencionaste X. Quiero asegurarme de que estamos alineados y corregir cualquier error por mi parte. ¿Qué perspectiva tienes al respecto?".
Por qué funciona: Evita la escalada de conflictos pasivo-agresivos a través de la confrontación directa basada en la razón estoica y la vulnerabilidad de Brené Brown. Al centrar la discusión en hechos objetivos y soluciones cooperativas, se desarma la postura defensiva del interlocutor.',
    'social_ladder',
    4,
    3,
    11,
    15
  ),
  (
    'Disidencia racional y constructiva',
    'Qué hacer: En una sesión de lluvia de ideas o discusión de decisiones grupales, exprese de forma estructurada una opinión opuesta a la de la mayoría o a la de su superior. Utilice un preámbulo neutral: "veo el valor de su propuesta en el punto A. Sin embargo, al analizar el riesgo en el punto B, encuentro un obstáculo crítico que deberíamos considerar. Propongo esta alternativa...".
Por qué funciona: Vence el conformismo grupal y el miedo al aislamiento social. Practica la asertividad ejecutiva y la fortaleza estoica al anteponer la verdad racional al agrado superficial del grupo, ganando respeto intelectual en el proceso.',
    'social_ladder',
    4,
    3,
    12,
    16
  );


-- 3. PREMIUM LEARNING RESOURCES (15 Resources)
-- Types: 'book', 'youtube', 'course', 'diplomado'

-- BOOKS (5 Resources)
INSERT INTO stoic.resources (title, author, type, url, description, phase) VALUES
  (
    'Rompe la barrera del no: Negociar como si te va la vida en ello',
    'Chris Voss',
    'book',
    NULL,
    'Un tratado fundamental sobre negociación y comunicación asertiva bajo situaciones de alta presión escrito por un exnegociador del FBI. Presenta herramientas prácticas como el espejo táctico, el etiquetado emocional y las preguntas calibradas, destinadas a desactivar la hostilidad y obtener acuerdos beneficiosos en cualquier ámbito.',
    2
  ),
  (
    'Hable como en TED: Nueve secretos para comunicar de los mejores',
    'Carmine Gallo',
    'book',
    NULL,
    'Análisis detallado de las presentaciones más exitosas de la plataforma TED, estructurado en nueve principios de oratoria y diseño de mensajes. El autor explica cómo aplicar el storytelling, mantener la atención del público mediante la regla de tres y presentar datos complejos con un impacto emocional duradero.',
    2
  ),
  (
    'Atreverse a liderar: El poder de la vulnerabilidad en el trabajo',
    'Brené Brown',
    'book',
    NULL,
    'Una obra clave sobre el liderazgo basado en la valentía y la empatía. La autora demuestra que la vulnerabilidad no es una debilidad, sino la base para la innovación, la confianza organizacional y el establecimiento de límites claros. Ofrece estrategias concretas para una comunicación honesta y constructiva.',
    3
  ),
  (
    'Cartas a Lucilio: Epístolas morales de un filósofo estoico',
    'Lucio Anneo Séneca',
    'book',
    NULL,
    'Colección de cartas personales que abordan la filosofía práctica estoica y el autodominio ante los retos del día a día. Séneca instruye sobre el control de las pasiones, la reflexión vespertina y la preparación mental ante la adversidad, constituyendo una lectura indispensable para la autogestión emocional.',
    3
  ),
  (
    'Meditaciones: Reflexiones personales de un emperador estoico',
    'Marco Aurelio',
    'book',
    NULL,
    'El diario íntimo del emperador romano Marco Aurelio, donde compila recordatorios diarios para mantener la ecuanimidad, la autodisciplina y el sentido del deber. Sus reflexiones sobre la dicotomía del control y la aceptación racional de las circunstancias externas son pilares fundamentales para el temple estoico.',
    1
  );

-- YOUTUBE CHANNELS/VIDEOS (5 Resources)
INSERT INTO stoic.resources (title, author, type, url, description, phase) VALUES
  (
    'Canal Oficial de Adrià Solà Pastor',
    'Adrià Solà Pastor',
    'youtube',
    'https://www.youtube.com/@adriasolapastor',
    'Canal enfocado en el desarrollo de la comunicación ejecutiva, habilidades sociales y oratoria de alto impacto. Ofrece videos prácticos sobre el lenguaje corporal, la gestión del miedo escénico, la estructura del discurso de ventas y entrevistas en profundidad en su podcast sobre psicología y crecimiento profesional.',
    1
  ),
  (
    'The School of Greatness',
    'Lewis Howes',
    'youtube',
    'https://www.youtube.com/@LewisHowes',
    'Canal de entrevistas que explora la mentalidad de éxito, la inteligencia emocional y la resolución de conflictos. Lewis Howes reúne a líderes globales de opinión, psicólogos y empresarios para analizar el impacto de la empatía, la comunicación vulnerable y la construcción de relaciones laborales saludables.',
    3
  ),
  (
    'Canal de Sebastián Lora',
    'Sebastián Lora',
    'youtube',
    'https://www.youtube.com/@SebasLora',
    'Canal dedicado a la formación práctica en oratoria moderna, técnicas de persuasión y desarrollo del carisma. Sebastián Lora presenta guías detalladas y plantillas estructuradas para eliminar muletillas, captar la atención en los primeros segundos de una presentación y vender ideas de forma convincente.',
    2
  ),
  (
    'Técnicas de Hablar en Público',
    'Víctor Toscano',
    'youtube',
    'https://www.youtube.com/@TecnicasHablarEnPublico',
    'Espacio enfocado en la superación del miedo a hablar en público y la mejora de la dicción. Mediante tutoriales paso a paso y dinámicas sencillas, Víctor Toscano enseña técnicas de vocalización, proyección de la voz y organización del lenguaje corporal para oradores de todos los niveles.',
    1
  ),
  (
    'Cómo hablar para que la gente quiera escuchar - Charla TED',
    'Julian Treasure',
    'youtube',
    'https://www.youtube.com/watch?v=eIho2S0ZahI',
    'Una de las charlas TED más vistas sobre el poder de la voz y la escucha. Julian Treasure desglosa los siete pecados capitales de la comunicación verbal, introduce los cuatro pilares de la honestidad y autenticidad en la oratoria, y demuestra ejercicios físicos inmediatos de calentamiento vocal.',
    1
  );

-- COURSES & DIPLOMADOS (5 Resources)
INSERT INTO stoic.resources (title, author, type, url, description, phase) VALUES
  (
    'Curso en Comunicación Asertiva y Persuasiva para Líderes',
    'Universidad de La Sabana',
    'course',
    'https://www.unisabana.edu.co/',
    'Programa de formación continua diseñado para directivos que buscan perfeccionar su capacidad de influencia y dirección de equipos. Se enfoca en la estructuración del discurso corporativo, la resolución diplomática de conflictos internos y el desarrollo de técnicas de persuasión verbal y no verbal.',
    3
  ),
  (
    'Curso de Comunicación Efectiva y Habilidades de Expresión Oral',
    'Universidad EAFIT',
    'course',
    'https://www.eafit.edu.co/',
    'Taller de entrenamiento práctico centrado en el desarrollo de la presencia escénica y corporal en ámbitos ejecutivos. El curso implementa técnicas de análisis de voz y grabaciones de retroalimentación en directo para corregir la postura, el ritmo del habla y optimizar la persuasión ante audiencias críticas.',
    1
  ),
  (
    'Improving Communication Skills',
    'The Wharton School of the University of Pennsylvania',
    'course',
    'https://www.coursera.org/learn/wharton-communication-skills',
    'Curso online impartido en Coursera que enseña a diseñar estrategias de comunicación efectivas en el entorno corporativo. Abarca temas esenciales como la negociación colaborativa, el análisis de perfiles de audiencia, la detección de mentiras y el uso de la retroalimentación constructiva para guiar equipos.',
    2
  ),
  (
    'Successful Negotiation: Essential Strategies and Skills',
    'University of Michigan',
    'course',
    'https://www.coursera.org/learn/negotiation-skills/',
    'Curso de alto prestigio en Coursera enfocado en las cuatro etapas clave de una negociación exitosa: la preparación estratégica, el diseño del plan de acción, la implementación de tácticas de persuasión mutua y la formalización de contratos estables, aplicando metodologías modernas basadas en la teoría de juegos.',
    2
  ),
  (
    'Diplomado en Comunicación Estratégica',
    'Pontificia Universidad Javeriana',
    'diplomado',
    'https://educacioncontinua.javeriana.edu.co/',
    'Programa de especialización ejecutiva enfocado en la gestión integral de la comunicación corporativa. Cubre módulos de manejo de crisis institucionales, relaciones públicas efectivas con los medios y el diseño de narrativas multicanal para alinear a los públicos de interés internos y externos.',
    3
  );
