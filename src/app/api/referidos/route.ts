import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { createCodes, type AccessCode } from '@/lib/access-codes'

// Códigos de invitación del usuario. Cada aprobado tiene REFERRALS_PER_USER
// para regalar: el producto es de disciplina compartida y "hazlo conmigo"
// convierte mejor que cualquier anuncio.
//
// GET → los códigos del usuario; los crea la primera vez que entra aquí.

const REFERRALS_PER_USER = 2

export async function GET() {
  const session = await createServerSupabase()
  const { data: { user } } = await session.auth.getUser()
  if (!user || user.app_metadata?.stoicom_approved !== true) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  // La nota liga el código a su dueño: así se sabe quién invitó a quién
  const note = `referido:${user.id}`

  const { data: existing, error } = await admin
    .from('access_codes')
    .select('code, campaign, note, expires_at, redeemed_email, redeemed_at, created_at')
    .eq('note', note)
    .order('created_at')

  if (error) {
    return NextResponse.json(
      { error: 'Ejecuta supabase_v13_access_codes.sql', detail: error.message },
      { status: 503 }
    )
  }

  let codes = (existing || []) as AccessCode[]

  // Primera visita: se le entregan sus invitaciones
  if (codes.length === 0) {
    try {
      await createCodes(admin, REFERRALS_PER_USER, 'referido', note)
      const { data: created } = await admin
        .from('access_codes')
        .select('code, campaign, note, expires_at, redeemed_email, redeemed_at, created_at')
        .eq('note', note)
        .order('created_at')
      codes = (created || []) as AccessCode[]
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'No se pudieron crear' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    codes: codes.map(c => ({
      code: c.code,
      usado: !!c.redeemed_at,
      usadoPor: c.redeemed_email,
    })),
  })
}
