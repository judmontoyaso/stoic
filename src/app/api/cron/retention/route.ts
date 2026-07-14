import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, weeklySummaryEmail, rescueEmail, type WeeklyTrackSummary } from '@/lib/email'
import { getApprovedUsers, type ApprovedUser } from '@/lib/recipients'
import { getPrefsMap, localParts, markEmailSent, DEFAULT_EMAIL_PREFS } from '@/lib/prefs-server'

// Cron de retención (idempotente, pensado para disparo horario):
//   - Resumen semanal: domingo desde las 17h locales del usuario.
//   - Rescate: 3+ días sin completar nada, desde las 12h locales,
//     máximo uno cada 4 días.
// GET/POST /api/cron/retention?secret=...
// Requiere supabase_v6_retention.sql; sin él, el dedupe de estos dos
// correos no persiste y el endpoint no envía nada (fail-safe).

export const maxDuration = 120

const WEEKLY_HOUR = 17
const RESCUE_HOUR = 12
const RESCUE_AFTER_DAYS = 3
const RESCUE_COOLDOWN_DAYS = 4

function isAuthorized(request: Request, secret: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  if (secret === cronSecret) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
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

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86400000)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = ReturnType<typeof createClient<any, any, any>>

interface UserTrackRow {
  track_id: string
  start_date: string | null
  tracks: { id: string; name: string; duration_days: number | null } | null
}

interface ActiveTrack {
  trackId: string
  trackName: string
  startDate: string
  dayNumber: number
}

