-- ============================================================
-- StoiComunication V9 - Captura de correos (lista de espera + drip)
--
-- Ejecutar en el SQL Editor de Supabase (idempotente).
--
-- Qué hace:
--   - leads: correos capturados en la landing, con doble opt-in.
--     El token sirve para confirmar y para darse de baja.
--     drip_day = cuántos correos de la secuencia de 7 ya recibió.
--   - RLS activo SIN políticas: ni anon ni authenticated tocan la
--     tabla. Todo pasa por las rutas /api/leads con service role.
-- ============================================================

CREATE TABLE IF NOT EXISTS stoic.leads (
  email TEXT PRIMARY KEY,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Doble opt-in
  confirm_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  -- Secuencia de 7 días
  drip_day INT NOT NULL DEFAULT 0 CHECK (drip_day BETWEEN 0 AND 7),
  last_drip_sent DATE,
  -- Salidas del embudo
  unsubscribed_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_token_idx ON stoic.leads (token);
-- Cola del drip: confirmados, no dados de baja, sin terminar la secuencia
CREATE INDEX IF NOT EXISTS leads_drip_idx
  ON stoic.leads (last_drip_sent)
  WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL AND drip_day < 7;

ALTER TABLE stoic.leads ENABLE ROW LEVEL SECURITY;

-- Sin políticas: nadie con las llaves públicas lee ni escribe aquí.
-- service_role ignora RLS, que es como entran las rutas /api/leads.
REVOKE ALL ON stoic.leads FROM anon, authenticated;
GRANT ALL ON stoic.leads TO service_role;

-- ============================================================
-- Verificación
-- ============================================================
SELECT
  (SELECT count(*) FROM stoic.leads)                                AS leads,
  (SELECT count(*) FROM stoic.leads WHERE confirmed_at IS NOT NULL) AS confirmados;
