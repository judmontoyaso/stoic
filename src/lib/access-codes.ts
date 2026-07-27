// Server-only. Códigos de acceso únicos (stoic.access_codes).
// Un código = un ingreso. La etiqueta de campaña da la atribución:
// qué canal (beca-creador, beca-aplicacion, referido…) trajo a quién.

import { randomBytes } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

// Sin caracteres ambiguos (0/O, 1/I/L): el código se dicta por voz o DM
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** STOIC-XXXX-XXXX — legible, dictable, 31^8 ≈ 850 mil millones */
export function generateCode(): string {
  const bytes = randomBytes(8)
  let body = ''
  for (let i = 0; i < 8; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length]
    if (i === 3) body += '-'
  }
  return `STOIC-${body}`
}

export interface AccessCode {
  code: string
  campaign: string
  note: string | null
  expires_at: string | null
  redeemed_email: string | null
  redeemed_at: string | null
  created_at: string
}

/** Crea n códigos de una campaña. Devuelve los códigos creados. */
export async function createCodes(
  admin: AnySupabaseClient,
  n: number,
  campaign: string,
  note?: string
): Promise<string[]> {
  const rows = Array.from({ length: n }, () => ({
    code: generateCode(),
    campaign,
    note: note || null,
  }))
  const { error } = await admin.from('access_codes').insert(rows)
  if (error) throw new Error(`No se pudieron crear los códigos: ${error.message}`)
  return rows.map(r => r.code)
}

/**
 * Redime un código si está disponible. Atómico: el UPDATE exige
 * redeemed_at IS NULL, así dos redenciones simultáneas no pueden
 * ganar las dos. Devuelve la campaña si redimió, null si no.
 */
export async function redeemCode(
  admin: AnySupabaseClient,
  rawCode: string,
  user: { id: string; email?: string }
): Promise<string | null> {
  const code = rawCode.trim().toUpperCase()
  if (!/^STOIC-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code)) return null

  try {
    const { data, error } = await admin
      .from('access_codes')
      .update({
        redeemed_by: user.id,
        redeemed_email: user.email?.toLowerCase() || null,
        redeemed_at: new Date().toISOString(),
      })
      .eq('code', code)
      .is('redeemed_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .select('campaign')

    if (error) {
      console.error('Error redimiendo código:', error.message)
      return null
    }
    return data?.[0]?.campaign ?? null
  } catch (err) {
    // Tabla ausente (v13 sin ejecutar): el código compartido sigue vivo
    console.error('access_codes no disponible:', err)
    return null
  }
}
