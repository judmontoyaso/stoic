// ============================================================
// Stoic Quotes - Rotated daily
// ============================================================

export interface StoicQuote {
  text: string
  author: string
  original?: string
}

export const STOIC_QUOTES: StoicQuote[] = [
  {
    text: 'No pretendas que las cosas ocurran como tu quieres. Desea, mas bien, que se produzcan tal como se producen, y seras feliz.',
    author: 'Epicteto',
  },
  {
    text: 'Todo habito y capacidad se confirma y crece con las acciones correspondientes. Si quieres hacer algo, hazlo un habito.',
    author: 'Epicteto',
  },
  {
    text: 'Aprovecha la tarea de hoy, y no dependeras tanto de la de manana. Mientras posponemos, la vida pasa.',
    author: 'Seneca',
  },
  {
    text: 'Ves que pocas cosas necesitas para vivir una vida satisfactoria y reverente?',
    author: 'Marco Aurelio',
  },
  {
    text: 'Adopta nuevos habitos... consolida tus principios poniendolos en practica.',
    author: 'Epicteto',
  },
  {
    text: 'La felicidad de tu vida depende de la calidad de tus pensamientos.',
    author: 'Marco Aurelio',
  },
  {
    text: 'No es que tengamos poco tiempo, sino que perdemos mucho.',
    author: 'Seneca',
  },
  {
    text: 'El impedimento para la accion hace avanzar la accion. Lo que se interpone en el camino se convierte en el camino.',
    author: 'Marco Aurelio',
  },
  {
    text: 'Las dificultades fortalecen la mente, como el trabajo fortalece el cuerpo.',
    author: 'Seneca',
  },
  {
    text: 'Primero di lo que serias, y luego haz lo que tengas que hacer.',
    author: 'Epicteto',
  },
  {
    text: 'Si un hombre no sabe a que puerto navega, ningun viento le es favorable.',
    author: 'Seneca',
  },
  {
    text: 'Cuando te levantes por la manana, piensa en el precioso privilegio de estar vivo: respirar, pensar, disfrutar, amar.',
    author: 'Marco Aurelio',
  },
  {
    text: 'No somos afectados por los eventos, sino por nuestra interpretacion de ellos.',
    author: 'Epicteto',
  },
  {
    text: 'La riqueza consiste no en tener grandes posesiones, sino en tener pocas necesidades.',
    author: 'Epicteto',
  },
  {
    text: 'Cada noche antes de dormir, debemos preguntarnos: que debilidad he vencido hoy? Que virtud he adquirido?',
    author: 'Seneca',
  },
  {
    text: 'Haz cada acto de tu vida como si fuera el ultimo.',
    author: 'Marco Aurelio',
  },
  {
    text: 'Lo que nos perturba no son las cosas, sino la opinion que tenemos de ellas.',
    author: 'Epicteto',
  },
  {
    text: 'Es mas civilizado hacerte a ti mismo la guerra que hacersela a otro.',
    author: 'Seneca',
  },
  {
    text: 'La mejor venganza es no ser como tu enemigo.',
    author: 'Marco Aurelio',
  },
  {
    text: 'No expliques tu filosofia. Encarnala.',
    author: 'Epicteto',
  },
  {
    text: 'Mientras esperamos a vivir, la vida pasa.',
    author: 'Seneca',
  },
  {
    text: 'Desecha tus opiniones y seras salvado. Quien te impide desecharlas?',
    author: 'Marco Aurelio',
  },
  {
    text: 'Solo el educado es libre.',
    author: 'Epicteto',
  },
  {
    text: 'No es porque las cosas sean dificiles que no nos atrevemos, es porque no nos atrevemos que son dificiles.',
    author: 'Seneca',
  },
  {
    text: 'La perdida no es nada mas que un cambio, y el cambio es el deleite de la naturaleza.',
    author: 'Marco Aurelio',
  },
  {
    text: 'Circunstancias no hacen al hombre, lo revelan a el mismo.',
    author: 'Epicteto',
  },
  {
    text: 'Asociate con personas que probablemente te mejoren.',
    author: 'Seneca',
  },
  {
    text: 'Piensa en todas las cosas buenas de tu vida. Nunca pienses en los infortunios.',
    author: 'Marco Aurelio',
  },
  {
    text: 'Si quieres mejorar, acepta ser visto como ignorante o estupido.',
    author: 'Epicteto',
  },
  {
    text: 'La suerte es lo que sucede cuando la preparacion se encuentra con la oportunidad.',
    author: 'Seneca',
  },
]

/**
 * Get the quote for today based on the day of the year.
 * Rotates through all quotes over the course of a month.
 */
export function getTodayQuote(): StoicQuote {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )
  return STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length]
}
