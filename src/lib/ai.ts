export interface AIDailyReflection {
  reflection: string
  actionableTip: string
}

/**
 * Genera una reflexión estoica y de comunicación personalizada usando Gemini 2.5 Flash.
 * Retorna null si no hay API Key configurada o si ocurre algún error, permitiendo fallback silencioso.
 */
export async function generateDailyReflection(opts: {
  dayNumber: number
  phase: number
  phaseLabel: string
  quote: { text: string; author: string }
  habits: { name: string; description: string }[]
  challenge: { title: string; description: string } | null
}): Promise<AIDailyReflection | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return null
  }

  const prompt = `
Eres un tutor estoico y mentor de comunicación estratégica moderna (inspirado en Marco Aurelio, Séneca, Chris Voss y Julian Treasure). Redacta una reflexión matutina diaria para el usuario.
Datos del día:
- Día del programa: ${opts.dayNumber}
- Fase: ${opts.phase} (${opts.phaseLabel})
- Cita estoica del día: "${opts.quote.text}" — ${opts.quote.author}
- Hábitos del día a entrenar: ${opts.habits.map(h => `${h.name} (${h.description})`).join('; ')}
- Reto semanal de exposición social: ${opts.challenge ? `${opts.challenge.title} (${opts.challenge.description})` : 'Ninguno'}

Instrucciones:
1. Escribe la "reflection" en español, de 1 o 2 párrafos. Debe ser profunda, inspiradora, directa y al estilo de Séneca y Chris Voss, conectando la cita estoica con la importancia de la comunicación racional de hoy.
2. Escribe un "actionableTip" (consejo práctico) sobre cómo afrontar las conversaciones de hoy y aplicar el reto y los hábitos de forma natural.
3. No uses emojis. Mantén un tono sumamente profesional, sobrio y estoico.
`

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              reflection: { type: 'STRING' },
              actionableTip: { type: 'STRING' }
            },
            required: ['reflection', 'actionableTip']
          }
        }
      })
    })

    if (!res.ok) {
      console.error('Error llamando a la API de Gemini:', res.statusText)
      return null
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    return JSON.parse(text) as AIDailyReflection
  } catch (error) {
    console.error('Error al generar la reflexión con IA:', error)
    return null
  }
}
