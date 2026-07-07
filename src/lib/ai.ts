export interface AIDailyReflection {
  reflection: string
  actionableTip: string
}

/**
 * Llama a una API compatible con OpenAI para generar contenido JSON.
 */
async function callOpenAICompatible(
  apiKey: string,
  baseUrl: string,
  model: string,
  prompt: string
): Promise<AIDailyReflection | null> {
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
            content: 'Eres un tutor estoico y mentor de comunicación estratégica moderna. Debes responder estrictamente con un objeto JSON que contenga las claves "reflection" (texto en español, de 1 o 2 párrafos profundos conectando la cita estoica con el día del entrenamiento, sin emojis) y "actionableTip" (un consejo práctico directo en español para el día, sin emojis).'
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

    return JSON.parse(content) as AIDailyReflection
  } catch (error) {
    console.error(`Fallo llamando al modelo ${model}:`, error)
    return null
  }
}

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
    const result = await callOpenAICompatible(deepseekKey, 'https://api.deepseek.com', model, prompt)
    if (result) return result
  }

  // 2. Fallback a OpenAI (gpt-4o-mini)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const result = await callOpenAICompatible(openaiKey, 'https://api.openai.com/v1', 'gpt-4o-mini', prompt)
    if (result) return result
  }

  return null
}
