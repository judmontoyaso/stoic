'use client'

import React from 'react'
import { Cinzel } from 'next/font/google'
import { BookOpen, Brain } from 'lucide-react'
import SpotlightCard from './SpotlightCard'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const GOLD = '#c9a84c'

export interface MethodologySectionProps {
  cinzelClassName?: string
}

/**
 * MethodologySection
 * Neo-Stoic Methodology Elevation for StoiCom Landing Page.
 *
 * Features:
 * - DOM Contract: Preserves required section ID `id="metodologia"`.
 * - Atmospheric Neo-Stoic background: Obsidian `#0d0d13` with layered radial gold glow.
 * - Two Spotlight Cards:
 *   1. Estoicismo Clásico (Marco Aurelio, Séneca, Epicteto) with illuminated BookOpen badge.
 *   2. Psicología de Alto Rendimiento (Robbins, Voss, Holiday) with illuminated Brain badge.
 * - Responsive grid: Clean single-column vertical stack on mobile (<768px), balanced 2-column layout on desktop.
 * - Microinteractions: Tactile cursor spotlight hover via SpotlightCard, subtle lift, border glow.
 */
export default function MethodologySection({ cinzelClassName }: MethodologySectionProps) {
  const fontClass = cinzelClassName || cinzel.className

  return (
    <section
      id="metodologia"
      className="relative overflow-hidden border-y border-[#c9a84c]/15 bg-[#0d0d13] py-16 md:py-24"
    >
      {/* Ambient background gold glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,168,76,0.08)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* Header Container */}
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <p
          className={`${fontClass} text-[11px] tracking-[0.35em] uppercase`}
          style={{ color: GOLD }}
        >
          Fundamento Científico y Práctico
        </p>

        <h2
          className={`${fontClass} mt-4 text-2xl md:text-3xl lg:text-4xl leading-snug text-slate-100`}
        >
          Filosofía Estoica + Psicología de Alto Rendimiento
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm md:text-base leading-relaxed text-slate-400">
          Marco Aurelio, Séneca y Epicteto pusieron la disciplina. Robbins, Voss y Holiday pusieron las técnicas con nombre: la Tríada, el condicionamiento neuro-asociativo, el etiquetado emocional, la redefinición del marco. Cada ejercicio dice de dónde sale.
        </p>
      </div>

      {/* Grid of Two Spotlight Cards */}
      <div className="relative mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-2 md:gap-8">
        {/* Card 1: Estoicismo Clásico */}
        <SpotlightCard className="h-full">
          <div className="flex h-full flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/10 text-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(201,168,76,0.3)]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[#c9a84c]/20 bg-[#c9a84c]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#c9a84c]">
                  Marco Aurelio · Séneca · Epicteto
                </span>
              </div>

              <h3 className={`${fontClass} text-xl text-slate-100 font-normal`}>
                Estoicismo Clásico
              </h3>

              <p className="text-sm leading-relaxed text-slate-400">
                Dicotomía del control, examen nocturno de conciencia y serenidad ante la provocación. Ver los hechos como son, eliminando el juicio apresurado.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-300 border-t border-slate-800/60">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#c9a84c] font-bold">·</span>
                  <span><strong>Dicotomía del control:</strong> discernir qué depende de ti y descartar la reactividad frente a lo externo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#c9a84c] font-bold">·</span>
                  <span><strong>Examen nocturno de Séneca:</strong> auditoría escrita de tres preguntas para no ir a la cama con juicio pendiente.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#c9a84c] font-bold">·</span>
                  <span><strong>Premeditatio Malorum:</strong> visualización previa para desarmar la sorpresa en situaciones de fricción.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 text-[11px] text-slate-500">
              <span className="font-medium text-[#c9a84c]/90">Percepción · Acción · Voluntad</span>
              <span>90 días de base</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2: Psicología de Alto Rendimiento */}
        <SpotlightCard className="h-full">
          <div className="flex h-full flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/10 text-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(201,168,76,0.3)]">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[#c9a84c]/20 bg-[#c9a84c]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#c9a84c]">
                  Robbins · Voss · Holiday
                </span>
              </div>

              <h3 className={`${fontClass} text-xl text-slate-100 font-normal`}>
                Psicología de Alto Rendimiento
              </h3>

              <p className="text-sm leading-relaxed text-slate-400">
                Tríada emocional (fisiología, foco y lenguaje), vocabulario transformacional y anclaje de estado a demanda para actuar con aplomo bajo presión.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-300 border-t border-slate-800/60">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#c9a84c] font-bold">·</span>
                  <span><strong>La Tríada de Robbins:</strong> control sincronizado de fisiología corporal, foco atencional y lenguaje interno.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#c9a84c] font-bold">·</span>
                  <span><strong>Negociación de Chris Voss:</strong> etiquetado emocional táctico, silencios dinámicos y preguntas calibradas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#c9a84c] font-bold">·</span>
                  <span><strong>Condicionamiento Neuro-Asociativo:</strong> instalación de anclajes somáticos para liderazgo bajo alta presión.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 text-[11px] text-slate-500">
              <span className="font-medium text-[#c9a84c]/90">Frameworks Modernos</span>
              <span>30 días avanzados</span>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  )
}
