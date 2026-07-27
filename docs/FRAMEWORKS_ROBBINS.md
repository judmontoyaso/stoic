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
| **Momentos de decisión** | El destino no se moldea en las circunstancias sino en el instante de decidir. Una decisión real es aquella tras la cual actúas de inmediato y cierras las alternativas; si no hay acción inmediata, era una preferencia. | PI d1 |

CE = Comunicación Estoica · PI = Práctica Interna

---

## Parte 2 — Frameworks NO usados todavía (oportunidades reales)

Estos salen de los dos libros y son **directamente de comunicación**, que
es el track que menos los aprovecha. Ordenados por encaje con el programa.

### 1. Anclaje (Poder sin límites, cap. 17) — el hueco más grande
Un ancla es un estímulo sensorial (un gesto, una palabra, una presión con
los dedos) unido por repetición a un estado intenso. Después, disparar el
estímulo devuelve el estado en segundos. Se instala en el pico de la
emoción, no después, y necesita un estímulo único y repetible.

**Por qué encaja:** el programa ya entrena estados (d8 priming, d12
respiración) pero no da forma de *recuperarlos a demanda* justo antes de
hablar. Es el complemento natural, y es la técnica más accionable que falta.

### 2. Redefinición del marco (cap. 16)
Dos variantes distintas: **de contexto** (la misma conducta cambia de valor
en otro escenario: lo que es terquedad en una junta es persistencia en una
negociación) y **de contenido** (el hecho es idéntico, cambia lo que
significa). Es la operación estoica de la disciplina del asentimiento
formulada como herramienta de conversación.

**Por qué encaja:** conecta el módulo `perception` estoico con una técnica
concreta que se usa hablando con otro, no solo por dentro.

### 3. Metaprogramas (cap. 14)
Filtros con los que alguien decide a qué presta atención: hacia/desde
(busca ganar o busca evitar), interno/externo (se valida solo o necesita
referencia ajena), semejanza/diferencia, general/detalle. Detectarlos en
dos minutos de conversación cambia cómo le presentas lo mismo.

**Por qué encaja:** es el nivel siguiente al VAK del día 19, y es
directamente persuasión — el ángulo Voss del programa.

### 4. Precisión del lenguaje (cap. 12)
Recuperar lo que el otro borró, generalizó o distorsionó: "¿todos?",
"¿comparado con qué?", "¿quién concretamente?". Devuelve la conversación a
hechos y desarma la generalización sin confrontar.

**Por qué encaja:** hermano directo de las preguntas calibradas de Voss que
ya usa el día 45.

### 5. Rapport y espejeo (cap. 13)
La compenetración se construye igualando lo no verbal antes que el
argumento: ritmo, volumen, postura, respiración. Primero acompasas, después
conduces — si el otro te sigue, hay rapport; si no, seguiste acompasando.

**Por qué encaja:** el programa entrena escucha (d2) pero no el mecanismo
físico de sintonía.

### 6. Reglas, valores, referencias e identidad ("sistema maestro")
La frustración casi nunca viene del valor, viene de la **regla** que le
pusiste: qué tiene que pasar para que sientas que ya lo cumpliste. Reglas
imposibles garantizan infelicidad con cualquier resultado.

**Por qué encaja:** es material de la fase de Evaluación y del track
interno, y explica por qué alguien "cumple" el programa y aun así se siente
mal.

### 7. Las diez emociones del poder / emociones como señal de acción
Cada emoción dolorosa es un mensaje con una acción asociada, no un defecto
a suprimir: la culpa señala una norma propia violada, el miedo señala
preparación pendiente. Se responde a la señal, no se pelea la emoción.

**Por qué encaja:** es estoicismo casi literal (la emoción como juicio) con
un protocolo operativo encima.

### 8. Metáforas (cap. 10)
La metáfora con la que describes un ámbito ("la vida es una guerra" vs.
"un juego") gobierna qué conductas te parecen razonables en él. Cambiarla
cambia el repertorio disponible.

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
