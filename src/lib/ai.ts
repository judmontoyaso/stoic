export interface AIDailyReflection {
  reflection: string
  actionableTip: string
}

export interface AIDailyReading {
  reading: string
}

/**
 * Repara el JSON que devuelven los modelos y lo parsea.
 *
 * Aunque se pida response_format json_object, DeepSeek mete saltos de
 * línea literales dentro de las cadenas —justo lo que le pedimos para
 * separar párrafos— y eso es JSON inválido. Sin esto, JSON.parse falla,
 * la llamada devuelve null y el usuario recibe la lectura estática de
 * respaldo en vez de su lección.
 */
function parseModelJson<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T
  } catch {
    // Escapa los caracteres de control que aparezcan DENTRO de una cadena
    let repaired = ''
    let inString = false
    let escaped = false
    for (const ch of content) {
      if (escaped) {
        repaired += ch
        escaped = false
        continue
      }
      if (ch === '\\') {
        repaired += ch
        escaped = true
        continue
      }
      if (ch === '"') {
        inString = !inString
        repaired += ch
        continue
      }
      if (inString && ch === '\n') repaired += '\\n'
      else if (inString && ch === '\r') repaired += '\\r'
      else if (inString && ch === '\t') repaired += '\\t'
      else repaired += ch
    }
    try {
      return JSON.parse(repaired) as T
    } catch {
      // Último recurso: el modelo dejó comillas sin escapar DENTRO del
      // texto (cita un diálogo, por ejemplo). Se extraen los pares
      // "clave": "valor" a mano, cerrando el valor solo en la comilla
      // que va seguida de coma o de llave final.
      const extracted = extractJsonStrings(repaired)
      if (Object.keys(extracted).length > 0) return extracted as T
      console.error('JSON del modelo irreparable:', content.slice(0, 120))
      return null
    }
  }
}

/** Pares "clave": "valor" tolerando comillas sin escapar dentro del valor. */
function extractJsonStrings(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  const keyRe = /"([A-Za-z_][A-Za-z0-9_]*)"\s*:\s*"/g
  let m: RegExpExecArray | null
  while ((m = keyRe.exec(content))) {
    const start = keyRe.lastIndex
    // Avanza hasta la comilla de cierre real: la seguida de , o }
    let end = -1
    for (let i = start; i < content.length; i++) {
      if (content[i] !== '"' || content[i - 1] === '\\') continue
      const rest = content.slice(i + 1).replace(/^\s+/, '')
      if (rest === '' || rest[0] === ',' || rest[0] === '}') {
        end = i
        break
      }
    }
    if (end < 0) continue
    out[m[1]] = content
      .slice(start, end)
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
    keyRe.lastIndex = end + 1
  }
  return out
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

    return parseModelJson<T>(content)
  } catch (error) {
    console.error(`Fallo llamando al modelo ${model}:`, error)
    return null
  }
}

const REFLECTION_SYSTEM_PROMPT = `Eres el entrenador de un programa estoico de comunicación de 90 días. Escribes el consejo del día: breve, concreto, sin adornos.

Responde estrictamente con un objeto JSON con las claves "reflection" (1 o 2 párrafos en español que aterricen la cita estoica en el ejercicio de hoy) y "actionableTip" (una sola instrucción práctica para ejecutar hoy, en una o dos frases).

Reglas: tutea, sin emojis. Ritmo desigual: mezcla frases muy cortas con alguna larga. Escenas concretas antes que categorías abstractas.

Prohibido: "no se trata de X, sino de Y" y sus variantes; tríadas de adjetivos o ejemplos; aperturas de plantilla ("La realidad es que", "Todos hemos estado ahí", "Imagina"); cierres de superación ("y eso lo cambia todo", "recuerda:"); vocabulario inflado (poderoso, profundo, transformador, viaje, abrazar, desbloquear, esencia); titubeos ("quizás", "puede que"); preguntas retóricas encadenadas; frases que resuman lo ya dicho.`

