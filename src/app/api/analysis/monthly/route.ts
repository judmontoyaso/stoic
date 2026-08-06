import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { hasProgramAccess } from '@/lib/access'
import { buildMonthlyAnalysis, periodoValido, type AnalysisOutcome } from '@/lib/analysis'

// Análisis mensual del diario.
//
//   GET  /api/analysis/monthly?month=YYYY-MM  → el informe cacheado
//   POST /api/analysis/monthly { month }      → lo genera si falta
//
// Se cachea en stoic.monthly_analyses porque generar cuesta dinero: sin
// caché, cada visita a /evaluation volvería a pagar la llamada. Se
// regenera solo si aparecieron entradas nuevas en ese mes.

export const maxDuration = 120

/** Mínimo de entradas para que el análisis diga algo. Menos es ruido. */
const MIN_ENTRIES = 4


async function contexto() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 }) }
  if (!hasProgramAccess(user.app_metadata)) {
    return { error: NextResponse.json({ error: 'Tu acceso no está vigente' }, { status: 403 }) }
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return { error: NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 }) }
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })
  return { user, admin }
}

export async function GET(request: Request) {
  const ctx = await contexto()
  if (ctx.error) return ctx.error
  const { user, admin } = ctx

  const month = new URL(request.url).searchParams.get('month') || ''
  if (!periodoValido(month)) {
    return NextResponse.json({ error: 'Mes inválido (usa YYYY-MM)' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('monthly_analyses')
    .select('analysis, entries_count, created_at')
    .eq('user_id', user.id)
    .eq('month', month)
    .limit(1)

  if (error) {
    return NextResponse.json(
      { error: 'Falta ejecutar supabase_v15_voz_analisis.sql', detail: error.message },
      { status: 503 }
    )
  }

  return NextResponse.json({ month, analysis: data?.[0] ?? null })
}

export async function POST(request: Request) {
  const ctx = await contexto()
  if (ctx.error) return ctx.error
  const { user, admin } = ctx

  let body: { month?: string; refresh?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const month = String(body.month || '')
  if (!periodoValido(month)) {
    return NextResponse.json({ error: 'Mes inválido (usa YYYY-MM)' }, { status: 400 })
  }

  const resultado: AnalysisOutcome = await buildMonthlyAnalysis(admin, {
    userId: user.id,
    month,
    refresh: body.refresh === true,
    minEntries: MIN_ENTRIES,
  })

  switch (resultado.status) {
    case 'cached':
    case 'generated':
      return NextResponse.json({
        month,
        analysis: resultado.analysis,
        entriesCount: resultado.entriesCount,
        cached: resultado.status === 'cached',
      })
    case 'too_few':
      return NextResponse.json(
        {
          error: `Con ${resultado.entriesCount} entradas no hay material para leer un mes. Escribe al menos ${MIN_ENTRIES}.`,
          entriesCount: resultado.entriesCount,
        },
        { status: 422 }
      )
    case 'schema_missing':
      return NextResponse.json(
        { error: 'Falta ejecutar supabase_v15_voz_analisis.sql', detail: resultado.detail },
        { status: 503 }
      )
    case 'failed':
      return NextResponse.json(
        { error: 'El modelo no devolvió un análisis. Inténtalo de nuevo.' },
        { status: 502 }
      )
  }
}
