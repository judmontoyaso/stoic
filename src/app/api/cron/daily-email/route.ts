import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getQuoteForDay, getTodayQuote } from '@/lib/quotes'
import { dailyProgramEmail, sendEmail, type TrackEmailBlock } from '@/lib/email'
import { generateDailyReflection } from '@/lib/ai'

// Endpoint de Cron diario: envía el ejercicio del día de cada track activo
// GET /api/cron/daily-email?secret=...&to=...&date=YYYY-MM-DD

const MODULE_LABELS: Record<string, string> = {
  perception: 'Percepción',
  action: 'Acción',
  will: 'Voluntad',
  evaluation: 'Evaluación',
}

/** Fecha YYYY-MM-DD en la zona horaria del usuario (Colombia) */
function todayInBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

/** Día del programa (1-90) para una fecha real, o null si está fuera */
function dayNumberFor(startDate: string, dateStr: string, durationDays: number): number | null {
  const start = new Date(startDate + 'T00:00:00Z')
  const date = new Date(dateStr + 'T00:00:00Z')
  const dayNumber = Math.round((date.getTime() - start.getTime()) / 86400000) + 1
  if (dayNumber < 1 || dayNumber > durationDays) return null
  return dayNumber
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const forceTo = searchParams.get('to')
  const forceDate = searchParams.get('date')

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const appUrl = process.env.APP_URL || 'http://localhost:3000'

  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'stoic' },
  })

  const dateStr = forceDate || todayInBogota()

  // 1. Tracks activos (con fecha de inicio)
  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .not('start_date', 'is', null)

  if (tracksError) {
    return NextResponse.json({ error: `Error leyendo tracks: ${tracksError.message}` }, { status: 500 })
  }

  // 2. Construir un bloque por track que tenga día del programa en esta fecha
  const blocks: TrackEmailBlock[] = []
  for (const track of tracks || []) {
    const dayNumber = dayNumberFor(track.start_date, dateStr, track.duration_days || 90)
    if (!dayNumber) continue

    const weekNumber = Math.min(13, Math.ceil(dayNumber / 7))
    const [{ data: days }, { data: weeks }] = await Promise.all([
      supabase
        .from('program_days')
        .select('title, instructions, rationale, source_author, module')
        .eq('track_id', track.id)
        .eq('day_number', dayNumber)
        .limit(1),
      supabase
        .from('program_weeks')
        .select('challenge_title, challenge_description')
        .eq('track_id', track.id)
        .eq('week_number', weekNumber)
        .limit(1),
    ])

    const day = days?.[0]
    if (!day) continue

    blocks.push({
      trackName: track.name,
      dayNumber,
      moduleLabel: MODULE_LABELS[day.module] || day.module,
      title: day.title,
      instructions: day.instructions,
      rationale: day.rationale,
      sourceAuthor: day.source_author,
      weeklyChallenge: weeks?.[0]
        ? { title: weeks[0].challenge_title, description: weeks[0].challenge_description }
        : null,
    })
  }

  if (blocks.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Ningún track activo tiene día de programa en esta fecha' })
  }

  // 3. Cita alineada al día del programa del primer track
  const quote = blocks[0] ? getQuoteForDay(blocks[0].dayNumber) : getTodayQuote()

  // 4. Reflexión IA (opcional) alimentada con los ejercicios reales del día
  const aiReflection = await generateDailyReflection({
    dayNumber: blocks[0].dayNumber,
    phase: Math.min(3, Math.ceil(blocks[0].dayNumber / 30)),
    phaseLabel: blocks.map(b => `${b.trackName}: ${b.title}`).join(' | '),
    quote,
    habits: blocks.map(b => ({ name: `${b.trackName} — ${b.title}`, description: b.instructions })),
    challenge: blocks[0].weeklyChallenge
      ? { title: blocks[0].weeklyChallenge.title, description: blocks[0].weeklyChallenge.description }
      : null,
  })

  // 5. Enviar
  const to = forceTo || process.env.NOTIFICATION_EMAIL
  if (!to) {
    return NextResponse.json({ error: 'Falta NOTIFICATION_EMAIL' }, { status: 500 })
  }
  const name = to.split('@')[0]

  const emailContent = dailyProgramEmail({
    name,
    quote,
    blocks,
    appUrl,
    aiReflection,
  })

  const success = await sendEmail(to, emailContent)

  return NextResponse.json({
    ok: true,
    date: dateStr,
    tracks: blocks.map(b => ({ track: b.trackName, day: b.dayNumber, title: b.title })),
    sent: success ? 1 : 0,
    failed: success ? 0 : 1,
  })
}
