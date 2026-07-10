-- ============================================================
-- StoiComunication V2 - Lecturas del día (caché de lecciones IA)
-- Cada lección se genera una vez por (track, día) y se cachea.
-- Ejecutar COMPLETO en el SQL Editor de Supabase.
-- ============================================================

CREATE TABLE IF NOT EXISTS stoic.daily_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES stoic.tracks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 90),
  content TEXT NOT NULL,
  model TEXT, -- modelo que la genero (o 'static' si fue el fallback)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (track_id, day_number)
);

-- La app es de un solo usuario con contraseña propia: sin RLS (igual que el resto)
ALTER TABLE stoic.daily_readings DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA stoic TO anon, authenticated, service_role;

SELECT 'daily_readings lista' AS resultado;
