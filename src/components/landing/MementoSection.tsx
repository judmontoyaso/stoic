'use client'

import React from 'react'
import { motion } from 'framer-motion'
import SpotlightCard from './SpotlightCard'

interface MementoSectionProps {
  cinzelClassName?: string
}

const GOLD = '#c9a84c'

export default function MementoSection({ cinzelClassName = '' }: MementoSectionProps) {
  return (
    <div>
      {/* 1. Cita de Zenón */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-10 h-0.5 bg-[#c9a84c]/60 mx-auto mb-8" />
          <p className={`${cinzelClassName} text-xl md:text-2xl leading-relaxed text-slate-200 italic font-medium`}>
            &ldquo;Tenemos dos oídos y una boca para escuchar el doble de lo que hablamos.&rdquo;
          </p>
          <p className="mt-5 text-xs tracking-[0.3em] uppercase text-[#c9a84c] font-bold">
            Zenón de Citio
          </p>
        </motion.div>
      </section>

      {/* 2. Memento Mori / Memento Vivere */}
      <section className="border-t border-slate-900 bg-[#09090d] py-20 md:py-28 relative overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[160px] opacity-10"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
        />

        <div className="max-w-4xl mx-auto px-6 grid sm:grid-cols-2 gap-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard className="p-6 border-[#c9a84c]/30 text-center bg-[#0d0d12]">
              <div className="aspect-[9/16] max-w-[260px] mx-auto overflow-hidden rounded-xl border border-[#c9a84c]/40 shadow-[0_12px_40px_-10px_rgba(201,168,76,0.2)] relative group">
                <video
                  src="/veo_hourglass_memento.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold tracking-wider text-[#c9a84c] border border-[#c9a84c]/30">
                  Google Veo 3.1
                </div>
              </div>
              <h3 className={`${cinzelClassName} mt-6 text-xl text-slate-100 font-semibold`}>
                Memento Mori
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Vas a morir. No sabes cuándo. El estoico se lo repite cada mañana para no aplazar la conversación difícil hasta &ldquo;después&rdquo;.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard className="p-6 border-[#c9a84c]/30 text-center bg-[#0d0d12]">
              <div className="aspect-[9/16] max-w-[260px] mx-auto overflow-hidden rounded-xl border border-[#c9a84c]/40 shadow-[0_12px_40px_-10px_rgba(201,168,76,0.2)]">
                <video
                  src="/memento_vivere_video.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className={`${cinzelClassName} mt-6 text-xl text-slate-100 font-semibold`}>
                Memento Vivere
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Y mientras tanto, vives. Hoy es el único día del programa que tienes enfrente — el de mañana todavía no existe.
              </p>
            </SpotlightCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
