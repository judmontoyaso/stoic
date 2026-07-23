import { NextResponse } from 'next/server'
import { mpConfig, getPayment } from '@/lib/mercadopago'
import { approveMpFounder } from '@/lib/mercadopago-approve'

// Retorno del checkout de Mercado Pago (back_url success). MP devuelve
// aquí al comprador tras pagar, con ?payment_id=...&status=... en la URL.
//
// Esta es la vía PRINCIPAL de aprobación (síncrona y fiable): verifica el
// pago contra la API de MP y aprueba en el acto, sin depender de que la
// notificación del webhook llegue a tiempo. El webhook queda de respaldo.
//
// Es pública (el proxy deja pasar /api/checkout/): no puede ir a /welcome
// directo porque esa página está protegida y el comprador aún no está
// aprobado cuando MP lo devuelve. Aprobamos aquí y recién ahí redirigimos.

export const maxDuration = 30

export async function GET(request: Request) {
  const url = new URL(request.url)
  const base = (process.env.APP_URL || url.origin).replace(/\/$/, '')
  const paymentId =
    url.searchParams.get('payment_id') || url.searchParams.get('collection_id')

  const config = mpConfig()
  if (!config || !paymentId) {
    return NextResponse.redirect(`${base}/auth/verify?pago=pendiente`, 303)
  }

  const lookup = await getPayment(config, paymentId)
  if (lookup.ok && lookup.payment.status === 'approved') {
    const outcome = await approveMpFounder(lookup.payment)
    if (outcome === 'approved' || outcome === 'already') {
      return NextResponse.redirect(`${base}/welcome`, 303)
    }
  }

  // Pago no aprobado aún (pendiente) o algo falló: el webhook es el
  // respaldo. El comprador ve /auth/verify con aviso; al recargar tras la
  // aprobación del webhook, entra.
  return NextResponse.redirect(`${base}/auth/verify?pago=pendiente`, 303)
}
