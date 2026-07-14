import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'

// Aprueba al usuario logueado si presenta el código de acceso correcto.
// La aprobación se guarda en app_metadata.stoicom_approved: solo el
// servidor (service role) puede escribirla, el usuario no puede
// auto-aprobarse. Un mismo proyecto Supabase puede servir varias apps:
// esta marca es exclusiva de StoiCom.
//
// Rate limit: MAX_ATTEMPTS intentos fallidos bloquean LOCK_MINUTES.
// El conteo vive en stoic.verify_attempts (persistente entre instancias
// serverless). Si la tabla no existe aún, degrada al freno de 1.5s.

const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

export async function POST(request: Request) {
  const accessCode = process.env.ACCESS_CODE
  if (!accessCode) {
    return NextResponse.json({ error: 'ACCESS_CODE no configurado en el servidor' }, { status: 500 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
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

  const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  const now = new Date()
  const { data: attemptRows } = await admin
    .from('verify_attempts')
    .select('attempts, locked_until')
    .eq('user_id', user.id)
    .limit(1)
  const attempt = attemptRows?.[0]

  if (attempt?.locked_until && new Date(attempt.locked_until) > now) {
    const mins = Math.ceil((new Date(attempt.locked_until).getTime() - now.getTime()) / 60000)
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${mins} minuto${mins === 1 ? '' : 's'}.` },
      { status: 429 }
    )
  }

  if (code !== accessCode) {
    // Un bloqueo ya vencido reinicia el conteo
    const prior = attempt?.locked_until ? 0 : attempt?.attempts || 0
    const attempts = prior + 1
    const locked = attempts >= MAX_ATTEMPTS
    await admin.from('verify_attempts').upsert({
      user_id: user.id,
      attempts: locked ? 0 : attempts,
      locked_until: locked ? new Date(now.getTime() + LOCK_MINUTES * 60000).toISOString() : null,
      updated_at: now.toISOString(),
    })
    // Freno básico contra fuerza bruta
    await new Promise(r => setTimeout(r, 1500))
    return NextResponse.json(
      {
        error: locked
          ? `Demasiados intentos. Espera ${LOCK_MINUTES} minutos.`
          : 'Código incorrecto',
      },
      { status: locked ? 429 : 401 }
    )
  }

  await admin.from('verify_attempts').delete().eq('user_id', user.id)

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, stoicom_approved: true },
  })

  if (error) {
    console.error('Error aprobando usuario:', error)
    return NextResponse.json({ error: 'No se pudo aprobar el usuario' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