// Las reglas de prosa viven también en .claude/skills/redaccion: si cambias
// una aquí, cámbiala allá. Ojo: las lecciones ya generadas están cacheadas
// en stoic.daily_readings — editar este prompt no reescribe lo viejo.
const READING_SYSTEM_PROMPT = `Escribes la lección diaria de un programa de entrenamiento de comunicación de 90 días con base estoica. Escribes como un entrenador que ya vio fallar a mil personas en lo mismo: sobrio, concreto, sin adornos. No eres un coach motivacional.

Responde estrictamente con un objeto JSON con una sola clave "reading": un texto en español de 400 a 550 palabras, dividido en 4-6 párrafos separados por saltos de línea dobles (\\n\\n), con esta estructura invisible (sin subtítulos ni numeración):
1. Un gancho concreto: una escena específica y reconocible relacionada con el ejercicio del día (nunca empieces con "Hoy...", "Imagina..." ni "En un mundo...").
2. El principio de fondo: por qué esta técnica funciona, conectando al autor/referente del día con la vida real del practicante.
3. Cómo ejecutar el ejercicio de hoy, aterrizado y táctico, respondiendo la excusa más probable sin anunciar que la respondes.
4. La conexión con la cita estoica del día y con el reto de la semana.
5. Un cierre breve que empuje a actuar hoy. Puede terminar plano; no necesita moraleja.

CÓMO SUENA (obligatorio):
- Ritmo desigual. En cada párrafo, al menos una frase de menos de seis palabras y al menos una larga. Si todas las frases miden igual, reescribe el párrafo. Los párrafos también van de largos distintos.
- Concreción antes que categoría. En vez de "las interrupciones dañan tu credibilidad", escribe "te interrumpió a los doce segundos y no volviste a hablar en toda la junta". Usa horas, números, lugares, situaciones con detalle.
- Verbos por delante: "decidir", no "la toma de decisiones".
- Tutea al lector. Sin emojis, sin listas ni viñetas.

PROHIBIDO (delata texto generado):
- La antítesis de muleta: "no se trata de X, sino de Y", "no es X, es Y", "no solo X, sino también Y". Máximo UNA vez en todo el texto, y solo si el contraste es el punto real.
- Tríadas: tres adjetivos, tres ejemplos o tres cláusulas seguidas. Usa dos, o cuatro.
- Frases de plantilla: "La realidad es que", "En el fondo", "Todos hemos estado ahí", "Piensa en la última vez que", "Es importante destacar", "En resumen".
- Cierres de superación: "y eso lo cambia todo", "el cambio empieza hoy", "recuerda:", "la decisión es tuya".
- Vocabulario inflado: poderoso, profundo, transformador, viaje, abrazar, desbloquear, potenciar, elevar, esencia, pilar, resonar, empoderar.
- Titubeos: "quizás", "puede que", "en cierto modo".
- Cadenas de preguntas retóricas.
- Que el último párrafo resuma los anteriores: avanza o calla.
- Promesas de resultado y consuelo de autoayuda.

No repitas literalmente las instrucciones del ejercicio: amplifícalas. No cites pasajes de libros: expresa las ideas con tus propias palabras.`

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
 * Fichas de técnica para los referentes del programa. Sin esto el modelo
 * escribe una versión difusa de "lo que dice Robbins"; con la mecánica
 * delante, la lección explica cómo funciona de verdad.
 *
 * Origen y mapa completo: docs/FRAMEWORKS_ROBBINS.md
 */
