// Server-only. Lectura del día: generación con IA + caché en stoic.daily_readings.
// Usado por /api/daily-reading (app) y /api/cron/daily-email (pre-generación matutina).

import type { SupabaseClient } from '@supabase/supabase-js'

// Cliente con cualquier esquema (la app usa el esquema "stoic")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** Lectura de respaldo enriquecida cuando no hay IA disponible: compone una lección estructurada y profunda. */
function staticReading(
  day: { title: string; instructions: string; rationale: string | null; source_author: string | null; module: string; phase: number; week: number },
  week: { theme: string; challenge_title: string; challenge_description: string } | null,
  quote: { text: string; author: string }
): string {
  const paragraphs: string[] = []

  // Párrafo 1: El gancho y la escena concreta conectada con la cita estoica
  paragraphs.push(
    `La mayoría de las conversaciones difíciles se pierden en los primeros diez segundos, antes de que los argumentos entren en juego. "${quote.text}" nos recordaba ${quote.author}. Cuando la tensión sube en una reunión o en un diálogo personal, la tendencia natural es reaccionar desde la urgencia de defenderse o de imponer un punto. Esta práctica de hoy —${day.title}— está diseñada para romper esa inercia reactiva e instalar una respuesta deliberada.`
  )

  // Párrafo 2: El principio y fundamento de fondo
  const sourceRef = day.source_author ? `siguiendo la metodología de ${day.source_author}` : 'desde la disciplina estoica aplicada'
  const rationaleText = day.rationale
    ? day.rationale
    : 'La comunicación de alto impacto no depende de la elocuencia improvisada, sino de la maestría sobre el propio estado interno y la precisión no verbal.'
  paragraphs.push(
    `El fundamento técnico de este ejercicio, ${sourceRef}, radica en un principio claro: ${rationaleText} Quien no domina su fisiología y sus pausas en frío termina cediendo el control en caliente. No se trata de fingir seguridad, sino de entrenar al sistema nervioso para operar con serenidad bajo cualquier nivel de fricción social.`
  )

  // Párrafo 3: Protocolo táctico de ejecución paso a paso
  paragraphs.push(
    `Cómo ejecutar el ejercicio de hoy: ${day.instructions} No busques el momento perfecto ni esperes a sentirte completamente cómodo; la incomodidad inicial es exactamente la señal de que el entrenamiento está haciendo su trabajo. Si notas resistencia interna o el impulso de volver a tu patrón habitual, respira profundo en cuatro tiempos y ejecuta la instrucción al pie de la letra.`
  )

  // Párrafo 4: Reto semanal y cierre hacia la acción
  const weekPart = week
    ? `Recuerda que este ejercicio se articula con tu reto de la semana (${week.theme}): ${week.challenge_title}. ${week.challenge_description}`
    : 'Lleva este estándar a cada conversación de tu jornada.'
  paragraphs.push(
    `${weekPart} El progreso no se construye leyendo sobre comunicación, sino ejecutando una acción concreta hoy. Cierra este día habiendo cumplido tu estándar.`
  )

  return paragraphs.join('\n\n')
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
    supabase.from('tracks').select('name, duration_days').eq('id', trackId).limit(1),
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
    durationDays: track.duration_days || 90,
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
