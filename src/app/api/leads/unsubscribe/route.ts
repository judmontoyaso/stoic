import { NextResponse } from 'next/server'
import { serviceClient, appUrl, type Lead } from '@/lib/leads'

// Baja de la secuencia de captación.
//
// GET  → NO da de baja: lleva a /suscripcion, que pide confirmar con un
//        botón. Los escáneres de correo (Outlook Safe Links y compañía)
//        visitan los enlaces solos; si el GET diera de baja, borraría
//        suscriptores que nunca pidieron irse.
// POST → ejecuta la baja.

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || ''
  const base = appUrl() || new URL(request.url).origin
  const estado = token ? 'baja-confirmar' : 'error'
  return NextResponse.redirect(
    `${base}/suscripcion?estado=${estado}${token ? `&token=${token}` : ''}`,
    { status: 303 }
  )
}

export async function POST(request: Request) {
  let token = ''
  try {
    const body = await request.json()
    token = String(body.token || '')
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
  if (!token) return NextResponse.json({ error: 'Falta el token' }, { status: 400 })

  const supabase = serviceClient()
  if (!supabase) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  const { data, error } = await supabase.from('leads').select('*').eq('token', token).limit(1)
  if (error) {
    console.error('Leads unsubscribe:', error.message)
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })
  }

  const lead = data?.[0] as Lead | undefined
  // Token desconocido: responder ok igual, para no confirmar si existe
  if (!lead) return NextResponse.json({ ok: true })
  if (lead.unsubscribed_at) return NextResponse.json({ ok: true })

  const { error: updateError } = await supabase
    .from('leads')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', lead.email)
  if (updateError) {
    console.error('Leads unsubscribe: no se pudo dar de baja', updateError.message)
    return NextResponse.json({ error: 'No se pudo completar la baja' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
