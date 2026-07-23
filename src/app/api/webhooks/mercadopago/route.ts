import { NextResponse } from 'next/server'
import { mpConfig, getPayment, verifyWebhookSignature } from '@/lib/mercadopago'
import { approveMpFounder } from '@/lib/mercadopago-approve'

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

  const lookup = await getPayment(config, dataId)
  if (!lookup.ok) {
    // 404 (id inexistente, p.ej. el simulador) → 200 y no reintentar.
    // Error transitorio → 500 para que MP reintente más tarde.
    return NextResponse.json(
      { ok: !lookup.retryable, ignored: 'pago no verificable' },
      { status: lookup.retryable ? 500 : 200 }
    )
  }
  const payment = lookup.payment

  if (payment.status !== 'approved') {
    return NextResponse.json({ ok: true, ignored: `status ${payment.status}` })
  }

  // Misma aprobación que usa el retorno del checkout (helper compartido)
  const outcome = await approveMpFounder(payment)
  if (outcome === 'error') {
    // 500: Mercado Pago reintenta el webhook
    return NextResponse.json({ error: 'No se pudo aprobar al comprador' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, outcome, user: payment.externalReference })
}
