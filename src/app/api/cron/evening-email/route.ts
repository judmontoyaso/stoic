import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { eveningReviewEmail, sendEmail, type EveningTrackStatus } from '@/lib/email'
import { sendPushToAll } from '@/lib/push'

// Cron nocturno (~8:30pm Bogota): pregunta si completaste el día y trae el
// examen nocturno de Séneca. El eslabón que más se rompe es el cierre del día.
// GET /api/cron/evening-email?secret=...&to=...&date=YYYY-MM-DD

export const maxDuration = 60

function todayInBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

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
  if (!cronSecret) return true
  if (secret === cronSecret) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
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
  const dateStr = searchParams.get('date') || todayInBogota()

  const { data: tracks, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .not('start_date', 'is', null)

  if (tracksError) {
    return NextResponse.json({ error: tracksError.message }, { status: 500 })
  }

  const statuses: EveningTrackStatus[] = []
  for (const track of tracks || []) {
    const dayNumber = dayNumberFor(track.start_date, dateStr, track.duration_days || 90)
    if (!dayNumber) continue

    const [{ data: days }, { data: logs }] = await Promise.all([
      supabase
        .from('program_days')
        .select('title')
        .eq('track_id', track.id)
        .eq('day_number', dayNumber)
        .limit(1),
      supabase
        .from('day_logs')
        .select('date, completed')
        .eq('track_id', track.id)
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
      trackName: track.name,
      dayNumber,
      title: days?.[0]?.title || `Día ${dayNumber}`,
      completed: completedToday,
      streak,
    })
  }

  if (statuses.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Ningún track activo tiene día de programa en esta fecha' })
  }

  const to = searchParams.get('to') || process.env.NOTIFICATION_EMAIL
  if (!to) {
    return NextResponse.json({ error: 'Falta NOTIFICATION_EMAIL' }, { status: 500 })
  }

  const content = eveningReviewEmail({
    name: to.split('@')[0],
    statuses,
    appUrl,
  })

  const success = await sendEmail(to, content)

  // Push nocturno (best effort)
  const pending = statuses.filter(s => !s.completed)
  const allDone = pending.length === 0
  const push = await sendPushToAll(supabase, {
    title: allDone ? 'Todo completado: cierra el día' : `${pending.length} pendiente${pending.length === 1 ? '' : 's'} de hoy`,
    body: allDone
      ? 'Solo falta el examen nocturno de Séneca. El día se cierra por escrito.'
      : pending.map(s => `${s.trackName}: ${s.title}`).join(' · '),
    url: allDone ? '/journal' : '/',
    tag: 'stoic-evening',
  })

  return NextResponse.json({
    ok: true,
    date: dateStr,
    statuses: statuses.map(s => ({ track: s.trackName, day: s.dayNumber, completed: s.completed, streak: s.streak })),
    sent: success ? 1 : 0,
    failed: success ? 0 : 1,
    push,
  })
}
