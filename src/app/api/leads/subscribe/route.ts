import { NextResponse } from 'next/server'
import { normalizeEmail, serviceClient, sendConfirmation, type Lead } from '@/lib/leads'

// POST /api/leads/subscribe  { email, source? }
// Alta en la lista con doble opt-in: aquí solo se guarda el correo y se
// manda el enlace de confirmación. Nada más sale hasta que hagan clic.
//
// Responde siempre lo mismo pase lo que pase con ese correo: si dijera
// "ya estabas suscrito" cualquiera podría usar el formulario para
// averiguar quién está en la lista.

const RESEND_THROTTLE_MINUTES = 5
// Freno global: un bot con mil correos ajenos podría convertir este
// formulario en una máquina de spam y quemar la reputación del dominio.
// Por encima de este ritmo se deja de aceptar altas nuevas durante una hora.
const MAX_NEW_PER_HOUR = 30

export async function POST(request: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const email = normalizeEmail(body.email)
  if (!email) {
    return NextResponse.json({ error: 'Ese correo no parece válido' }, { status: 400 })
  }

  const source = typeof body.source === 'string' ? body.source.slice(0, 40) : 'landing'
  const ok = NextResponse.json({ ok: true })

  const supabase = serviceClient()
  if (!supabase) {
    console.error('Leads: falta SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })
  }

  const { data: existingRows, error: readError } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .limit(1)

  if (readError) {
    console.error('Leads: ¿ejecutaste supabase_v9_leads.sql?', readError.message)
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })
  }

  const existing = existingRows?.[0] as Lead | undefined

  // Ya confirmado: no reenviar nada. Si se dio de baja, tampoco: para
  // volver a entrar tiene que pedirlo de nuevo y confirmar.
  if (existing?.confirmed_at || existing?.unsubscribed_at) return ok

  // Anti mail-bombing: un mismo correo no recibe otra confirmación
  // hasta pasados unos minutos.
  if (existing?.confirm_sent_at) {
    const elapsedMin = (Date.now() - new Date(existing.confirm_sent_at).getTime()) / 60000
    if (elapsedMin < RESEND_THROTTLE_MINUTES) return ok
  }

  let lead = existing
  if (!lead) {
    const hourAgo = new Date(Date.now() - 3600_000).toISOString()
    const { count } = await supabase
      .from('leads')
      .select('email', { count: 'exact', head: true })
      .gte('created_at', hourAgo)
    if ((count ?? 0) >= MAX_NEW_PER_HOUR) {
      console.error(`Leads: ${count} altas en la última hora, se frena el alta de ${email}`)
      return ok
    }

    const { data: inserted, error: insertError } = await supabase
      .from('leads')
      .insert({ email, source })
      .select('*')
      .single()
    if (insertError || !inserted) {
      console.error('Leads: no se pudo insertar', insertError?.message)
      return NextResponse.json({ error: 'No se pudo completar el registro' }, { status: 500 })
    }
    lead = inserted as Lead
  }

  const sent = await sendConfirmation(lead)
  if (sent) {
    await supabase
      .from('leads')
      .update({ confirm_sent_at: new Date().toISOString() })
      .eq('email', email)
  } else {
    // El correo no salió: sin confirm_sent_at podrá reintentar enseguida
    console.error('Leads: Resend no aceptó la confirmación para', email)
  }

  return ok
}
