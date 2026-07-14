// Server-only. Destinatarios de los correos automáticos.
// Prioridad: usuarios registrados (Google via Supabase Auth, filtrados por
// ALLOWED_EMAILS) y como fallback NOTIFICATION_EMAIL.

import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Correos destino: los de los usuarios autenticados con Google.
 * Requiere cliente con SERVICE_ROLE_KEY (auth.admin).
 * Fallback a NOTIFICATION_EMAIL si no hay usuarios.
 */
export async function getRecipients(supabase: AnySupabaseClient, forceTo?: string | null): Promise<string[]> {
  if (forceTo) return [forceTo]

  let emails: string[] = []
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (!error) {
      emails = (data?.users || [])
        .map(u => u.email?.toLowerCase())
        .filter((e): e is string => !!e)
    }
  } catch (err) {
    console.error('Error listando usuarios para correos:', err)
  }

  const allowed = allowedEmails()
  if (allowed.length > 0) {
    emails = emails.filter(e => allowed.includes(e))
  }

  if (emails.length === 0 && process.env.NOTIFICATION_EMAIL) {
    emails = [process.env.NOTIFICATION_EMAIL]
  }

  return [...new Set(emails)]
}
