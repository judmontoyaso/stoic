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

/** Tamaño de página de listUsers (el máximo que acepta Supabase es 1000). */
const PAGE_SIZE = 1000
/** Tope de seguridad: 100k usuarios. Evita un bucle infinito si la API cambia. */
const MAX_PAGES = 100

/**
 * Usuarios aprobados (requiere cliente con SERVICE_ROLE_KEY).
 *
 * listUsers() pagina y devuelve solo 50 por defecto: sin recorrer las
 * páginas, los crons dejarían de escribirle a la base a partir del
 * usuario 51. Se recorre hasta agotar los resultados.
 */
export async function getApprovedUsers(supabase: AnySupabaseClient): Promise<ApprovedUser[]> {
  const approved: ApprovedUser[] = []
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE })
      if (error) {
        console.error('Error listando usuarios (página %d):', page, error)
        // Con páginas ya leídas, es mejor escribirle a esos que a nadie
        break
      }

      const users = data?.users || []
      for (const u of users) {
        if (u.app_metadata?.stoicom_approved !== true || !u.email) continue
        approved.push({
          id: u.id,
          email: (u.email as string).toLowerCase(),
          plan: (u.app_metadata?.stoicom_plan as string) || 'code',
        })
      }

      // Última página: la API devolvió menos de lo pedido
      if (users.length < PAGE_SIZE) break
    }
  } catch (err) {
    console.error('Error listando usuarios para correos:', err)
  }
  return approved
}
