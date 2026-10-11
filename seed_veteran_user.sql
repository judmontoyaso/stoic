-- ============================================================
-- StoiCom — Poblar usuario veterano (Día 25 activo, 24 completados)
-- Ejecutar en el SQL Editor de Supabase (idempotente)
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_track_com UUID;
  v_track_int UUID;
  v_start_date DATE := CURRENT_DATE - INTERVAL '24 days';
  v_day_date DATE;
  i INT;
BEGIN
  -- 1. Buscar el usuario registrado
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'cirosteven278@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'El usuario cirosteven278@gmail.com no fue encontrado en auth.users. Asegúrate de iniciar sesión al menos una vez con Google en la app.';
    RETURN;
  END IF;

  -- 2. Asegurar aprobación como estudiante con Matrícula Anual (NO admin)
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{stoicom_approved}',
      'true'::jsonb
    ),
    '{stoicom_plan}',
    '"annual"'::jsonb
  )
  WHERE id = v_user_id;

  -- 3. Obtener los IDs de los tracks
  SELECT id INTO v_track_com FROM stoic.tracks WHERE slug = 'comunicacion' LIMIT 1;
  SELECT id INTO v_track_int FROM stoic.tracks WHERE slug = 'interna' LIMIT 1;

  IF v_track_com IS NULL THEN
    SELECT id INTO v_track_com FROM stoic.tracks ORDER BY created_at ASC LIMIT 1;
  END IF;
  IF v_track_int IS NULL THEN
    SELECT id INTO v_track_int FROM stoic.tracks ORDER BY created_at DESC LIMIT 1;
  END IF;

  -- 4. Registrar inicio de ambos tracks hace 24 días
  INSERT INTO stoic.user_tracks (user_id, track_id, start_date)
  VALUES 
    (v_user_id, v_track_com, v_start_date),
    (v_user_id, v_track_int, v_start_date)
  ON CONFLICT (user_id, track_id) 
  DO UPDATE SET start_date = EXCLUDED.start_date;

  -- 5. Poblar 24 días completados en ambos tracks
  FOR i IN 1..24 LOOP
    v_day_date := v_start_date + (i - 1);
    
    INSERT INTO stoic.day_logs (user_id, track_id, date, day_number, completed, notes)
    VALUES (
      v_user_id,
      v_track_com,
      v_day_date,
      i,
      true,
      CASE i
        WHEN 1 THEN 'Línea base grabada: 3 minutos sobre mi trabajo. Conté 7 muletillas ("o sea" y "este"). Me sentí acelerado.'
        WHEN 2 THEN 'Aplicada la primera pausa antes de contestar en la reunión matutina. La tensión disminuyó visiblemente.'
        WHEN 3 THEN 'Silencio de 2 segundos tolerado. Mi interlocutor reformuló su objeción por sí solo.'
        WHEN 4 THEN 'Respiración diafragmática antes de abrir el micrófono en la videollamada. Sin temblor de voz.'
        WHEN 7 THEN 'Reto de la semana 1 completado con éxito. Mi audio de control muestra 3 muletillas menos.'
        WHEN 12 THEN 'Auditoría de primera reacción: anoté 3 impulsos reactivos y ninguno era información pura.'
        WHEN 18 THEN 'Espejo táctico de Chris Voss usado en la negociación. Funcionó de inmediato.'
        WHEN 22 THEN 'Entregado feedback con formato 1-3-1 de Dan Martell. La reunión duró la mitad de tiempo.'
        ELSE 'Práctica del día ejecutada con atención plena y serenidad.'
      END
    )
    ON CONFLICT (user_id, track_id, date)
    DO UPDATE SET completed = true, notes = EXCLUDED.notes;

    INSERT INTO stoic.day_logs (user_id, track_id, date, day_number, completed, notes)
    VALUES (
      v_user_id,
      v_track_int,
      v_day_date,
      i,
      true,
      'Examen nocturno y observación del diálogo interno.'
    )
    ON CONFLICT (user_id, track_id, date)
    DO UPDATE SET completed = true;
  END LOOP;

  -- 6. Retos semanales 1, 2 y 3 completados
  INSERT INTO stoic.week_logs (user_id, track_id, week_number, completed, reflection)
  VALUES
    (v_user_id, v_track_com, 1, true, 'Reto 1 completado: audio de 3 min comparado y analizado con rigor.'),
    (v_user_id, v_track_com, 2, true, 'Reto 2 completado: ayuno de quejas durante 7 días consecutivos.'),
    (v_user_id, v_track_com, 3, true, 'Reto 3 completado: conversación difícil sostenida sin reactividad.')
  ON CONFLICT (user_id, track_id, week_number)
  DO UPDATE SET completed = true, reflection = EXCLUDED.reflection;

  -- 7. Entradas del diario de Séneca (20 días de reflexiones nocturnas)
  FOR i IN 1..20 LOOP
    v_day_date := v_start_date + (i + 2);
    
    INSERT INTO stoic.journal_entries (user_id, date, entry_type, mood, content)
    VALUES (
      v_user_id,
      v_day_date,
      'evening',
      CASE (i % 3) WHEN 0 THEN 5 WHEN 1 THEN 4 ELSE 5 END,
      jsonb_build_object(
        'did_well', CASE (i % 3)
          WHEN 0 THEN 'Escuché sin intervenir hasta que el otro terminó completamente su idea.'
          WHEN 1 THEN 'No respondí a la provocación en la reunión; apliqué la dicotomía del control.'
          ELSE 'Sostuve el silencio tras hacer la propuesta principal.'
        END,
        'to_improve', CASE (i % 3)
          WHEN 0 THEN 'Evitar acelerar el ritmo cuando siento que el tiempo apremia.'
          WHEN 1 THEN 'Tomar un respiro profundo antes de entrar a conversaciones tensas.'
          ELSE 'Cerrar el computador a tiempo en la noche.'
        END,
        'learned', CASE (i % 3)
          WHEN 0 THEN 'El ritmo lento transmite serenidad y dominio.'
          WHEN 1 THEN 'La actitud del otro es suya, mi respuesta es mía.'
          ELSE 'La pausa estratégica genera más autoridad que apresurarse a responder.'
        END,
        'gratitude', 'Agradecido por la constancia y claridad mental que voy consolidando.'
      )
    )
    ON CONFLICT (user_id, date, entry_type)
    DO UPDATE SET mood = EXCLUDED.mood, content = EXCLUDED.content;
  END LOOP;

  -- 8. Preferencias horarias
  INSERT INTO stoic.user_prefs (user_id, timezone, morning_hour, evening_hour)
  VALUES (v_user_id, 'America/Bogota', 6, 20)
  ON CONFLICT (user_id)
  DO UPDATE SET timezone = 'America/Bogota', morning_hour = 6, evening_hour = 20;

  RAISE NOTICE '¡Éxito! Usuario cirosteven278@gmail.com configurado como estudiante veterano: Día 25 activo (esperando para el demo), 24 días completados, 20 entradas en diario y 3 retos semanales listos.';
END $$;
