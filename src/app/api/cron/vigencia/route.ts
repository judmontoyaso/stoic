import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, lifecycleEmail, type LifecycleKind } from '@/lib/email'
import { getLifecycleUsers } from '@/lib/recipients'
import { readAccess } from '@/lib/access'
import { deadlineFrom, outOfTime } from '@/lib/cron-budget'

// Ciclo de vida de la vigencia (idempotente, pensado para disparo diario):
//
//   -7 días  → aviso_7d      "te quedan siete días"
//    día 0   → vencido       empieza el mes de gracia
//   +15 días → gracia_15     mitad de la gracia
//   +27 días → ultimo_aviso  tres días para el borrado
//   +30 días → purgado       se borra el contenido personal
//
// El dedupe vive en stoic.lifecycle_emails, con el vencimiento dentro de
// la clave: al renovar, la serie del año siguiente vuelve a estar
// disponible sin borrar el histórico. SIN esa tabla el cron no envía
// nada (fail-safe): reenviar el mismo aviso a diario es peor que no
// avisar. Requiere supabase_v14_vigencia.sql.
//
// GET/POST /api/cron/vigencia?secret=...&dry=1
// ?dry=1 lista lo que haría sin enviar ni borrar. Úsalo la primera vez.

export const maxDuration = 300

/** Margen propio cuando corre suelto (no dentro del lote de /cron/emails). */
const OWN_BUDGET_MS = 280_000
/** Lo que cuesta el usuario más lento (envío + borrado en 8 tablas). */
const RESERVE_MS = 4_000

/** Tablas con contenido personal. Se borran al vencer la gracia. */
const PERSONAL_TABLES = [
  'journal_entries',    // el diario: lo más íntimo
  'daily_reflections',  // examen nocturno
  'monthly_analyses',   // lo que la IA leyó de su diario: deriva de él, se va con él
  'day_logs',
  'week_logs',
  'month_logs',
  'user_tracks',
  'user_prefs',         // arrastra el consentimiento de voz: si vuelve, se le vuelve a preguntar
  'transcription_usage',
  'push_subscriptions',
] as const

// Deliberadamente NO se borran:
//   · auth.users     — la cuenta queda para que pueda volver
//   · stoic.payments — contabilidad; conservarla es una obligación fiscal
//   · stoic.events   — métricas de cohorte, sin contenido que él escribiera
//   · stoic.leads    — su suscripción al correo tiene su propia baja

function isAuthorized(request: Request, secret: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  if (secret === cronSecret) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
}

/** Días de antelación de cada aviso, medidos como quedan hasta el hito. */
const AVISO_PREVIO_DIAS = 7   // antes del vencimiento
const ULTIMO_AVISO_DIAS = 3   // antes del borrado
const MEDIA_GRACIA_DIAS = 15  // antes del borrado

/**
 * Qué aviso toca hoy, o null si ninguno.
 *
 * Devuelve UNO solo, el más urgente. Si el cron estuvo caído una semana,
 * el usuario recibe el aviso que corresponde a hoy y no los cuatro
 * atrasados de golpe.
 */
function dueKind(
  state: string,
  daysToExpiry: number | null,
  daysToPurge: number | null
): LifecycleKind | null {
  if (state === 'expired') return 'purgado'

  if (state === 'grace') {
    if (daysToPurge === null) return null
    if (daysToPurge <= ULTIMO_AVISO_DIAS) return 'ultimo_aviso'
    if (daysToPurge <= MEDIA_GRACIA_DIAS + 1) return 'gracia_15'
    return 'vencido'
  }

  if (state === 'active' && daysToExpiry !== null && daysToExpiry <= AVISO_PREVIO_DIAS) {
    return 'aviso_7d'
  }
  return null
}

export async function POST(request: Request) {
  return GET(request)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  if (!isAuthorized(request, url.searchParams.get('secret'))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const dryRun = url.searchParams.get('dry') === '1'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })
  // Cliente aparte para auth.admin: el schema 'stoic' no aplica ahí
  const authAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  // Fail-safe: sin la tabla de dedupe no se envía nada
  const { error: tableErr } = await admin.from('lifecycle_emails').select('kind').limit(1)
  if (tableErr) {
    console.error('lifecycle_emails no disponible:', tableErr.message)
    return NextResponse.json(
      { error: 'Falta ejecutar supabase_v14_vigencia.sql', detail: tableErr.message },
      { status: 503 }
    )
  }

  const appUrl = (process.env.APP_URL || 'https://stoicom.app').replace(/\/$/, '')
  const deadline = deadlineFrom(request, OWN_BUDGET_MS)
  const users = await getLifecycleUsers(authAdmin)

  const enviados: Record<string, number> = {}
  const purgados: string[] = []
  const planeado: Array<{ email: string; kind: string; vence: string }> = []
  let revisados = 0
  let sinTiempo = false

  for (const user of users) {
    if (outOfTime(deadline, RESERVE_MS)) {
      sinTiempo = true
      break
    }
    revisados++

    const access = readAccess(user.metadata)
    // Vitalicios y accesos sin vencimiento no entran en el ciclo
    if (!access.expiresAt || !access.purgeAt) continue

    const kind = dueKind(access.state, access.daysToExpiry, access.daysToPurge)
    if (!kind) continue

    const cycleEndsAt = access.expiresAt.toISOString()

    // ¿Ya se le mandó este aviso para este vencimiento?
    const { data: yaEnviado } = await admin
      .from('lifecycle_emails')
      .select('kind')
      .eq('user_id', user.id)
      .eq('kind', kind)
      .eq('cycle_ends_at', cycleEndsAt)
      .limit(1)
    if (yaEnviado && yaEnviado.length > 0) continue

    if (dryRun) {
      planeado.push({ email: user.email, kind, vence: cycleEndsAt.slice(0, 10) })
      continue
    }

    // El borrado va ANTES del correo: si el correo falla, el dato ya se
    // fue y el registro queda escrito. Al revés se le avisaría de un
    // borrado que no ocurrió.
    if (kind === 'purgado') {
      const fallos: string[] = []
      for (const table of PERSONAL_TABLES) {
        const { error } = await admin.from(table).delete().eq('user_id', user.id)
        if (error) fallos.push(`${table}: ${error.message}`)
      }
      if (fallos.length > 0) {
        // Sin borrado completo no se marca ni se avisa: se reintenta mañana
        console.error('Borrado incompleto de %s:', user.email, fallos.join(' | '))
        continue
      }
      await authAdmin.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.metadata, stoicom_purged_at: new Date().toISOString() },
      })
      purgados.push(user.email)
    }

    const content = lifecycleEmail(kind, {
      name: user.email.split('@')[0],
      appUrl,
      expiresAt: cycleEndsAt,
      purgeAt: access.purgeAt.toISOString(),
    })

    try {
      await sendEmail(user.email, content)
    } catch (err) {
      console.error('Error enviando aviso %s a %s:', kind, user.email, err)
      // El purgado ya borró: hay que dejar constancia igual para no
      // repetir el borrado ni reintentar el aviso a diario.
      if (kind !== 'purgado') continue
    }

    await admin.from('lifecycle_emails').insert({
      user_id: user.id,
      kind,
      cycle_ends_at: cycleEndsAt,
    })
    enviados[kind] = (enviados[kind] || 0) + 1
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    revisados,
    total: users.length,
    enviados,
    purgados: purgados.length,
    ...(dryRun ? { planeado } : {}),
    ...(sinTiempo ? { aviso: 'Se acabó el presupuesto de tiempo; sigue en la próxima pasada' } : {}),
  })
}
