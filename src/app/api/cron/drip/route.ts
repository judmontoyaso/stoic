import { NextResponse } from 'next/server'
import { serviceClient, sendDripDay, DRIP_LENGTH, type Lead } from '@/lib/leads'

// Cron de la secuencia de captación: manda el siguiente día (2..7) a
// cada lead confirmado, uno por día. El día 1 sale al confirmar.
//
// GET/POST /api/cron/drip?secret=...&to=correo
// ?to= es modo prueba: solo ese lead, salta la hora y el dedupe, y no
// marca nada (se puede repetir sin gastar su secuencia).
//
// Requiere supabase_v9_leads.sql. Sin la tabla no envía nada.

export const maxDuration = 120

// Los leads no declaran zona horaria: se envía a una hora fija que cae
// en la mañana de América y la tarde de Europa.
const SEND_HOUR_UTC = 13
// Tope por pasada: el plan gratuito de Resend tiene un límite diario y
// los correos del programa (usuarios de pago) tienen prioridad sobre estos.
const MAX_PER_RUN = 40

function isAuthorized(request: Request, secret: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  if (secret === cronSecret) return true
  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

export async function POST(request: Request) {
  return GET(request)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (!isAuthorized(request, searchParams.get('secret'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = serviceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const forceTo = searchParams.get('to')?.toLowerCase() || null
  const forced = !!forceTo
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  if (!forced && now.getUTCHours() < SEND_HOUR_UTC) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 'fuera de hora' })
  }

  let query = supabase
    .from('leads')
    .select('*')
    .order('confirmed_at', { ascending: true })
    .limit(MAX_PER_RUN)

  if (forced) {
    // Prueba: sin filtros de estado, para poder previsualizar cualquier día
    query = query.eq('email', forceTo)
  } else {
    query = query
      .not('confirmed_at', 'is', null)
      .is('unsubscribed_at', null)
      .lt('drip_day', DRIP_LENGTH)
      // Uno al día: los que ya recibieron algo hoy quedan fuera
      .or(`last_drip_sent.is.null,last_drip_sent.lt.${today}`)
  }

  // ?day= fuerza un día concreto de la secuencia (solo en modo prueba)
  const dayParam = forced ? Number(searchParams.get('day')) : NaN
  const forcedDay =
    Number.isInteger(dayParam) && dayParam >= 1 && dayParam <= DRIP_LENGTH ? dayParam : null

  const { data, error } = await query
  if (error) {
    return NextResponse.json({
      ok: false,
      message: 'Ejecuta supabase_v9_leads.sql para habilitar la secuencia de captación',
      error: error.message,
    })
  }

  const leads = (data || []) as Lead[]
  let sent = 0
  let failed = 0
  const detail: { email: string; day: number; status: string }[] = []

  for (const lead of leads) {
    const nextDay = forcedDay ?? Math.min(lead.drip_day + 1, DRIP_LENGTH)
    const ok = await sendDripDay(supabase, lead, nextDay, today, { markSent: !forced })
    if (ok) sent++
    else failed++
    detail.push({ email: lead.email, day: nextDay, status: ok ? 'enviado' : 'falló' })
  }

  return NextResponse.json({ ok: true, sent, failed, pending: leads.length, detail })
}
