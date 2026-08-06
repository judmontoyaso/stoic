-- ============================================================
-- StoiComunication V15 - Dictado por voz + análisis del diario
--
-- Ejecutar en el SQL Editor de Supabase (idempotente).
--
-- Dos funciones nuevas, ambas con costo por uso, y por eso ambas con
-- freno:
--
--   1. Dictado (Deepgram). El audio del diario sale hacia un tercero
--      fuera del país, así que necesita consentimiento EXPLÍCITO por
--      usuario (no basta con que esté en /privacy) y tope mensual de
--      minutos, o un usuario con el micrófono abierto se come el margen.
--
--   2. Análisis mensual del diario (DeepSeek). Se cachea por mes: sin
--      caché, cada visita a /evaluation volvería a pagar la generación.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Consentimiento del dictado
--
-- Ley 1581: mandar la voz de alguien a un procesador en el exterior
-- exige autorización previa e informada. NULL = no ha aceptado, y sin
-- eso /api/transcribe rechaza.
-- ------------------------------------------------------------
ALTER TABLE stoic.user_prefs
  ADD COLUMN IF NOT EXISTS voice_consent_at TIMESTAMPTZ;


-- ------------------------------------------------------------
-- 2. Consumo de transcripción por mes
--
-- month en texto 'YYYY-MM': el tope se reinicia solo al cambiar de mes,
-- sin cron que lo limpie.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stoic.transcription_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  seconds INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month)
);

ALTER TABLE stoic.transcription_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON stoic.transcription_usage FROM anon, authenticated;
GRANT ALL ON stoic.transcription_usage TO service_role;

-- Suma segundos y devuelve el total del mes. Atómico: dos dictados
-- simultáneos no pueden pisarse el contador.
CREATE OR REPLACE FUNCTION stoic.add_transcription_seconds(
  p_user UUID,
  p_month TEXT,
  p_seconds INT
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = stoic, public
AS $$
DECLARE
  v_total INT;
BEGIN
  INSERT INTO stoic.transcription_usage (user_id, month, seconds)
  VALUES (p_user, p_month, p_seconds)
  ON CONFLICT (user_id, month) DO UPDATE
    SET seconds = stoic.transcription_usage.seconds + EXCLUDED.seconds,
        updated_at = now()
  RETURNING seconds INTO v_total;
  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION stoic.add_transcription_seconds(UUID, TEXT, INT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION stoic.add_transcription_seconds(UUID, TEXT, INT) TO service_role;


-- ------------------------------------------------------------
-- 3. Análisis mensual del diario
--
-- Un informe por usuario y mes. entries_count guarda cuántas entradas
-- lo alimentaron: si el usuario escribe más durante el mes, se puede
-- regenerar sabiendo que hay material nuevo.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stoic.monthly_analyses (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,               -- 'YYYY-MM'
  analysis TEXT NOT NULL,
  entries_count INT NOT NULL DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month)
);

ALTER TABLE stoic.monthly_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS monthly_analyses_read_own ON stoic.monthly_analyses;
CREATE POLICY monthly_analyses_read_own ON stoic.monthly_analyses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON stoic.monthly_analyses FROM anon;
GRANT SELECT ON stoic.monthly_analyses TO authenticated;
GRANT ALL ON stoic.monthly_analyses TO service_role;


-- ============================================================
-- Verificación
-- ============================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema = 'stoic' AND table_name = 'user_prefs'
       AND column_name = 'voice_consent_at')                        AS consent_ok,
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema = 'stoic' AND table_name = 'transcription_usage') AS usage_ok,
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema = 'stoic' AND table_name = 'monthly_analyses')    AS analyses_ok,
  (SELECT count(*) FROM information_schema.routines
     WHERE routine_schema = 'stoic' AND routine_name = 'add_transcription_seconds') AS rpc_ok;