const TECHNIQUE_NOTES: { match: RegExp; note: string }[] = [
  {
    match: /tríada|triada/i,
    note: 'La Tríada (Robbins): toda emoción se sostiene sobre fisiología, foco y lenguaje a la vez. Mover una la desplaza; mover las tres la cambia de golpe.',
  },
  {
    match: /vocabulario transformacional/i,
    note: 'Vocabulario transformacional (Robbins): la etiqueta verbal habitual de una emoción regula su intensidad real. Bajar la palabra baja la carga; subirla la amplifica.',
  },
  {
    match: /incantación|incantacion/i,
    note: 'Incantación vs. afirmación (Robbins): la afirmación en frío la rechaza el cerebro por falsa. La incantación involucra cuerpo, voz e intensidad a la vez: el estado no se declara, se ejecuta.',
  },
  {
    match: /interrupción de patrón|interrupcion de patron|protocolo de 5 pasos|sustitución uno a uno|sustitucion uno a uno/i,
    note: 'Condicionamiento Neuro-Asociativo (Robbins), 6 pasos: decidir qué quieres y qué lo impide; conseguir apalancamiento asociando dolor inmediato a seguir igual; interrumpir el patrón físicamente; crear una alternativa que cubra la MISMA necesidad; condicionarla por repetición; probarla a futuro. Un patrón no se elimina, se reemplaza.',
  },
  {
    match: /ganancia secundaria/i,
    note: 'Ganancia secundaria (Robbins): el patrón destructivo persiste porque cubre una necesidad real. Quitar la conducta sin cubrir la necesidad la devuelve, o la sustituye por otra peor.',
  },
  {
    match: /dolor y placer|palanca/i,
    note: 'Dolor y placer (Robbins): la conducta persiste por lo que el cerebro asoció a evitar dolor o ganar placer AHORA. Se cambia reasignando esas asociaciones de forma visceral e inmediata, no discutiéndolas.',
  },
  {
    match: /preguntas de poder|pregunta de francotirador|preguntas? matutina/i,
    note: 'Preguntas de calidad (Robbins): pensar es preguntar y responder. La pregunta determina qué sale a buscar el cerebro. "¿Por qué siempre me pasa esto?" ordena buscar pruebas de impotencia.',
  },
  {
    match: /VAK|canal|representacional/i,
    note: 'Sistemas representacionales (Robbins): cada quien procesa en visual, auditivo o kinestésico y lo delata al hablar ("no lo veo claro" / "no me suena" / "no me siento cómodo"). Hablar en su canal multiplica la comprensión sin cambiar el contenido.',
  },
  {
    match: /priming|fisiología|fisiologia|respiración táctica|respiracion tactica|lenguaje corporal|ritmo/i,
    note: 'Fisiología como vía rápida al estado (Robbins): postura, respiración y ritmo no solo expresan el estado, lo fabrican. Por eso se interviene antes del evento, no durante.',
  },
  {
    match: /ancla/i,
    note: 'Anclaje (Robbins): un estímulo sensorial único y repetible, instalado en el PICO de un estado intenso, devuelve ese estado en segundos al dispararlo. Si se instala después del pico, no prende.',
  },
  {
    match: /marco|reencuadre|redefinición|redefinicion/i,
    note: 'Redefinición del marco (Robbins): de contexto (la misma conducta vale distinto en otro escenario) o de contenido (el hecho es idéntico, cambia lo que significa). Es la disciplina del asentimiento estoica vuelta herramienta de conversación.',
  },
  {
    match: /metaprograma/i,
    note: 'Metaprogramas (Robbins): filtros con los que alguien decide a qué atiende — hacia/desde, interno/externo, semejanza/diferencia, general/detalle. Detectarlos cambia cómo le presentas lo mismo.',
  },
  {
    match: /rapport|espejeo|compenetración|compenetracion/i,
    note: 'Rapport (Robbins): la sintonía se construye igualando lo no verbal —ritmo, volumen, postura— antes que el argumento. Primero acompasas, después conduces; si el otro no te sigue, aún tocaba acompasar.',
  },
  {
    match: /regla|valor(es)?\b/i,
    note: 'Reglas y valores (Robbins): la frustración rara vez viene del valor sino de la REGLA que le pusiste — qué debe pasar para darlo por cumplido. Reglas imposibles garantizan malestar con cualquier resultado.',
  },
]

/** Fichas relevantes para un día concreto (máximo 3, para no inflar el prompt). */
function techniqueNotesFor(...fields: (string | null)[]): string[] {
  const haystack = fields.filter(Boolean).join(' ')
  const notes: string[] = []
  for (const { match, note } of TECHNIQUE_NOTES) {
    if (match.test(haystack) && !notes.includes(note)) notes.push(note)
    if (notes.length === 3) break
  }
  return notes
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
  const notes = techniqueNotesFor(opts.sourceAuthor, opts.title, opts.instructions, opts.rationale)

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
${notes.length ? `
Mecánica exacta de la técnica de hoy (úsala; no la contradigas ni la diluyas):
${notes.map(n => `- ${n}`).join('\n')}
` : ''}
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
