-- ============================================================
-- StoiComunication V2 - FIX: RLS y permisos
-- Las tablas V2 se crearon con Row Level Security activado por
-- defecto, lo que bloquea al rol anon que usa la app.
-- La app es de un solo usuario protegida por contraseña propia,
-- igual que las tablas V1 (habits, challenges...) que no usan RLS.
-- Ejecutar COMPLETO en el SQL Editor de Supabase.
-- ============================================================

ALTER TABLE stoic.tracks           DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.program_days     DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.program_weeks    DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.program_months   DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.day_logs         DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.week_logs        DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.month_logs       DISABLE ROW LEVEL SECURITY;
ALTER TABLE stoic.journal_entries  DISABLE ROW LEVEL SECURITY;

-- Acceso tambien para service_role (faltaba en el schema V1)
GRANT USAGE ON SCHEMA stoic TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA stoic TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA stoic TO service_role;

-- Asegurar los dos tracks (idempotente)
INSERT INTO stoic.tracks (slug, name, description) VALUES
  (
    'comunicacion',
    'Comunicación Estoica',
    'Cómo hablas con los demás: voz, escucha, negociación, storytelling y liderazgo comunicativo. 90 días de práctica deliberada basada en Robbins, Solà, Voss, Duhigg, Gallo, Brown y Martell.'
  ),
  (
    'interna',
    'Práctica Interna',
    'Cómo te hablas a ti mismo: journaling, examen matutino y nocturno, ruptura de bucles, identidad y propósito. 90 días basados en el estoicismo práctico, la logoterapia de Frankl y los protocolos de Martell, Howes y Robbins.'
  )
ON CONFLICT (slug) DO NOTHING;

-- Verificacion: debe devolver 2 tracks y los conteos de contenido
SELECT
  (SELECT count(*) FROM stoic.tracks)         AS tracks,
  (SELECT count(*) FROM stoic.program_days)   AS dias,
  (SELECT count(*) FROM stoic.program_weeks)  AS semanas,
  (SELECT count(*) FROM stoic.program_months) AS meses;
