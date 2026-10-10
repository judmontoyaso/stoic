'use client'

import React from 'react'
import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import LeadForm from '@/components/LeadForm'
import { Sparkles, CheckCircle2 } from 'lucide-react'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

// Staggered orchestration container
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

// Badge entrance with subtle blur-to-focus
const badgeVariants: Variants = {
  hidden: { opacity: 0, y: -16, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1], // Apple/Linear ease-out expo
    },
  },
}

// Interactive breathing gold dot
const goldDotVariants: Variants = {
  animate: {
    scale: [1, 1.25, 1],
    opacity: [0.6, 1, 0.6],
    boxShadow: [
      '0 0 0px 0px rgba(201, 168, 76, 0.3)',
      '0 0 10px 3px rgba(201, 168, 76, 0.6)',
      '0 0 0px 0px rgba(201, 168, 76, 0.3)',
    ],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Continuous subtle floating physics for stoic seal/emblem
const floatingEmblemVariants: Variants = {
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Typography reveals: blur-to-focus fade + translateY
const titleVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// LeadForm glassmorphic container reveal
const leadFormCardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// Trust indicators entrance
const trustStripVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export interface HeroSectionProps {
  children?: React.ReactNode
  leadForm?: React.ReactNode
  cinzelClassName?: string
}

export default function HeroSection({
  children,
  leadForm,
  cinzelClassName,
}: HeroSectionProps) {
  const fontClass = cinzelClassName || cinzel.className

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] pt-8 pb-20 md:pt-16 md:pb-32">
      {/* ============================================================
          LAYER 0: GOOGLE VEO 3.1 CINEMATIC AMBIENT VIDEO LOOP
          Generated with models/veo-3.1-generate-preview (Google AI)
          ============================================================ */}
      <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden select-none opacity-25 mix-blend-screen">
        <video
          src="/veo_stoic_hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover filter brightness-90 contrast-125 scale-105"
        />
        {/* Soft edge masking and vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      </div>

      {/* ============================================================
          ATMOSPHERIC NEO-STOIC LIGHTING LAYERS
          ============================================================ */}

      {/* Layer 1: Core Imperial Gold Radial Glow Aura */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] max-w-[100vw] h-[550px] select-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 15%, rgba(201, 168, 76, 0.16) 0%, rgba(201, 168, 76, 0.05) 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Layer 2: Dual Atmospheric Flanks for Lateral Depth */}
      <div
        className="pointer-events-none absolute top-1/4 -left-40 w-[550px] h-[550px] select-none rounded-full blur-[60px]"
        style={{
          background: 'radial-gradient(circle, rgba(201, 168, 76, 0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-40 w-[550px] h-[550px] select-none rounded-full blur-[60px]"
        style={{
          background: 'radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Classical Roman Stipple / Mosaic Grid (0 KB, Pure CSS) */}
      <div
        className="pointer-events-none absolute inset-0 w-full h-full select-none opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(rgba(201, 168, 76, 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 75% 60% at 50% 35%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 35%, black 20%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Layer 4: Dark Obsidian Grounding Vignette (Seamless section blend) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]"
        aria-hidden="true"
      />

      {/* ============================================================
          HERO CONTENT CONTAINER (Orchestrated Framer Motion)
          ============================================================ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Item 1: Floating Stoic Seal & Interactive Gold Dot Eyebrow */}
        <motion.div variants={badgeVariants} className="inline-flex flex-col items-center">
          <motion.div
            variants={floatingEmblemVariants}
            animate="animate"
            className="inline-flex items-center gap-2.5 rounded-full border border-[#c9a84c]/30 bg-[#111116]/80 px-4 py-1.5 shadow-[0_0_20px_rgba(201,168,76,0.15)] backdrop-blur-md"
          >
            {/* Pulsing Gold Indicator Dot */}
            <motion.span
              variants={goldDotVariants}
              animate="animate"
              className="inline-block h-2 w-2 rounded-full bg-[#c9a84c]"
              aria-hidden="true"
            />
            {/* Sculpture Avatar Miniature */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sculpture.png"
              alt="StoiCom"
              className="h-4 w-4 rounded-full object-cover border border-[#c9a84c]/40"
            />
            <span
              className={`${fontClass} text-[10px] sm:text-[11px] font-bold tracking-[0.28em] uppercase text-[#c9a84c]`}
            >
              Programa Guiado · Filosofía Estoica & Alto Rendimiento
            </span>
          </motion.div>
        </motion.div>

        {/* Item 2: H1 Headline (Staggered Blur-to-Focus Reveal) */}
        <motion.h1
          variants={titleVariants}
          className={`${fontClass} mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] tracking-tight text-slate-100`}
        >
          Entrena cómo hablas.
          <br />
          <span className="bg-gradient-to-r from-[#fae7a5] via-[#c9a84c] to-[#9c7a26] bg-clip-text text-transparent">
            Con los demás y contigo.
          </span>
        </motion.h1>

        {/* Item 3: Subtitle */}
        <motion.p
          variants={subtitleVariants}
          className="mt-8 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-400 font-normal"
        >
          Un ejercicio real cada día para dejar de sonar dubitativo, escuchar de verdad y sostener la conversación difícil. Sin frases de taza, sin atajos: percepción, acción y voluntad, entrenadas como los estoicos — por escrito y contra el reloj de un día real.
        </motion.p>

        {/* Item 4: LeadForm Elevated Glassmorphic Card Container */}
        <motion.div
          variants={leadFormCardVariants}
          className="mt-10 mx-auto max-w-xl rounded-2xl border border-[#c9a84c]/25 bg-[#111116]/85 p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(201,168,76,0.14)] backdrop-blur-md"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#c9a84c]" />
            <p className="text-sm font-semibold tracking-wide text-slate-200">
              Empieza gratis: los primeros 7 días del programa, en tu correo.
            </p>
          </div>

          {/* Preserves exact contract: renders LeadForm with source="landing-hero" */}
          {children || leadForm || <LeadForm source="landing-hero" />}

          <p className="mt-5 text-xs text-slate-500">
            ¿Ya tienes acceso?{' '}
            <Link
              href="/login"
              className="text-slate-400 underline underline-offset-2 hover:text-[#c9a84c] transition-colors"
            >
              Entrar con Google
            </Link>
          </p>
        </motion.div>

        {/* Item 5: Roman Standards & Trust Guarantee Strip */}
        <motion.div
          variants={trustStripVariants}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
            <span>210 Ejercicios Prácticos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
            <span>3 Tracks Progresivos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
            <span>Sin Tarjeta de Crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
            <span>Cancela con 1 Clic</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
