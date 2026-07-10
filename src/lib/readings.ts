// Server-only. Lectura del día: generación con IA + caché en stoic.daily_readings.
// Usado por /api/daily-reading (app) y /api/cron/daily-email (pre-generación matutina).

import type { SupabaseClient } from '@supabase/supabase-js'

// Cliente con cualquier esquema (la app usa el esquema "stoic")
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

import { getQuoteForDay } from '@/lib/quotes'
import { generateDailyReading } from '@/lib/ai'

const MODULE_LABELS: Record<string, string> = {
  perception: 'Percepción (disciplina del asentimiento)',
  action: 'Acción (disciplina de la acción)',
  will: 'Voluntad (disciplina del deseo)',
  evaluation: 'Evaluación (cierre del ciclo)',
}

export interface DailyReadingResult {
  reading: string
  model: string
  cached: boolean
}

/** Lectura de respaldo cuando no hay IA disponible: compone los campos existentes. */
function staticReading(
  day: { instructions: string; rationale: string | null; source_author: string | null },
  week: { theme: string; challenge_title: string; challenge_description: string } | null,
  quote: { text: string; author: string }
): string {
  const parts = [`"${quote.text}" — ${quote.author}`, day.instructions]
  if (day.rationale) parts.push(`Por qué funciona: ${day.rationale}`)
  if (day.source_author) parts.push(`Esta técnica viene de ${day.source_author}.`)
  if (week) parts.push(`Esta semana (${week.theme}) tu reto es: ${week.challenge_title}. ${week.challenge_description}`)
  return parts.join('\n\n')
}

export async function getOrCreateDailyReading(
  supabase: AnySupabaseClient,
  trackId: string,
  dayNumber: number,
  opts: { refresh?: boolean } = {}
): Promise<DailyReadingResult | null> {
  // 1. Caché
  if (!opts.refresh) {
    try {
      const { data: cached } = await supabase
        .from('daily_readings')
        .select('content, model')
        .eq('track_id', trackId)
        .eq('day_number', dayNumber)
        .maybeSingle()
      if (cached?.content) {
        return { reading: cached.content, model: cached.model, cached: true }
      }
    } catch {
      // Tabla ausente: continuar sin caché
    }
  }

  // 2. Datos del día
  const weekNumber = Math.min(13, Math.ceil(dayNumber / 7))
  const [{ data: tracks }, { data: days }, { data: weeks }] = await Promise.all([
    supabase.from('tracks').select('name').eq('id', trackId).limit(1),
    supabase
      .from('program_days')
      .select('title, instructions, rationale, source_author, module, phase, week')
      .eq('track_id', trackId)
      .eq('day_number', dayNumber)
      .limit(1),
    supabase
      .from('program_weeks')
      .select('theme, challenge_title, challenge_description')
      .eq('track_id', trackId)
      .eq('week_number', weekNumber)
      .limit(1),
  ])

  const track = tracks?.[0]
  const day = days?.[0]
  if (!track || !day) return null
  const week = weeks?.[0] || null
  const quote = getQuoteForDay(dayNumber)

  // 3. Generar con IA; si no hay IA, componer lectura estática
  const generated = await generateDailyReading({
    trackName: track.name,
    dayNumber,
    phase: day.phase,
    weekNumber: day.week,
    weekTheme: week?.theme || null,
    module: MODULE_LABELS[day.module] || day.module,
    title: day.title,
    instructions: day.instructions,
    rationale: day.rationale,
    sourceAuthor: day.source_author,
    quote,
    weeklyChallenge: week
      ? { title: week.challenge_title, description: week.challenge_description }
      : null,
  })

  const content = generated?.reading || staticReading(day, week, quote)
  const model = generated?.model || 'static'

  // 4. Cachear (best effort)
  try {
    await supabase
      .from('daily_readings')
      .upsert(
        { track_id: trackId, day_number: dayNumber, content, model },
        { onConflict: 'track_id,day_number' }
      )
  } catch (err) {
    console.error('No se pudo cachear la lectura:', err)
  }

  return { reading: content, model, cached: false }
}
