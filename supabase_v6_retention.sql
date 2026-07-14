-- ============================================================
-- StoiComunication V6 - Correos de retención
--
-- Ejecutar COMPLETO en el SQL Editor de Supabase (idempotente).
-- Requiere supabase_v5_prefs_events.sql ejecutado antes.
--
-- Añade a user_prefs el dedupe de los dos correos nuevos:
--   - last_weekly_sent: resumen semanal del domingo
--   - last_rescue_sent: rescate tras 3+ días de inactividad
-- ============================================================

ALTER TABLE stoic.user_prefs ADD COLUMN IF NOT EXISTS last_weekly_sent DATE;
ALTER TABLE stoic.user_prefs ADD COLUMN IF NOT EXISTS last_rescue_sent DATE;

SELECT 'user_prefs listo para retención' AS resultado;
