import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { eveningReviewEmail, sendEmail, type EveningTrackStatus } from '@/lib/email'
import { sendPushToUser } from '@/lib/push'
import { getApprovedUsers, type ApprovedUser } from '@/lib/recipients'
import { getPrefsMap, localParts, markEmailSent, DEFAULT_EMAIL_PREFS } from '@/lib/prefs-server'

// Cron nocturno: a CADA usuario aprobado le pregunta si completó SU día
// (según su user_tracks y sus day_logs) y trae el examen nocturno de
// Séneca. El eslabón que más se rompe es el cierre del día.
//
// Idempotente por usuario y día local (user_prefs.last_evening_sent):
// puede dispararse cada hora; envía cuando la hora local del usuario
// alcanzó su evening_hour y aún no recibió el correo de hoy.
//
// GET/POST /api/cron/evening-email?secret=...&to=...&date=YYYY-MM-DD
// Webhook-compatible: n8n u otro scheduler puede llamarlo por POST con
// header "Authorization: Bearer <CRON_SECRET>" o query ?secret=
// ?to= o ?date= fuerzan el envío saltando horario y dedupe (pruebas).

export const maxDuration = 60

function dayNumberFor(startDate: string, dateStr: string, durationDays: number): number | null {
  const start = new Date(startDate + 'T00:00:00Z')
  const date = new Date(dateStr + 'T00:00:00Z')
  const dayNumber = Math.round((date.getTime() - start.getTime()) / 86400000) + 1
  if (dayNumber < 1 || dayNumber > durationDays) return null
  return dayNumber
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
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

/** Estado del día de un usuario en cada uno de sus tracks activos */
async function buildStatusesForUser(
  supabase: AnySupabaseClient,
  userId: string,
  dateStr: string
): Promise<EveningTrackStatus[]> {
  const { data: userTracks, error } = await supabase
    .from('user_tracks')
    .select('track_id, start_date, tracks(id, name, duration_days)')
    .eq('user_id', userId)
    .not('start_date', 'is', null)

  if (error) {
    console.error('Error leyendo user_tracks:', error.message)
    return []
  }

  const statuses: EveningTrackStatus[] = []
  for (const ut of (userTracks || []) as unknown as UserTrackRow[]) {
    if (!ut.start_date || !ut.tracks) continue
    const dayNumber = dayNumberFor(ut.start_date, dateStr, ut.tracks.duration_days || 90)
    if (!dayNumber) continue

    const [{ data: days }, { data: logs }] = await Promise.all([
      supabase
        .from('program_days')
        .select('title')
        .eq('track_id', ut.track_id)
        .eq('day_number', dayNumber)
        .limit(1),
      supabase
        .from('day_logs')
        .select('date, completed')
        .eq('track_id', ut.track_id)
        .eq('user_id', userId)
        .eq('completed', true),
    ])

    const completedDates = new Set((logs || []).map(l => l.date))
    const completedToday = completedDates.has(dateStr)

    // Racha: días consecutivos completados terminando hoy (o ayer si hoy pende)
    let cursor = completedToday ? dateStr : addDays(dateStr, -1)
    let streak = 0
    while (completedDates.has(cursor)) {
      streak++
      cursor = addDays(cursor, -1)
    }

    statuses.push({
      trackName: ut.tracks.name,
      dayNumber,
      title: days?.[0]?.title || `Día ${dayNumber}`,
      completed: completedToday,
      streak,
    })
  }
  return statuses
}

export async function POST(request: Request) {
  return GET(request)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (!isAuthorized(request, searchParams.get('secret'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, { db: { schema: 'stoic' } })
  const forceDate = searchParams.get('date')
  const forceTo = searchParams.get('to')

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

  // ?to= o ?date= son pruebas: saltan horario y dedupe
  const forced = !!forceTo || !!forceDate
  const prefsMap = await getPrefsMap(supabase)

  let sent = 0
  let failed = 0
  let skipped = 0
  const push = { sent: 0, failed: 0, removed: 0 }
  const detail: { email: string; tracks: number; sent: boolean; skipped?: string }[] = []

  for (const user of users) {
    const prefs = prefsMap.get(user.id) || { ...DEFAULT_EMAIL_PREFS }
    const { date: localDate, hour: localHour } = localParts(prefs.timezone)

    if (!forced) {
      if (localHour < prefs.evening_hour) {
        skipped++
        detail.push({ email: user.email, tracks: 0, sent: false, skipped: `aún no es su hora (${localHour} < ${prefs.evening_hour})` })
        continue
      }
      if (prefs.last_evening_sent === localDate) {
        skipped++
        detail.push({ email: user.email, tracks: 0, sent: false, skipped: 'ya enviado hoy' })
        continue
      }
    }

    const dateStr = forceDate || localDate
    const statuses = await buildStatusesForUser(supabase, user.id, dateStr)
    if (statuses.length === 0) {
      detail.push({ email: user.email, tracks: 0, sent: false, skipped: 'sin programa activo' })
      continue
    }

    const success = await sendEmail(user.email, eveningReviewEmail({
      name: user.email.split('@')[0],
      statuses,
      appUrl,
    }))
    if (success) {
      sent++
      // Los envíos forzados (pruebas) no consumen el correo del día
      if (!forced) await markEmailSent(supabase, user.id, 'last_evening_sent', localDate, prefs)
    } else {
      failed++
    }
    detail.push({ email: user.email, tracks: statuses.length, sent: success })

    // Push nocturno (best effort) con el estado del propio usuario
    const pending = statuses.filter(s => !s.completed)
    const allDone = pending.length === 0
    const p = await sendPushToUser(supabase, user.id, {
      title: allDone ? 'Todo completado: cierra el día' : `${pending.length} pendiente${pending.length === 1 ? '' : 's'} de hoy`,
      body: allDone
        ? 'Solo falta el examen nocturno de Séneca. El día se cierra por escrito.'
        : pending.map(s => `${s.trackName}: ${s.title}`).join(' · '),
      url: allDone ? '/journal' : '/',
      tag: 'stoic-evening',
    })
    push.sent += p.sent
    push.failed += p.failed
    push.removed += p.removed
  }

  return NextResponse.json({ ok: true, recipients: users.length, sent, failed, skipped, detail, push })
}
