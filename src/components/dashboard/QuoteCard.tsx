import type { StoicQuote } from '@/lib/quotes'

/** Cita estoica del día con el estilo dorado del dashboard */
export default function QuoteCard({ quote }: { quote: StoicQuote }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] border border-[#c9a84c]/20 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <i className="pi pi-bookmark text-[#c9a84c]" />
          <span className="text-xs uppercase tracking-widest text-[#c9a84c] font-medium">Reflexión del día</span>
        </div>
        <p className="text-slate-200 text-lg italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[#c9a84c] mt-3 text-sm font-medium">
          — {quote.author}
        </p>
      </div>
    </div>
  )
}
