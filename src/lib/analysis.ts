// Server-only. Arma el análisis mensual del diario: reúne el material,
// llama al modelo y lo cachea.
//
// Vive aparte de la ruta HTTP para poder ejecutarlo también desde un
// script (src/scripts) sin levantar el servidor ni pasar por el login.

import { generateMonthlyAnalysis } from '@/lib/ai'
import { JOURNAL_TEMPLATES } from '@/lib/journal'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { JournalEntryType } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

export type AnalysisOutcome =
  | { status: 'cached'; analysis: string; entriesCount: number }
  | { status: 'generated'; analysis: string; entriesCount: number; model: string }
  | { status: 'too_few'; entriesCount: number }
  | { status: 'schema_missing'; detail: string }
  | { status: 'failed' }

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** '2026-03' → 'marzo de 2026' */
export function etiquetaMes(month: string): string {
  const [anio, mes] = month.split('-')
  return `${MESES[Number(mes) - 1] ?? mes} de ${anio}`
}

/** Primer y último día del mes, en formato DATE. */
function rango(month: string): { desde: string; hasta: string } {
  const [anio, mes] = month.split('-').map(Number)
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
  return { desde: `${month}-01`, hasta: `${month}-${String(ultimo).padStart(2, '0')}` }
}

interface JournalRow {
  date: string
  entry_type: JournalEntryType
  mood: number | null
  content: Record<string, string> | null
}

export async function buildMonthlyAnalysis(
  admin: AnySupabaseClient,
  opts: { userId: string; month: string; refresh?: boolean; minEntries: number }
): Promise<AnalysisOutcome> {
  const { desde, hasta } = rango(opts.month)

  const [journalRes, dayLogsRes] = await Promise.all([
    admin
      .from('journal_entries')
      .select('date, entry_type, mood, content')
      .eq('user_id', opts.userId)
      .gte('date', desde)
      .lte('date', hasta)
      .order('date'),
    admin
      .from('day_logs')
      .select('date, completed')
      .eq('user_id', opts.userId)
      .gte('date', desde)
      .lte('date', hasta),
  ])

  if (journalRes.error) {
    return { status: 'schema_missing', detail: journalRes.error.message }
  }

  const journal = (journalRes.data || []) as JournalRow[]
  if (journal.length < opts.minEntries) {
    return { status: 'too_few', entriesCount: journal.length }
  }

  // Caché: solo se reaprovecha si NO han aparecido entradas nuevas. Así
  // quien siga escribiendo el 28 obtiene un informe que sí lo incluye.
  if (!opts.refresh) {
    const { data: previo } = await admin
      .from('monthly_analyses')
      .select('analysis, entries_count')
      .eq('user_id', opts.userId)
      .eq('month', opts.month)
      .limit(1)
    const cacheado = previo?.[0]
    if (cacheado && cacheado.entries_count >= journal.length) {
      return { status: 'cached', analysis: cacheado.analysis, entriesCount: journal.length }
    }
  }

  const logs = (dayLogsRes.data || []) as Array<{ date: string; completed: boolean }>
  const diasCompletados = logs.filter(l => l.completed).length
  const animos = journal.map(e => e.mood).filter((m): m is number => typeof m === 'number')
  const animoMedio = animos.length > 0 ? animos.reduce((a, b) => a + b, 0) / animos.length : null

  // Se manda solo lo que el usuario escribió, con la etiqueta de cada
  // campo para que el modelo sepa a qué pregunta responde cada texto.
  const entries = journal.map(e => {
    const plantilla = JOURNAL_TEMPLATES[e.entry_type]
    const campos = (plantilla?.fields || []).flatMap(f => {
      const texto = e.content?.[f.key]
      return texto && texto.trim() ? [{ label: f.label, texto }] : []
    })
    return { date: e.date, tipo: plantilla?.label || e.entry_type, campos }
  }).filter(e => e.campos.length > 0)

  if (entries.length < opts.minEntries) {
    return { status: 'too_few', entriesCount: entries.length }
  }

  const generado = await generateMonthlyAnalysis({
    monthLabel: etiquetaMes(opts.month),
    entries,
    diasCompletados,
    diasPerdidos: Math.max(0, logs.length - diasCompletados),
    animoMedio,
  })
  if (!generado) return { status: 'failed' }

  const { error: saveErr } = await admin.from('monthly_analyses').upsert(
    {
      user_id: opts.userId,
      month: opts.month,
      analysis: generado.analysis,
      entries_count: journal.length,
      model: generado.model,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,month' }
  )
  if (saveErr) {
    // Se devuelve igual: el usuario ya esperó la generación. Solo se
    // pierde la caché, y la próxima vez se vuelve a pagar.
    console.error('No se pudo cachear el análisis:', saveErr.message)
  }

  return {
    status: 'generated',
    analysis: generado.analysis,
    entriesCount: journal.length,
    model: generado.model,
  }
}
