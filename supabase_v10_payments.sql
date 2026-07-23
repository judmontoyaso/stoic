-- ============================================================
-- StoiComunication V10 - Registro interno de pagos
--
-- Ejecutar en el SQL Editor de Supabase (idempotente).
--
-- Un registro propio de cada pago (aparte del panel de la pasarela):
-- para soporte ("pagué y no entré"), conciliación, reembolsos y métricas
-- de ingresos. NO reemplaza el comprobante que la pasarela envía al
-- comprador ni la factura fiscal.
--
-- RLS activo SIN políticas: solo el service role (las rutas del servidor)
-- lo toca. La lista de pagos no se expone al navegador.
-- ============================================================

CREATE TABLE IF NOT EXISTS stoic.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,               -- 'mercadopago' | 'lemonsqueezy'
  provider_payment_id TEXT NOT NULL,    -- id del pago/orden en la pasarela
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  amount NUMERIC,                       -- en unidades de la moneda (no centavos)
  currency TEXT,
  status TEXT,                          -- 'approved', 'refunded', ...
  plan TEXT,                            -- 'founder'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Idempotencia: el webhook y el retorno del checkout pueden registrar el
  -- mismo pago; el upsert por esta clave evita duplicados.
  UNIQUE (provider, provider_payment_id)
);

CREATE INDEX IF NOT EXISTS payments_user_idx ON stoic.payments (user_id, created_at);
CREATE INDEX IF NOT EXISTS payments_created_idx ON stoic.payments (created_at);

ALTER TABLE stoic.payments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON stoic.payments FROM anon, authenticated;
GRANT ALL ON stoic.payments TO service_role;

-- ============================================================
-- Verificación
-- ============================================================
SELECT
  (SELECT count(*) FROM stoic.payments)                              AS pagos,
  (SELECT count(*) FROM stoic.payments WHERE status = 'approved')    AS aprobados;
