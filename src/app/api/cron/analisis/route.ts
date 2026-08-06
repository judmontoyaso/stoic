import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, monthlyAnalysisEmail } from '@/lib/email'
import { getApprovedUsers } from '@/lib/recipients'
import { buildMonthlyAnalysis, etiquetaPeriodo, claveSemana, periodoValido, inicioPeriodo, ES_SEMANA } from '@/lib/analysis'
import { deadlineFrom, outOfTime } from '@/lib/cron-budget'

// Lectura mensual del diario, por correo.
//
// Se manda en los primeros días de cada mes y habla del mes ANTERIOR, ya
// cerrado. Sin esto el informe existe pero nadie se entera: vive dentro
// de /evaluation y hay que ir a buscarlo.
//
// Solo entra quien escribió lo suficiente: con tres entradas sueltas el
// análisis no dice nada y el correo quema la función para siempre.
//
// El dedupe reutiliza stoic.lifecycle_emails con kind='analisis_mensual'
// y cycle_ends_at = primer día del mes analizado. Es la misma tabla de
// los avisos de vencimiento porque tiene exactamente la forma que hace
// falta (usuario + tipo + periodo, con clave primaria que impide el
// duplicado) y así no hay que ejecutar otra migración.
//
// GET/POST /api/cron/analisis?secret=...&month=YYYY-MM&dry=1

export const maxDuration = 300

const OWN_BUDGET_MS = 280_000
/**
 * Lo que cuesta el usuario más lento. Generar tarda ~46 s con
 * deepseek-v4-pro, así que se reserva con holgura: cortar a mitad de una
 * generación es pagarla y tirarla.
 */
const RESERVE_MS = 70_000

/** Días del mes en que sale la lectura mensual. */
const SEND_WINDOW_DAYS = 5
/** Mínimo de entradas del mes para que el análisis diga algo. */
const MIN_ENTRIES = 6
/** La semana da menos material: se pide menos para no dejarla muda. */
const MIN_ENTRIES_SEMANA = 3

function isAuthorized(request: Request, secret: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  if (secret === cronSecret) return true
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
}

/** 'YYYY-MM' del mes anterior al de hoy. */
function mesAnterior(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
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
  const mesPedido = url.searchParams.get('month')
  const now = new Date()

  // Qué periodo toca hoy. La lectura sale sola, sin que nadie la pida:
  //   · lunes            → la semana que acaba de cerrar
  //   · días 1-5 del mes → el mes anterior, ya cerrado
  // El mes manda si coinciden; la semana vuelve al lunes siguiente.
  // ?month= salta la ventana, para poder probarlo cualquier día.
  let periodo: string
  if (mesPedido) {
    periodo = mesPedido
  } else if (now.getUTCDate() <= SEND_WINDOW_DAYS) {
    periodo = mesAnterior(now)
  } else if (now.getUTCDay() === 1) {
    const haceUnaSemana = new Date(now)
    haceUnaSemana.setUTCDate(haceUnaSemana.getUTCDate() - 7)
    periodo = claveSemana(haceUnaSemana)
  } else {
    return NextResponse.json({ ok: true, omitido: 'hoy no toca lectura' })
  }

  if (!periodoValido(periodo)) {
    return NextResponse.json({ error: 'Periodo inválido (YYYY-MM o YYYY-Www)' }, { status: 400 })
  }
  const esSemana = ES_SEMANA.test(periodo)
  const month = periodo

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })
  const authAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  // Fail-safe: sin la tabla de dedupe no se manda nada. Repetir este
  // correo a diario sería peor que no mandarlo.
  const { error: tableErr } = await admin.from('lifecycle_emails').select('kind').limit(1)
  if (tableErr) {
    return NextResponse.json(
      { error: 'Falta ejecutar supabase_v14_vigencia.sql', detail: tableErr.message },
      { status: 503 }
    )
  }

  const appUrl = (process.env.APP_URL || 'https://stoicom.app').replace(/\/$/, '')
  const deadline = deadlineFrom(request, OWN_BUDGET_MS)
  // Marca del periodo para el dedupe: su primer día real (el lunes en las
  // semanas, el día 1 en los meses). Tiene que ser distinta por periodo o
  // la clave primaria dejaría pasar una sola lectura semanal al año.
  const cycleEndsAt = new Date(`${inicioPeriodo(periodo)}T00:00:00.000Z`).toISOString()

  // getApprovedUsers ya excluye a los vencidos: al que no puede entrar no
  // se le manda un informe que no va a poder abrir.
  const usuarios = await getApprovedUsers(authAdmin)

  const enviados: string[] = []
  const sinMaterial: string[] = []
  const planeado: string[] = []
  let revisados = 0
  let sinTiempo = false

  for (const usuario of usuarios) {
    if (outOfTime(deadline, RESERVE_MS)) {
      sinTiempo = true
      break
    }
    revisados++

    const { data: yaEnviado } = await admin
      .from('lifecycle_emails')
      .select('kind')
      .eq('user_id', usuario.id)
      .eq('kind', esSemana ? 'analisis_semanal' : 'analisis_mensual')
      .eq('cycle_ends_at', cycleEndsAt)
      .limit(1)
    if (yaEnviado && yaEnviado.length > 0) continue

    const resultado = await buildMonthlyAnalysis(admin, {
      userId: usuario.id,
      month,
      minEntries: esSemana ? MIN_ENTRIES_SEMANA : MIN_ENTRIES,
    })

    if (resultado.status === 'too_few') {
      sinMaterial.push(usuario.email)
      continue
    }
    if (resultado.status !== 'generated' && resultado.status !== 'cached') {
      console.error('Análisis mensual falló para %s: %s', usuario.email, resultado.status)
      continue
    }

    if (dryRun) {
      planeado.push(usuario.email)
      continue
    }

    const primerParrafo = resultado.analysis.split(/\n\n+/)[0]?.trim() || ''
    try {
      await sendEmail(
        usuario.email,
        monthlyAnalysisEmail({
          name: usuario.email.split('@')[0],
          appUrl,
          mesLabel: etiquetaPeriodo(month),
          entradas: resultado.entriesCount,
          primerParrafo,
        })
      )
    } catch (err) {
      console.error('Error enviando el análisis a %s:', usuario.email, err)
      continue
    }

    await admin.from('lifecycle_emails').insert({
      user_id: usuario.id,
      kind: esSemana ? 'analisis_semanal' : 'analisis_mensual',
      cycle_ends_at: cycleEndsAt,
    })
    enviados.push(usuario.email)
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    periodo: month,
    revisados,
    total: usuarios.length,
    enviados: enviados.length,
    sinMaterial: sinMaterial.length,
    ...(dryRun ? { planeado } : {}),
    ...(sinTiempo
      ? { aviso: 'Se acabó el presupuesto de tiempo; el resto sigue en la próxima pasada' }
      : {}),
  })
}
