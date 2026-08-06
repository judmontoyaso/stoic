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

// Un "periodo" es un mes ('2026-07') o una semana ISO ('2026-W31').
//
// Los dos viven en la MISMA tabla y en la misma columna de texto. Es
// reutilización deliberada: la clave primaria (user_id, month) ya impide
// duplicados sea cual sea el formato, y así la lectura semanal no obligó
// a otra migración.
export const ES_SEMANA = /^\d{4}-W\d{2}$/
export const ES_MES = /^\d{4}-(0[1-9]|1[0-2])$/

export function periodoValido(periodo: string): boolean {
  return ES_MES.test(periodo) || ES_SEMANA.test(periodo)
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Lunes de la semana ISO de una fecha. */
function lunesDe(fecha: Date): Date {
  const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()))
  // getUTCDay: 0 = domingo. Se lleva a lunes = 0.
  const desplazamiento = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - desplazamiento)
  return d
}

/** '2026-W31' de una fecha cualquiera. */
export function claveSemana(fecha: Date): string {
  const lunes = lunesDe(fecha)
  // Semana ISO: la del jueves manda sobre a qué año pertenece
  const jueves = new Date(lunes)
  jueves.setUTCDate(jueves.getUTCDate() + 3)
  const primeroDeAnio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1))
  const semana = Math.ceil(((jueves.getTime() - primeroDeAnio.getTime()) / 86400000 + 1) / 7)
  return `${jueves.getUTCFullYear()}-W${String(semana).padStart(2, '0')}`
}

/** '2026-07' de una fecha. */
export function claveMes(fecha: Date): string {
  return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`
}

/** 'marzo de 2026' o 'la semana del 3 al 9 de marzo' */
export function etiquetaPeriodo(periodo: string): string {
  if (ES_SEMANA.test(periodo)) {
    const { desde, hasta } = rango(periodo)
    const d = new Date(`${desde}T00:00:00Z`)
    const h = new Date(`${hasta}T00:00:00Z`)
    const mesD = MESES[d.getUTCMonth()]
    const mesH = MESES[h.getUTCMonth()]
    return mesD === mesH
      ? `la semana del ${d.getUTCDate()} al ${h.getUTCDate()} de ${mesH}`
      : `la semana del ${d.getUTCDate()} de ${mesD} al ${h.getUTCDate()} de ${mesH}`
  }
  const [anio, mes] = periodo.split('-')
  return `${MESES[Number(mes) - 1] ?? mes} de ${anio}`
}

/** Compatibilidad: se sigue usando en el correo mensual. */
export const etiquetaMes = etiquetaPeriodo

/** Primer día del periodo (DATE). Sirve de marca única para el dedupe. */
export function inicioPeriodo(periodo: string): string {
  return rango(periodo).desde
}

/** Primer y último día del periodo, en formato DATE. */
function rango(periodo: string): { desde: string; hasta: string } {
  if (ES_SEMANA.test(periodo)) {
    const [anioStr, semanaStr] = periodo.split('-W')
    // 4 de enero cae siempre en la semana ISO 1
    const base = lunesDe(new Date(Date.UTC(Number(anioStr), 0, 4)))
    base.setUTCDate(base.getUTCDate() + (Number(semanaStr) - 1) * 7)
    const fin = new Date(base)
    fin.setUTCDate(fin.getUTCDate() + 6)
    return { desde: iso(base), hasta: iso(fin) }
  }
  const [anio, mes] = periodo.split('-').map(Number)
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
  return { desde: `${periodo}-01`, hasta: `${periodo}-${String(ultimo).padStart(2, '0')}` }
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
    monthLabel: etiquetaPeriodo(opts.month),
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
