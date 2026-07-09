// ============================================================
// Citas del programa - 90 citas alineadas al arco de 90 días
// Semanas 1-4: percepción y fundamentos · 5-8: acción e identidad
// Semanas 9-13: voluntad, propósito y cierre
// ============================================================

export interface StoicQuote {
  text: string
  author: string
  original?: string
}

export const STOIC_QUOTES: StoicQuote[] = [
  // ---- Semana 1 (días 1-7): autoconocimiento y diagnóstico ----
  { text: 'Es imposible empezar a aprender lo que uno cree saber ya.', author: 'Epicteto' },
  { text: 'Reconocer la propia falta es el comienzo de la salud.', author: 'Séneca' },
  { text: 'Mira hacia dentro: ahí está la fuente del bien, siempre lista a manar si no dejas de excavar.', author: 'Marco Aurelio' },
  { text: 'Las circunstancias no hacen al hombre: lo revelan ante sí mismo.', author: 'Epicteto' },
  { text: 'Exígete cuentas cada día, y los errores perderán su fuerza sobre ti.', author: 'Séneca' },
  { text: 'Si quieres mejorar, acepta ser visto como ignorante en algunas cosas.', author: 'Epicteto' },
  { text: 'Mientras posponemos, la vida pasa.', author: 'Séneca' },

  // ---- Semana 2 (días 8-14): disciplina, cuerpo y estado ----
  { text: 'Al amanecer, cuando te cueste levantarte, recuerda: me levanto para hacer el trabajo de un ser humano.', author: 'Marco Aurelio' },
  { text: 'Ningún gran logro nace de repente, como tampoco un racimo de uvas: florece primero, luego madura.', author: 'Epicteto' },
  { text: 'Las dificultades fortalecen la mente, como el trabajo fortalece el cuerpo.', author: 'Séneca' },
  { text: 'El bienestar se alcanza poco a poco; pero no es poca cosa.', author: 'Zenón de Citio' },
  { text: 'Donde va tu enfoque, fluye tu energía.', author: 'Tony Robbins' },
  { text: 'Es en tus momentos de decisión donde se moldea tu destino.', author: 'Tony Robbins' },
  { text: 'No subes al nivel de tus metas: caes al nivel de tus sistemas.', author: 'James Clear' },

  // ---- Semana 3 (días 15-21): dicotomía del control ----
  { text: 'De las cosas que existen, unas dependen de nosotros y otras no. Ahí empieza toda la filosofía.', author: 'Epicteto' },
  { text: 'Sufre más de lo necesario quien sufre antes de lo necesario.', author: 'Séneca' },
  { text: 'Tienes poder sobre tu mente, no sobre los acontecimientos. Comprende esto y hallarás tu fuerza.', author: 'Marco Aurelio' },
  { text: 'No nos perturban las cosas, sino nuestras opiniones sobre las cosas.', author: 'Epicteto' },
  { text: 'La felicidad de tu vida depende de la calidad de tus pensamientos.', author: 'Marco Aurelio' },
  { text: 'No te insulta quien te golpea o te injuria, sino tu juicio de que eso es un insulto.', author: 'Epicteto' },
  { text: 'En ningún lugar encuentra el hombre retiro más tranquilo que en su propia alma.', author: 'Marco Aurelio' },

  // ---- Semana 4 (días 22-28): calma, silencio e impulsos ----
  { text: 'Tenemos dos oídos y una boca para escuchar el doble de lo que hablamos.', author: 'Zenón de Citio' },
  { text: 'El mejor remedio de la ira es la demora.', author: 'Séneca' },
  { text: 'Sé como el promontorio contra el que rompen las olas: se mantiene firme, y a su alrededor el agua se aquieta.', author: 'Marco Aurelio' },
  { text: 'Impresión: espera un momento. Déjame ver quién eres antes de seguirte.', author: 'Epicteto' },
  { text: 'Cuánto más graves son las consecuencias de la ira que sus causas.', author: 'Marco Aurelio' },
  { text: 'Es más fácil no admitir las pasiones dañinas que gobernarlas una vez dentro.', author: 'Séneca' },
  { text: 'El silencio es una de las respuestas más poderosas que existen.', author: 'Chris Voss' },

  // ---- Semana 5 (días 29-35): decisión, contrato e identidad ----
  { text: 'Primero dite a ti mismo quién quieres ser; luego haz lo que tengas que hacer.', author: 'Epicteto' },
  { text: 'Deja ya de discutir sobre cómo debe ser un hombre bueno: sélo.', author: 'Marco Aurelio' },
  { text: 'Cuando ya no podemos cambiar la situación, el desafío es cambiarnos a nosotros mismos.', author: 'Viktor Frankl' },
  { text: 'Fijar una meta es el primer paso para volver visible lo invisible.', author: 'Tony Robbins' },
  { text: 'El "no" es el principio de la negociación, no su final.', author: 'Chris Voss' },
  { text: 'Ningún viento es favorable para el que no sabe a qué puerto navega.', author: 'Séneca' },
  { text: 'No expliques tu filosofía: encárnala.', author: 'Epicteto' },

  // ---- Semana 6 (días 36-42): identidad en acción y hábito ----
  { text: 'Todo hábito y toda capacidad se confirman y crecen con sus actos correspondientes.', author: 'Epicteto' },
  { text: 'Cada acción que tomas es un voto por el tipo de persona en que te convertirás.', author: 'James Clear' },
  { text: 'Lo que haces repetidamente es lo que eres: la excelencia no es un acto, es un hábito.', author: 'Aristóteles' },
  { text: 'La calidad de tu vida es la calidad de tus preguntas habituales.', author: 'Tony Robbins' },
  { text: 'Haz sin descanso lo que la naturaleza de este momento te exige.', author: 'Marco Aurelio' },
  { text: 'La confianza se construye cumpliendo la palabra que te das a ti mismo.', author: 'Adrià Solà Pastor' },
  { text: 'Mientras esperamos a vivir, la vida pasa.', author: 'Séneca' },

  // ---- Semana 7 (días 43-49): cambio, preguntas y negociación ----
  { text: 'Es más civilizado hacerte la guerra a ti mismo que hacérsela a otro.', author: 'Séneca' },
  { text: 'La pérdida no es más que cambio, y el cambio es el deleite de la naturaleza.', author: 'Marco Aurelio' },
  { text: 'Quien teme preguntar se avergüenza de aprender.', author: 'Proverbio estoico' },
  { text: 'Que la otra parte se sienta escuchada es la concesión más barata y poderosa que puedes hacer.', author: 'Chris Voss' },
  { text: 'A cada impulso, oponle el hábito contrario.', author: 'Epicteto' },
  { text: 'Nada es tan nuestro como el uso que damos a nuestro tiempo.', author: 'Séneca' },
  { text: 'El fuego hace de todo lo que le echan llama y claridad.', author: 'Marco Aurelio' },

  // ---- Semana 8 (días 50-56): verdad, sombra y vulnerabilidad ----
  { text: 'Nada está tan cubierto que no haya de descubrirse, y la verdad es hija del tiempo.', author: 'Séneca' },
  { text: 'Detrás de cada máscara hay un hombre que necesita conexión más de lo que necesita parecer fuerte.', author: 'Lewis Howes' },
  { text: 'Lo que niegas te somete; lo que aceptas te transforma.', author: 'Atribuido a C. G. Jung' },
  { text: 'A veces incluso vivir es un acto de valentía.', author: 'Séneca' },
  { text: 'El sufrimiento deja de serlo, de alguna manera, en el momento en que encuentra un sentido.', author: 'Viktor Frankl' },
  { text: 'Acepta las cosas a las que el destino te ata, y ama a las personas con las que el destino te une.', author: 'Marco Aurelio' },
  { text: 'La vulnerabilidad es el precio de entrada a la conexión.', author: 'Brené Brown' },

  // ---- Semana 9 (días 57-63): coraje, miedo y adversidad ----
  { text: 'No es porque las cosas sean difíciles que no nos atrevemos: es porque no nos atrevemos que son difíciles.', author: 'Séneca' },
  { text: 'Sufrimos más en la imaginación que en la realidad.', author: 'Séneca' },
  { text: 'El impedimento para la acción hace avanzar la acción: lo que se interpone en el camino se convierte en el camino.', author: 'Marco Aurelio' },
  { text: 'Todo lo que quieres está al otro lado del miedo.', author: 'Lewis Howes' },
  { text: 'Considera de antemano las dificultades: así ninguna llegará de sorpresa.', author: 'Séneca' },
  { text: 'Al miedo se le responde con acción; la duda se disuelve haciendo.', author: 'Tony Robbins' },
  { text: 'Un gladiador decide su plan en la arena.', author: 'Séneca' },

  // ---- Semana 10 (días 64-70): propósito, servicio y límites ----
  { text: 'Quien tiene un porqué para vivir puede soportar casi cualquier cómo.', author: 'Nietzsche (citado por Frankl)' },
  { text: 'No preguntes qué esperas de la vida: pregunta qué espera la vida de ti.', author: 'Viktor Frankl' },
  { text: 'Lo que no es útil para la colmena no es útil para la abeja.', author: 'Marco Aurelio' },
  { text: 'El éxito no debe perseguirse: llega como efecto secundario de servir a algo más grande que uno.', author: 'Viktor Frankl' },
  { text: 'Ser claro es ser amable; ser difuso es ser cruel.', author: 'Brené Brown' },
  { text: 'Ningún hombre es libre si no es dueño de sí mismo.', author: 'Epicteto' },
  { text: 'Vive para los demás si quieres vivir para ti.', author: 'Séneca' },

  // ---- Semana 11 (días 71-77): memento mori y amor fati ----
  { text: 'No es que tengamos poco tiempo: es que perdemos mucho.', author: 'Séneca' },
  { text: 'Podrías dejar la vida ahora mismo: deja que eso determine lo que haces, dices y piensas.', author: 'Marco Aurelio' },
  { text: 'Mi fórmula para la grandeza humana es amor fati: no querer que nada sea distinto de como es.', author: 'Nietzsche' },
  { text: 'Haz cada acto de tu vida como si fuera el último.', author: 'Marco Aurelio' },
  { text: 'Empieza a vivir de una vez, y cuenta cada día como una vida entera.', author: 'Séneca' },
  { text: 'La muerte no es lo contrario de la vida: le da forma y precio a cada hora.', author: 'Diario del practicante' },
  { text: 'Lo que la naturaleza trae, la naturaleza se lleva: agradece haberlo tenido en préstamo.', author: 'Séneca' },

  // ---- Semana 12 (días 78-84): entorno, comunidad y conflicto ----
  { text: 'Asóciate con quienes probablemente te mejoren; acoge a quienes tú puedas mejorar.', author: 'Séneca' },
  { text: 'Eres el promedio de las cinco personas con las que más tiempo pasas.', author: 'Jim Rohn' },
  { text: 'La mejor venganza es no ser como tu enemigo.', author: 'Marco Aurelio' },
  { text: 'Los hombres han nacido los unos para los otros: edúcalos o sopórtalos.', author: 'Marco Aurelio' },
  { text: 'Nadie llega solo a la grandeza: se llega en equipo o no se llega.', author: 'Lewis Howes' },
  { text: 'Con quien pases el día, eso aprenderás a ser.', author: 'Epicteto' },
  { text: 'La riqueza no consiste en tener grandes posesiones, sino en tener pocas necesidades.', author: 'Epicteto' },

  // ---- Semana 13 (días 85-90): evaluación, cierre y celebración ----
  { text: 'Cada noche pregúntate: ¿qué debilidad vencí hoy? ¿qué virtud adquirí?', author: 'Séneca' },
  { text: 'La disciplina es destino: lo que haces cada día decide quién llegas a ser.', author: 'Ryan Holiday' },
  { text: 'Aprovecha la tarea de hoy y no dependerás tanto de la de mañana.', author: 'Séneca' },
  { text: 'Mira atrás solo para medir cuánto subiste: la montaña se agradece desde la cima del día.', author: 'Diario del practicante' },
  { text: 'Lo perfecto del carácter es esto: vivir cada día como el último, sin prisa, sin apatía, sin fingir.', author: 'Marco Aurelio' },
  { text: 'Celebra lo que quieres ver más veces: el progreso reconocido es progreso que se repite.', author: 'Lewis Howes' },
]

/**
 * Cita alineada al día del programa (1-90).
 * El arco temático de las citas sigue el arco de los tracks.
 */
export function getQuoteForDay(dayNumber: number): StoicQuote {
  const index = Math.min(Math.max(dayNumber, 1), STOIC_QUOTES.length) - 1
  return STOIC_QUOTES[index]
}

/**
 * Cita del día por fecha (fallback cuando no hay track activo).
 * Rota por el día del año.
 */
export function getTodayQuote(): StoicQuote {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )
  return STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length]
}
