import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { sendEmail, welcomeEmail } from '@/lib/email'
import { markLeadConverted } from '@/lib/leads'
import { mpConfig, getPayment, verifyWebhookSignature } from '@/lib/mercadopago'

// Webhook de Mercado Pago: al aprobarse un pago, aprueba al usuario
// (misma marca app_metadata.stoicom_approved que el código y que LS) y
// registra el plan fundador. Segunda puerta de pago; el código y LS
// siguen vivos en paralelo.
//
// Configurar en el panel de MP → Webhooks:
//   URL:    https://<app>/api/webhooks/mercadopago
//   Evento: Pagos (payment)
//   Firma:  el secreto va en MERCADOPAGO_WEBHOOK_SECRET (mismo valor).
//
// MP solo manda el id del pago; el estado se consulta con la API. Nunca
// se confía en un status que venga en el cuerpo de la notificación.

export const maxDuration = 30

export async function POST(request: Request) {
  const config = mpConfig()
  if (!config) {
    // Sin config no hay nada que hacer; 200 para que MP no reintente
    return NextResponse.json({ ok: true, ignored: 'mp no configurado' })
  }

  const url = new URL(request.url)
  const raw = await request.text()

  let payload: { type?: string; action?: string; data?: { id?: string } } = {}
  try {
    payload = raw ? JSON.parse(raw) : {}
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  // El id del recurso puede venir en el cuerpo o en la query (?data.id=)
  const dataId = payload.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id')
  const type = payload.type || url.searchParams.get('type') || url.searchParams.get('topic')

  // La firma se valida siempre. Sin secreto configurado no se puede: se
  // rechaza, nunca se procesa a ciegas.
  const validSignature = verifyWebhookSignature({
    secret: config.webhookSecret,
    xSignature: request.headers.get('x-signature'),
    xRequestId: request.headers.get('x-request-id'),
    dataId,
  })
  if (!validSignature) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  // Solo interesan las notificaciones de pago
  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ ok: true, ignored: type || 'sin tipo' })
  }

  const payment = await getPayment(config, dataId)
  if (!payment) {
    // No se pudo leer: 500 para que MP reintente más tarde
    return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 500 })
  }

  if (payment.status !== 'approved') {
    return NextResponse.json({ ok: true, ignored: `status ${payment.status}` })
  }

  const userId = payment.externalReference
  if (!userId) {
    console.error('Pago MP aprobado sin external_reference:', payment.id)
    return NextResponse.json({ ok: true, warning: 'pago sin user_id' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  const { data: userData, error: getError } = await admin.auth.admin.getUserById(userId)
  if (getError || !userData?.user) {
    console.error('Pago MP para usuario inexistente:', userId, getError)
    return NextResponse.json({ ok: true, warning: 'usuario no encontrado' })
  }

  // Idempotente: si ya estaba aprobado, no se reenvía la bienvenida
  const alreadyApproved = userData.user.app_metadata?.stoicom_approved === true

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...userData.user.app_metadata,
      stoicom_approved: true,
      stoicom_plan: 'founder',
      stoicom_paid_at: userData.user.app_metadata?.stoicom_paid_at || new Date().toISOString(),
      stoicom_mp_payment: payment.id,
    },
  })
  if (error) {
    console.error('Error aprobando comprador MP:', error)
    // 500: Mercado Pago reintenta el webhook
    return NextResponse.json({ error: 'No se pudo aprobar al comprador' }, { status: 500 })
  }

  if (!alreadyApproved) {
    const email = userData.user.email || payment.payerEmail
    if (email) {
      const appUrl = process.env.APP_URL || 'https://stoicom.app'
      try {
        await sendEmail(email, welcomeEmail({ name: email.split('@')[0], appUrl }))
      } catch (err) {
        console.error('Error enviando bienvenida al comprador MP:', err)
      }
      await markLeadConverted(email)
      await markLeadConverted(payment.payerEmail)
    }
  }

  return NextResponse.json({ ok: true, approved: userId })
}
