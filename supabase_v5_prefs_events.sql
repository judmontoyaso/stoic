-- ============================================================
-- StoiComunication V5 - Preferencias por usuario + eventos
--
-- Ejecutar COMPLETO en el SQL Editor de Supabase (idempotente).
-- Requiere supabase_v3_multiuser.sql ejecutado antes.
--
-- Qué hace:
--   - user_prefs: zona horaria y hora de los correos por usuario.
--     last_*_sent hace idempotentes a los crons: pueden dispararse
--     cada hora sin duplicar correos.
--   - events: métricas de producto (activación, retención) sin
--     depender de servicios externos.
-- ============================================================

-- ============================================================
-- 1. Preferencias por usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS stoic.user_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/Bogota',
  morning_hour INT NOT NULL DEFAULT 6 CHECK (morning_hour BETWEEN 0 AND 23),
  evening_hour INT NOT NULL DEFAULT 20 CHECK (evening_hour BETWEEN 0 AND 23),
  -- Fecha local (en su timezone) del último correo enviado de cada tipo
  last_morning_sent DATE,
  last_evening_sent DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stoic.user_prefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_prefs_own ON stoic.user_prefs;
CREATE POLICY user_prefs_own ON stoic.user_prefs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT ALL ON stoic.user_prefs TO authenticated;
GRANT ALL ON stoic.user_prefs TO service_role;

-- ============================================================
-- 2. Eventos de producto
--    El cliente solo inserta los suyos; leer requiere service_role.
-- ============================================================
CREATE TABLE IF NOT EXISTS stoic.events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  props JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_name_created_idx ON stoic.events (name, created_at);
CREATE INDEX IF NOT EXISTS events_user_created_idx ON stoic.events (user_id, created_at);

ALTER TABLE stoic.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_insert_own ON stoic.events;
CREATE POLICY events_insert_own ON stoic.events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT INSERT ON stoic.events TO authenticated;
GRANT ALL ON stoic.events TO service_role;

-- ============================================================
-- Verificación
-- ============================================================
SELECT
  (SELECT count(*) FROM stoic.user_prefs) AS user_prefs,
  (SELECT count(*) FROM stoic.events)     AS events;
