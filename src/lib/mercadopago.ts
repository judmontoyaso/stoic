// Server-only. Integración con Mercado Pago (Checkout Pro) como segunda
// puerta de pago, en paralelo a Lemon Squeezy. MP es el rail para
// México + Colombia (y demás LatAm): tarjeta, PSE, OXXO, saldo.
//
// Sin SDK: la API de MP es REST y la firma del webhook es HMAC, igual
// que el webhook de Lemon Squeezy. Menos dependencias, menos sorpresas.
//
// A diferencia de LS (URL de checkout estática), MP exige crear una
// "preferencia" por comprador para poder colgarle el user_id. Por eso
// hay una ruta de backend (/api/checkout/mercadopago) además del webhook.

import crypto from 'node:crypto'

const MP_API = 'https://api.mercadopago.com'

export interface MpConfig {
  accessToken: string
  webhookSecret: string | null
  currency: string
  price: number
}

// Devuelve la config solo si MP está realmente listo para cobrar.
// El estado seguro es "no configurado": igual que LEMONSQUEEZY_LIVE, no
// se vende por accidente. La cuenta de MP es de un país (la del fundador
// es COP); MERCADOPAGO_CURRENCY y MERCADOPAGO_FOUNDER_PRICE lo ajustan
// sin tocar código.
export function mpConfig(): MpConfig | null {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) return null
  const price = Number(process.env.MERCADOPAGO_FOUNDER_PRICE)
  if (!Number.isFinite(price) || price <= 0) return null
  return {
    accessToken,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || null,
    currency: process.env.MERCADOPAGO_CURRENCY || 'COP',
    price,
  }
}

export interface MpPreference {
  initPoint: string
  preferenceId: string
}

// Crea la preferencia y devuelve el init_point (URL de checkout alojado).
// external_reference = user_id: es lo que el webhook usa para saber a
// quién acreditar el pago.
export async function createPreference(opts: {
  config: MpConfig
  userId: string
  email: string | null
  appUrl: string
}): Promise<MpPreference | null> {
  const { config, userId, email, appUrl } = opts
  const base = appUrl.replace(/\/$/, '')

  const body = {
    items: [
      {
        id: 'stoicom-founder',
        title: 'StoiCom · Acceso de fundador',
        description: 'Acceso de por vida al programa completo de 90 días.',
        quantity: 1,
        unit_price: config.price,
        currency_id: config.currency,
      },
    ],
    payer: email ? { email } : undefined,
    external_reference: userId,
    metadata: { user_id: userId },
    back_urls: {
      // NO va directo a /welcome (protegida): pasa por la ruta de retorno
      // que verifica el pago y aprueba antes de dejar entrar.
      success: `${base}/api/checkout/mercadopago/return`,
      pending: `${base}/auth/verify?pago=pendiente`,
      failure: `${base}/auth/verify?pago=fallido`,
    },
    auto_return: 'approved',
    // NO se pone notification_url a propósito. Si se pone, MP manda una
    // notificación IPN por esa URL que puede venir SIN firmar, y el
    // webhook la rechaza (401) → el pago no aprueba la cuenta. Dejándolo
    // fuera, MP usa solo el webhook configurado en el panel (Your
    // integrations → app → Webhooks), que llega firmado con x-signature
    // y sí se valida. Ese webhook apunta al mismo endpoint.
    statement_descriptor: 'STOICOM',
  }

  try {
    const res = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        // Evita preferencias duplicadas si el usuario hace doble clic
        'X-Idempotency-Key': `pref-${userId}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('Mercado Pago rechazó la preferencia:', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = (await res.json()) as { id?: string; init_point?: string }
    if (!data.id || !data.init_point) {
      console.error('Preferencia MP sin id/init_point:', JSON.stringify(data))
      return null
    }
    return { initPoint: data.init_point, preferenceId: data.id }
  } catch (err) {
    console.error('Error creando preferencia en Mercado Pago:', err)
    return null
  }
}

export interface MpPayment {
  id: number
  status: string
  externalReference: string | null
  payerEmail: string | null
}

// Resultado de consultar un pago:
//   - ok: el pago existe, se procesa.
//   - not_found: el id no corresponde a un pago (p.ej. el simulador de MP
//     con un id falso). No es un error nuestro → el webhook responde 200
//     para que MP no reintente en vano.
//   - error: fallo transitorio (red, 5xx, token) → el webhook responde
//     500 para que MP reintente más tarde.
export type PaymentLookup =
  | { ok: true; payment: MpPayment }
  | { ok: false; retryable: boolean }

// Consulta el pago para conocer su estado real. El webhook solo trae el
// id; nunca se confía en un "status" que venga en la notificación.
export async function getPayment(config: MpConfig, paymentId: string): Promise<PaymentLookup> {
  try {
    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    })
    if (res.status === 404) {
      // Id inexistente (típico del simulador): no reintentar
      return { ok: false, retryable: false }
    }
    if (!res.ok) {
      console.error('Mercado Pago: no se pudo leer el pago', paymentId, res.status)
      return { ok: false, retryable: true }
    }
    const p = (await res.json()) as {
      id: number
      status: string
      external_reference?: string | null
      payer?: { email?: string | null }
    }
    return {
      ok: true,
      payment: {
        id: p.id,
        status: p.status,
        externalReference: p.external_reference ?? null,
        payerEmail: p.payer?.email ?? null,
      },
    }
  } catch (err) {
    console.error('Error leyendo el pago de Mercado Pago:', err)
    return { ok: false, retryable: true }
  }
}

// Valida la firma del webhook (HMAC-SHA256). MP arma un manifiesto con el
// id del recurso, el x-request-id y el timestamp, y lo firma con el
// secreto que se configura en el panel. Sin secreto configurado no se
// puede validar: se rechaza, nunca se procesa a ciegas.
// Doc: el header x-signature viene como "ts=...,v1=<hmac hex>".
export function verifyWebhookSignature(opts: {
  secret: string | null
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
}): boolean {
  const { secret, xSignature, xRequestId, dataId } = opts
  if (!secret || !xSignature || !dataId) return false

  let ts = ''
  let v1 = ''
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=').map(s => s?.trim())
    if (k === 'ts') ts = v
    else if (k === 'v1') v1 = v
  }
  if (!ts || !v1) return false

  // El id alfanumérico se compara en minúsculas (regla de MP)
  const id = /[a-zA-Z]/.test(dataId) ? dataId.toLowerCase() : dataId
  const manifest = `id:${id};request-id:${xRequestId ?? ''};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  const a = Buffer.from(expected)
  const b = Buffer.from(v1)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
