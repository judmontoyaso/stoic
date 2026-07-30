import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// Reinicia el progreso de un usuario desde /admin. Solo administrador.
//
// POST { email, startDay }  — startDay = en qué día del programa queda
//   (1 = empieza hoy, 3 = hoy es su día 3). Los días anteriores al actual
//   se marcan como cumplidos.
//
// SE CONSERVA: la cuenta, su aprobación, sus preferencias (zona horaria y
// horas de correo) y sus suscripciones push. Solo se borra el progreso.
// No es reversible desde la app: quien lo use debe estar seguro.

const TABLAS_PROGRESO = [
  'day_logs',
  'week_logs',
  'month_logs',
  'journal_entries',
  'daily_reflections',
] as const

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export async function POST(request: Request) {
  const session = await createServerSupabase()
  const { data: { user: actor } } = await session.auth.getUser()
  if (!isAdminEmail(actor?.email)) {
    return NextResponse.json({ error: 'Solo el administrador' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  let body: { email?: string; startDay?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const email = String(body.email || '').trim().toLowerCase()
  // Día 1 = empieza hoy. Se limita a 90 (la duración del track más largo).
  const startDay = Math.min(Math.max(Number(body.startDay) || 1, 1), 90)
  if (!email) return NextResponse.json({ error: 'Falta el correo' }, { status: 400 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  // Buscar al usuario (paginado: la base puede pasar de 50)
  let target: { id: string; email?: string } | null = null
  for (let page = 1; page <= 20 && !target; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) break
    target = (data?.users || []).find(u => u.email?.toLowerCase() === email) || null
    if ((data?.users || []).length < 1000) break
  }
  if (!target) {
    return NextResponse.json({ error: `No hay usuario con el correo ${email}` }, { status: 404 })
  }

  // Los tracks que ya tenía: se reusan sus track_id, no se inventan otros
  const { data: previos } = await admin
    .from('user_tracks')
    .select('track_id')
    .eq('user_id', target.id)
    .not('start_date', 'is', null)
  const trackIds = (previos || []).map(t => t.track_id as string)

  // Borrar progreso
  const borrado: Record<string, string> = {}
  for (const t of TABLAS_PROGRESO) {
    const { error } = await admin.from(t).delete().eq('user_id', target.id)
    borrado[t] = error ? `error: ${error.message}` : 'ok'
  }

  // Recolocar la fecha de inicio y marcar los días ya transcurridos
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  const inicio = addDays(hoy, -(startDay - 1))

  for (const trackId of trackIds) {
    await admin
      .from('user_tracks')
      .upsert({ user_id: target.id, track_id: trackId, start_date: inicio }, { onConflict: 'user_id,track_id' })

    // Días anteriores a hoy = cumplidos. El de hoy queda pendiente.
    if (startDay > 1) {
      const filas = Array.from({ length: startDay - 1 }, (_, i) => ({
        user_id: target.id,
        track_id: trackId,
        day_number: i + 1,
        date: addDays(inicio, i),
        completed: true,
      }))
      await admin.from('day_logs').upsert(filas, { onConflict: 'user_id,track_id,date' })
    }
  }

  // Marcadores de correo a null: hoy vuelve a recibir como si empezara
  await admin
    .from('user_prefs')
    .update({
      last_morning_sent: null,
      last_evening_sent: null,
      last_weekly_sent: null,
      last_rescue_sent: null,
      last_quote_sent: null,
      last_welcome_sent: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', target.id)

  console.warn(`Progreso reiniciado por ${actor?.email}: ${email} -> día ${startDay} (inicio ${inicio})`)

  return NextResponse.json({
    ok: true,
    email,
    startDay,
    startDate: inicio,
    tracksReiniciados: trackIds.length,
    diasMarcados: startDay > 1 ? (startDay - 1) * Math.max(trackIds.length, 1) : 0,
    borrado,
  })
}
