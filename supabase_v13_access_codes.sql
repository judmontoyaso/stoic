-- V13: códigos de acceso únicos + aplicaciones a becas.
--
-- Hasta ahora el único código era ACCESS_CODE (env compartida): si se
-- filtra, cualquiera entra para siempre y sin atribución. Esta tabla da
-- códigos de UN SOLO USO con etiqueta de campaña (beca-creador,
-- beca-aplicacion, referido...) — quién lo usó, cuándo, y de qué canal
-- vino. El código compartido sigue funcionando como legacy.
--
-- beca_applications: formulario público /becas. El admin aprueba desde
-- /admin/becas y el sistema envía el código por correo.
--
-- Ejecutar una vez en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS stoic.access_codes (
  code TEXT PRIMARY KEY,
  campaign TEXT NOT NULL,
  note TEXT,                    -- para quién se creó ("DM @fulano", correo…)
  expires_at TIMESTAMPTZ,       -- NULL = no expira
  redeemed_by UUID,             -- auth.users.id de quien lo usó
  redeemed_email TEXT,
  redeemed_at TIMESTAMPTZ,      -- NULL = disponible
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stoic.beca_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  activity TEXT,                -- a qué se dedica
  reason TEXT NOT NULL,         -- por qué quiere la beca
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  code TEXT,                    -- código otorgado al aprobar
  created_at TIMESTAMPTZ DEFAULT now(),
  decided_at TIMESTAMPTZ
);

-- Una aplicación por correo
CREATE UNIQUE INDEX IF NOT EXISTS beca_applications_email_uq
  ON stoic.beca_applications (lower(email));

-- Solo el servidor toca estas tablas
ALTER TABLE stoic.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.beca_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON stoic.access_codes FROM anon, authenticated;
REVOKE ALL ON stoic.beca_applications FROM anon, authenticated;
GRANT ALL ON stoic.access_codes TO service_role;
GRANT ALL ON stoic.beca_applications TO service_role;

-- Verificación
SELECT
  (SELECT count(*) FROM information_schema.tables
    WHERE table_schema = 'stoic' AND table_name = 'access_codes') AS access_codes_ok,
  (SELECT count(*) FROM information_schema.tables
    WHERE table_schema = 'stoic' AND table_name = 'beca_applications') AS beca_applications_ok;
