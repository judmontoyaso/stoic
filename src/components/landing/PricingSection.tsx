'use client'

import { useState } from 'react'
import { Check, ShieldCheck, Sparkles, Lock, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface PricingSectionProps {
  onSelectFreeTrial?: () => void
}

export default function PricingSection({ onSelectFreeTrial }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  const handleCheckoutClick = (planName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-1 text-xs">
        <span className="font-bold text-[#c9a84c] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Verificación de pasarela en proceso
        </span>
        <span>
          La integración con Lemon Squeezy para el plan <strong>{planName}</strong> está lista en el sistema. Los pagos se activarán apenas concluya la verificación de la cuenta.
        </span>
        <button
          onClick={() => {
            toast.dismiss(t.id)
            if (onSelectFreeTrial) onSelectFreeTrial()
          }}
          className="mt-2 text-left underline font-semibold text-slate-200 hover:text-white"
        >
          Prueba los 7 días gratis mientras tanto →
        </button>
      </div>
    ), {
      duration: 6000,
      style: {
        background: '#111116',
        color: '#e2e8f0',
        border: '1px solid rgba(201, 168, 76, 0.4)',
      },
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Header Precios */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[11px] font-bold tracking-widest text-[#c9a84c] uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Transparente y sin contratos
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
          Invierte en tu forma de comunicar
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-base text-slate-400">
          Comienza gratis 7 días por correo. Cuando quieras el sistema completo de 90 días con diario e IA, elige el plan que mejor se adapte a ti.
        </p>

        {/* Toggle Mensual / Anual */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-100' : 'text-slate-500'}`}>
            Pago Mensual
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-800 transition-colors duration-200 ease-in-out focus:outline-none"
            role="switch"
            aria-checked={billingCycle === 'yearly'}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#c9a84c] shadow-lg ring-0 transition duration-200 ease-in-out ${
                billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-100' : 'text-slate-500'}`}>
            Pago Anual <span className="px-2 py-0.5 rounded text-[10px] bg-[#c9a84c]/20 text-[#c9a84c] font-bold">Ahorra 50%</span>
          </span>
        </div>
      </div>

      {/* Grid de Tarjetas de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Card 1: Prueba Gratis */}
        <div className="rounded-xl border border-slate-800 bg-[#0d0d13] p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">Prueba de 7 Días</h3>
              <p className="text-xs text-slate-500">Secuencia introductoria en tu correo</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-100">$0</span>
              <span className="text-xs text-slate-500">/ 7 días</span>
            </div>
            <ul className="space-y-2.5 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                1 lección diaria en tu correo durante 7 días
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Ejercicios reales de comunicación estoica
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Sin necesidad de ingresar tarjeta de crédito
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onSelectFreeTrial}
            className="mt-6 w-full py-2.5 px-4 rounded-lg border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
          >
            Empezar Gratis Ahora
          </button>
        </div>

        {/* Card 2: Plan Suscripción (Mensual / Anual) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d0d13] p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">
                {billingCycle === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}
              </h3>
              <p className="text-xs text-slate-500">Acceso completo a la plataforma web & PWA</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-100">
                {billingCycle === 'yearly' ? '$29.99' : '$4.99'}
              </span>
              <span className="text-xs text-slate-500">
                USD / {billingCycle === 'yearly' ? 'año' : 'mes'}
              </span>
            </div>
            <ul className="space-y-2.5 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Programa completo de 90 días (2 tracks)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Diario estoico con examen nocturno
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Coaching e historial impulsado por IA
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Notificaciones web push y personalización
              </li>
            </ul>
          </div>
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleCheckoutClick(billingCycle === 'yearly' ? 'Anual ($29.99)' : 'Mensual ($4.99)')}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-750 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#c9a84c]" />
              Suscribirse con Lemon Squeezy
            </button>
            <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#c9a84c]" /> Verificación de pasarela en proceso
            </p>
          </div>
        </div>

        {/* Card 3: Pase Fundador Lifetime (Destacado) */}
        <div className="relative rounded-xl border-2 border-[#c9a84c]/60 bg-[#111118] p-6 flex flex-col justify-between shadow-[0_10px_40px_-15px_rgba(201,168,76,0.25)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#c9a84c] text-[#0a0a0f] text-[10px] font-black uppercase tracking-widest">
            Edición Fundador · Pago Único
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
                <span>Pase Fundador</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c]">Por Vida</span>
              </h3>
              <p className="text-xs text-slate-400">Limitado a los primeros 100 usuarios</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#c9a84c]">$59</span>
              <span className="text-xs text-slate-400">USD / de por vida</span>
            </div>
            <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Acceso vitalicio a todos los 90 días
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Incluye temporada avanzada &ldquo;Influencia&rdquo; (30 días)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Todas las futuras actualizaciones y módulos sin cargos extra
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Insignia exclusiva de Fundador en tu perfil
              </li>
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleCheckoutClick('Fundador Lifetime ($59)')}
              className="w-full py-3 px-4 rounded-lg bg-[#c9a84c] text-[#0a0a0f] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Obtener Pase Fundador
            </button>
            <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#c9a84c]" /> Verificación Lemon Squeezy pendiente
            </p>
          </div>
        </div>

      </div>

      {/* Nota de Seguridad & Garantía */}
      <div className="rounded-lg border border-slate-800 bg-[#0d0d13] p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#c9a84c] shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-200">Garantía Incondicional de 7 Días</p>
            <p className="text-[11px] text-slate-400">Si el programa no satisface tus expectativas, solicitas el reembolso total sin preguntas.</p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Procesamiento de pago cifrado SSL vía Lemon Squeezy (Merchant of Record).
        </div>
      </div>
    </div>
  )
}
