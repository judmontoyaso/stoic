'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import SpotlightCard from './SpotlightCard'
import { Sun, Compass, Moon, Sparkles, CheckCircle2, Play, Pause, Volume2 } from 'lucide-react'

interface DailyFlowSectionProps {
  cinzelClassName?: string
}

function AudioPreviewPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sample_lesson_audio.mp3')
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[#c9a84c] hover:bg-[#d6b75c] text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(201,168,76,0.4)]"
          aria-label={isPlaying ? 'Pausar muestra de audio' : 'Reproducir muestra de audio'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
        <div>
          <p className="text-xs font-semibold text-slate-200">
            Escuchar lección narrada
          </p>
          <p className="text-[10px] text-slate-500">
            Locución estoica de alta fidelidad · 45 seg
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {isPlaying ? (
          <div className="flex items-center gap-0.5 h-4">
            {[40, 90, 60, 100, 50, 80].map((h, i) => (
              <motion.span
                key={i}
                className="w-1 bg-[#c9a84c] rounded-full"
                animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : (
          <Volume2 className="w-4 h-4 text-slate-500" />
        )}
      </div>
    </div>
  )
}

const GOLD = '#c9a84c'

const TIMELINE_STEPS = [
  {
    id: 'morning',
    time: '6:00',
    title: 'La lección y el ejercicio',
    icon: Sun,
    description:
      'Llega tu correo con el ejercicio del día y una lección completa escrita para ese día exacto de tu proceso. A la hora que tú fijes, en tu zona horaria.',
    badge: 'Despertar Estoico',
    actionText: '400–550 palabras calibradas al momento de tu proceso.',
  },
  {
    id: 'day',
    time: 'El día',
    title: 'Entrenamiento en vivo',
    icon: Compass,
    description:
      'Ejecutas el ejercicio en tu vida real: una conversación, una auditoría de tu lenguaje, un silencio a tiempo. Lo marcas en la app. Los días perdidos se marcan — el calendario nunca se reorganiza para consolarte.',
    badge: 'Campo Real',
    actionText: 'Sin escenarios artificiales: contra el reloj de un día real.',
  },
  {
    id: 'night',
    time: '20:00',
    title: 'Examen nocturno de Séneca',
    icon: Moon,
    description:
      'El examen nocturno de Séneca: tres preguntas, por escrito. El día se cierra en el diario, no en la cabeza.',
    badge: 'Cierre del Día',
    actionText: '¿Qué hábito vencí hoy? ¿Qué vicio resistí? ¿En qué soy mejor?',
  },
]

export default function DailyFlowSection({ cinzelClassName = '' }: DailyFlowSectionProps) {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="relative overflow-hidden border-t border-slate-900 bg-[#09090d] py-20 md:py-28">
      {/* Luz ambiental sutil en el fondo */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10"
        style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Columna izquierda: Timeline narrativo interactivo */}
          <div>
            <p className={`${cinzelClassName} text-[11px] tracking-[0.35em] uppercase text-[#c9a84c]`}>
              Así se ve un día
            </p>
            <h2 className={`${cinzelClassName} mt-4 text-2xl md:text-4xl text-slate-100 leading-snug`}>
              El programa no se lee.
              <br />
              <span className="text-[#c9a84c]">Se ejecuta.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              La disciplina estoica es un ritmo constante entre el amanecer, la fricción del día y el examen nocturno.
            </p>

            {/* Pasos interactivos con animación suave */}
            <div className="mt-8 space-y-4">
              {TIMELINE_STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = activeStep === index

                return (
                  <motion.div
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border ${
                      isActive
                        ? 'bg-[#121218] border-[#c9a84c]/40 shadow-[0_4px_24px_-6px_rgba(201,168,76,0.18)]'
                        : 'bg-[#0d0d12]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#111116]'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex items-center justify-center w-9 h-9 rounded-lg shrink-0 border transition-colors ${
                          isActive
                            ? 'bg-[#c9a84c]/15 border-[#c9a84c]/60 text-[#c9a84c]'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={`${cinzelClassName} text-xs font-bold tracking-wider ${
                              isActive ? 'text-[#c9a84c]' : 'text-slate-400'
                            }`}
                          >
                            {step.time}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">
                            {step.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-200">
                          {step.title}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Columna derecha: Carta interactiva del día */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <SpotlightCard
                className="p-7 shadow-[0_20px_60px_-20px_rgba(201,168,76,0.18)] border-[#c9a84c]/30"
                spotlightColor="rgba(201, 168, 76, 0.16)"
              >
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c9a84c]">
                      Comunicación · Día 12
                    </p>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Percepción
                  </span>
                </div>

                <h3 className={`${cinzelClassName} mt-5 text-xl text-slate-100 font-semibold`}>
                  Auditoría de la primera reacción
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Hoy, en cada conversación que te incomode, no respondas a la primera
                  frase que se te forme. Anota (mentalmente o en el teléfono) qué fue
                  lo primero que quisiste decir. En la noche revisa la lista: ¿cuántas
                  de esas primeras reacciones eran juicio y cuántas eran información?
                </p>

                <div className="mt-6 rounded-lg bg-slate-900/70 border border-slate-800 p-4 space-y-2">
                  <p className="text-xs leading-relaxed text-slate-400 italic">
                    <span className="not-italic font-bold text-[#c9a84c]">
                      Por qué funciona:{' '}
                    </span>
                    Epicteto separa lo que ocurre de tu opinión sobre lo que ocurre.
                    La primera reacción casi siempre es la opinión. Verla escrita le
                    quita el disfraz de &ldquo;verdad&rdquo;.
                  </p>
                </div>

                {/* Mini reproductor de audio narrado */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <AudioPreviewPlayer />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
                    <span>Registro diario honesto</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    210 lecciones estructuradas
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              Ejercicio real del programa — hay 210 como este, uno por día y por track.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
