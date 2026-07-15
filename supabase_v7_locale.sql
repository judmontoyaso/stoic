-- ============================================================
-- StoiComunication V7 - Idioma preferido (preparación i18n)
--
-- Ejecutar en el SQL Editor de Supabase (idempotente).
-- La app guarda navigator.language al guardar preferencias; cuando
-- llegue el soporte multi-idioma ya se sabrá qué quiere cada usuario.
-- ============================================================

ALTER TABLE stoic.user_prefs ADD COLUMN IF NOT EXISTS locale TEXT;

SELECT 'user_prefs.locale listo' AS resultado;
