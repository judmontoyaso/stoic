// Server-only. Lógica compartida para aprobar a un fundador que pagó por
// Mercado Pago. La usan DOS caminos:
//   1. El retorno del checkout (back_url success) — fiable, síncrono: el
//      comprador vuelve al sitio y se aprueba en el acto.
//   2. El webhook — respaldo, por si el comprador cierra la pestaña antes
//      de volver.
// Ambos verifican el pago contra la API de MP antes de aprobar; nunca se
// confía en datos que lleguen del navegador o de la notificación.

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { sendEmail, welcomeEmail } from '@/lib/email'
import { markLeadConverted } from '@/lib/leads'
import { recordPayment } from '@/lib/payments'
import type { MpPayment } from '@/lib/mercadopago'

export type ApproveOutcome =
  | 'approved'       // recién aprobado
  | 'already'        // ya estaba aprobado (idempotente)
  | 'no_user_ref'    // pago sin external_reference
  | 'user_not_found' // el user_id no existe
  | 'error'          // fallo transitorio: conviene reintentar

// Aprueba al dueño del pago (payment.externalReference = user_id).
// Idempotente: reejecutar no reenvía la bienvenida ni pisa la fecha.
export async function approveMpFounder(payment: MpPayment): Promise<ApproveOutcome> {
  const userId = payment.externalReference
  if (!userId) {
    console.error('Pago MP aprobado sin external_reference:', payment.id)
    return 'no_user_ref'
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error('approveMpFounder: falta SUPABASE_SERVICE_ROLE_KEY')
    return 'error'
  }
  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  const { data: userData, error: getError } = await admin.auth.admin.getUserById(userId)
  if (getError || !userData?.user) {
    console.error('Pago MP para usuario inexistente:', userId, getError)
    return 'user_not_found'
  }

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
    return 'error'
  }

  const email = userData.user.email || payment.payerEmail

  // Registro interno del pago (idempotente; no bloquea la aprobación)
  await recordPayment({
    provider: 'mercadopago',
    providerPaymentId: String(payment.id),
    userId,
    email,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    plan: 'founder',
  })

  if (!alreadyApproved) {
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

  return alreadyApproved ? 'already' : 'approved'
}
