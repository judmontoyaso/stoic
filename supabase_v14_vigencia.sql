-- ============================================================
-- StoiComunication V14 - Vigencia de un año
--
-- Ejecutar en el SQL Editor de Supabase (idempotente).
--
-- El acceso fundador pasa de vitalicio a un año renovable, con 30 días
-- de gracia para descargar el diario antes de borrar el contenido
-- personal. La vigencia vive en app_metadata.stoicom_expires_at y la
-- escriben los webhooks de pago (ver src/lib/access.ts).
--
-- ESTA MIGRACIÓN HACE DOS COSAS:
--
--   1. Blinda a quien ya compró. La landing anunciaba "Acceso Vitalicio
--      · Pago Único" y eso fue lo que esa gente pagó. Se les marca
--      stoicom_lifetime = true y nunca vencen. Cambiarles el trato
--      después de cobrarles no es una opción.
--
--   2. Crea stoic.lifecycle_emails, el registro de qué aviso de
--      vencimiento se le mandó a quién. Sin esto el cron diario
--      reenviaría el mismo aviso todos los días.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Compradores anteriores al cambio → vitalicios
--
-- Solo los que pagaron (plan 'founder'). Los códigos y becas no llevan
-- marca: readAccess() ya trata "aprobado sin fecha" como sin vencimiento,
-- y así conservan la puerta abierta para ponerles vigencia más adelante.
--
-- La última condición hace la migración re-ejecutable y, sobre todo,
-- impide que una segunda pasada pise a alguien a quien se le hubiera
-- quitado la marca a mano.
-- ------------------------------------------------------------
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
      'stoicom_lifetime', true,
      'stoicom_lifetime_reason', 'compró cuando se anunciaba acceso vitalicio'
    )
WHERE raw_app_meta_data ->> 'stoicom_approved' = 'true'
  AND raw_app_meta_data ->> 'stoicom_plan' = 'founder'
  AND raw_app_meta_data -> 'stoicom_lifetime' IS NULL;


-- ------------------------------------------------------------
-- 2. Registro de avisos del ciclo de vida
--
-- cycle_ends_at forma parte de la clave a propósito: al renovar, el
-- vencimiento se mueve y la serie de avisos del año siguiente vuelve a
-- estar disponible sin borrar el histórico del año anterior.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stoic.lifecycle_emails (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 'aviso_7d' | 'vencido' | 'gracia_15' | 'ultimo_aviso' | 'purgado'
  kind TEXT NOT NULL,
  -- El vencimiento al que corresponde el aviso
  cycle_ends_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, cycle_ends_at)
);

CREATE INDEX IF NOT EXISTS lifecycle_emails_sent_idx
  ON stoic.lifecycle_emails (sent_at);

-- Solo el servidor (crons con service role) toca esta tabla
ALTER TABLE stoic.lifecycle_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON stoic.lifecycle_emails FROM anon, authenticated;
GRANT ALL ON stoic.lifecycle_emails TO service_role;


-- ============================================================
-- Verificación
--
-- vitalicios_blindados debe coincidir con el número de compradores que
-- tenías ANTES de este cambio. Si sale 0 y sabes que hay compras,
-- revisa que esas cuentas tengan stoicom_plan = 'founder'.
-- ============================================================
SELECT
  (SELECT count(*) FROM auth.users
     WHERE raw_app_meta_data ->> 'stoicom_lifetime' = 'true')     AS vitalicios_blindados,
  (SELECT count(*) FROM auth.users
     WHERE raw_app_meta_data ->> 'stoicom_approved' = 'true')     AS aprobados_totales,
  (SELECT count(*) FROM auth.users
     WHERE raw_app_meta_data ? 'stoicom_expires_at')              AS con_vigencia,
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema = 'stoic' AND table_name = 'lifecycle_emails') AS lifecycle_emails_ok;
