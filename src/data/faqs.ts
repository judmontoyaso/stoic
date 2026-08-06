import { copLabel, usdLabel } from '@/lib/pricing'

export interface FAQItem {
  question: string
  answer: string
}

// Estas preguntas alimentan DOS cosas: el acordeón de la landing y el
// bloque FAQPage del JSON-LD. Por eso están escritas con forma de
// búsqueda real y no de folleto.
//
// Criterio para redactarlas:
//   · La pregunta se escribe como la teclea alguien en Google, en
//     español y en segunda persona ("¿Cómo dejo de...?").
//   · La respuesta CONTESTA en la primera frase. Un fragmento destacado
//     se arma con las primeras 40-50 palabras: si la primera frase es
//     preámbulo, Google no tiene qué mostrar.
//   · Se responde de verdad, aunque la respuesta no venda. La que solo
//     empuja a comprar no gana nada y se nota.
//
// Las cinco primeras apuntan a búsquedas por síntoma (competencia baja,
// intención alta); las últimas son de producto, para quien ya llegó.
export const FAQS: FAQItem[] = [
  {
    question: '¿Cómo dejo de decir muletillas al hablar?',
    answer:
      'Grábate tres minutos hablando de cualquier tema y cuenta cuántas veces dices tu muletilla. Ese número es tu línea base y casi siempre sorprende. Después sustituye la muletilla por silencio: cuando sientas venir el "este", "o sea" o "eh", cierra la boca dos segundos. La muletilla existe para rellenar el hueco mientras piensas, así que la única forma de quitarla es aprender a tolerar ese hueco. Repite la grabación cada semana y compara los números. En StoiCom ese es el ejercicio del día 1 y se vuelve a medir el día 86.',
  },
  {
    question: '¿Por qué me tiembla la voz cuando hablo en público?',
    answer:
      'Te tiembla porque respiras alto y corto: la tensión sube el diafragma, el aire llega justo y las cuerdas vocales trabajan sin apoyo. No es falta de carácter ni de preparación. Se corrige antes de hablar, no durante: respira por la nariz llevando el aire al abdomen, exhala más lento de lo que inhalas, y haz la primera frase corta y ya decidida de memoria. El temblor aparece casi siempre en los primeros quince segundos; si sobrevives a esos, el cuerpo se regula solo.',
  },
  {
    question: '¿Cómo se hace el examen nocturno de Séneca?',
    answer:
      'Séneca lo describe en "Sobre la ira": al final del día repasaba su jornada y se preguntaba qué mal había curado, contra qué defecto había luchado y en qué era mejor. Se hace por escrito, sin público y sin adornarlo. En la práctica son tres preguntas antes de dormir: qué hiciste bien, qué harías distinto y qué aprendiste. La clave es la constancia y la honestidad, no la extensión: cinco líneas sinceras valen más que una página bonita. StoiCom lo trae como plantilla del diario, con recordatorio a la hora que elijas.',
  },
  {
    question: '¿El estoicismo sirve de verdad para comunicarse mejor?',
    answer:
      'Sí, y no por las frases célebres. Sirve por la dicotomía del control: en una conversación no controlas lo que el otro entiende, solo lo que dices y cómo lo dices. Esa distinción quita la ansiedad de tener que convencer, que es justo lo que hace hablar rápido, interrumpir y sobrejustificarse. Además, la terapia cognitivo-conductual moderna salió en buena parte de ahí, así que el mecanismo está estudiado. Lo que no sirve es leer a Marco Aurelio sin ejecutar nada: hay que practicarlo en conversaciones reales.',
  },
  {
    question: '¿Hay alguna app de diario estoico en español?',
    answer:
      'Sí. La mayoría de aplicaciones de estoicismo están en inglés y son colecciones de citas con un espacio para escribir. StoiCom está escrita en español de LatAm y funciona al revés: es un programa con fecha real, un ejercicio concreto al día y una lección escrita para ese día, con el diario y el examen nocturno de Séneca dentro. Se instala desde el navegador en iPhone, Android o computador, sin pasar por App Store ni Google Play.',
  },
  {
    question: '¿Qué incluye exactamente el programa StoiCom?',
    answer:
      'Un año de acceso a los 3 tracks de entrenamiento (210 ejercicios prácticos en total): 1) Comunicación Interpersonal (90 días), 2) Maestría Interna y Diario Estoico (90 días), y 3) Influencia y Liderazgo (30 días). Incluye la evaluación diagnóstica de competencias, 13 retos semanales, el tracker de hábitos estoicos y el diario de autorreflexión de Séneca.',
  },
  {
    question: '¿Puedo dictar el diario en vez de escribirlo?',
    answer:
      'Sí. Cada campo del diario tiene un botón de dictado: hablas y el texto aparece transcrito, con puntuación. Está pensado para la noche, que es cuando escribir cuesta más y es justo cuando toca el examen nocturno. El dictado es opcional y está apagado hasta que lo autorices de forma expresa, porque la grabación se manda a un servicio de transcripción externo. Si prefieres no usarlo, escribes a mano y no pierdes ninguna función.',
  },
  {
    question: '¿La app analiza lo que escribo en el diario?',
    answer:
      'Solo si lo pides. Una vez al mes puedes generar una lectura de tu diario: te devuelve el patrón que más se repite, la contradicción entre cómo empezaste y cómo terminaste el mes, lo que estás evitando y lo que mejoró de verdad. Cita tus propias frases con su fecha, para que puedas verificar cada afirmación. No se genera sola, no es un diagnóstico clínico y no reemplaza a un profesional de la salud mental.',
  },
  {
    question: '¿Cómo mido si de verdad estoy mejorando?',
    answer:
      'Con evidencia tuya, no con un puntaje. El día 1 te grabas tres minutos hablando y anotas tus métricas: muletillas, palabras por minuto, nivel de nervios. El día 86 repites la grabación y las comparas. En medio, cada domingo recibes tu resumen: días cumplidos, días perdidos, tu racha real y el ánimo medio de tu diario. El día perdido se marca y se queda marcado; el calendario nunca se reorganiza para que te sientas mejor.',
  },
  {
    question: '¿Cuánto tiempo debo dedicarle al entrenamiento cada día?',
    answer:
      'Entre 10 y 15 minutos al día. Cinco minutos en la mañana para leer la lección y entender el ejercicio, la ejecución práctica durante tu día real —que no cuesta tiempo extra, porque son conversaciones que ibas a tener igual— y de cinco a diez minutos en la noche para el examen nocturno.',
  },
  {
    question: '¿Qué es la combinación de estoicismo con psicología de alto rendimiento?',
    answer:
      'El estoicismo clásico (Séneca, Marco Aurelio, Epicteto) pone la disciplina; Robbins, Voss y Holiday ponen las técnicas con nombre: la Tríada, el condicionamiento neuro-asociativo, el vocabulario transformacional, la redefinición del marco, el etiquetado emocional. Cada día del programa dice de qué autor y de qué técnica sale, y termina en algo que ejecutas hoy, no en teoría.',
  },
  {
    question: '¿Necesito instalar la app desde App Store o Google Play?',
    answer:
      'No. StoiCom es una aplicación web progresiva (PWA): la usas en cualquier navegador o la instalas con un toque en la pantalla de inicio de tu iPhone, Android o computador. Recibe notificaciones a la hora que elijas igual que una app nativa, y no ocupa el espacio de una descarga.',
  },
  {
    question: '¿Cuáles son los métodos y precios de pago?',
    answer:
      `Empiezas gratis con los primeros 7 días por correo. El acceso completo es un pago único de ${copLabel} COP vía Mercado Pago (PSE, tarjeta de crédito/débito, Nequi) o ${usdLabel} USD vía Lemon Squeezy para pagos internacionales, y te da un año de programa. No es suscripción: no se te cobra solo ni tienes que cancelar nada. Incluye 7 días de garantía incondicional de devolución.`,
  },
  {
    question: '¿Qué pasa cuando se acaba el año?',
    answer:
      'Te avisamos cuatro veces antes de que venza. Si renuevas, sigues exactamente donde ibas y pagas el mismo precio que pagaste la primera vez: tu precio queda congelado mientras no dejes vencer el acceso, aunque suba para quien entre después. Si no renuevas, tienes 30 días para descargar tu diario completo en un archivo tuyo, gratis y sin dar explicaciones. Pasado ese mes borramos el contenido personal (diario, reflexiones y registro de días) y ese borrado es definitivo: volver a pagar más adelante no lo recupera. Tu cuenta y tu correo se conservan, así que si vuelves entras con el mismo acceso y empiezas de nuevo en el día 1.',
  },
]
