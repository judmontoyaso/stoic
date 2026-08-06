'use client'

import { useState, useEffect } from 'react'
import { Check, ShieldCheck, Sparkles, CreditCard, Globe, CalendarClock } from 'lucide-react'
import { copLabel, usdLabel } from '@/lib/pricing'

interface PricingSectionProps {
  onSelectFreeTrial?: () => void
}

export default function PricingSection({ onSelectFreeTrial }: PricingSectionProps) {
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')

  useEffect(() => {
    // COP para toda América: Mercado Pago es la única puerta que cobra
    // hoy (el botón en USD está inactivo hasta que Lemon Squeezy
    // verifique). Con el filtro anterior, solo Colombia veía la opción
    // pagable y un visitante de México se quedaba sin ninguna. Su tarjeta
    // convierte de COP sin problema.
    let moneda: 'COP' | 'USD' = 'COP'
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (!tz.startsWith('America/')) moneda = 'USD'
    } catch {
      // Sin zona horaria: se queda en COP, la que sí cobra
    }
    // La zona horaria solo existe en el cliente: hay que fijarla al montar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrency(moneda)
  }, [])

  const handleMercadoPagoCheckout = () => {
    window.location.href = '/login'
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      {/* Header Precios */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[11px] font-bold tracking-widest text-[#c9a84c] uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Acceso completo · Un año
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
          Doce meses de entrenamiento. Un solo pago.
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-base text-slate-300">
          Empiezas gratis con los siete primeros días por correo. Cuando quieras el programa entero, pagas una vez y tienes un año. No es suscripción: no se te cobra solo.
        </p>

        {/* Selector de Moneda */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <Globe className="w-4 h-4 text-[#c9a84c]" />
          <span className="text-sm text-slate-300">Moneda preferida:</span>
          <div className="inline-flex rounded-lg border border-slate-800 bg-[#101017] p-1">
            <button
              type="button"
              onClick={() => setCurrency('COP')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                currency === 'COP'
                  ? 'bg-[#c9a84c] text-[#0a0a0f]'
                  : 'text-slate-300 hover:text-slate-200'
              }`}
            >
              {copLabel} COP (Mercado Pago / PSE)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                currency === 'USD'
                  ? 'bg-[#c9a84c] text-[#0a0a0f]'
                  : 'text-slate-300 hover:text-slate-200'
              }`}
            >
              {usdLabel} USD (Lemon Squeezy / Int.)
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
        {/* Card 1: Prueba Gratis */}
        <div className="rounded-xl border border-slate-800 bg-[#16161d] p-7 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">Prueba de 7 Días</h3>
              <p className="text-xs text-slate-400">Secuencia introductoria en tu correo</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-100">$0</span>
              <span className="text-xs text-slate-400">/ 7 días gratis</span>
            </div>
            <ul className="space-y-3 pt-3 text-sm text-slate-300">
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
            Un año · Pago único
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
                <span>Acceso Completo</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c]">
                  Sin suscripción
                </span>
              </h3>
              <p className="text-sm text-slate-300">
                {currency === 'COP'
                  ? 'Mercado Pago (PSE, Tarjeta de Crédito/Débito, Nequi)'
                  : 'Lemon Squeezy (Tarjeta Internacional / PayPal)'}
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#c9a84c]">
                {currency === 'COP' ? copLabel : usdLabel}
              </span>
              <span className="text-sm text-slate-300">
                {currency === 'COP' ? 'COP / un año' : 'USD / un año'}
              </span>
            </div>
            <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Los 3 tracks completos: 210 prácticas, doce meses
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Incluye el track avanzado: &ldquo;Influencia y Liderazgo&rdquo;
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Resumen semanal y evaluación de tu progreso real
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                Diario nocturno de Séneca y 13 retos semanales
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                App instalable en iOS, Android y PC
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#c9a84c]">Renuevas siempre a este precio.</strong> Para
                  quien entre después, sube.
                </span>
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
                Pagar {copLabel} COP con Mercado Pago
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                Pago en USD Próximamente
              </button>
            )}
            <p className="text-[10px] text-center text-slate-400">
              Garantía incondicional de 7 días. Pago cifrado seguro.
            </p>
          </div>
        </div>
      </div>

      {/* Qué pasa cuando se acaba el año.
          Va aquí arriba, junto al precio, y no enterrado en los términos:
          es la pregunta que cualquiera se hace antes de pagar, y
          contestarla de frente vende más que esconderla. */}
      <div className="max-w-3xl mx-auto rounded-lg border border-[#c9a84c]/25 bg-[#16161d] p-6">
        <div className="flex items-start gap-3">
          <CalendarClock className="w-6 h-6 text-[#c9a84c] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Qué pasa cuando se acaba el año
            </p>
            <p className="text-[15px] leading-relaxed text-slate-300">
              Te avisamos cuatro veces antes de que venza. Si renuevas, sigues donde ibas y pagas
              lo mismo que pagaste hoy. Si no renuevas, tienes 30 días para descargar tu diario
              completo y llevártelo en un archivo tuyo. Pasado ese mes lo borramos, y volver a
              pagar más tarde no lo recupera.
            </p>
            <p className="text-[15px] leading-relaxed text-slate-300">
              Lo decimos aquí y no en la letra pequeña porque es tu decisión, no una trampa.
            </p>
          </div>
        </div>
      </div>

      {/* Para quién NO es. Rechazar clientes en voz alta es la señal de
          autoridad más barata que existe, y filtra los reembolsos. */}
      <div className="max-w-3xl mx-auto rounded-lg border border-slate-800 bg-[#16161d] p-6">
        <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Esto no es para ti si
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
          Buscas frases para publicar en redes. Quieres resultados sin grabarte y sin escribir
          nada. Esperas que una app te dé la disciplina que no tienes. El día 1 es grabarte tres
          minutos hablando y verte entero, sin saltar. La mayoría lo odia. Es exactamente el punto.
        </p>
      </div>

      {/* Nota de Seguridad y Garantía */}
      <div className="rounded-lg border border-slate-800 bg-[#16161d] p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#c9a84c] shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-200">Garantía incondicional de 7 días</p>
            <p className="text-[11px] text-slate-300">Si no es lo que esperabas, escribes y te devolvemos todo. Sin preguntas.</p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Pagos procesados de forma cifrada con Mercado Pago (COP) y Lemon Squeezy (USD).
        </div>
      </div>
    </div>
  )
}
