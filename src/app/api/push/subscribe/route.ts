import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Registro y baja de suscripciones Web Push.
// POST   /api/push/subscribe  { endpoint, keys: { p256dh, auth } }
// DELETE /api/push/subscribe  { endpoint }
// Protegido por el proxy (cookie stoic_session).

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  return createClient(url, key, { db: { schema: 'stoic' } })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: body.endpoint,
          keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
          user_agent: request.headers.get('user-agent') || null,
        },
        { onConflict: 'endpoint' }
      )

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error guardando suscripción push:', err)
    return NextResponse.json({ error: 'No se pudo guardar la suscripción' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    if (!body?.endpoint) {
      return NextResponse.json({ error: 'Falta endpoint' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', body.endpoint)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error eliminando suscripción push:', err)
    return NextResponse.json({ error: 'No se pudo eliminar la suscripción' }, { status: 500 })
  }
}
