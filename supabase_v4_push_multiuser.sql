-- ============================================================
-- StoiComunication V4 - Push por usuario + rate limit del código
--
-- Ejecutar COMPLETO en el SQL Editor de Supabase (idempotente).
-- Requiere haber ejecutado antes supabase_v3_multiuser.sql.
--
-- Qué hace:
--   - push_subscriptions.user_id: cada suscripción pertenece a un
--     usuario; los crons envían a cada quien SU contenido.
--   - RLS en push_subscriptions: solo service_role (el cliente pasa
--     siempre por /api/push/subscribe).
--   - verify_attempts: intentos fallidos del código de acceso, para
--     rate limit persistente (sobrevive los reinicios serverless).
-- ============================================================

-- ============================================================
-- 1. user_id en push_subscriptions
-- ============================================================
ALTER TABLE stoic.push_subscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill: suscripciones viejas -> primer usuario aprobado
DO $$
DECLARE v_user UUID;
BEGIN
  SELECT id INTO v_user
  FROM auth.users
  WHERE raw_app_meta_data ->> 'stoicom_approved' = 'true'
  ORDER BY created_at
  LIMIT 1;

  IF v_user IS NOT NULL THEN
    UPDATE stoic.push_subscriptions SET user_id = v_user WHERE user_id IS NULL;
  END IF;
END $$;

-- ============================================================
-- 2. RLS: la tabla solo se toca con service_role
--    (RLS activo sin políticas = nadie más ve nada)
-- ============================================================
ALTER TABLE stoic.push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON stoic.push_subscriptions FROM anon, authenticated;
GRANT ALL ON stoic.push_subscriptions TO service_role;

-- ============================================================
-- 3. Rate limit del código de acceso
-- ============================================================
CREATE TABLE IF NOT EXISTS stoic.verify_attempts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stoic.verify_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON stoic.verify_attempts FROM anon, authenticated;
GRANT ALL ON stoic.verify_attempts TO service_role;

-- ============================================================
-- Verificación
-- ============================================================
SELECT
  (SELECT count(*) FROM stoic.push_subscriptions WHERE user_id IS NULL) AS push_sin_usuario,
  (SELECT count(*) FROM stoic.verify_attempts)                          AS verify_attempts;
