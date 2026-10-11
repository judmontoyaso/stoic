'use client'

import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck } from 'lucide-react'
import PreferencesForm from '@/components/PreferencesForm'

// Bienvenida tras aprobar el código de acceso: iniciar track(s) y
// configurar zona horaria y hora de los correos, todo en una pantalla.

export default function WelcomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-xl mx-auto px-4 py-10 space-y-8"
    >
      <div className="text-center space-y-4">
        {/* Ambient gold glow sculpture avatar */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div
            className="pointer-events-none absolute -inset-2 rounded-full bg-[var(--primary-gold)]/30 blur-md"
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sculpture.png"
            alt="Escultura Estoica"
            className="relative w-20 h-20 rounded-full object-cover border-2 border-[var(--primary-gold)]/60 shadow-[0_0_25px_rgba(201,168,76,0.25)]"
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 text-[var(--primary-gold)] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso Verificado</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-wider text-[var(--foreground)] font-serif">
            Bienvenido a Stoi<span className="text-[var(--primary-gold)]">Com</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto pt-1">
            90 días de entrenamiento estoico para forjar tu voz y carácter. Configura tu
            inicio en menos de un minuto (podrás ajustarlo en cualquier momento desde tus Preferencias).
          </p>
        </div>
      </div>

      <PreferencesForm
        showTracks
        afterSaveHref="/"
        submitLabel="Comenzar mi entrenamiento"
      />
    </motion.div>
  )
}
