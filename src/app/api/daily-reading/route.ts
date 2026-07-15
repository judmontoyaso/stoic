import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { getOrCreateDailyReading } from '@/lib/readings'
import { isAdminEmail } from '@/lib/admin'
import { localParts, DEFAULT_EMAIL_PREFS } from '@/lib/prefs-server'

// Lectura del día: lección completa generada con IA y cacheada por (track, día).
// GET /api/daily-reading?track_id=...&day=N[&refresh=1]
//
// La generación cuesta IA: solo se sirve hasta el día ACTUAL del usuario
// en ese track (nada de generar los 90 días por adelantado desde la
// consola), y refresh= (regenerar ignorando caché) es solo para admin.

export const maxDuration = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackId = searchParams.get('track_id')
  const dayParam = searchParams.get('day')
  const refresh = searchParams.get('refresh') === '1'

  const dayNumber = dayParam ? parseInt(dayParam, 10) : NaN
  if (!trackId || isNaN(dayNumber) || dayNumber < 1 || dayNumber > 90) {
    return NextResponse.json({ error: 'Parámetros inválidos: track_id y day (1-90) son requeridos' }, { status: 400 })
  }

  // Sesión del usuario (RLS: solo ve sus propias filas)
  const session = await createServerSupabase()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })
  }

  const { data: userTrack } = await session
    .from('user_tracks')
    .select('start_date')
    .eq('track_id', trackId)
    .maybeSingle()

  if (!userTrack?.start_date) {
    return NextResponse.json({ error: 'Inicia el track para acceder a sus lecciones' }, { status: 403 })
  }

  const { data: prefRow } = await session
    .from('user_prefs')
    .select('timezone')
    .maybeSingle()
  const timezone = prefRow?.timezone || DEFAULT_EMAIL_PREFS.timezone
  const { date: today } = localParts(timezone)

  const currentDay =
    Math.round(
      (new Date(today + 'T00:00:00Z').getTime() - new Date(userTrack.start_date + 'T00:00:00Z').getTime()) / 86400000
    ) + 1

  if (dayNumber > currentDay) {
    return NextResponse.json(
      { error: 'Esa lección aún no llega: el programa se vive un día a la vez' },
      { status: 403 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  const supabase = createClient(supabaseUrl, serviceKey, { db: { schema: 'stoic' } })

  const result = await getOrCreateDailyReading(supabase, trackId, dayNumber, {
    refresh: refresh && isAdminEmail(user.email),
  })
  if (!result) {
    return NextResponse.json({ error: 'Día del programa no encontrado' }, { status: 404 })
  }

  return NextResponse.json(result)
}
