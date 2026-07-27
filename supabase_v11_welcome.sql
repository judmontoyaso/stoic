-- V11: correo de activación para aprobados sin programa iniciado.
--
-- Problema que resuelve: un usuario aprobado (pagó o usó código) que nunca
-- elige fecha de inicio no tiene fila en user_tracks. Los cuatro crons lo
-- saltan con un `continue` silencioso, así que no recibe ningún correo —
-- ni hoy ni nunca. Si pagó, está pagando por nada y nadie se entera.
--
-- La columna guarda la fecha local del último correo de activación enviado,
-- para no repetirlo cada hora que corre el cron.
--
-- Ejecutar una vez en el editor SQL de Supabase.

ALTER TABLE stoic.user_prefs
  ADD COLUMN IF NOT EXISTS last_welcome_sent date;

COMMENT ON COLUMN stoic.user_prefs.last_welcome_sent IS
  'Fecha local del último correo de activación (aprobado sin track). Dedupe del cron de retención.';

-- Verificación
SELECT
  (SELECT count(*) FROM stoic.user_prefs) AS filas_prefs,
  (SELECT count(*) FROM information_schema.columns
    WHERE table_schema = 'stoic'
      AND table_name = 'user_prefs'
      AND column_name = 'last_welcome_sent') AS columna_creada;