async function getActiveTracks(
  supabase: AnySupabaseClient,
  userId: string,
  localDate: string
): Promise<ActiveTrack[]> {
  const { data } = await supabase
    .from('user_tracks')
    .select('track_id, start_date, tracks(id, name, duration_days)')
    .eq('user_id', userId)
    .not('start_date', 'is', null)

  const active: ActiveTrack[] = []
  for (const ut of (data || []) as unknown as UserTrackRow[]) {
    if (!ut.start_date || !ut.tracks) continue
    const dayNumber = dayNumberFor(ut.start_date, localDate, ut.tracks.duration_days || 90)
    if (!dayNumber) continue
    active.push({ trackId: ut.track_id, trackName: ut.tracks.name, startDate: ut.start_date, dayNumber })
  }
  return active
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

  // Sin las columnas de V6 el dedupe no persiste: mejor no enviar nada
  const { error: v6Error } = await supabase.from('user_prefs').select('last_weekly_sent').limit(1)
  if (v6Error) {
    return NextResponse.json({
      ok: false,
      message: 'Ejecuta supabase_v6_retention.sql para habilitar los correos de retención',
    })
  }

  const users: ApprovedUser[] = await getApprovedUsers(supabase)
  const prefsMap = await getPrefsMap(supabase)

  let weeklySent = 0
  let rescueSent = 0
  const detail: { email: string; weekly?: string; rescue?: string }[] = []

  for (const user of users) {
    const prefs = prefsMap.get(user.id) || { ...DEFAULT_EMAIL_PREFS }
    const { date: localDate, hour: localHour, weekday } = localParts(prefs.timezone)
    const entry: { email: string; weekly?: string; rescue?: string } = { email: user.email }
    detail.push(entry)

    const activeTracks = await getActiveTracks(supabase, user.id, localDate)
    if (activeTracks.length === 0) continue

    // Logs completados del usuario (una query para ambos correos)
    const { data: logs } = await supabase
      .from('day_logs')
      .select('track_id, date, completed')
      .eq('user_id', user.id)
      .eq('completed', true)
    const completedByTrack = new Map<string, Set<string>>()
    let lastCompleted: string | null = null
    for (const l of logs || []) {
      if (!completedByTrack.has(l.track_id)) completedByTrack.set(l.track_id, new Set())
      completedByTrack.get(l.track_id)!.add(l.date)
      if (!lastCompleted || l.date > lastCompleted) lastCompleted = l.date
    }

    // ---------- Resumen semanal (domingo) ----------
    if (weekday === 'Sun' && localHour >= WEEKLY_HOUR && prefs.last_weekly_sent !== localDate) {
      const summaries: WeeklyTrackSummary[] = []
      for (const t of activeTracks) {
        const completedDates = completedByTrack.get(t.trackId) || new Set<string>()
        let completedThisWeek = 0
        let missedThisWeek = 0
        for (let i = 6; i >= 0; i--) {
          const d = addDays(localDate, -i)
          if (!dayNumberFor(t.startDate, d, 90)) continue
          if (completedDates.has(d)) completedThisWeek++
          else if (d < localDate) missedThisWeek++ // hoy aún no cuenta como perdido
        }
        let streak = 0
        let cursor = completedDates.has(localDate) ? localDate : addDays(localDate, -1)
        while (completedDates.has(cursor)) {
          streak++
          cursor = addDays(cursor, -1)
        }
        summaries.push({
          trackName: t.trackName,
          dayNumber: t.dayNumber,
          completedThisWeek,
          missedThisWeek,
          totalCompleted: completedDates.size,
          streak,
        })
      }

      // Ánimo promedio de la semana según el diario
      const { data: moods } = await supabase
        .from('journal_entries')
        .select('mood')
        .eq('user_id', user.id)
        .gte('date', addDays(localDate, -6))
        .not('mood', 'is', null)
      const moodVals = (moods || []).map(m => m.mood as number)
      const moodAvg = moodVals.length > 0 ? moodVals.reduce((a, b) => a + b, 0) / moodVals.length : null

      // Reto de la semana entrante (track principal)
      const primary = activeTracks[0]
      const nextWeek = Math.min(13, Math.ceil((primary.dayNumber + 1) / 7))
      const { data: weeks } = await supabase
        .from('program_weeks')
        .select('challenge_title, challenge_description')
        .eq('track_id', primary.trackId)
        .eq('week_number', nextWeek)
        .limit(1)

      const ok = await sendEmail(user.email, weeklySummaryEmail({
        name: user.email.split('@')[0],
        appUrl,
        summaries,
        moodAvg,
        nextChallenge: weeks?.[0]
          ? { title: weeks[0].challenge_title, description: weeks[0].challenge_description }
          : null,
      }))
      if (ok) {
        weeklySent++
        await markEmailSent(supabase, user.id, 'last_weekly_sent', localDate, prefs)
        entry.weekly = 'enviado'
      } else {
        entry.weekly = 'falló'
      }
    }

    // ---------- Rescate de inactivos ----------
    const programAge = Math.min(...activeTracks.map(t => daysBetween(t.startDate, localDate)))
    const sinceLast = lastCompleted
      ? daysBetween(lastCompleted, localDate)
      : programAge + 1
    const cooldownOk = !prefs.last_rescue_sent || daysBetween(prefs.last_rescue_sent, localDate) >= RESCUE_COOLDOWN_DAYS

    if (
      localHour >= RESCUE_HOUR &&
      programAge >= RESCUE_AFTER_DAYS &&
      sinceLast >= RESCUE_AFTER_DAYS &&
      cooldownOk
    ) {
      const trackInfos: { trackName: string; dayNumber: number; title: string }[] = []
      for (const t of activeTracks) {
        const { data: days } = await supabase
          .from('program_days')
          .select('title')
          .eq('track_id', t.trackId)
          .eq('day_number', t.dayNumber)
          .limit(1)
        trackInfos.push({ trackName: t.trackName, dayNumber: t.dayNumber, title: days?.[0]?.title || `Día ${t.dayNumber}` })
      }

      const ok = await sendEmail(user.email, rescueEmail({
        name: user.email.split('@')[0],
        appUrl,
        daysInactive: sinceLast,
        tracks: trackInfos,
      }))
      if (ok) {
        rescueSent++
        await markEmailSent(supabase, user.id, 'last_rescue_sent', localDate, prefs)
        entry.rescue = 'enviado'
      } else {
        entry.rescue = 'falló'
      }
    }
  }

  return NextResponse.json({ ok: true, weeklySent, rescueSent, detail })
}
