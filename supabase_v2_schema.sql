-- ============================================================
-- StoiComunication V2 - Programa de 90 dias con fechas reales
-- Schema: stoic
-- Ejecutar DESPUES de supabase_schema.sql (usa el mismo schema)
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Tracks: cada track es un programa de 90 dias independiente
-- con su propia fecha de inicio (fechas reales, no dias relativos)
CREATE TABLE IF NOT EXISTS stoic.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 90,
  start_date DATE, -- NULL = track no iniciado; el usuario elige cuando empezar
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ejercicio diario del programa (contenido estatico, 90 por track)
CREATE TABLE IF NOT EXISTS stoic.program_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 90),
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 3),
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 13),
  -- Disciplinas estoicas: percepcion (asentimiento), accion, voluntad (deseo)
  module TEXT NOT NULL CHECK (module IN ('perception', 'action', 'will', 'evaluation')),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,  -- Que hacer hoy (concreto y accionable)
  rationale TEXT,              -- Por que funciona
  source_author TEXT,          -- Referente del que proviene la tecnica
  UNIQUE (track_id, day_number)
);

-- Reto semanal del programa (contenido estatico, 13 por track)
CREATE TABLE IF NOT EXISTS stoic.program_weeks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 13),
  theme TEXT NOT NULL,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  deliverable TEXT, -- Entregable concreto y verificable de la semana
  UNIQUE (track_id, week_number)
);

-- Hito mensual del programa (contenido estatico, 3 por track)
CREATE TABLE IF NOT EXISTS stoic.program_months (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (track_id, month_number)
);

-- Log diario por track y FECHA REAL.
-- Un dia sin log completado cuya fecha ya paso = dia perdido.
-- Los dias perdidos se marcan, nunca se reorganiza el calendario.
CREATE TABLE IF NOT EXISTS stoic.day_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 90),
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (track_id, date)
);

-- Log del reto semanal
CREATE TABLE IF NOT EXISTS stoic.week_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 13),
  completed BOOLEAN NOT NULL DEFAULT false,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (track_id, week_number)
);

-- Log del hito mensual
CREATE TABLE IF NOT EXISTS stoic.month_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 3),
  completed BOOLEAN NOT NULL DEFAULT false,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (track_id, month_number)
);

-- Diario estructurado (plantillas manana / noche / semanal / libre)
-- content es JSONB con las respuestas de la plantilla:
--   morning: { identity, goals, triggers, pattern_to_break }
--   evening: { did_well, to_improve, learned, gratitude }
--   weekly:  { why_wake_up, praise_self, sacrifice, next_week }
--   free:    { text }
CREATE TABLE IF NOT EXISTS stoic.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('morning', 'evening', 'weekly', 'free')),
  mood INTEGER CHECK (mood BETWEEN 1 AND 5), -- estado de animo reportado (para la evaluacion final)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (date, entry_type)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_program_days_track ON stoic.program_days(track_id, day_number);
CREATE INDEX IF NOT EXISTS idx_day_logs_track_date ON stoic.day_logs(track_id, date);
CREATE INDEX IF NOT EXISTS idx_day_logs_date ON stoic.day_logs(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON stoic.journal_entries(date);

-- ============================================================
-- GRANTS (por si los default privileges no aplican)
-- ============================================================
GRANT ALL ON ALL TABLES IN SCHEMA stoic TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA stoic TO anon, authenticated;

-- ============================================================
-- SEED: los dos tracks (sin fecha de inicio; se elige en la app)
-- ============================================================
INSERT INTO stoic.tracks (slug, name, description) VALUES
  (
    'comunicacion',
    'Comunicación Estoica',
    'Cómo hablas con los demás: voz, escucha, negociación, storytelling y liderazgo comunicativo. 90 días de práctica deliberada basada en Robbins, Solà, Voss, Duhigg, Gallo, Brown y Martell.'
  ),
  (
    'interna',
    'Práctica Interna',
    'Cómo te hablas a ti mismo: journaling, examen matutino y nocturno, ruptura de bucles, identidad y propósito. 90 días basados en el estoicismo práctico, la logoterapia de Frankl y los protocolos de Martell, Howes y Robbins.'
  )
ON CONFLICT (slug) DO NOTHING;
