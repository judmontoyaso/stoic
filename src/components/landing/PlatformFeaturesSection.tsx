'use client'

import React from 'react'
import { motion } from 'framer-motion'
import SpotlightCard from './SpotlightCard'
import {
  Layers,
  CheckCircle2,
  Smartphone,
  CalendarCheck,
  Sparkles,
  Shield,
  UserCheck,
} from 'lucide-react'

interface PlatformFeaturesSectionProps {
  cinzelClassName?: string
}

const GOLD = '#c9a84c'

const PLATFORM_ITEMS = [
  {
    icon: <Layers className="w-5 h-5 text-[#c9a84c]" />,
    title: '13 Retos Semanales',
    body: 'Desafíos de campo cada 7 días con entregables concretos para llevar la práctica al mundo real.',
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-[#c9a84c]" />,
    title: 'Tracker de Hábitos Estoicos',
    body: 'Monitoreo diario de hábitos clave: duchas frías, silencio consciente, ayuno de quejas.',
  },
  {
    icon: <Smartphone className="w-5 h-5 text-[#c9a84c]" />,
    title: 'PWA Multi-dispositivo',
    body: 'Instálala en iPhone, Android o PC. Funciona de manera fluida como una app nativa.',
  },
  {
    icon: <CalendarCheck className="w-5 h-5 text-[#c9a84c]" />,
    title: 'Calendario Honesto',
    body: 'Seguimiento de racha y días perdidos sin trampas. El calendario no miente para consolarte.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-[#c9a84c]" />,
    title: 'Horario Personalizado',
    body: 'Correos matutinos y notificaciones push a la hora exacta que elijas y en tu zona horaria.',
  },
  {
    icon: <Shield className="w-5 h-5 text-[#c9a84c]" />,
    title: 'Gráfico de Estados de Ánimo',
    body: 'Registra y analiza tu nivel de claridad y calma a lo largo de las 12 semanas del programa.',
  },
]

export default function PlatformFeaturesSection({ cinzelClassName = '' }: PlatformFeaturesSectionProps) {
  return (
    <div>
      {/* 1. Evaluación & Diagnóstico Personalizado */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className={`${cinzelClassName} text-[11px] tracking-[0.35em] uppercase text-[#c9a84c]`}>
              Medición honesta
            </p>
            <h2 className={`${cinzelClassName} text-2xl md:text-3xl text-slate-100 leading-snug font-semibold`}>
              La prueba la das tú
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Nada de puntajes inventados. Tu avance se mide con lo que grabas, lo que escribes y los días que cumpliste:
            </p>
            <ul className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Día 1 contra día 86:</strong> te grabas tres minutos el primer día. Vuelves a grabarte al final. Esa comparación es la prueba, y es tuya.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Resumen semanal:</strong> cada domingo recibes tus días cumplidos, los perdidos, tu racha real y el ánimo medio de tu diario.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Sin rachas infladas:</strong> el día perdido se marca y se queda marcado. El calendario nunca se reorganiza para hacerte sentir bien.
                </span>
              </li>
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard
              className="p-7 space-y-4 border-[#c9a84c]/30 shadow-[0_16px_50px_-15px_rgba(201,168,76,0.14)]"
              spotlightColor="rgba(201, 168, 76, 0.15)"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[#c9a84c]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  El consejo de cada mañana
                </span>
              </div>
              <div className="text-xs leading-relaxed text-slate-400 space-y-3">
                <p className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 italic leading-relaxed">
                  &ldquo;Hoy bajas el ritmo a la mitad. Vas a sentir que arrastras las palabras: no es verdad, es que estabas corriendo. La aceleración comunica miedo a perder el turno.&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 text-right">
                  Cada día llega con su lección escrita, de 400 a 550 palabras.
                </p>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>

      {/* 2. Plataforma PWA & Funcionalidades Completas */}
      <section className="border-t border-slate-900 bg-[#09090d] py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3 mb-14">
            <p className={`${cinzelClassName} text-[11px] tracking-[0.35em] uppercase text-[#c9a84c]`}>
              Herramientas de la App
            </p>
            <h2 className={`${cinzelClassName} text-2xl md:text-3xl text-slate-100 font-semibold`}>
              Todo lo que incluye la Plataforma
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard className="p-6 space-y-3 h-full border-slate-800/80 hover:border-slate-700 bg-[#0d0d12]">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{item.body}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
