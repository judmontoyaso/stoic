// Server-only. Revoca el acceso de un fundador reembolsado.
//
// Hasta ahora un reembolso dejaba el acceso de por vida intacto y había
// que quitarlo a mano. Se conserva la cuenta y sus datos (días, diario):
// solo se retira la marca de aprobación, así que si vuelve a pagar
// recupera todo su progreso.

import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

export async function revokeAccess(
  admin: AnySupabaseClient,
  opts: { userId?: string | null; email?: string | null; reason: string }
): Promise<boolean> {
  let userId = opts.userId || null

  // Sin user_id se busca por correo (LS y MP no siempre lo mandan)
  if (!userId && opts.email) {
    const target = opts.email.toLowerCase()
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) break
      const match = (data?.users || []).find(u => u.email?.toLowerCase() === target)
      if (match) {
        userId = match.id
        break
      }
      if ((data?.users || []).length < 1000) break
    }
  }

  if (!userId) {
    console.error('Revocación sin destinatario:', opts.reason, opts.email)
    return false
  }

  const { data: userData, error: readErr } = await admin.auth.admin.getUserById(userId)
  if (readErr || !userData?.user) {
    console.error('Revocación: usuario no encontrado', userId)
    return false
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...userData.user.app_metadata,
      stoicom_approved: false,
      stoicom_plan: 'refunded',
      stoicom_revoked_at: new Date().toISOString(),
      stoicom_revoked_reason: opts.reason,
    },
  })

  if (error) {
    console.error('Error revocando acceso:', error.message)
    return false
  }

  console.warn(`Acceso revocado (${opts.reason}):`, userData.user.email)
  return true
}
