-- ============================================================
-- StoiComunication V2 - Suscripciones Web Push (PWA)
-- Ejecutar COMPLETO en el SQL Editor de Supabase.
-- ============================================================

CREATE TABLE IF NOT EXISTS stoic.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL, -- { p256dh, auth }
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- App de un solo usuario con contraseña propia: sin RLS (igual que el resto)
ALTER TABLE stoic.push_subscriptions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA stoic TO anon, authenticated, service_role;

SELECT 'push_subscriptions lista' AS resultado;
