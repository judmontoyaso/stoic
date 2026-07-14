-- ============================================================
-- StoiComunication V3 - Progreso POR USUARIO
--
-- ORDEN RECOMENDADO:
--   1. Inicia sesión en la app con Google + código de acceso
--      (crea tu usuario aprobado en auth.users)
--   2. Ejecuta este script COMPLETO en el SQL Editor
--   El script es idempotente: puede re-ejecutarse sin daño.
--   Si lo corres antes del primer login, vuelve a correrlo después
--   para que el backfill asigne tus datos históricos a tu usuario.
--
-- Qué hace:
--   - user_tracks: fecha de inicio del programa POR usuario
--   - user_id en day_logs, week_logs, month_logs, journal_entries
--   - uniques nuevos que incluyen user_id
--   - RLS: cada usuario solo ve y escribe SUS filas
--   - Backfill: asigna lo existente al primer usuario aprobado
-- ============================================================

-- ============================================================
-- 1. user_tracks: inicio del programa por usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS stoic.user_tracks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);

-- ============================================================
-- 2. user_id en las tablas de progreso
--    DEFAULT auth.uid(): los inserts del cliente no necesitan enviarlo
-- ============================================================
ALTER TABLE stoic.day_logs        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE stoic.week_logs       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE stoic.month_logs      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE stoic.journal_entries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- ============================================================
-- 3. Uniques nuevos con user_id (los viejos impedían multiusuario)
-- ============================================================
ALTER TABLE stoic.day_logs        DROP CONSTRAINT IF EXISTS day_logs_track_id_date_key;
ALTER TABLE stoic.week_logs       DROP CONSTRAINT IF EXISTS week_logs_track_id_week_number_key;
ALTER TABLE stoic.month_logs      DROP CONSTRAINT IF EXISTS month_logs_track_id_month_number_key;
ALTER TABLE stoic.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_date_entry_type_key;

CREATE UNIQUE INDEX IF NOT EXISTS day_logs_user_track_date_key       ON stoic.day_logs(user_id, track_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS week_logs_user_track_week_key      ON stoic.week_logs(user_id, track_id, week_number);
CREATE UNIQUE INDEX IF NOT EXISTS month_logs_user_track_month_key    ON stoic.month_logs(user_id, track_id, month_number);
CREATE UNIQUE INDEX IF NOT EXISTS journal_user_date_type_key         ON stoic.journal_entries(user_id, date, entry_type);

-- ============================================================
-- 4. Backfill: datos históricos -> primer usuario aprobado
--    (re-ejecutable: solo toca filas con user_id NULL)
-- ============================================================
DO $$
DECLARE v_user UUID;
BEGIN
  SELECT id INTO v_user
  FROM auth.users
  WHERE raw_app_meta_data ->> 'stoicom_approved' = 'true'
  ORDER BY created_at
  LIMIT 1;

  IF v_user IS NOT NULL THEN
    UPDATE stoic.day_logs        SET user_id = v_user WHERE user_id IS NULL;
    UPDATE stoic.week_logs       SET user_id = v_user WHERE user_id IS NULL;
    UPDATE stoic.month_logs      SET user_id = v_user WHERE user_id IS NULL;
    UPDATE stoic.journal_entries SET user_id = v_user WHERE user_id IS NULL;

    -- La fecha de inicio global de tracks pasa a ser la del primer usuario
    INSERT INTO stoic.user_tracks (user_id, track_id, start_date)
    SELECT v_user, id, start_date
    FROM stoic.tracks
    WHERE start_date IS NOT NULL
    ON CONFLICT (user_id, track_id) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 5. RLS: cada usuario solo ve/escribe lo suyo.
--    Contenido del programa: lectura para cualquier autenticado.
--    El rol anon pierde todo acceso (antes tenía GRANT ALL).
-- ============================================================
REVOKE ALL ON ALL TABLES IN SCHEMA stoic FROM anon;

ALTER TABLE stoic.tracks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.program_days     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.program_weeks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.program_months   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.user_tracks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.day_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.week_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.month_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.journal_entries  ENABLE ROW LEVEL SECURITY;

-- Contenido estático: solo lectura autenticada
DROP POLICY IF EXISTS tracks_read          ON stoic.tracks;
DROP POLICY IF EXISTS program_days_read    ON stoic.program_days;
DROP POLICY IF EXISTS program_weeks_read   ON stoic.program_weeks;
DROP POLICY IF EXISTS program_months_read  ON stoic.program_months;
CREATE POLICY tracks_read         ON stoic.tracks         FOR SELECT TO authenticated USING (true);
CREATE POLICY program_days_read   ON stoic.program_days   FOR SELECT TO authenticated USING (true);
CREATE POLICY program_weeks_read  ON stoic.program_weeks  FOR SELECT TO authenticated USING (true);
CREATE POLICY program_months_read ON stoic.program_months FOR SELECT TO authenticated USING (true);

-- Progreso: dueño total de sus filas
DROP POLICY IF EXISTS user_tracks_own ON stoic.user_tracks;
DROP POLICY IF EXISTS day_logs_own    ON stoic.day_logs;
DROP POLICY IF EXISTS week_logs_own   ON stoic.week_logs;
DROP POLICY IF EXISTS month_logs_own  ON stoic.month_logs;
DROP POLICY IF EXISTS journal_own     ON stoic.journal_entries;
CREATE POLICY user_tracks_own ON stoic.user_tracks      FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY day_logs_own    ON stoic.day_logs         FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY week_logs_own   ON stoic.week_logs        FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY month_logs_own  ON stoic.month_logs       FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY journal_own     ON stoic.journal_entries  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Grants (RLS es el filtro; el rol necesita el permiso base)
GRANT SELECT ON stoic.tracks, stoic.program_days, stoic.program_weeks, stoic.program_months TO authenticated;
GRANT ALL ON stoic.user_tracks, stoic.day_logs, stoic.week_logs, stoic.month_logs, stoic.journal_entries TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA stoic TO service_role;

-- ============================================================
-- Verificación
-- ============================================================
SELECT
  (SELECT count(*) FROM stoic.user_tracks)                          AS user_tracks,
  (SELECT count(*) FROM stoic.day_logs        WHERE user_id IS NULL) AS day_logs_sin_usuario,
  (SELECT count(*) FROM stoic.journal_entries WHERE user_id IS NULL) AS journal_sin_usuario;
