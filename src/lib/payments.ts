// Server-only. Registro interno de pagos en stoic.payments.
// Aparte del panel de la pasarela: sirve para soporte, conciliación,
// reembolsos y métricas de ingresos. Requiere supabase_v10_payments.sql.
//
// Nunca lanza ni bloquea la aprobación: si la tabla no existe todavía o
// el insert falla, se registra en el log y el flujo de acceso sigue.

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export interface PaymentRecord {
  provider: 'mercadopago' | 'lemonsqueezy'
  providerPaymentId: string
  userId: string | null
  email: string | null
  amount: number | null
  currency: string | null
  status: string
  plan: string
}

export async function recordPayment(p: PaymentRecord): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  const admin = createSupabaseAdmin(url, key, { db: { schema: 'stoic' } })
  try {
    const { error } = await admin.from('payments').upsert(
      {
        provider: p.provider,
        provider_payment_id: p.providerPaymentId,
        user_id: p.userId,
        email: p.email,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        plan: p.plan,
      },
      { onConflict: 'provider,provider_payment_id' }
    )
    if (error) {
      console.error('recordPayment: ¿ejecutaste supabase_v10_payments.sql?', error.message)
    }
  } catch (err) {
    console.error('recordPayment error:', err)
  }
}
