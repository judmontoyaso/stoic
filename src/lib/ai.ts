export interface AIDailyReflection {
  reflection: string
  actionableTip: string
}

export interface AIDailyReading {
  reading: string
}

/**
 * Llama a una API compatible con OpenAI para generar contenido JSON.
 */
async function callOpenAICompatible<T>(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  prompt: string
): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Error en API compatible con OpenAI (${model}):`, errorText)
      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return null

    return JSON.parse(content) as T
  } catch (error) {
    console.error(`Fallo llamando al modelo ${model}:`, error)
    return null
  }
}

const REFLECTION_SYSTEM_PROMPT = 'Eres un tutor estoico y mentor de comunicación estratégica moderna. Debes responder estrictamente con un objeto JSON que contenga las claves "reflection" (texto en español, de 1 o 2 párrafos profundos conectando la cita estoica con el día del entrenamiento, sin emojis) y "actionableTip" (un consejo práctico directo en español para el día, sin emojis).'

const READING_SYSTEM_PROMPT = `Eres un mentor de clase mundial que combina el estoicismo práctico de Ryan Holiday, la energía estratégica de Tony Robbins y la calidez de Lewis Howes. Escribes la lección diaria de un programa de 90 días.

Responde estrictamente con un objeto JSON con una sola clave "reading": un texto en español de 400 a 550 palabras, dividido en 4-6 párrafos separados por saltos de línea dobles (\\n\\n), con esta estructura invisible (sin subtítulos ni numeración):
1. Un gancho inicial concreto: una escena, tensión o verdad incómoda relacionada con el ejercicio del día (nunca empieces con "Hoy...").
2. El principio de fondo: por qué esta técnica funciona, conectando al autor/referente del día con la vida real del practicante.
3. Cómo ejecutar el ejercicio de hoy, aterrizado y táctico, anticipando la objeción o excusa más probable.
4. La conexión con la cita estoica del día y con el reto de la semana.
5. Un cierre breve y potente que deje al lector con ganas de actuar hoy, no mañana.

Reglas: tutea al lector, sin emojis, sin listas con viñetas, sin repetir literalmente las instrucciones del ejercicio (amplifícalas), sin promesas vacías de autoayuda, tono sobrio pero enérgico. No cites pasajes de libros: expresa las ideas con tus propias palabras.`

/**
 * Genera una reflexión estoica y de comunicación personalizada.
 * Prioriza DeepSeek (deepseek-chat) y usa OpenAI (gpt-4o-mini) como fallback.
 * Si ambos fallan o no están configurados, retorna null para usar la plantilla estática.
 */
export async function generateDailyReflection(opts: {
  dayNumber: number
  phase: number
  phaseLabel: string
  quote: { text: string; author: string }
  habits: { name: string; description: string }[]
  challenge: { title: string; description: string } | null
}): Promise<AIDailyReflection | null> {
  const prompt = `
Datos del día:
- Día del programa: ${opts.dayNumber}
- Fase: ${opts.phase} (${opts.phaseLabel})
- Cita estoica del día: "${opts.quote.text}" — ${opts.quote.author}
- Hábitos del día a entrenar: ${opts.habits.map(h => `${h.name} (${h.description})`).join('; ')}
- Reto semanal de exposición social: ${opts.challenge ? `${opts.challenge.title} (${opts.challenge.description})` : 'Ninguno'}

Instrucciones:
Escribe una reflexión estoica inspiradora sobre la comunicación de hoy y un consejo práctico accionable. No uses emojis.
`

  // 1. Intentar con DeepSeek primero
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (deepseekKey) {
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    const result = await callOpenAICompatible<AIDailyReflection>(deepseekKey, 'https://api.deepseek.com', model, REFLECTION_SYSTEM_PROMPT, prompt)
    if (result) return result
  }

  // 2. Fallback a OpenAI (gpt-4o-mini)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const result = await callOpenAICompatible<AIDailyReflection>(openaiKey, 'https://api.openai.com/v1', 'gpt-4o-mini', REFLECTION_SYSTEM_PROMPT, prompt)
    if (result) return result
  }

  return null
}

/**
 * Genera la lectura completa del día (lección de 400-550 palabras).
 * Prioriza DeepSeek y usa OpenAI como fallback. Devuelve null si ambos fallan.
 */
export async function generateDailyReading(opts: {
  trackName: string
  dayNumber: number
  phase: number
  weekNumber: number
  weekTheme: string | null
  module: string
  title: string
  instructions: string
  rationale: string | null
  sourceAuthor: string | null
  quote: { text: string; author: string }
  weeklyChallenge: { title: string; description: string } | null
}): Promise<{ reading: string; model: string } | null> {
  const prompt = `
Datos del día para escribir la lección:
- Track del programa: ${opts.trackName}
- Día: ${opts.dayNumber} de 90 (fase ${opts.phase}, semana ${opts.weekNumber}${opts.weekTheme ? `: ${opts.weekTheme}` : ''})
- Módulo estoico: ${opts.module}
- Ejercicio de hoy: ${opts.title}
- Instrucciones del ejercicio: ${opts.instructions}
- Por qué funciona: ${opts.rationale || 'No especificado'}
- Referente de la técnica: ${opts.sourceAuthor || 'Tradición estoica'}
- Cita estoica del día: "${opts.quote.text}" — ${opts.quote.author}
- Reto de la semana: ${opts.weeklyChallenge ? `${opts.weeklyChallenge.title} (${opts.weeklyChallenge.description})` : 'Ninguno'}

Escribe la lección diaria completa siguiendo la estructura y reglas del sistema.
`

  // Para lecturas largas priorizamos velocidad: deepseek-chat responde en ~20-30s,
  // mientras los modelos razonadores pueden tardar minutos.
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (deepseekKey) {
    const model = process.env.DEEPSEEK_READING_MODEL || 'deepseek-chat'
    const result = await callOpenAICompatible<AIDailyReading>(deepseekKey, 'https://api.deepseek.com', model, READING_SYSTEM_PROMPT, prompt)
    if (result?.reading) return { reading: result.reading, model }
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const result = await callOpenAICompatible<AIDailyReading>(openaiKey, 'https://api.openai.com/v1', 'gpt-4o-mini', READING_SYSTEM_PROMPT, prompt)
    if (result?.reading) return { reading: result.reading, model: 'gpt-4o-mini' }
  }

  return null
}
