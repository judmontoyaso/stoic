import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { createCodes, type AccessCode } from '@/lib/access-codes'

// Gestión de códigos de acceso únicos. Solo administrador.
// GET  → lista de códigos con su estado
// POST → crea n códigos de una campaña ({ n, campaign, note })

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

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Solo el administrador' }, { status: 403 })
  }

  const { data, error } = await admin
    .from('access_codes')
    .select('code, campaign, note, expires_at, redeemed_email, redeemed_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Ejecuta supabase_v13_access_codes.sql', detail: error.message },
      { status: 503 }
    )
  }

  const codes = (data || []) as AccessCode[]
  const byCampaign: Record<string, { total: number; usados: number }> = {}
  for (const c of codes) {
    const b = (byCampaign[c.campaign] ||= { total: 0, usados: 0 })
    b.total++
    if (c.redeemed_at) b.usados++
  }

  return NextResponse.json({
    total: codes.length,
    usados: codes.filter(c => c.redeemed_at).length,
    byCampaign,
    codes,
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Solo el administrador' }, { status: 403 })
  }

  let body: { n?: number; campaign?: string; note?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const n = Math.min(Math.max(Number(body.n) || 0, 1), 100)
  const campaign = String(body.campaign || '').trim().slice(0, 60)
  if (!campaign) {
    return NextResponse.json({ error: 'Falta la campaña' }, { status: 400 })
  }

  try {
    const codes = await createCodes(admin, n, campaign, body.note)
    return NextResponse.json({ ok: true, codes })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error creando códigos' },
      { status: 500 }
    )
  }
}
