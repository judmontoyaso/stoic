import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

/**
 * Puebla un usuario con historial veterano (~24 días cumplidos,
 * 2 tracks activos, notas realistas, examen de Séneca y estado de ánimo)
 * para que la aplicación muestre un usuario maduro y activo.
 */
export async function seedVeteranUser(userId: string, userEmail?: string | null): Promise<{ ok: boolean; message: string }> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !url) {
    return { ok: false, message: 'Faltan credenciales de Supabase en el servidor' }
  }

  const admin = createSupabaseAdmin(url, serviceKey, {
    db: { schema: 'stoic' },
  })

  // 1. Asegurar app_metadata (aprobado y plan annual, NO admin)
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      stoicom_approved: true,
      stoicom_plan: 'annual',
      stoicom_paid_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
  })

  // 2. Obtener tracks
  const { data: tracks, error: tracksErr } = await admin.from('tracks').select('id, slug, name')
  if (tracksErr || !tracks || tracks.length === 0) {
    return { ok: false, message: `Error leyendo tracks: ${tracksErr?.message}` }
  }

  const trackCom = tracks.find(t => t.slug === 'comunicacion') || tracks[0]
  const trackInt = tracks.find(t => t.slug === 'interna') || tracks[1] || tracks[0]

  // Fecha de inicio: exactamente hace 24 días (hoy es el día 25)
  const today = new Date()
  const startDate = new Date(today.getTime() - 24 * 86400000)
  const startDateStr = startDate.toISOString().split('T')[0]

  // 3. User tracks
  await admin.from('user_tracks').upsert(
    [
      { user_id: userId, track_id: trackCom.id, start_date: startDateStr },
      { user_id: userId, track_id: trackInt.id, start_date: startDateStr },
    ],
    { onConflict: 'user_id,track_id' }
  )

  // 4. Day logs para track de comunicación y track de práctica interna
  const sampleNotes: Record<number, string> = {
    1: 'Línea base grabada: 3 minutos sobre mi trabajo. Conté 7 muletillas ("o sea" y "este"). Me sentí acelerado.',
    2: 'Aplicada la primera pausa antes de contestar en la reunión matutina. La tensión disminuyó visiblemente.',
    3: 'Silencio de 2 segundos tolerado. Mi interlocutor reformuló su objeción por sí solo.',
    4: 'Respiración diafragmática antes de abrir el micrófono en la videollamada. Sin temblor de voz.',
    5: 'Postura y anclaje físico listos. Sensación de presencia sólida.',
    6: 'Sin interrupciones en todo el día. Anoté los impulsos de hablar.',
    7: 'Reto de la semana 1 completado con éxito. Mi audio de control muestra 3 muletillas menos.',
    8: 'Contacto visual sostenido durante los argumentos clave.',
    10: 'Eliminada la sobrejustificación: respondí "sí, me encargo" sin añadir excusas previas.',
    12: 'Auditoría de primera reacción: anoté 3 impulsos reactivos y ninguno era información pura.',
    14: 'Segunda semana cerrada con balance positivo.',
    16: 'Tono bajo y pausado aplicado en discusión técnica difícil.',
    18: 'Espejo táctico de Chris Voss usado en la negociación. Funcionó de inmediato.',
    20: 'Pregunta calibrada ("¿Cómo sugieres que procedamos?") desarmó la confrontación.',
    22: 'Entregado feedback con formato 1-3-1 de Dan Martell. La reunión duró la mitad de tiempo.',
    24: 'Día 24 superado. Gran sensación de control y claridad verbal.',
  }

  const dayLogsToInsert = []
  for (let i = 1; i <= 24; i++) {
    const dayDate = new Date(startDate.getTime() + (i - 1) * 86400000).toISOString().split('T')[0]
    dayLogsToInsert.push({
      user_id: userId,
      track_id: trackCom.id,
      date: dayDate,
      day_number: i,
      completed: true,
      notes: sampleNotes[i] || `Práctica del día ${i} ejecutada en conversaciones reales.`,
    })
    dayLogsToInsert.push({
      user_id: userId,
      track_id: trackInt.id,
      date: dayDate,
      day_number: i,
      completed: true,
      notes: `Examen y auto-observación estoica día ${i}.`,
    })
  }

  // Insertar logs (upsert)
  await admin.from('day_logs').upsert(dayLogsToInsert, { onConflict: 'user_id,track_id,date' })

  // 5. Week logs (retos semanales)
  const weekLogs = [
    {
      user_id: userId,
      track_id: trackCom.id,
      week_number: 1,
      completed: true,
      reflection: 'Reto 1 completado: audio de 3 min comparado y analizado con rigor.',
    },
    {
      user_id: userId,
      track_id: trackCom.id,
      week_number: 2,
      completed: true,
      reflection: 'Reto 2 completado: ayuno de quejas durante 7 días consecutivos.',
    },
    {
      user_id: userId,
      track_id: trackCom.id,
      week_number: 3,
      completed: true,
      reflection: 'Reto 3 completado: conversación difícil sostenida sin reactividad.',
    },
  ]
  await admin.from('week_logs').upsert(weekLogs, { onConflict: 'user_id,track_id,week_number' })

  // 6. Entradas del diario de Séneca (20 días de historial nocturno con estados de ánimo)
  const journalReflections = [
    {
      did_well: 'Escuché sin intervenir hasta que el otro terminó completamente su idea.',
      to_improve: 'Evitar mover las manos rápido cuando siento que el tiempo apremia.',
      learned: 'El ritmo lento transmite serenidad y dominio.',
      gratitude: 'Agradecido por la serenidad en momentos de alta presión.',
      mood: 4,
    },
    {
      did_well: 'No respondí a la provocación en el chat del equipo.',
      to_improve: 'Tomar un respiro antes de entrar a la reunión de balance.',
      learned: 'Dicotomía del control: su actitud es suya, mi respuesta es mía.',
      gratitude: 'Agradecido por la disciplina estoica que voy construyendo.',
      mood: 5,
    },
    {
      did_well: 'Usé la pregunta calibrada en vez de discutir abiertamente.',
      to_improve: 'Mejorar la modulación de voz al final del día.',
      learned: 'La pregunta desactiva la confrontación mucho mejor que un argumento directo.',
      gratitude: 'Por el progreso medible de estas semanas de práctica.',
      mood: 4,
    },
    {
      did_well: 'Sostuve el silencio tras hacer la propuesta principal.',
      to_improve: 'Cerrar el computador a tiempo en la noche.',
      learned: 'Quien habla primero tras la propuesta suele ceder terreno.',
      gratitude: 'Por la claridad mental recuperada en mi jornada.',
      mood: 5,
    },
    {
      did_well: 'Excelente gestión de objeciones con calma y firmeza.',
      to_improve: 'Mantener la rutina matutina de respiración nasal.',
      learned: 'Marco Aurelio: la mente se adapta al obstáculo y avanza.',
      gratitude: 'Agradecido por la constancia y disciplina de estos 24 días.',
      mood: 5,
    },
  ]

  const journalEntries = []
  for (let i = 1; i <= 20; i++) {
    const entryDate = new Date(startDate.getTime() + (i + 3) * 86400000).toISOString().split('T')[0]
    const template = journalReflections[(i - 1) % journalReflections.length]
    journalEntries.push({
      user_id: userId,
      date: entryDate,
      entry_type: 'evening',
      mood: template.mood,
      content: {
        did_well: template.did_well,
        to_improve: template.to_improve,
        learned: template.learned,
        gratitude: template.gratitude,
      },
    })
  }

  await admin.from('journal_entries').upsert(journalEntries, { onConflict: 'user_id,date,entry_type' })

  // 7. Preferencias de usuario
  await admin.from('user_prefs').upsert(
    {
      user_id: userId,
      timezone: 'America/Bogota',
      morning_hour: 6,
      evening_hour: 20,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return {
    ok: true,
    message: `Usuario ${userEmail || userId} poblado con éxito: día 25 activo, 24 días completados, 20 entradas de diario y 3 retos semanales.`,
  }
}
