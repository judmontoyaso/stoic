import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getQuoteForDay, getTodayQuote } from '@/lib/quotes'
import { dailyProgramEmail, sendEmail, type TrackEmailBlock } from '@/lib/email'
import { generateDailyReflection } from '@/lib/ai'
import { getOrCreateDailyReading } from '@/lib/readings'
import { sendPushToAll } from '@/lib/push'

// Endpoint de Cron diario: envía el ejercicio del día de cada track activo
// (incluye la lectura completa y la deja pre-generada en caché para la app)
// GET /api/cron/daily-email?secret=...&to=...&date=YYYY-MM-DD

export const maxDuration = 300

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

/** Autorizado por query secret (schedulers externos) o Bearer (Vercel Cron) */
function isAuthorized(request: Request, secret: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  if (secret === cronSecret) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const forceTo = searchParams.get('to')
  const forceDate = searchParams.get('date')

  if (!isAuthorized(request, searchParams.get('secret'))) {
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

    // Pre-generar (o leer de caché) la lección completa del día: queda lista
    // para el correo y para que la app la cargue instantánea.
    const readingResult = await getOrCreateDailyReading(supabase, track.id, dayNumber)

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
      reading: readingResult?.model !== 'static' ? readingResult?.reading : null,
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

  // Push matutino (best effort): el ejercicio del día en la pantalla de bloqueo
  const push = await sendPushToAll(supabase, {
    title: `Día ${blocks[0].dayNumber} · ${blocks[0].title}`,
    body: blocks.length > 1
      ? blocks.map(b => `${b.trackName}: ${b.title}`).join(' · ')
      : blocks[0].instructions.slice(0, 120) + '...',
    url: '/',
    tag: 'stoic-morning',
  })

  return NextResponse.json({
    ok: true,
    date: dateStr,
    tracks: blocks.map(b => ({ track: b.trackName, day: b.dayNumber, title: b.title })),
    sent: success ? 1 : 0,
    failed: success ? 0 : 1,
    push,
  })
}
