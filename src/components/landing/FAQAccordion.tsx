'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQS: FAQItem[] = [
  {
    question: '¿Qué incluye exactamente el programa StoiCom?',
    answer:
      'StoiCom incluye 3 tracks de entrenamiento (210 ejercicios prácticos en total): 1) Comunicación Interpersonal (90 días), 2) Maestría Interna & Diario Estoico (90 días), y 3) Influencia & Liderazgo (30 días). Además, cuenta con evaluación inicial de competencias con IA, 13 retos semanales, tracker de hábitos estoicos y diarios guiados de mañana y noche.',
  },
  {
    question: '¿Cómo funciona la Inteligencia Artificial en StoiCom?',
    answer:
      'La IA (impulsada por modelos avanzados) actúa como tu mentor estoico. Evalúa tus respuestas iniciales para diagnosticar tus fortalezas y áreas de mejora en comunicación, analiza tus reflexiones en el diario nocturno y genera lecturas/insights personalizados ajustados a tu progreso real.',
  },
  {
    question: '¿Qué es la combinación de Estoicismo con Psicología de Alto Rendimiento?',
    answer:
      'Unimos la sabiduría estoica clásica (Séneca, Marco Aurelio, Epicteto) con frameworks científicos de psicología moderna y PNL (Tríada Emocional, Condicionamiento Neuro-Asociativo NAC, Vocabulario Transformacional y Reencuadre de Marcos). Esto garantiza que las lecciones no se queden en teoría, sino en cambios viscerales de conducta.',
  },
  {
    question: '¿Necesito instalar alguna app desde App Store o Google Play?',
    answer:
      'StoiCom es una Progressive Web App (PWA) de última generación. Puedes usarla directamente en cualquier navegador o instalarla con un solo toque en la pantalla de inicio de tu iPhone, Android o computadora, funcionando incluso sin conexión fluida y recibiendo notificaciones Web Push a tu hora preferida.',
  },
  {
    question: '¿Cuánto tiempo debo dedicarle al entrenamiento cada día?',
    answer:
      'Aproximadamente 10 a 15 minutos al día. 5 minutos en la mañana para leer la lección y entender el ejercicio, ejecución práctica durante tu día real, y 5 a 10 minutos en la noche para el examen nocturno de autorreflexión.',
  },
  {
    question: '¿Cómo funcionan los 7 días gratis y las opciones de pago?',
    answer:
      'Puedes comenzar inmediatamente los primeros 7 días del programa sin costo recibiendo las lecciones en tu correo electrónico sin ingresar tarjeta. Cuando la pasarela (Lemon Squeezy / Mercado Pago) esté habilitada, podrás desbloquear la plataforma completa mediante suscripción mensual ($4.99 USD), anual ($29.99 USD) o Pase Fundador vitalicio ($59 USD). Todos los planes de pago incluyen garantía incondicional de devolución de 7 días.',
  },
]

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className="rounded-lg border border-slate-800/80 bg-[#0d0d13] overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-slate-100">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-[#c9a84c] shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-slate-400 border-t border-slate-800/40">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
