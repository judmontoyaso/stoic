import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { getApprovedUsers } from '@/lib/recipients'

// Métricas de producto para el administrador.
// Autorización: el correo de la sesión debe estar en ADMIN_EMAILS
// (lista separada por comas) o ser igual a NOTIFICATION_EMAIL.

export const maxDuration = 60

function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL || ''
  return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  const session = await createServerSupabase()
  const { data: { user } } = await session.auth.getUser()
  if (!user?.email || !adminEmails().includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Solo el administrador puede ver estas métricas' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  const since30 = addDays(today, -29)
  const since7 = addDays(today, -6)

  const [users, tracksRes, userTracksRes, logsRes, journalRes, pushRes, prefsRes, eventsRes] =
    await Promise.all([
      getApprovedUsers(supabase),
      supabase.from('tracks').select('id, name'),
      supabase.from('user_tracks').select('user_id, track_id, start_date'),
      supabase.from('day_logs').select('user_id, track_id, date, completed'),
      supabase.from('journal_entries').select('user_id, date'),
      supabase.from('push_subscriptions').select('user_id'),
      supabase.from('user_prefs').select('user_id, timezone, morning_hour, evening_hour'),
      supabase.from('events').select('user_id, name, created_at').gte('created_at', since30 + 'T00:00:00Z'),
    ])

  const trackNames = new Map((tracksRes.data || []).map(t => [t.id, t.name]))
  const pushUsers = new Set((pushRes.data || []).map(p => p.user_id))
  const prefsByUser = new Map((prefsRes.data || []).map(p => [p.user_id, p]))

  const perUser = users.map(u => {
    const myTracks = (userTracksRes.data || []).filter(t => t.user_id === u.id && t.start_date)
    const myLogs = (logsRes.data || []).filter(l => l.user_id === u.id && l.completed)
    const myJournal = (journalRes.data || []).filter(j => j.user_id === u.id)
    const myEvents = (eventsRes.data || []).filter(e => e.user_id === u.id)

    // Racha global: días consecutivos (cualquier track) terminando hoy o ayer
    const completedDates = new Set(myLogs.map(l => l.date))
    let streak = 0
    let cursor = completedDates.has(today) ? today : addDays(today, -1)
    while (completedDates.has(cursor)) {
      streak++
      cursor = addDays(cursor, -1)
    }

    const lastLog = myLogs.reduce<string | null>((max, l) => (!max || l.date > max ? l.date : max), null)
    const lastJournal = myJournal.reduce<string | null>((max, j) => (!max || j.date > max ? j.date : max), null)
    const lastEvent = myEvents.reduce<string | null>(
      (max, e) => {
        const d = String(e.created_at).slice(0, 10)
        return !max || d > max ? d : max
      },
      null
    )
    const lastActivity = [lastLog, lastJournal, lastEvent].filter(Boolean).sort().pop() || null
    const prefs = prefsByUser.get(u.id)

    return {
      email: u.email,
      plan: u.plan,
      tracks: myTracks.map(t => ({
        name: trackNames.get(t.track_id) || t.track_id,
        startDate: t.start_date,
        completed: myLogs.filter(l => l.track_id === t.track_id).length,
      })),
      completedTotal: myLogs.length,
      completed7d: myLogs.filter(l => l.date >= since7).length,
      journalTotal: myJournal.length,
      journal7d: myJournal.filter(j => j.date >= since7).length,
      streak,
      lastActivity,
      push: pushUsers.has(u.id),
      prefs: prefs
        ? { timezone: prefs.timezone, morning: prefs.morning_hour, evening: prefs.evening_hour }
        : null,
    }
  })

  // Eventos de los últimos 30 días agrupados por nombre
  const eventCounts: Record<string, number> = {}
  for (const e of eventsRes.data || []) {
    eventCounts[e.name] = (eventCounts[e.name] || 0) + 1
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totals: {
      approvedUsers: users.length,
      activeUsers: perUser.filter(u => u.tracks.length > 0).length,
      withPush: perUser.filter(u => u.push).length,
      active7d: perUser.filter(u => u.lastActivity && u.lastActivity >= since7).length,
    },
    users: perUser,
    events30d: eventCounts,
  })
}
