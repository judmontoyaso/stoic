import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'

// Aprueba al usuario logueado si presenta el código de acceso correcto.
// La aprobación se guarda en app_metadata.stoicom_approved: solo el
// servidor (service role) puede escribirla, el usuario no puede
// auto-aprobarse. Un mismo proyecto Supabase puede servir varias apps:
// esta marca es exclusiva de StoiCom.

export async function POST(request: Request) {
  const accessCode = process.env.ACCESS_CODE
  if (!accessCode) {
    return NextResponse.json({ error: 'ACCESS_CODE no configurado en el servidor' }, { status: 500 })
  }

  let code = ''
  try {
    const body = await request.json()
    code = String(body.code || '')
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  // Usuario autenticado (sesión Supabase en cookies)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })
  }

  if (code !== accessCode) {
    // Freno básico contra fuerza bruta
    await new Promise(r => setTimeout(r, 1500))
    return NextResponse.json({ error: 'Código incorrecto' }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, stoicom_approved: true },
  })

  if (error) {
    console.error('Error aprobando usuario:', error)
    return NextResponse.json({ error: 'No se pudo aprobar el usuario' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
