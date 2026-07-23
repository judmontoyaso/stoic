import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { sendEmail, welcomeEmail } from '@/lib/email'
import { markLeadConverted } from '@/lib/leads'

// Webhook de Lemon Squeezy: al confirmarse una orden pagada, aprueba al
// usuario (misma marca que el código de acceso) y registra el plan.
// La otra puerta de entrada —el código— sigue viva en /auth/verify.
//
// Configurar en Lemon Squeezy → Settings → Webhooks:
//   URL:    https://<app>/api/webhooks/lemonsqueezy
//   Secret: LEMONSQUEEZY_WEBHOOK_SECRET (mismo valor en Vercel)
//   Evento: order_created
// El checkout debe llevar checkout[custom][user_id] (lo añade /auth/verify).

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'LEMONSQUEEZY_WEBHOOK_SECRET no configurado' }, { status: 500 })
  }

  const raw = await request.text()
  const signature = request.headers.get('x-signature') || ''
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  const eventName = request.headers.get('x-event-name') || ''
  if (eventName !== 'order_created') {
    return NextResponse.json({ ok: true, ignored: eventName })
  }

  let payload: {
    meta?: { custom_data?: { user_id?: string } }
    data?: { attributes?: { status?: string; user_email?: string; identifier?: string } }
  }
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const status = payload.data?.attributes?.status
  if (status !== 'paid') {
    return NextResponse.json({ ok: true, ignored: `status ${status}` })
  }

  const userId = payload.meta?.custom_data?.user_id
  if (!userId) {
    // Sin user_id no hay a quién acreditar: 200 para que LS no reintente,
    // pero queda en los logs para resolverlo a mano.
    console.error('Orden pagada sin user_id en custom_data:', payload.data?.attributes?.identifier)
    return NextResponse.json({ ok: true, warning: 'orden sin user_id' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  const { data: userData, error: getError } = await admin.auth.admin.getUserById(userId)
  if (getError || !userData?.user) {
    console.error('Orden pagada para usuario inexistente:', userId, getError)
    return NextResponse.json({ ok: true, warning: 'usuario no encontrado' })
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...userData.user.app_metadata,
      stoicom_approved: true,
      stoicom_plan: 'founder',
      stoicom_paid_at: new Date().toISOString(),
      stoicom_order: payload.data?.attributes?.identifier || null,
    },
  })
  if (error) {
    console.error('Error aprobando comprador:', error)
    // 500: Lemon Squeezy reintenta el webhook
    return NextResponse.json({ error: 'No se pudo aprobar al comprador' }, { status: 500 })
  }

  // Bienvenida (best effort, pero con await: en serverless una promesa
  // suelta muere cuando la función responde)
  const email = userData.user.email || payload.data?.attributes?.user_email
  if (email) {
    const appUrl = process.env.APP_URL || 'https://stoicom.app'
    try {
      await sendEmail(email, welcomeEmail({ name: email.split('@')[0], appUrl }))
    } catch (err) {
      console.error('Error enviando bienvenida al comprador:', err)
    }
    // El correo de la compra puede diferir del de la cuenta: marcar ambos
    await markLeadConverted(email)
    await markLeadConverted(payload.data?.attributes?.user_email)
  }

  return NextResponse.json({ ok: true, approved: userId })
}
