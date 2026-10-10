'use client'

import React from 'react'
import { motion } from 'framer-motion'
import SpotlightCard from './SpotlightCard'
import { MessageSquare, Brain, Zap, ShieldCheck, ArrowRight } from 'lucide-react'

interface TracksCurriculumSectionProps {
  cinzelClassName?: string
}

const GOLD = '#c9a84c'

const PHASES = [
  {
    numeral: 'I',
    title: 'Percepción',
    subtitle: 'Días 1–30',
    body: 'Ver las conversaciones y tus pensamientos como son, no como los tiñe la primera emoción. Aquí se entrena el juicio.',
  },
  {
    numeral: 'II',
    title: 'Acción',
    subtitle: 'Días 31–60',
    body: 'Hablar, callar, preguntar y sostener lo difícil — a propósito. Aquí el entrenamiento sale al mundo.',
  },
  {
    numeral: 'III',
    title: 'Voluntad',
    subtitle: 'Días 61–90',
    body: 'Sostener el estándar cuando nadie aplaude y el ánimo no acompaña. Aquí se consolida el carácter.',
  },
]

const TRACKS = [
  {
    daysBadge: '90 Días',
    title: 'Comunicación Interpersonal',
    icon: MessageSquare,
    focus: 'Manejo de tensión en vivo',
    body: 'Manejo de tensión en vivo, silencios estratégicos, tono de voz y establecimiento de límites sin reactividad.',
    features: ['Negociación y marcos de Chris Voss', 'Calibración de silencios', 'Separación de juicio y hechos'],
    highlight: false,
  },
  {
    daysBadge: '90 Días',
    title: 'Maestría Interna & Diario',
    icon: Brain,
    focus: 'Autogobierno y diálogo interno',
    body: 'Diálogo interno, examen nocturno de Séneca, gráficos de estado de ánimo y autorregulación estoica.',
    features: ['Examen nocturno de Séneca en 3 preguntas', 'Tríada emocional (fisiología, foco, lenguaje)', 'Registro de ánimo y claridad'],
    highlight: false,
  },
  {
    daysBadge: '30 Días · Avanzado',
    title: 'Influencia & Liderazgo',
    icon: Zap,
    focus: 'Temporada avanzada de alto impacto',
    body: 'Temporada avanzada. Anclajes de estado a demanda, redefinición de marcos en vivo y metaprogramas.',
    features: ['Anclaje somático de estado bajo presión', 'Redefinición del marco en conversaciones difíciles', 'Metaprogramas y toma de decisiones'],
    highlight: true,
  },
]

export default function TracksCurriculumSection({ cinzelClassName = '' }: TracksCurriculumSectionProps) {
  return (
    <div>
      {/* 1. Las tres fases: secuencia real del programa */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-20 md:py-28 relative overflow-hidden">
        <div
          className="pointer-events-none absolute top-0 right-1/4 w-[450px] h-[300px] rounded-full blur-[130px] opacity-10"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <p className={`${cinzelClassName} text-[11px] tracking-[0.35em] uppercase text-[#c9a84c]`}>
              Tres fases de 30 días
            </p>
            <h2 className={`${cinzelClassName} mt-4 text-2xl md:text-3xl text-slate-100 font-semibold`}>
              La disciplina estoica, en orden
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-lg mx-auto">
              Un recorrido progresivo que transforma tu juicio interno antes de intervenir en el mundo exterior.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {PHASES.map((phase, idx) => (
              <motion.div
                key={phase.numeral}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard className="p-6 h-full border-slate-800/90 hover:border-[#c9a84c]/40">
                  <div className="flex items-baseline justify-between">
                    <span className={`${cinzelClassName} text-3xl font-bold`} style={{ color: GOLD }}>
                      {phase.numeral}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {phase.subtitle}
                    </span>
                  </div>
                  <h3 className={`${cinzelClassName} mt-4 text-lg text-slate-100 font-semibold`}>
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {phase.body}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Los 3 Tracks Guiados (id="tracks" obligatorio) */}
      <section id="tracks" className="border-t border-slate-900 bg-[#09090d] py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <p className={`${cinzelClassName} text-[11px] tracking-[0.35em] uppercase text-[#c9a84c]`}>
              Currículum Completo
            </p>
            <h2 className={`${cinzelClassName} mt-4 text-2xl md:text-4xl text-slate-100 font-semibold`}>
              Tres Tracks Guiados
            </h2>
            <p className="mt-4 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              210 ejercicios en total. Dos programas base de 90 días y una temporada avanzada de 30 días.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {TRACKS.map((track, idx) => {
              const Icon = track.icon
              return (
                <motion.div
                  key={track.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SpotlightCard
                    className={`p-7 h-full flex flex-col justify-between transition-all duration-300 ${
                      track.highlight
                        ? 'border-[#c9a84c]/50 bg-[#121218] shadow-[0_12px_40px_-10px_rgba(201,168,76,0.18)]'
                        : 'border-slate-800/90 hover:border-slate-700 bg-[#0d0d13]'
                    }`}
                    spotlightColor={track.highlight ? 'rgba(201, 168, 76, 0.22)' : 'rgba(201, 168, 76, 0.12)'}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#c9a84c]">
                          {track.daysBadge}
                        </span>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[#c9a84c]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className={`${cinzelClassName} mt-5 text-lg font-semibold text-slate-100`}>
                        {track.title}
                      </h3>

                      <p className="mt-3 text-xs leading-relaxed text-slate-400">
                        {track.body}
                      </p>

                      <div className="mt-5 pt-4 border-t border-slate-800/60 space-y-2">
                        {track.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-400">
                            <span className="text-[#c9a84c] mt-0.5">•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px] text-[#c9a84c] font-medium">{track.focus}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </SpotlightCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
