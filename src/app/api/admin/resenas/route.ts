import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { generateCode } from '@/lib/access-codes'
import { sendEmail, resenaInviteEmail } from '@/lib/email'

// Campaña de reseñas fundadoras. Solo administrador.
//
// El problema que resuelve: una landing sin reseñas no convierte, y
// fabricarlas es publicidad engañosa (Ley 1480) además de motivo de
// cierre de cuenta en las pasarelas. La salida legítima es regalar el
// acceso a cambio de una opinión honesta — y los mejores candidatos ya
// están en la base: los leads que terminaron los siete días gratis y no
// compraron. Tienen doble opt-in, conocen el producto y no costó nada
// llegar a ellos.
//
// GET  → cuántos candidatos hay y a cuántos ya se invitó
// POST → invita a los primeros n ({ n }), con código único por persona
//
// El dedupe vive en access_codes.note (`resena:<correo>`): reejecutar
// no vuelve a escribirle a nadie ni regala un segundo código.

const CAMPAIGN = 'resena-fundador'
const notaDe = (email: string) => `resena:${email.toLowerCase()}`

async function requireAdmin() {
  const session = await createServerSupabase()
  const { data: { user } } = await session.auth.getUser()
  if (!isAdminEmail(user?.email)) return null
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = ReturnType<typeof createClient<any, any, any>>

/**
 * Leads que terminaron la secuencia de 7 días sin comprar.
 *
 * Confirmados (doble opt-in) y sin baja: escribirles es legítimo, no es
 * correo frío. Los ya invitados se descuentan aquí mismo.
 */
async function candidatos(admin: AnySupabaseClient): Promise<string[]> {
  const { data, error } = await admin
    .from('leads')
    .select('email')
    .eq('drip_day', 7)
    .is('converted_at', null)
    .is('unsubscribed_at', null)
    .not('confirmed_at', 'is', null)
    .order('created_at')
  if (error) throw new Error(error.message)

  const emails = (data || []).map((l: { email: string }) => l.email.toLowerCase())
  if (emails.length === 0) return []

  const { data: yaInvitados } = await admin
    .from('access_codes')
    .select('note')
    .eq('campaign', CAMPAIGN)
  const invitados = new Set(
    (yaInvitados || []).map((c: { note: string | null }) => c.note || '')
  )

  return emails.filter(e => !invitados.has(notaDe(e)))
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Solo el administrador' }, { status: 403 })

  try {
    const pendientes = await candidatos(admin)
    const { data: emitidos } = await admin
      .from('access_codes')
      .select('note, redeemed_at')
      .eq('campaign', CAMPAIGN)

    const lista = emitidos || []
    return NextResponse.json({
      pendientes: pendientes.length,
      correos: pendientes,
      invitados: lista.length,
      activados: lista.filter((c: { redeemed_at: string | null }) => c.redeemed_at).length,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'No se pudo leer la campaña (¿falta supabase_v13_access_codes.sql?)',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Solo el administrador' }, { status: 403 })

  let body: { n?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const n = Math.min(Math.max(Number(body.n) || 0, 1), 50)
  const appUrl = (process.env.APP_URL || 'https://stoicom.app').replace(/\/$/, '')

  let pendientes: string[]
  try {
    pendientes = (await candidatos(admin)).slice(0, n)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error leyendo candidatos' },
      { status: 503 }
    )
  }

  const enviados: string[] = []
  const fallidos: string[] = []

  for (const email of pendientes) {
    const code = generateCode()

    // El código se crea ANTES de enviar: si el correo falla, el código
    // queda emitido y esa persona no vuelve a entrar en la lista. Es
    // preferible perder un código a escribirle dos veces a alguien.
    const { error } = await admin.from('access_codes').insert({
      code,
      campaign: CAMPAIGN,
      note: notaDe(email),
    })
    if (error) {
      fallidos.push(email)
      continue
    }

    try {
      await sendEmail(email, resenaInviteEmail({ name: email.split('@')[0], code, appUrl }))
      enviados.push(email)
    } catch (err) {
      console.error('Error invitando a reseñar a %s:', email, err)
      fallidos.push(email)
    }
  }

  return NextResponse.json({
    ok: true,
    enviados: enviados.length,
    fallidos: fallidos.length,
    correos: enviados,
    ...(fallidos.length > 0 ? { conProblemas: fallidos } : {}),
  })
}
