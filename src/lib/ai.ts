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

/**
 * Llama a la API nativa de Google Gemini (Gemini 3.8 / 2.5 Flash) con respuesta JSON estructurada.
 */
async function callGemini<T>(
  apiKey: string,
  model: string,
  systemPrompt: string,
  prompt: string
): Promise<T | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Error en Google Gemini API (${model}):`, errorText)
      return null
    }

    const data = await res.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) return null

    return parseModelJson<T>(content)
  } catch (error) {
    console.error(`Fallo llamando a Google Gemini (${model}):`, error)
    return null
  }
}

const REFLECTION_SYSTEM_PROMPT = `Eres el entrenador de un programa estoico de comunicación. Escribes el consejo del día: breve, concreto, sin adornos.

Responde estrictamente con un objeto JSON con las claves "reflection" (1 o 2 párrafos en español que aterricen la cita estoica en el ejercicio de hoy) y "actionableTip" (una sola instrucción práctica para ejecutar hoy, en una o dos frases).

Reglas: tutea, sin emojis. Ritmo desigual: mezcla frases muy cortas con alguna larga. Escenas concretas antes que categorías abstractas.

Prohibido: "no se trata de X, sino de Y" y sus variantes; tríadas de adjetivos o ejemplos; aperturas de plantilla ("La realidad es que", "Todos hemos estado ahí", "Imagina"); cierres de superación ("y eso lo cambia todo", "recuerda:"); vocabulario inflado (poderoso, profundo, transformador, viaje, abrazar, desbloquear, esencia); titubeos ("quizás", "puede que"); preguntas retóricas encadenadas; frases que resuman lo ya dicho.`

// Las reglas de prosa viven también en .claude/skills/redaccion: si cambias
// una aquí, cámbiala allá. Ojo: las lecciones ya generadas están cacheadas
// en stoic.daily_readings — editar este prompt no reescribe lo viejo.
const READING_SYSTEM_PROMPT = `Escribes la lección diaria de un programa de entrenamiento de comunicación con base estoica. Escribes como un entrenador que ya vio fallar a mil personas en lo mismo: sobrio, concreto, sin adornos. No eres un coach motivacional.

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

  // 1. Intentar con Google Gemini (Gemini 3.8 Flash) si está configurado en .env
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (geminiKey) {
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
    const result = await callGemini<AIDailyReflection>(geminiKey, model, REFLECTION_SYSTEM_PROMPT, prompt)
    if (result) return result
  }

  // 2. Intentar con DeepSeek
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (deepseekKey) {
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    const result = await callOpenAICompatible<AIDailyReflection>(deepseekKey, 'https://api.deepseek.com', model, REFLECTION_SYSTEM_PROMPT, prompt)
    if (result) return result
  }

  // 3. Fallback a OpenAI (gpt-4o-mini)
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
  // --- TONY ROBBINS & ALTO RENDIMIENTO ---
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
    match: /interrupción de patrón|interrupcion de patron|protocolo de 5 pasos|sustitución uno a uno|sustitucion uno a uno|condicionamiento: repetir|condicionamiento neuro-asociativo/i,
    note: 'Condicionamiento Neuro-Asociativo (Robbins), 6 pasos: decidir qué quieres y qué lo impide; conseguir apalancamiento asociando dolor inmediato a seguir igual; interrumpir el patrón físicamente; crear una alternativa que cubra la MISMA necesidad; condicionarla por repetición; probarla a futuro. Un patrón no se elimina, se reemplaza.',
  },
  {
    match: /ganancia secundaria/i,
    note: 'Ganancia secundaria (Robbins): el patrón destructivo persiste porque cubre una necesidad real. Quitar la conducta sin cubrir la necesidad la devuelve, o la sustituye por otra peor.',
  },
  {
    match: /dolor y placer/i,
    note: 'Dolor y placer (Robbins): la conducta persiste por lo que el cerebro asoció a evitar dolor o ganar placer AHORA. Se cambia reasignando esas asociaciones de forma visceral e inmediata, no discutiéndolas.',
  },
  {
    match: /preguntas de poder|pregunta de francotirador|preguntas de calidad/i,
    note: 'Preguntas de calidad (Robbins): pensar es preguntar y responder. La pregunta determina qué sale a buscar el cerebro. "¿Por qué siempre me pasa esto?" ordena buscar pruebas de impotencia.',
  },
  {
    match: /canal vak|cambia el canal/i,
    note: 'Sistemas representacionales (Robbins): cada quien procesa en visual, auditivo o kinestésico y lo delata al hablar ("no lo veo claro" / "no me suena" / "no me siento cómodo"). Hablar en su canal multiplica la comprensión sin cambiar el contenido.',
  },
  {
    match: /priming matutino|respiración táctica|respiracion tactica|lenguaje corporal|ritmo a la mitad/i,
    note: 'Fisiología como vía rápida al estado (Robbins): postura, respiración y ritmo no solo expresan el estado, lo fabrican. Por eso se interviene antes del evento, no durante.',
  },
  {
    match: /primera decisión|primera decision|contrato sagrado|contrato 2\.0/i,
    note: 'Momentos de decisión (Robbins): una decisión real es aquella tras la cual actúas de inmediato y cierras las alternativas. Si no hubo acción inmediata, era una preferencia disfrazada.',
  },
  {
    match: /matching sutil|rapport/i,
    note: 'Rapport (Robbins): la sintonía se construye igualando lo no verbal —ritmo, volumen, postura— antes que el argumento. Primero acompasas, después conduces; si el otro no te sigue, aún tocaba acompasar.',
  },
  {
    match: /metáfora|metafora/i,
    note: 'Metáforas (Robbins): la metáfora con la que describes un ámbito ("negociar es una guerra" vs. "un rompecabezas a dos manos") gobierna qué conductas te parecen razonables en él. No se discute la conducta: se cambia la metáfora que la produce.',
  },
  {
    match: /anclaje de estado|instalar un ancla|ancla de estado|apila estados/i,
    note: 'Anclaje (Robbins): un estímulo sensorial único y repetible, instalado en el PICO de un estado intenso, devuelve ese estado en segundos al dispararlo. Si se instala después del pico, no prende.',
  },
  {
    match: /redefinición del marco|redefinicion del marco|reencuadre|detecta el marco/i,
    note: 'Redefinición del marco (Robbins): de contexto (la misma conducta vale distinto en otro escenario) o de contenido (el hecho es idéntico, cambia lo que significa). Es la disciplina del asentimiento estoica vuelta herramienta de conversación.',
  },
  {
    match: /metaprograma/i,
    note: 'Metaprogramas (Robbins): filtros con los que alguien decide a qué atiende — hacia/desde, interno/externo, semejanza/diferencia, general/detalle. Detectarlos cambia cómo le presentas lo mismo.',
  },
  {
    match: /precisión del lenguaje|precision del lenguaje|generalizaciones|comparativos huérfanos/i,
    note: 'Precisión del lenguaje (Robbins): las generalizaciones ("siempre", "todos", "imposible") y los comparativos sin vara ("muy caro", "mejor") borran la información que contradice. La pregunta de precisión ("¿quiénes exactamente?", "¿comparado con qué?") no discute la frase: le pide al mapa que muestre el territorio.',
  },
  {
    match: /reglas y valores|código fuente/i,
    note: 'Reglas y valores (Robbins): la frustración casi nunca viene del valor sino de la REGLA que le pusiste — qué tiene que pasar para darlo por cumplido. Reglas imposibles o que dependen de otros garantizan malestar; una regla reescrita bajo tu control convierte el valor de lotería en rutina.',
  },
  {
    match: /emoción como señal|emocion como senal|emociones por diseño/i,
    note: 'La emoción como señal (Robbins): cada emoción dolorosa es un mensaje con acción asociada, no un defecto a suprimir — la culpa señala una norma propia violada, el miedo preparación pendiente, la frustración un método agotado. Se atiende la señal; suprimirla es matar al mensajero.',
  },

  // --- CHRIS VOSS (EMPATÍA TÁCTICA & NEGOCIACIÓN BAJO PRESIÓN) ---
  {
    match: /espejo táctico|espejo tactico|espejo bajo fricción|silencio post-espejo/i,
    note: 'Espejo táctico (Chris Voss): repetir las últimas 1 a 3 palabras clave del interlocutor con entonación de pregunta ascendente, seguido de al menos 4 segundos de silencio absoluto. Induce a la contraparte a profundizar y aclarar sin sentirse presionada ni interrogada.',
  },
  {
    match: /etiquetado emocional|etiqueta lo positivo|etiquetado por escrito/i,
    note: 'Etiquetado emocional (Chris Voss): verbalizar la emoción o dinámica subyacente comenzando con "Parece que...", "Suena a que...", sin usar jamás el pronombre "Yo". Nombrar la emoción negativa apaga la amígdala cerebral y restaura la racionalidad.',
  },
  {
    match: /auditoría de acusaciones|auditoria de acusaciones/i,
    note: 'Auditoría de acusaciones (Chris Voss): enumerar de forma preventiva todas las críticas o sospechas negativas que la otra parte podría formular en tu contra, antes de que las mencione. Desactiva la carga tóxica y genera alivio inmediato.',
  },
  {
    match: /preguntas calibradas|banco de calibradas|¿cómo se supone que haga eso\?/i,
    note: 'Preguntas calibradas (Chris Voss): formular interrogantes con "¿Cómo...?" o "¿Qué...?" que transfieren el peso de la resolución a la otra parte sin generar agresión (evitando siempre el "¿Por qué?"). "¿Cómo se supone que haga eso?" fuerza a la contraparte a reevaluar su demanda.',
  },
  {
    match: /el poder del no|orientada al no/i,
    note: 'El poder del No (Chris Voss): formular propuestas buscando un "No" protector en vez de un "Sí" defensivo ("¿Sería descabellado considerar...?", "¿Has descartado continuar con este proyecto?"). Decir "No" otorga al interlocutor sensación de seguridad y control.',
  },
  {
    match: /voz de locutor|locutor de radio nocturno|baja la voz/i,
    note: 'Voz de locutor de radio nocturno (Chris Voss): tono grave, pausado y con inflexión descendente al final de la frase. Actúa como un tranquilizante biológico inmediato sobre el sistema nervioso de la sala, proyectando autoridad serena.',
  },
  {
    match: /empatía táctica en caliente|empatia tactica/i,
    note: 'Empatía táctica en caliente (Chris Voss): resumir la visión y los sentimientos del interlocutor con tal precisión que responda "Exacto / Así es". Es la señal verde que indica que sus defensas cayeron y está listo para escuchar tu propuesta.',
  },

  // --- DAN MARTELL & LIDERAZGO EJECUTIVO ---
  {
    match: /1-3-1|regla 1-3-1|instala el 1-3-1/i,
    note: 'Regla 1-3-1 (Dan Martell): presentar ante cualquier desafío un (1) problema bien delimitado, tres (3) soluciones viables evaluadas y una (1) recomendación argumentada. Erradica la cultura de la queja y acelera la toma de decisiones ejecutiva.',
  },
  {
    match: /delega el problema|delegar el problema/i,
    note: 'Delegar el problema, no la tarea (Dan Martell): transferir el contexto, el criterio de éxito y las restricciones ("el qué y para cuándo"), dejando plena autonomía sobre el "cómo". Fomenta la responsabilidad radical y el criterio propio en el equipo.',
  },
  {
    match: /cpps|framework cpps/i,
    note: 'Framework CPPS (Dan Martell): Contexto → Problema → Propuesta → Siguiente paso. Estructura ejecutiva en 4 líneas para comunicar iniciativas técnicas o de negocio sin divagar ni perder la atención de la directiva.',
  },
  {
    match: /elevator pitch|analogía técnica/i,
    note: 'Síntesis y analogía (Dan Martell): si no puedes explicar tu propuesta en 60 segundos con una analogía cotidiana, aún no dominas el concepto. La claridad es un acto de respeto y una ventaja competitiva.',
  },

  // --- BRENÉ BROWN, LEWIS HOWES & ASertividad Estoica ---
  {
    match: /claro es amable|límite sin disculpa|limite sin disculpa/i,
    note: 'Claro es amable (Brené Brown): la ambigüedad y las disculpas excesivas son cobardía disfrazada de cortesía. Comunicar límites con hechos objetivos y sin rodeos ("no puedo asumir esto debido a prioridades X e Y") protege la relación a largo plazo.',
  },
  {
    match: /vulnerabilidad estratégica|máscara del invencible|máscara del sabelotodo|no sé \/ me equivoqué/i,
    note: 'Vulnerabilidad estratégica (Lewis Howes & Brené Brown): admitir "no sé" o asumir un error en público sin dramatismo ni justificaciones derriba la máscara de invencibilidad y construye seguridad psicológica colectiva.',
  },
  {
    match: /feedback sbi|feedforward/i,
    note: 'Feedback SBI & Feedforward (Howes & Robbins): Situación concreta (S) → Conducta observable (B) → Impacto medible (I). Desvincula la crítica de la identidad personal y enfoca la retroalimentación en acciones de mejora hacia el futuro.',
  },

  // --- JULIAN TREASURE, ADRIÀ SOLÀ & ORATORIA DE ALTO IMPACTO ---
  {
    match: /calentamiento vocal|melodía vocal|melodia vocal/i,
    note: 'Vocal Power (Julian Treasure): la voz es un instrumento físico. Diafragma, vibración labial (lip trills), distensión mandibular y rango dinámico aseguran resonancia profunda y eliminan el temblor vocal inducido por estrés.',
  },
  {
    match: /silencio estratégico|silencio estrategico|pausa de 2 segundos/i,
    note: 'Silencio estratégico (Adrià Solà Pastor): sostener una pausa deliberada de 2 a 4 segundos con mirada firme tras una afirmación clave. Multiplica la autoridad percibida, genera expectación y demuestra control del turno conversacional.',
  },
  {
    match: /guerra a las muletillas|inventario de muletillas/i,
    note: 'Erradicación de muletillas (Adrià Solà Pastor): las muletillas son fugas acústicas originadas por el miedo al silencio. Se corrigen cerrando físicamente los labios al culminar cada frase e incorporando el micro-silencio como elemento de poder.',
  },

  // --- CARMINE GALLO & CHARLES DUHIGG ---
  {
    match: /sparkline|storytelling|historia personal/i,
    note: 'Estructura Sparkline (Carmine Gallo): alternar constantemente el contraste entre "lo que es" (estado actual, dolor, fricción) y "lo que podría ser" (visión de futuro resuelta), cerrando con una llamada inequívoca a la acción.',
  },
  {
    match: /regla de tres/i,
    note: 'Regla de tres (Carmine Gallo): el cerebro procesa y recuerda información en tríadas estructurales de manera óptima. Tres argumentos, tres fases o tres opciones evitan la sobrecarga cognitiva y proyectan dominio temático.',
  },
  {
    match: /mapa de conversaciones|tipos de conversación/i,
    note: 'Supercomunicadores (Charles Duhigg): identificar antes de hablar si la conversación es práctica (resolver un problema), emocional (sentirse escuchado) o social (identidad y pertenencia). Ajustar el registro al tipo correspondiente previene el 90% de los conflictos.',
  },

  // --- FILOSOFÍA ESTOICA PURA (EPICTETO, SÉNECA, MARCO AURELIO) ---
  {
    match: /dicotomía del control|dicotomia del control|marco estoico/i,
    note: 'Dicotomía del Control (Epicteto): dividir los acontecimientos entre lo que depende absolutamente de tu voluntad (juicios, intenciones, reacciones) y lo que no (opiniones ajenas, resultados, clima). Asignar energía exclusivamente a lo primero.',
  },
  {
    match: /disciplina del asentimiento|auditoría de la primera reacción/i,
    note: 'Disciplina del Asentimiento (Marco Aurelio): interponer una pausa infranqueable entre la impresión sensorial bruta (phantasia) y la emisión del juicio racional (dogma). Negar el asentimiento automático a la ira o la provocación.',
  },
  {
    match: /premeditatio malorum|examen de fase|examen nocturno/i,
    note: 'Premeditatio Malorum & Examen de Séneca: anticipación lúcida de los obstáculos diarios para anular el factor sorpresa, seguido de una auditoría nocturna de tres preguntas ("¿Qué debilidad vencí hoy? ¿Qué virtud ejercité? ¿Dónde titubeé?").',
  },
]

