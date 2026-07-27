import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { createCodes } from '@/lib/access-codes'
import { sendEmail, becaEmail } from '@/lib/email'

// Aplicaciones a las becas. Solo administrador.
// GET  → lista de aplicaciones
// POST → decide una ({ id, decision: 'approved' | 'rejected' }). Aprobar
//        genera un código único de campaña "beca" y lo envía por correo.

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
    .from('beca_applications')
    .select('id, name, email, activity, reason, status, code, created_at, decided_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Ejecuta supabase_v13_access_codes.sql', detail: error.message },
      { status: 503 }
    )
  }

  const rows = data || []
  return NextResponse.json({
    total: rows.length,
    pendientes: rows.filter(r => r.status === 'pending').length,
    aprobadas: rows.filter(r => r.status === 'approved').length,
    applications: rows,
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Solo el administrador' }, { status: 403 })
  }

  let body: { id?: string; decision?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const id = String(body.id || '')
  const decision = body.decision === 'approved' ? 'approved' : 'rejected'
  if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })

  const { data: rows } = await admin
    .from('beca_applications')
    .select('id, name, email, status, code')
    .eq('id', id)
    .limit(1)
  const app = rows?.[0]
  if (!app) return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 })
  if (app.status === 'approved') {
    return NextResponse.json({ ok: true, code: app.code, message: 'Ya estaba aprobada' })
  }

  if (decision === 'rejected') {
    await admin
      .from('beca_applications')
      .update({ status: 'rejected', decided_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({ ok: true })
  }

  // Aprobar: un código único de campaña "beca" y correo con el código
  let code: string
  try {
    ;[code] = await createCodes(admin, 1, 'beca', `beca: ${app.email}`)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'No se pudo crear el código' },
      { status: 500 }
    )
  }

  await admin
    .from('beca_applications')
    .update({ status: 'approved', code, decided_at: new Date().toISOString() })
    .eq('id', id)

  const appUrl = process.env.APP_URL || 'https://stoicom.app'
  const sent = await sendEmail(
    app.email,
    becaEmail({ name: app.name.split(' ')[0], code, appUrl })
  )

  return NextResponse.json({ ok: true, code, emailSent: sent })
}
