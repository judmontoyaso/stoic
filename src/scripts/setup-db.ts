import { Client } from 'pg'

const connectionString = 'postgres://postgres:cleopatra123@db.gfyvjogffxgzkjrompdg.supabase.co:5432/postgres'

const setupSQL = `
-- 1. Create the schema
CREATE SCHEMA IF NOT EXISTS stoic;

-- ============================================================
-- TABLES
-- ============================================================

-- Habits (communication, stoic, social)
CREATE TABLE IF NOT EXISTS stoic.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('stoic', 'communication', 'social')),
  phase INTEGER CHECK (phase BETWEEN 1 AND 3),
  week INTEGER CHECK (week BETWEEN 1 AND 12),
  sort_order INTEGER DEFAULT 0,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily habit logs
CREATE TABLE IF NOT EXISTS stoic.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES stoic.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Challenges (social ladder, communication, stoic)
CREATE TABLE IF NOT EXISTS stoic.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('social_ladder', 'communication', 'stoic')),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  phase INTEGER CHECK (phase BETWEEN 1 AND 3),
  week INTEGER CHECK (week BETWEEN 1 AND 12),
  sort_order INTEGER DEFAULT 0,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge completion logs
CREATE TABLE IF NOT EXISTS stoic.challenge_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES stoic.challenges(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, date)
);

-- Weekly reviews (Seneca style)
CREATE TABLE IF NOT EXISTS stoic.weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 3),
  date TIMESTAMPTZ DEFAULT now(),
  bad_habits_resisted TEXT,
  progress_made TEXT,
  next_week_plan TEXT,
  gratitude TEXT,
  stoic_quote TEXT
);

-- Resources (books, courses, YouTubers)
CREATE TABLE IF NOT EXISTS stoic.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  type TEXT NOT NULL CHECK (type IN ('book', 'youtube', 'course', 'diplomado')),
  url TEXT,
  description TEXT,
  phase INTEGER CHECK (phase BETWEEN 1 AND 3),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON stoic.habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON stoic.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_date ON stoic.challenge_logs(date);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_challenge_id ON stoic.challenge_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_habits_category ON stoic.habits(category);
CREATE INDEX IF NOT EXISTS idx_habits_phase ON stoic.habits(phase);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON stoic.challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_phase ON stoic.challenges(phase);
CREATE INDEX IF NOT EXISTS idx_challenges_level ON stoic.challenges(level);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_phase ON stoic.weekly_reviews(phase);
CREATE INDEX IF NOT EXISTS idx_resources_type ON stoic.resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_phase ON stoic.resources(phase);
`