/**
 * Fichas relevantes para un día concreto (máximo 3, para no inflar el prompt).
 * Busca coincidencias en el autor de referencia, título, instrucciones y por qué funciona.
 */
function techniqueNotesFor(
  sourceAuthor: string | null,
  title: string | null,
  instructions?: string | null,
  rationale?: string | null
): string[] {
  const haystack = `${sourceAuthor || ''} ${title || ''} ${instructions || ''} ${rationale || ''}`
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
  /** Duración del track. El de Influencia dura 30, no 90. */
  durationDays?: number
}): Promise<{ reading: string; model: string } | null> {
  const notes = techniqueNotesFor(opts.sourceAuthor, opts.title, opts.instructions, opts.rationale)

  const prompt = `
Datos del día para escribir la lección:
- Track del programa: ${opts.trackName}
- Día: ${opts.dayNumber} de ${opts.durationDays || 90} (fase ${opts.phase}, semana ${opts.weekNumber}${opts.weekTheme ? `: ${opts.weekTheme}` : ''})
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

  // 1. Intentar con Google Gemini (Gemini 3.8 Flash) si está configurado en .env
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (geminiKey) {
    const model = process.env.GEMINI_READING_MODEL || 'gemini-3.8-flash'
    const result = await callGemini<AIDailyReading>(geminiKey, model, READING_SYSTEM_PROMPT, prompt)
    if (result?.reading) return { reading: result.reading, model }
  }

  // 2. Para lecturas largas fallback a DeepSeek
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (deepseekKey) {
    const model = process.env.DEEPSEEK_READING_MODEL || 'deepseek-chat'
    const result = await callOpenAICompatible<AIDailyReading>(deepseekKey, 'https://api.deepseek.com', model, READING_SYSTEM_PROMPT, prompt)
    if (result?.reading) return { reading: result.reading, model }
  }

  // 3. Fallback a OpenAI (gpt-4o-mini)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const result = await callOpenAICompatible<AIDailyReading>(openaiKey, 'https://api.openai.com/v1', 'gpt-4o-mini', READING_SYSTEM_PROMPT, prompt)
    if (result?.reading) return { reading: result.reading, model: 'gpt-4o-mini' }
  }

  return null
}

// ============================================================
// Análisis mensual del diario
// ============================================================

export interface AIMonthlyAnalysis {
  analysis: string
}

// La regla que decide si esto sirve o es un horóscopo: CITAR AL USUARIO.
// Un informe que dice "sigue trabajando tu asertividad" no lo lee nadie
// dos veces. Uno que dice "el 12 de marzo escribiste que te callaste en
// la junta, y el 3 de abril que pediste la palabra tú" es indiscutible,
// porque el usuario reconoce sus propias frases.
//
// Las reglas de prosa son las mismas de READING_SYSTEM_PROMPT y viven
// también en .claude/skills/redaccion: si cambias una aquí, cámbiala allá.
const ANALYSIS_SYSTEM_PROMPT = `Analizas el diario de un mes de alguien que está haciendo un programa de entrenamiento de comunicación con base estoica. Escribes como un entrenador que leyó todo lo que esa persona escribió y le devuelve lo que ve, sin adornos y sin consolarla.

Responde estrictamente con un objeto JSON con una sola clave "analysis": un texto en español de 350 a 500 palabras, en 4-5 párrafos separados por saltos de línea dobles (\n\n), con esta estructura invisible (sin subtítulos ni numeración):
1. El patrón que más se repite en lo que escribió, nombrado sin rodeos.
2. Una contradicción o un cambio entre el principio y el final del mes, sostenido con SUS PALABRAS.
3. Lo que evita: el tema que aparece de refilón y nunca desarrolla, o la situación que sigue posponiendo.
4. Lo que mejoró de verdad, con la evidencia concreta que lo demuestra.
5. Una sola cosa para el mes que viene. Una, no una lista.

REGLA INNEGOCIABLE — CITA SUS PALABRAS:
- Cita textualmente al menos tres fragmentos de lo que escribió, entre comillas y con la fecha. Ejemplo: el 12 de marzo escribiste "me quedé callado otra vez".
- Cita corto: seis a quince palabras. No pegues párrafos enteros.
- Si el material es tan escaso que no alcanza para tres citas, dilo de frente en la primera línea y analiza solo lo que haya. No rellenes.
- Nunca inventes una cita ni una fecha. Si no está en el material, no existe.

CÓMO SUENA (obligatorio):
- Ritmo desigual. En cada párrafo, al menos una frase de menos de seis palabras y al menos una larga. Si todas miden igual, reescribe.
- Concreción antes que categoría: la escena que él contó, no la etiqueta psicológica.
- Verbos por delante: "decidir", no "la toma de decisiones".
- Tutea. Sin emojis, sin listas ni viñetas.
- Directo pero no cruel: señalas lo que ves, no lo humillas. No eres su terapeuta ni su animador.

PROHIBIDO (delata texto generado):
- La antítesis de muleta: "no se trata de X, sino de Y", "no es X, es Y". Máximo UNA vez.
- Tríadas: tres adjetivos, tres ejemplos o tres cláusulas seguidas. Usa dos, o cuatro.
- Frases de plantilla: "La realidad es que", "En el fondo", "Todos hemos estado ahí", "Es importante destacar", "En resumen".
- Cierres de superación: "y eso lo cambia todo", "el cambio empieza hoy", "recuerda:", "la decisión es tuya".
- Vocabulario inflado: poderoso, profundo, transformador, viaje, abrazar, desbloquear, potenciar, elevar, esencia, pilar, resonar, empoderar.
- Titubeos: "quizás", "puede que", "en cierto modo".
- Diagnósticos clínicos o etiquetas de salud mental. No eres profesional de la salud.
- Que el último párrafo resuma los anteriores: avanza o calla.`

/**
 * Analiza el diario de un mes. Devuelve null si no hay material o si el
 * modelo falla — el llamador decide qué mostrar.
 *
 * `entries` llega ya recortado por el llamador: se manda el texto que el
 * usuario escribió, no la base entera.
 */
export async function generateMonthlyAnalysis(opts: {
  monthLabel: string
  entries: Array<{ date: string; tipo: string; campos: Array<{ label: string; texto: string }> }>
  diasCompletados: number
  diasPerdidos: number
  animoMedio: number | null
}): Promise<{ analysis: string; model: string } | null> {
  if (opts.entries.length === 0) return null

  const material = opts.entries
    .map(e => {
      const cuerpo = e.campos
        .filter(c => c.texto.trim())
        .map(c => `  ${c.label}: ${c.texto.trim()}`)
        .join('\n')
      return `[${e.date}] ${e.tipo}\n${cuerpo}`
    })
    .join('\n\n')

  const prompt = `
Mes analizado: ${opts.monthLabel}
Días completados en el programa: ${opts.diasCompletados}
Días perdidos: ${opts.diasPerdidos}
Ánimo medio reportado: ${opts.animoMedio !== null ? `${opts.animoMedio.toFixed(1)} sobre 5` : 'sin datos'}
Entradas de diario en el mes: ${opts.entries.length}

Esto es TODO lo que escribió durante el mes. Las fechas entre corchetes son reales: úsalas al citar.

${material}

Escribe el análisis del mes siguiendo la estructura y las reglas del sistema. Cita sus palabras.
`

  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (deepseekKey) {
    const model = process.env.DEEPSEEK_ANALYSIS_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    const result = await callOpenAICompatible<AIMonthlyAnalysis>(
      deepseekKey, 'https://api.deepseek.com', model, ANALYSIS_SYSTEM_PROMPT, prompt
    )
    if (result?.analysis) return { analysis: result.analysis, model }
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const result = await callOpenAICompatible<AIMonthlyAnalysis>(
      openaiKey, 'https://api.openai.com/v1', 'gpt-4o-mini', ANALYSIS_SYSTEM_PROMPT, prompt
    )
    if (result?.analysis) return { analysis: result.analysis, model: 'gpt-4o-mini' }
  }

  return null
}
