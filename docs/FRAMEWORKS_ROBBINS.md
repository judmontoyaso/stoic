# Frameworks de Robbins — inventario para el contenido del programa

Fuente: *Controle su destino* (Awaken the Giant Within) y *Poder sin
límites* (Unlimited Power), ambos en `books/`. Las técnicas están descritas
con nuestras palabras: son **ideas y mecánicas**, no texto de los libros.
Regla del proyecto (skill `marketing`): se cita al autor por su nombre y
nunca se reproduce su prosa.

Para qué sirve este archivo:

1. Escribir o revisar días del programa con la mecánica exacta, no con una
   versión vaga de "lo que dice Robbins".
2. Alimentar el prompt de generación: `src/lib/ai.ts` inyecta la ficha de
   la técnica cuando el día la referencia (ver `TECHNIQUE_NOTES`).

---

## Parte 1 — Frameworks YA usados en el programa

| Técnica | Mecánica real | Días que la usan |
|---|---|---|
| **La fuerza que configura la vida** (dolor/placer) | Toda conducta persiste porque el cerebro la asoció a evitar dolor o ganar placer *ahora*. No se cambia una conducta discutiéndola: se cambia reasignando qué duele y qué da placer, y hay que hacerlo de forma inmediata y visceral, no intelectual. | PI d43 |
| **Condicionamiento Neuro-Asociativo (NAC), 6 pasos** | 1) Decide qué quieres de verdad y qué te lo impide. 2) Consigue apalancamiento: asocia dolor masivo e inmediato a seguir igual. 3) Interrumpe el patrón limitante (romperlo físicamente, no resistirlo). 4) Crea una alternativa nueva que cubra la MISMA necesidad. 5) Condiciónala por repetición hasta que sea consistente. 6) Pruébala: imagínala a futuro y verifica que aguanta. | PI d22, d26, d43, d44 |
| **La Tríada** | Toda emoción se sostiene sobre tres palancas simultáneas: fisiología (cómo usas el cuerpo), foco (a qué le prestas atención) y lenguaje (qué te dices y con qué palabras). Cambia una y la emoción se mueve; cambia las tres y cambia de golpe. | PI d24 |
| **Fisiología como vía rápida al estado** | El cuerpo es la palanca más veloz porque es la más directa: la postura, la respiración y el ritmo no solo expresan un estado, lo fabrican. Por eso se interviene antes del evento, no durante. | CE d5, d8, d12; PI d22 |
| **Vocabulario transformacional** | La etiqueta verbal que le pones habitualmente a una emoción regula su intensidad. Bajar la palabra ("estoy irritado" en vez de "estoy furioso") baja la carga; subirla la amplifica. Se entrena cambiando 2-3 etiquetas de uso diario. | CE d13; PI d32 |
| **Preguntas de calidad** | Pensar es preguntar y responder. La calidad de la pregunta determina la calidad de la respuesta que el cerebro busca: "¿por qué siempre me pasa esto?" ordena buscar pruebas de impotencia; "¿qué tiene esto de bueno y qué puedo hacer con ello?" ordena buscar recursos. | CE d24; PI d38 |
| **Incantación vs. afirmación** | La afirmación repetida en frío la rechaza el cerebro por falsa. La incantación involucra cuerpo, voz e intensidad emocional a la vez: no se declara el estado, se ejecuta. | PI d37 |
| **Ganancia secundaria** | Un patrón destructivo se sostiene porque cubre una necesidad real. Si eliminas la conducta sin cubrir la necesidad, vuelve o se sustituye por otra peor. Primero identificas qué te da; después construyes el reemplazo. | PI d6, d44 |
| **Sistemas representacionales (VAK)** | Cada persona procesa preferentemente en visual, auditivo o kinestésico, y lo delata en su lenguaje ("no lo veo claro" / "no me suena" / "no me siento cómodo"). Hablarle en su canal multiplica la comprensión sin cambiar el contenido. | CE d19 |
| **Momentos de decisión** | El destino no se moldea en las circunstancias sino en el instante de decidir. Una decisión real es aquella tras la cual actúas de inmediato y cierras las alternativas; si no hay acción inmediata, era una preferencia. | PI d1, d31, d88 |
| **Metáforas** | La metáfora con la que describes un ámbito ("negociar es una guerra" vs. "un rompecabezas a dos manos") gobierna qué conductas te parecen razonables en él. Se cambia la metáfora, no la conducta. | CE d49 |
| **Rapport y espejeo** | La sintonía se construye igualando lo no verbal —ritmo, volumen, postura— antes que el argumento. Primero acompasas, después conduces; si el otro no sigue, aún tocaba acompasar. | CE d57 |

CE = Comunicación Estoica · PI = Práctica Interna

---

## Parte 2 — El track "Influencia" (temporada avanzada, 30 días)

Los frameworks que los dos tracks de 90 días no usaban se convirtieron en
un **tercer track de 30 días** (`supabase_v12_track_influencia.sql`,
slug `influencia`), pensado como la temporada siguiente para quien termina
sus primeros 90 días — el día 89 del programa pide literalmente un plan de
30 días, y este track es la respuesta.

| Semana | Framework | Días |
|---|---|---|
| 1 · El estado a demanda | **Anclaje** (Poder sin límites, cap. 17): estímulo único instalado en el PICO de un estado intenso; probado en frío, apilado, y disparado antes y durante conversaciones reales. | d1-7 |
| 2 · El marco manda | **Redefinición del marco** (cap. 16): de contexto y de contenido, reencuadre en voz alta, marco previo, y la versión estoica (asentimiento) en tiempo real. | d8-14 |
| 3 · Leer al otro | **Precisión del lenguaje** (cap. 12): generalizaciones y comparativos sin vara + **Metaprogramas** (cap. 14): hacia/desde, interno/externo, presentar en el filtro del receptor. | d15-21 |
| 4 · El sistema maestro | **Reglas y valores** (Controle su destino, cap. 15-16): jerarquía, reglas imposibles, reescritura bajo control propio + **emociones como señal** (cap. 11). | d22-28 |
| 5 · Integración | Examen de influencia (todas las herramientas en una conversación real) + protocolo permanente. | d29-30 |

Los días llevan la técnica en `source_author`
("Tony Robbins — anclaje de estado"), que es lo que dispara la ficha de
mecánica en `TECHNIQUE_NOTES` al generar la lección.

---

## Parte 3 — Cómo usarlo al escribir un día

1. Elige la técnica de la tabla y **cita el nombre exacto** en
   `source_author` (ej. "Tony Robbins — anclaje", no "Tony Robbins").
2. `instructions` describe la mecánica ejecutable hoy, con números y
   condiciones de verificación. Nada de "reflexiona sobre".
3. `rationale` explica *por qué funciona el mecanismo*, no por qué es
   importante ser mejor.
4. Prosa según `.claude/skills/redaccion`: sin tics de IA, concreta,
   ritmo desigual.
