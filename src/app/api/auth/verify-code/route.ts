import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { sendEmail, welcomeEmail } from '@/lib/email'
import { markLeadConverted } from '@/lib/leads'
import { redeemCode } from '@/lib/access-codes'

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

  // Dos llaves abren la puerta: el código compartido (legacy, env) y los
  // códigos únicos de un solo uso (stoic.access_codes, con campaña).
  // La campaña queda como stoicom_plan: atribución visible en /admin.
  let plan: string | null = null
  if (code === accessCode) {
    plan = 'code'
  } else {
    const campaign = await redeemCode(admin, code, { id: user.id, email: user.email })
    if (campaign) plan = campaign
  }

  if (!plan) {
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

  // Un fundador que reverifique con código no pierde su plan
  const finalPlan = user.app_metadata?.stoicom_plan === 'founder' ? 'founder' : plan
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, stoicom_approved: true, stoicom_plan: finalPlan },
  })

  if (error) {
    console.error('Error aprobando usuario:', error)
    return NextResponse.json({ error: 'No se pudo aprobar el usuario' }, { status: 500 })
  }

  // Bienvenida (best effort, pero con await: en serverless una promesa
  // suelta muere cuando la función responde)
  if (user.email) {
    const appUrl = process.env.APP_URL || 'https://stoicom.app'
    try {
      await sendEmail(user.email, welcomeEmail({ name: user.email.split('@')[0], appUrl }))
    } catch (err) {
      console.error('Error enviando bienvenida:', err)
    }
    // Si venía de la lista, cierra su ficha de lead (métrica de conversión)
    await markLeadConverted(user.email)
  }

  return NextResponse.json({ ok: true })
}
