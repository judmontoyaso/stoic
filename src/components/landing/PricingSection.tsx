'use client'

import { useState, useEffect } from 'react'
import { Check, ShieldCheck, Sparkles, CreditCard, Globe } from 'lucide-react'

interface PricingSectionProps {
  onSelectFreeTrial?: () => void
}

export default function PricingSection({ onSelectFreeTrial }: PricingSectionProps) {
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz.includes('Bogota') || tz.includes('America/Bogota') || tz.includes('Colombia')) {
        setCurrency('COP')
      } else {
        setCurrency('USD')
      }
    } catch {
      setCurrency('COP')
    }
  }, [])

  const handleMercadoPagoCheckout = () => {
    window.location.href = '/login'
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      {/* Header Precios */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[11px] font-bold tracking-widest text-[#c9a84c] uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Acceso Completo de Por Vida
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
          Una sola inversión para transformar tu forma de hablar
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-base text-slate-400">
          Comienza gratis los primeros 7 días por correo. Cuando estés listo para dominar el programa completo de 210 prácticas, obtén tu acceso permanente.
        </p>

        {/* Selector de Moneda */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <Globe className="w-4 h-4 text-[#c9a84c]" />
          <span className="text-xs text-slate-400">Moneda preferida:</span>
          <div className="inline-flex rounded-lg border border-slate-800 bg-[#0a0a0f] p-1">
            <button
              type="button"
              onClick={() => setCurrency('COP')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                currency === 'COP'
                  ? 'bg-[#c9a84c] text-[#0a0a0f]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              $199.900 COP (Mercado Pago / PSE)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                currency === 'USD'
                  ? 'bg-[#c9a84c] text-[#0a0a0f]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              $60 USD (Lemon Squeezy / Int.)
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
        {/* Card 1: Prueba Gratis */}
        <div className="rounded-xl border border-slate-800 bg-[#0d0d13] p-7 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">Prueba de 7 Días</h3>
              <p className="text-xs text-slate-500">Secuencia introductoria en tu correo</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-100">$0</span>
              <span className="text-xs text-slate-500">/ 7 días gratis</span>
            </div>
            <ul className="space-y-3 pt-3 text-xs text-slate-400">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                7 lecciones fundamentales escritas para ti
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Ejercicios diarios de comunicación práctica
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Sin tarjeta de crédito requerida
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onSelectFreeTrial}
            className="mt-8 w-full py-3 px-4 rounded-lg border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
          >
            Empezar Gratis Ahora
          </button>
        </div>

        {/* Card 2: Pase de Acceso Completo (Pago Único) */}
        <div className="relative rounded-xl border-2 border-[#c9a84c]/60 bg-[#111118] p-7 flex flex-col justify-between shadow-[0_10px_40px_-15px_rgba(201,168,76,0.25)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#c9a84c] text-[#0a0a0f] text-[10px] font-black uppercase tracking-widest">
            Acceso Vitalicio · Pago Único
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
                <span>Pase de Acceso Completo</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c]">
                  Sin mensualidades
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {currency === 'COP'
                  ? 'Mercado Pago (PSE, Tarjeta de Crédito/Débito, Nequi)'
                  : 'Lemon Squeezy (Tarjeta Internacional / PayPal)'}
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#c9a84c]">
                {currency === 'COP' ? '$199.900' : '$60'}
              </span>
              <span className="text-xs text-slate-400">
                {currency === 'COP' ? 'COP / Pago único' : 'USD / Pago único'}
              </span>
            </div>
            <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Acceso vitalicio a los 3 Tracks (210 prácticas)
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Incluye Track Avanzado: &ldquo;Influencia & Liderazgo&rdquo;
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Sistema de Diagnóstico y Feedback Adaptativo
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Diario nocturno de Séneca + 13 Retos Semanales
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                App PWA instalable en iOS, Android y PC
              </li>
            </ul>
          </div>

          <div className="mt-8 space-y-2">
            {currency === 'COP' ? (
              <button
                type="button"
                onClick={handleMercadoPagoCheckout}
                className="w-full py-3 px-4 rounded-lg bg-[#c9a84c] text-[#0a0a0f] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pagar $199.900 COP con Mercado Pago
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                Pago en USD Próximamente
              </button>
            )}
            <p className="text-[10px] text-center text-slate-500">
              Garantía incondicional de 7 días. Pago cifrado seguro.
            </p>
          </div>
        </div>
      </div>

      {/* Nota de Seguridad & Garantía */}
      <div className="rounded-lg border border-slate-800 bg-[#0d0d13] p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#c9a84c] shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-200">Garantía Incondicional de 7 Días</p>
            <p className="text-[11px] text-slate-400">Prueba el programa sin riesgo. Si no cumple tus expectativas, solicitas el reembolso total.</p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Pagos procesados de forma cifrada con Mercado Pago (COP) y Lemon Squeezy (USD).
        </div>
      </div>
    </div>
  )
}
