// Server-only. Usuarios aprobados de StoiCom para los correos automáticos.
// El proyecto Supabase puede ser compartido por varias apps: aquí solo
// cuentan los usuarios con app_metadata.stoicom_approved (otorgado una
// única vez con el código de acceso en /auth/verify).

import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

export interface ApprovedUser {
  id: string
  email: string
  /** 'founder' si entró pagando; 'code' si entró con código de invitación */
  plan: string
}

/** Usuarios aprobados (requiere cliente con SERVICE_ROLE_KEY). */
export async function getApprovedUsers(supabase: AnySupabaseClient): Promise<ApprovedUser[]> {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) {
      console.error('Error listando usuarios:', error)
      return []
    }
    return (data?.users || [])
      .filter(u => u.app_metadata?.stoicom_approved === true && !!u.email)
      .map(u => ({
        id: u.id,
        email: (u.email as string).toLowerCase(),
        plan: (u.app_metadata?.stoicom_plan as string) || 'code',
      }))
  } catch (err) {
    console.error('Error listando usuarios para correos:', err)
    return []
  }
}
