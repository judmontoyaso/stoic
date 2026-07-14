// Server-only. Destinatarios de los correos automáticos.
// El proyecto Supabase puede ser compartido por varias apps: aquí solo
// cuentan los usuarios aprobados para StoiCom (app_metadata.stoicom_approved,
// que se otorga una única vez con el código de acceso en /auth/verify).
// Fallback: NOTIFICATION_EMAIL.

import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

/**
 * Correos destino: usuarios aprobados de StoiCom.
 * Requiere cliente con SERVICE_ROLE_KEY (auth.admin).
 */
export async function getRecipients(supabase: AnySupabaseClient, forceTo?: string | null): Promise<string[]> {
  if (forceTo) return [forceTo]

  let emails: string[] = []
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (!error) {
      emails = (data?.users || [])
        .filter(u => u.app_metadata?.stoicom_approved === true)
        .map(u => u.email?.toLowerCase())
        .filter((e): e is string => !!e)
    }
  } catch (err) {
    console.error('Error listando usuarios para correos:', err)
  }

  if (emails.length === 0 && process.env.NOTIFICATION_EMAIL) {
    emails = [process.env.NOTIFICATION_EMAIL]
  }

  return [...new Set(emails)]
}
