import { copLabel, usdLabel } from '@/lib/pricing'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQS: FAQItem[] = [
  {
    question: '¿Qué incluye exactamente el programa StoiCom?',
    answer:
      'StoiCom incluye acceso vitalicio a 3 tracks de entrenamiento (210 ejercicios prácticos en total): 1) Comunicación Interpersonal (90 días), 2) Maestría Interna & Diario Estoico (90 días), y 3) Influencia & Liderazgo (30 días). Además, cuenta con evaluación diagnóstica de competencias, 13 retos semanales, tracker de hábitos estoicos y el diario de autorreflexión de Séneca.',
  },
  {
    question: '¿Cómo mido si de verdad estoy mejorando?',
    answer:
      'Con evidencia tuya, no con un puntaje. El día 1 te grabas tres minutos hablando y anotas tus métricas: muletillas, palabras por minuto, nivel de nervios. El día 86 repites la grabación y las comparas. En medio, cada domingo recibes tu resumen: días cumplidos, días perdidos, tu racha real y el ánimo medio de tu diario. El día perdido se marca y se queda marcado; el calendario nunca se reorganiza para que te sientas mejor.',
  },
  {
    question: '¿Qué es la combinación de Estoicismo con Psicología de Alto Rendimiento?',
    answer:
      'El estoicismo clásico (Séneca, Marco Aurelio, Epicteto) pone la disciplina; Robbins, Voss y Holiday ponen las técnicas con nombre: la Tríada, el condicionamiento neuro-asociativo, el vocabulario transformacional, la redefinición del marco, el etiquetado emocional. Cada día del programa dice de qué autor y de qué técnica sale, y termina en algo que ejecutas hoy, no en teoría.',
  },
  {
    question: '¿Necesito instalar alguna app desde App Store o Google Play?',
    answer:
      'StoiCom es una Progressive Web App (PWA) de última generación. Puedes usarla directamente en cualquier navegador o instalarla con un solo toque en la pantalla de inicio de tu iPhone, Android o computadora, recibiendo notificaciones a tu hora preferida.',
  },
  {
    question: '¿Cuánto tiempo debo dedicarle al entrenamiento cada día?',
    answer:
      'Aproximadamente 10 a 15 minutos al día. 5 minutos en la mañana para leer la lección y entender el ejercicio, ejecución práctica durante tu día real, y 5 a 10 minutos en la noche para el examen nocturno de autorreflexión.',
  },
  {
    question: '¿Cuáles son los métodos y precios de pago?',
    answer:
      `Puedes comenzar gratis los primeros 7 días por correo. Para el acceso completo de por vida, ofrecemos un pago único de ${copLabel} COP vía Mercado Pago (PSE, tarjeta de crédito/débito, Nequi) o ${usdLabel} USD vía Lemon Squeezy para pagos internacionales. Todos los accesos incluyen 7 días de garantía incondicional de devolución.`,
  },
]
