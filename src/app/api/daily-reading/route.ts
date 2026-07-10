import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getOrCreateDailyReading } from '@/lib/readings'

// Lectura del día: lección completa generada con IA y cacheada por (track, día).
// GET /api/daily-reading?track_id=...&day=N[&refresh=1]
// Protegida por el proxy (cookie stoic_session), igual que el resto de la app.

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  const supabase = createClient(supabaseUrl, serviceKey, { db: { schema: 'stoic' } })

  const result = await getOrCreateDailyReading(supabase, trackId, dayNumber, { refresh })
  if (!result) {
    return NextResponse.json({ error: 'Día del programa no encontrado' }, { status: 404 })
  }

  return NextResponse.json(result)
}
