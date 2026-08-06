import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { sendEmail, welcomeEmail, renewalEmail } from '@/lib/email'
import { markLeadConverted } from '@/lib/leads'
import { recordPayment } from '@/lib/payments'
import { revokeAccess } from '@/lib/revoke-access'
import { nextExpiry } from '@/lib/access'

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
    data?: {
      id?: string
      attributes?: {
        status?: string
        user_email?: string
        identifier?: string
        total?: number | null // en centavos
        currency?: string | null
      }
    }
  }
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const status = payload.data?.attributes?.status

  // Reembolso: se retira el acceso. Sin esto, quien pedía su dinero de
  // vuelta conservaba el acceso de por vida y había que quitarlo a mano.
  if (status === 'refunded') {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        db: { schema: 'stoic' },
      })
      await revokeAccess(admin, {
        userId: payload.meta?.custom_data?.user_id,
        email: payload.data?.attributes?.user_email,
        reason: 'lemonsqueezy:refunded',
      })
      const id = payload.data?.id
      if (id) {
        await admin
          .from('payments')
          .update({ status: 'refunded' })
          .eq('provider', 'lemonsqueezy')
          .eq('provider_payment_id', String(id))
      }
    }
    return NextResponse.json({ ok: true, revoked: true })
  }

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

  const meta = userData.user.app_metadata || {}
  const alreadyApproved = meta.stoicom_approved === true

  // Vigencia de un año, extendida desde el vencimiento actual si aún no
  // ha llegado. LS reintenta los webhooks que fallan, así que se marca
  // qué orden otorgó la vigencia: un reintento de la MISMA orden no puede
  // regalar un segundo año.
  const identifier = payload.data?.attributes?.identifier || payload.data?.id || null
  const orderRef = `lemonsqueezy:${identifier ?? userId}`
  const yaContado = meta.stoicom_vigencia_order === orderRef
  const expiresAt = yaContado
    ? (meta.stoicom_expires_at as string)
    : nextExpiry(meta.stoicom_expires_at as string | null).toISOString()
  const esRenovacion = alreadyApproved && !yaContado

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...meta,
      stoicom_approved: true,
      stoicom_plan: 'founder',
      stoicom_paid_at: meta.stoicom_paid_at || new Date().toISOString(),
      stoicom_order: identifier,
      stoicom_expires_at: expiresAt,
      stoicom_vigencia_order: orderRef,
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
  if (email && (!alreadyApproved || esRenovacion)) {
    const appUrl = process.env.APP_URL || 'https://stoicom.app'
    const name = email.split('@')[0]
    try {
      await sendEmail(
        email,
        esRenovacion
          ? renewalEmail({ name, appUrl, expiresAt })
          : welcomeEmail({ name, appUrl })
      )
    } catch (err) {
      console.error('Error enviando correo al comprador:', err)
    }
    if (!alreadyApproved) {
      // El correo de la compra puede diferir del de la cuenta: marcar ambos
      await markLeadConverted(email)
      await markLeadConverted(payload.data?.attributes?.user_email)
    }
  }

  // Registro interno del pago (idempotente; no bloquea la aprobación).
  // LS reporta el total en centavos → a unidades de la moneda.
  const total = payload.data?.attributes?.total
  await recordPayment({
    provider: 'lemonsqueezy',
    providerPaymentId: payload.data?.attributes?.identifier || payload.data?.id || `ls-${userId}`,
    userId,
    email: email || null,
    amount: typeof total === 'number' ? total / 100 : null,
    currency: payload.data?.attributes?.currency || null,
    status: 'approved',
    plan: 'founder',
  })

  return NextResponse.json({ ok: true, approved: userId })
}
