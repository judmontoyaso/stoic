'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

export const FAQS: FAQItem[] = [
  {
    question: '¿Necesito conocimientos previos de estoicismo o filosofía?',
    answer:
      'No. StoiCom está diseñado de forma práctica y progresiva. Cada lección explica los principios de Marco Aurelio, Séneca o Epicteto aplicados a la vida real y la comunicación cotidiana, sin lenguaje académico ni rodeos.',
  },
  {
    question: '¿Cuánto tiempo debo dedicarle al entrenamiento cada día?',
    answer:
      'Aproximadamente 10 a 15 minutos al día. 5 minutos en la mañana para leer la lección y entender el ejercicio, ejecución práctica durante tu día real, y 5 a 10 minutos en la noche para el examen de autorreflexión.',
  },
  {
    question: '¿Cómo funcionan los 7 días gratis por correo?',
    answer:
      'Al suscribirte con tu email, recibirás inmediatamente el Día 1 del programa en tu bandeja de entrada y una lección nueva cada día durante 7 días. No requerimos tarjeta de crédito para iniciar la prueba.',
  },
  {
    question: '¿Qué diferencia hay entre StoiCom y un curso tradicional de comunicación?',
    answer:
      'Los cursos tradicionales enseñan teoría en video que se olvida al cerrar la pestaña. StoiCom es un sistema de entrenamiento activo de 90 días con fechas reales: un ejercicio concreto al día, seguimiento de racha sin trampas y diario con examen nocturno.',
  },
  {
    question: '¿Qué sucede si un día no puedo realizar el ejercicio?',
    answer:
      'La app registra los días perdidos de forma transparente. La filosofía estoica enfatiza la honestidad y la disciplina sin autoengaño. Si fallas un día, la app te permite continuar sin reorganizar el calendario para darte consuelo ficticio.',
  },
  {
    question: '¿Cómo podré adquirir el acceso completo cuando esté disponible?',
    answer:
      'Próximamente habilitaremos el pago directo con tarjeta de crédito/débito internacional vía Lemon Squeezy y métodos locales (PSE/Nequi) vía Mercado Pago. Mientras tanto, puedes disfrutar de la prueba de 7 días sin costo.',
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
