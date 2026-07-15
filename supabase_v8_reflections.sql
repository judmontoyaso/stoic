-- ============================================================
-- StoiComunication V8 - Consejo del mentor persistido
--
-- Ejecutar en el SQL Editor de Supabase (idempotente).
-- El cron matutino genera la reflexión IA para el correo; ahora
-- también la guarda aquí para que la app la muestre en "Hoy".
-- ============================================================

CREATE TABLE IF NOT EXISTS stoic.daily_reflections (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reflection TEXT NOT NULL,
  actionable_tip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, date)
);

ALTER TABLE stoic.daily_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_reflections_read_own ON stoic.daily_reflections;
CREATE POLICY daily_reflections_read_own ON stoic.daily_reflections
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON stoic.daily_reflections FROM anon;
GRANT SELECT ON stoic.daily_reflections TO authenticated;
GRANT ALL ON stoic.daily_reflections TO service_role;

SELECT 'daily_reflections lista' AS resultado;