async function runSetup() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('Conectando a PostgreSQL de Supabase...')
    await client.connect()
    console.log('Conexión exitosa a PostgreSQL!')

    console.log('Ejecutando script de creación de tablas en esquema "stoic"...')
    await client.query(setupSQL)
    console.log('Esquema y tablas creadas exitosamente!')

    // Insertar datos de semilla si no existen
    console.log('Insertando datos semilla...')

    // Hábitos Fase 1
    const habitsPhase1 = [
      ['Grabarte 2 min hablando', 'Habla de un tema random, revisa muletillas y lenguaje corporal', 'communication', 1, 1, 1],
      ['Hacer 1 pregunta antes de opinar', 'En cada reunion de equipo, haz al menos 1 pregunta antes de dar tu opinion', 'communication', 1, 2, 2],
      ['Pausas de 2 segundos', 'Practica pausas de 2 segundos antes de responder algo importante', 'communication', 1, 3, 3],
      ['Status update sin notas', 'Da una actualizacion de status a tu equipo sin leer notas', 'communication', 1, 4, 4]
    ]
    for (const h of habitsPhase1) {
      await client.query(
        'INSERT INTO stoic.habits (name, description, category, phase, week, sort_order) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        h
      )
    }

    // Hábitos Fase 2
    const habitsPhase2 = [
      ['Usar labeling', 'Usa "labeling" (nombrar la emocion del otro) en una conversacion dificil', 'communication', 2, 5, 5],
      ['Presentar con historia', 'Presenta un avance tecnico usando una historia, no solo datos', 'communication', 2, 6, 6],
      ['Calibrated questions', 'Usa "calibrated questions" (como podriamos...?) en vez de dar la solucion directo', 'communication', 2, 7, 7],
      ['Dar noticias sin justificarte', 'Da una noticia incomoda (retraso, bug, cambio) sin justificarte de mas', 'communication', 2, 8, 8]
    ]
    for (const h of habitsPhase2) {
      await client.query(
        'INSERT INTO stoic.habits (name, description, category, phase, week, sort_order) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        h
      )
    }

    // Hábitos Fase 3
    const habitsPhase3 = [
      ['Feedback SBI', 'Da feedback directo usando el modelo situacion-comportamiento-impacto', 'communication', 3, 9, 9],
      ['Ceder la palabra', 'En una junta, cede la palabra activamente y haz que alguien mas brille', 'communication', 3, 10, 10],
      ['Decir no se o me equivoque', 'Practica decir "no se" o "me equivoque" en voz alta sin minimizarlo', 'communication', 3, 11, 11],
      ['Presentacion de cierre', 'Cierra el trimestre con una presentacion de resultados aplicando todo lo anterior', 'communication', 3, 12, 12]
    ]
    for (const h of habitsPhase3) {
      await client.query(
        'INSERT INTO stoic.habits (name, description, category, phase, week, sort_order) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        h
      )
    }

    // Retos Escalera Social
    const challenges = [
      ['Sonrie y da buenos dias', 'Sonriele y da los buenos dias a alguien en el ascensor o porteria', 'social_ladder', 1, 1, 1, 1],
      ['Agradece mirando a los ojos', 'Dale las gracias al cajero del super mirandolo a los ojos, no al celular', 'social_ladder', 1, 1, 1, 2],
      ['Comenta algo neutro', 'Comenta algo neutro con quien te atiende en la panaderia o tienda', 'social_ladder', 1, 1, 2, 3],
      ['Pregunta a un desconocido', 'Preguntale algo a un desconocido en la calle (una direccion, la hora)', 'social_ladder', 2, 1, 3, 4],
      ['Cumplido genuino', 'Hazle un cumplido genuino y breve a alguien (companero de gym, barista)', 'social_ladder', 2, 1, 3, 5],
      ['Comenta en la fila', 'En la fila del super, comenta algo sobre lo que la persona esta comprando', 'social_ladder', 2, 1, 4, 6],
      ['Charla de 2-3 min', 'Inicia una charla de 2-3 minutos con alguien nuevo en el gym a las 5am', 'social_ladder', 3, 2, 5, 7],
      ['Que te trajo por aca?', 'Preguntale a alguien "que te trajo por aca?" en un evento o fila', 'social_ladder', 3, 2, 5, 8],
      ['Habla con un vecino', 'Habla con un vecino que normalmente solo saludas de pasada', 'social_ladder', 3, 2, 6, 9],
      ['Pregunta abierta + escucha', 'Une dos temas: pregunta abierta + escucha activa sin interrumpir hasta que termine', 'social_ladder', 4, 2, 7, 10],
      ['Elogio + pregunta abierta', 'Practica el "elogio + pregunta abierta" sobre el entorno compartido', 'social_ladder', 4, 2, 7, 11],
      ['Cierra elegantemente', 'Cierra una conversacion de forma elegante en vez de simplemente irte', 'social_ladder', 4, 2, 8, 12]
    ]
    for (const c of challenges) {
      await client.query(
        'INSERT INTO stoic.challenges (title, description, category, level, phase, week, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        c
      )
    }

    // Recursos
    const resources = [
      ['El lenguaje del cuerpo', 'Allan Pease', 'book', null, 'Guia practica sobre comunicacion no verbal, rapido de leer', 1],
      ['Never Split the Difference', 'Chris Voss', 'book', null, 'Negociacion y comunicacion bajo presion, tecnicas del FBI', 2],
      ['Dare to Lead', 'Brene Brown', 'book', null, 'Vulnerabilidad y conexion autentica en el liderazgo', 3],
      ['Comunicacion No Violenta', 'Marshall Rosenberg', 'book', null, 'Clasico practico sobre comunicacion empatica y efectiva', null],
      ['Talk Like TED', 'Carmine Gallo', 'book', null, 'Storytelling y presentaciones de alto impacto', null],
      ['Start With Why', 'Simon Sinek', 'book', null, 'Comunicacion de proposito y liderazgo inspirador', null],
      ['Victor Toscano - Curso Oratoria', 'Victor Toscano', 'youtube', 'https://www.youtube.com/@TecnicasHablarEnPublico', 'Curso gratuito de 33 videos, desde perder el miedo hasta estructurar presentaciones', 1],
      ['Sebastian Lora', 'Sebastian Lora', 'youtube', 'https://www.youtube.com/@SebasLora', 'El mas completo en espanol: oratoria, persuasion, lenguaje corporal, carisma', 2],
      ['Lewis Howes - School of Greatness', 'Lewis Howes', 'youtube', 'https://www.youtube.com/@LewisHowes', 'Comunicacion, vulnerabilidad y liderazgo personal', 3],
      ['Fundel Colombia', 'Nelson Cubides', 'youtube', 'https://www.youtube.com/@FundelColombia', 'Curso de oratoria colombiano, referencia local', null],
      ['Israel Munoz', 'Israel Munoz', 'youtube', 'https://www.youtube.com/@IsraelMunozOficial', 'Combina psicologia con expresion oral', null],
      ['Improving Communication Skills', 'University of Pennsylvania', 'course', 'https://www.coursera.org/learn/wharton-communication-skills', 'Curso de Coursera sobre habilidades de comunicacion', null],
      ['Diplomado Habilidades Comunicativas', 'Universidad de La Sabana', 'diplomado', 'https://www.unisabana.edu.co/', '3 modulos: comunicacion oral, liderazgo comunicativo, comunicacion estrategica ejecutiva', null],
      ['Competencias Ejecutivas EAFIT', 'EAFIT', 'diplomado', 'https://www.eafit.edu.co/', 'Incluye comunicacion, toma de decisiones y gestion del cambio', null]
    ]
    for (const r of resources) {
      await client.query(
        'INSERT INTO stoic.resources (title, author, type, url, description, phase) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        r
      )
    }

    console.log('Datos semilla insertados exitosamente!')
    console.log('Configuración de base de datos finalizada correctamente!')

  } catch (error) {
    console.error('Error durante la configuración de base de datos:', error)
  } finally {
    await client.end()
  }
}

runSetup()
