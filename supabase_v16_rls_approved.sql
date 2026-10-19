-- ============================================================
-- StoiCom V16: Endurecimiento de RLS sobre el contenido del programa
--
-- Antes (supabase_v3_multiuser.sql), program_days, program_weeks y
-- program_months tenían USING (true) para cualquier usuario autenticado,
-- lo que permitía a una cuenta autenticada con Google pero NO aprobada
-- consultar los 210 ejercicios directamente con la anon key.
--
-- Esta migración exige app_metadata.stoicom_approved = true en el JWT
-- para leer el contenido del programa desde el navegador.
-- (El service_role del backend ignora RLS como siempre.)
-- Idempotente: se puede re-ejecutar sin romper nada.
-- ============================================================

DROP POLICY IF EXISTS program_days_read   ON stoic.program_days;
DROP POLICY IF EXISTS program_weeks_read  ON stoic.program_weeks;
DROP POLICY IF EXISTS program_months_read ON stoic.program_months;

CREATE POLICY program_days_read ON stoic.program_days
  FOR SELECT TO authenticated
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'stoicom_approved')::boolean, false) = true);

CREATE POLICY program_weeks_read ON stoic.program_weeks
  FOR SELECT TO authenticated
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'stoicom_approved')::boolean, false) = true);

CREATE POLICY program_months_read ON stoic.program_months
  FOR SELECT TO authenticated
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'stoicom_approved')::boolean, false) = true);
