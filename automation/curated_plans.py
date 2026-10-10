"""
Guiones y planes curados para los días 11 al 20 de StoiCom.
Diseñados para alta retención, hooks psicológicos virales y formato de 25-30 segundos.
"""

from pydantic import BaseModel

class Scene(BaseModel):
    narration: str
    image_subject: str

class VideoPlan(BaseModel):
    hook_text: str
    scenes: list[Scene]
    social_caption: str
    reddit_title: str
    reddit_body: str

CURATED_PLANS = {
    11: VideoPlan(
        hook_text="HABLAR PLANO TE HACE INVISIBLE",
        scenes=[
            Scene(narration="El cerebro humano se desconecta de cualquier sonido monótono.", image_subject="Extreme close-up of a white marble Greek philosopher's ear and jawline, deep shadows, amber key light"),
            Scene(narration="Si hablas siempre en el mismo tono, tus ideas desaparecen.", image_subject="Ancient Greek bronze lyre with vibrating strings in dramatic chiaroscuro"),
            Scene(narration="Hoy grábate dos minutos exagerando graves y agudos como si contaras un secreto.", image_subject="Side profile of a marble statue speaking into dark void, warm golden rim light"),
            Scene(narration="Te vas a sentir ridículo, pero afuera suena como autoridad. Día once de noventa.", image_subject="Regal weathered white marble bust looking upward with austere authority, black background")
        ],
        social_caption="La monotonía vocal es la forma más rápida de que te ignoren en reuniones. Entrena tu voz con el día 11 de StoiCom. #comunicacion #oratoria #liderazgo #estoicismo #voz",
        reddit_title="¿Por qué la gente pierde el interés cuando hablas? El hábito de la melodía vocal",
        reddit_body="El cerebro del oyente se habitúa a los estímulos constantes y deja de procesarlos. En oratoria clásica y negociación, la modulación vocal no es adorno: es el interruptor que mantiene activa la atención. ¿Han probado grabar sus conversaciones y medir si hablan en línea plana?"
    ),
    12: VideoPlan(
        hook_text="CÓMO APAGAR EL TEMBLOR DE VOZ",
        scenes=[
            Scene(narration="Cuando te tiembla la voz, no es falta de práctica ni cobardía.", image_subject="Trembling candlelight casting flickering golden shadows on a weathered classical marble hand"),
            Scene(narration="Tus pulmones se quedan sin aire por puro estrés social.", image_subject="Stone sculpture of a man clutching his chest in emotional turmoil, pitch black background"),
            Scene(narration="Antes de hablar hoy, inhala en cuatro segundos y exhala despacio en seis. Tres veces.", image_subject="Extreme macro of a calm stoic face breathing in stillness, golden dust in light beam"),
            Scene(narration="La exhalación larga apaga el pánico. Primero dominas tu cuerpo; luego tus palabras. Día doce de noventa.", image_subject="Imperturbable white marble statue of Marcus Aurelius in serene majesty, dark background")
        ],
        social_caption="El temblor de voz no se quita repasando notas: se apaga regulando el nervio vago. Técnica de respiración 4-6 del día 12. #nervios #hablarenpublico #comunicacion #oratoria #estoico",
        reddit_title="La técnica fisiológica para apagar el temblor de voz antes de una junta importante",
        reddit_body="Tony Robbins y los entrenadores de élite lo repiten: el estado fisiológico precede a las palabras. La exhalación más larga que la inhalación estimula el nervio vago y le comunica al sistema nervioso autónomo que no hay amenaza. ¿Qué técnica física usan ustedes antes de hablar bajo presión?"
    ),
    13: VideoPlan(
        hook_text="TRES FRASES QUE DESTRUYEN TU RESPETO",
        scenes=[
            Scene(narration="Deja de decir estas tres frases: estoy abrumado, seguro lo digo mal, no sirvo para esto.", image_subject="Ancient Roman parchment with dark wet ink staining the surface, chiaroscuro golden light"),
            Scene(narration="Las palabras habituales no describen tu experiencia: la están fabricando.", image_subject="Weathered marble face with subtle cracked fissures, pitch black backdrop"),
            Scene(narration="Hoy cambia tu diálogo interno: no estás abrumado, estás ordenando prioridades.", image_subject="Ancient golden kintsugi repairing the cracks of a marble stone with luminous gold"),
            Scene(narration="Quien cuida sus palabras protege su propia mente. Día trece de noventa.", image_subject="Noble Roman philosopher bust with dignified serene gaze, illuminated by warm amber side light")
        ],
        social_caption="Tu vocabulario no reporta tus emociones: las intensifica. Aprende a reprogramar tus etiquetas verbales con el día 13. #mentalidad #psicologia #estoicismo #hablarbien #crecimiento",
        reddit_title="Vocabulario transformacional: cómo tres palabras habituales sabotean tu autoridad",
        reddit_body="En psicología del rendimiento, cambiar la etiqueta verbal de una emoción altera su intensidad biológica. Decir 'estoy ordenando prioridades' produce una respuesta neuroquímica radicalmente diferente a 'estoy colapsado'. ¿Han cazado muletillas mentales en su diálogo interno?"
    ),
    14: VideoPlan(
        hook_text="LA PRUEBA QUE TU EGO NO PUEDE NEGAR",
        scenes=[
            Scene(narration="Hace dos semanas te grabaste tres minutos hablando en frío.", image_subject="Ancient hourglass with glowing golden sand running through the glass, dark background"),
            Scene(narration="Hoy vas a repetir el mismo tema y poner las dos grabaciones lado a lado.", image_subject="Two classical Roman busts facing each other in contrasting shadow and golden light"),
            Scene(narration="Cuenta tus muletillas, mira tus hombros y escucha tus silencios.", image_subject="Extreme close-up of piercing stone eyes staring forward with razor sharpness, dark mood"),
            Scene(narration="Tu mente siempre duda, pero dos videos separados por catorce días son una prueba irrefutable. Día catorce de noventa.", image_subject="Victorious austere marble statue standing firm in pitch black space with golden halo lighting")
        ],
        social_caption="Tu autoduda discute con opiniones, pero se rinde ante la evidencia visual de 14 días. Retro de la semana 2. #progreso #disciplina #estoicismo #habitos #crecimientopersonal",
        reddit_title="Por qué comparar dos videos tuyos separados por 14 días vence al síndrome del impostor",
        reddit_body="La percepción subjetiva siempre miente: el cerebro se acostumbra a los pequeños cambios diarios y cree que no avanza. Grabar una línea base y contrastarla dos semanas después es la prueba objetiva más honesta. ¿Suelen llevar métricas visuales de sus habilidades blandas?"
    ),
    15: VideoPlan(
        hook_text="LA PREGUNTA QUE SALVA CONVERSACIONES",
        scenes=[
            Scene(narration="El error que más destruye conversaciones es dar consejos cuando solo pedían desahogo.", image_subject="Two ancient philosophers in thoughtful conversation under deep shadows and golden light"),
            Scene(narration="En tu próxima charla haz esta pregunta: ¿buscas que te ayude o que te escuche?", image_subject="Carved stone hand extended in a gentle, firm gesture of patience, chiaroscuro"),
            Scene(narration="Y guarda silencio. Si pidió escucha, tu única tarea es atender sin juzgar.", image_subject="Extreme close-up of a marble statue's lips sealed in thoughtful noble silence"),
            Scene(narration="Callar tus soluciones es dominar al ego. Día quince de noventa.", image_subject="Serene classical marble bust in deep contemplation, dark background, golden candlelight")
        ],
        social_caption="Preguntar qué tipo de conversación espera la otra persona evita el 90% de los conflictos de pareja y trabajo. Día 15 de StoiCom. #empatia #escuchaactiva #relaciones #comunicacion #liderazgo",
        reddit_title="La pregunta explícita de 6 palabras que evita la mayoría de las discusiones",
        reddit_body="Charles Duhigg lo demuestra en sus estudios sobre supercomunicadores: la gente entra a una conversación buscando apoyo práctico, emocional o social. Mezclarlos arruina el vínculo. Preguntar '¿quieres que te escuche o que lo resolvamos?' desarma cualquier fricción. ¿Lo aplican en su día a día?"
    ),
    16: VideoPlan(
        hook_text="YA NO ESCUCHAS A LA OTRA PERSONA",
        scenes=[
            Scene(narration="Tú no escuchas a quien tienes enfrente: escuchas la etiqueta que le pusiste.", image_subject="Classical Greek theatrical mask split between deep shadow and warm candlelight"),
            Scene(narration="Adivinas lo que va a decir y preparas tu respuesta mientras todavía habla.", image_subject="Stone bust half hidden behind heavy dark fabric, only eyes visible in golden beam"),
            Scene(narration="Hoy desactiva tus juicios. Atiende únicamente a los hechos de hoy.", image_subject="Clean weathered Roman marble column standing solid under dramatic amber key light"),
            Scene(narration="Te sorprenderá cuánto llevabas sin oír de verdad. Día dieciséis de noventa.", image_subject="Profile of a classical philosopher looking intently ahead, pitch black background")
        ],
        social_caption="Escuchamos a través de filtros históricos que editan el mensaje antes de que llegue a la conciencia. Ejercicio del día 16. #psicologia #escucha #relaciones #sesgos #estoicismo",
        reddit_title="Filtros de escucha: por qué creemos que la gente 'siempre dice lo mismo'",
        reddit_body="Julian Treasure explica que acumulamos capas de expectativas sobre las personas cercanas hasta que dejamos de escuchar lo que dicen hoy y solo escuchamos el archivo mental que tenemos de ellas. Desactivar ese filtro una sola reunión cambia todo. ¿Cómo limpian sus filtros mentales?"
    ),
    17: VideoPlan(
        hook_text="CÓMO DESARMAR A ALGUIEN AGRESIVO",
        scenes=[
            Scene(narration="Cuando alguien te ataque molesto, jamás te justifiques.", image_subject="Ancient Greek bronze shield bearing battle scratches in dramatic chiaroscuro"),
            Scene(narration="Los negociadores del FBI usan esta regla: valida su emoción en una frase.", image_subject="Calm sculpted hands resting peacefully on a marble plinth, warm amber illumination"),
            Scene(narration="Parece que esta situación te está frustrando mucho.", image_subject="Extreme close-up of classical Roman statue with an empathetic and observant gaze"),
            Scene(narration="Al sentirse comprendido, su cerebro baja la guardia. Validar no es ceder: es mandar. Día diecisiete de noventa.", image_subject="Austere marble bust of Seneca radiating absolute mental control and composure, black backdrop")
        ],
        social_caption="Validar la emoción del otro no es darle la razón: es desarmar su amígdala antes de negociar. Técnica de Chris Voss en el día 17. #negociacion #chrisvoss #comunicacion #liderazgo #manejoemocional",
        reddit_title="La técnica del FBI para calmar a alguien hostil sin dar tu brazo a torcer",
        reddit_body="Chris Voss llama a esto 'etiquetado táctico'. Nombrar la emoción negativa del otro ('parece que te sientes ignorado') desactiva la respuesta de pelea en su cerebro. La gente suele cometer el error de responder al ataque con lógica o defensa. ¿Han probado etiquetar emociones en el trabajo?"
    ),
    18: VideoPlan(
        hook_text="EL SILENCIO QUE TU EGO NO TOLERA",
        scenes=[
            Scene(narration="El ejercicio más incómodo de tu semana: una conversación completa sin interrumpir.", image_subject="Marble statue of a classical philosopher with index finger held firmly against his lips"),
            Scene(narration="No completes sus frases y no prepares tu réplica mental.", image_subject="Ancient stone sundial in absolute darkness with a thin sliver of golden light moving across"),
            Scene(narration="Cuando termine de hablar, cuenta dos segundos enteros en silencio.", image_subject="Extreme close-up of weathered stone eyes gazing calmly into the shadows"),
            Scene(narration="Tolerar el silencio proyecta el doble de autoridad que atropellar con palabras. Día dieciocho de noventa.", image_subject="Monumental Roman marble bust commanding silent austere presence, pitch black background")
        ],
        social_caption="Interrumpir no es entusiasmo: es ansiedad y ego. Aprende a dominar el silencio táctico con el día 18 de StoiCom. #silencio #oratoria #autoridad #comunicacionefectiva #estoicismo",
        reddit_title="El ejercicio de los 2 segundos de silencio que incomoda a todo el mundo",
        reddit_body="Tolerar el micro-silencio después de que el otro termina de hablar es la señal no verbal más contundente de control interno. La mayoría de la gente rellena el vacío por miedo a perder el turno. ¿Son capaces de sostener 2 segundos de pausa en una reunión importante?"
    ),
    19: VideoPlan(
        hook_text="HABLA EN SU DIALECTO CEREBRAL",
        scenes=[
            Scene(narration="Quien dice no lo veo claro necesita un esquema visual.", image_subject="Sculpted marble eye in ultra close-up reflecting warm amber light, dramatic shadows"),
            Scene(narration="Quien dice no me suena necesita una historia; y quien dice no me cuadra, un ejemplo práctico.", image_subject="Ancient carved marble ear in sharp chiaroscuro lighting, deep black background"),
            Scene(narration="Escucha las palabras de tu receptor hoy y adapta tu mensaje a su canal.", image_subject="Two hands sculpted in white marble interlocking in mutual understanding, golden glow"),
            Scene(narration="La persuasión real empieza cuando hablas su mismo dialecto. Día diecinueve de noventa.", image_subject="Noble Roman philosopher bust in three-quarter view radiating deep intellect and clarity")
        ],
        social_caption="Adaptar tu explicación al canal sensorial (visual, auditivo, kinestésico) del otro multiplica la comprensión al instante. Día 19. #persuasion #pnl #comunicacion #tonyrobbins #liderazgo",
        reddit_title="Por qué la misma explicación funciona con unas personas y fracasa con otras",
        reddit_body="Tony Robbins lo detalla en la teoría de canales VAK: la gente revela su sistema de representación dominante en los predicados verbales que usa. Si a un visual le explicas con datos abstractos se desconecta; si le dibujas un esquema, lo capta en 5 segundos. ¿Suelen adaptar su canal al receptor?"
    ),
    20: VideoPlan(
        hook_text="EL PUENTE QUE NADIE OLVIDA",
        scenes=[
            Scene(narration="La forma más elegante de ganarte el respeto de alguien:", image_subject="Ancient Roman stone bridge spanning over mist and darkness under golden dawn light"),
            Scene(narration="Recuérdale un detalle que te contó hace semanas.", image_subject="Ancient rolled Roman scroll with golden seal lying on dark polished stone table"),
            Scene(narration="Mencionaste que tenías un proyecto difícil, ¿cómo te fue con eso?", image_subject="Two classical Roman pillars connected by an arch of warm golden light, pitch black space"),
            Scene(narration="La gente olvida lo que dices, pero nunca olvida que la escuchaste de verdad. Día veinte de noventa.", image_subject="Weathered classical marble statue with a warm noble expression, looking forward with dignity")
        ],
        social_caption="Recordar la vida de los demás es el puente más escaso y poderoso en las relaciones profesionales. Reto del día 20 de StoiCom. #networking #relaciones #respeto #carisma #comunicacion",
        reddit_title="El puente diferido: el hábito de los grandes líderes para crear lealtad",
        reddit_body="Lewis Howes lo describe como una de las habilidades relacionales más magnéticas: anotar mentalmente una preocupación o meta que alguien mencionó de pasada y retomarla semanas después. Transmite un nivel de atención que el 99% de las personas nunca experimenta. ¿Tienen el hábito de hacer puentes diferidos?"
    )
}
