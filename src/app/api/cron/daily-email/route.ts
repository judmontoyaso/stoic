import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getQuoteForDay } from '@/lib/quotes'
import { dailyProgramEmail, sendEmail, type TrackEmailBlock } from '@/lib/email'
import { generateDailyReflection } from '@/lib/ai'
import { getOrCreateDailyReading } from '@/lib/readings'
import { sendPushToAll } from '@/lib/push'
import { getApprovedUsers, type ApprovedUser } from '@/lib/recipients'

// Endpoint de Cron diario: envía a CADA usuario aprobado el ejercicio del
// día según SU fecha de inicio (user_tracks). La lectura queda cacheada
// por (track, día), compartida entre usuarios que vayan en el mismo día.
// GET/POST /api/cron/daily-email?secret=...&to=...&date=YYYY-MM-DD
// Webhook-compatible: n8n u otro scheduler puede llamarlo por POST con
// header "Authorization: Bearer <CRON_SECRET>" o query ?secret=
// ?to= fuerza el destinatario: usa el progreso de ese usuario si existe.

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
  // Sin secret configurado: abierto solo en desarrollo, nunca en producción
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  if (secret === cronSecret) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = ReturnType<typeof createClient<any, any, any>>

interface UserTrackRow {
  track_id: string
  start_date: string | null
  tracks: { id: string; name: string; duration_days: number | null } | null
}

/** Bloques de correo para un usuario según sus user_tracks */
async function buildBlocksForUser(
  supabase: AnySupabaseClient,
  userId: string,
  dateStr: string
): Promise<TrackEmailBlock[]> {
  const { data: userTracks, error } = await supabase
    .from('user_tracks')
    .select('track_id, start_date, tracks(id, name, duration_days)')
    .eq('user_id', userId)
    .not('start_date', 'is', null)

  if (error) {
    console.error('Error leyendo user_tracks:', error.message)
    return []
  }

  const blocks: TrackEmailBlock[] = []
  for (const ut of (userTracks || []) as unknown as UserTrackRow[]) {
    if (!ut.start_date || !ut.tracks) continue
    const dayNumber = dayNumberFor(ut.start_date, dateStr, ut.tracks.duration_days || 90)
    if (!dayNumber) continue

    const weekNumber = Math.min(13, Math.ceil(dayNumber / 7))
    const [{ data: days }, { data: weeks }] = await Promise.all([
      supabase
        .from('program_days')
        .select('title, instructions, rationale, source_author, module')
        .eq('track_id', ut.track_id)
        .eq('day_number', dayNumber)
        .limit(1),
      supabase
        .from('program_weeks')
        .select('challenge_title, challenge_description')
        .eq('track_id', ut.track_id)
        .eq('week_number', weekNumber)
        .limit(1),
    ])

    const day = days?.[0]
    if (!day) continue

    // Lectura completa cacheada por (track, día): compartida entre usuarios
    const readingResult = await getOrCreateDailyReading(supabase, ut.track_id, dayNumber)

    blocks.push({
      trackName: ut.tracks.name,
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
  return blocks
}

export async function POST(request: Request) {
  return GET(request)
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

  // Destinatarios: usuarios aprobados; ?to= fuerza uno solo
  let users: ApprovedUser[] = await getApprovedUsers(supabase)
  if (forceTo) {
    const match = users.find(u => u.email === forceTo.toLowerCase())
    users = match ? [match] : users.slice(0, 1).map(u => ({ ...u, email: forceTo }))
  }
  if (users.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      message: 'Sin usuarios aprobados: inicia sesión con Google y el código de acceso',
    })
  }

  let sent = 0
  let failed = 0
  let firstBlocks: TrackEmailBlock[] = []
  const detail: { email: string; tracks: number; sent: boolean }[] = []

  for (const user of users) {
    const blocks = await buildBlocksForUser(supabase, user.id, dateStr)
    if (blocks.length === 0) {
      detail.push({ email: user.email, tracks: 0, sent: false })
      continue
    }
    if (firstBlocks.length === 0) firstBlocks = blocks

    const quote = getQuoteForDay(blocks[0].dayNumber)

    // Reflexión IA (opcional) alimentada con los ejercicios reales del usuario
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

    const success = await sendEmail(user.email, dailyProgramEmail({
      name: user.email.split('@')[0],
      quote,
      blocks,
      appUrl,
      aiReflection,
    }))
    if (success) sent++
    else failed++
    detail.push({ email: user.email, tracks: blocks.length, sent: success })
  }

  // Push matutino (best effort). Las suscripciones no distinguen usuario:
  // se usa el contenido del primer usuario con programa activo.
  const push = firstBlocks.length > 0
    ? await sendPushToAll(supabase, {
        title: `Día ${firstBlocks[0].dayNumber} · ${firstBlocks[0].title}`,
        body: firstBlocks.length > 1
          ? firstBlocks.map(b => `${b.trackName}: ${b.title}`).join(' · ')
          : firstBlocks[0].instructions.slice(0, 120) + '...',
        url: '/',
        tag: 'stoic-morning',
      })
    : { sent: 0, failed: 0, removed: 0 }

  return NextResponse.json({ ok: true, date: dateStr, recipients: users.length, sent, failed, detail, push })
}
