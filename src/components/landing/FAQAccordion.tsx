'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQS } from '@/data/faqs'

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
