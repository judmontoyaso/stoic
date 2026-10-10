'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cinzel } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const GOLD = '#c9a84c'

export interface LandingNavProps {
  cinzelClassName?: string
}

/**
 * LandingNav
 * Sticky glassmorphic navigation header for StoiCom Landing Page.
 *
 * Features:
 * - Dynamic scroll detection: rest state (subtle blur) -> scrolled state (illuminated gold border, enhanced blur, shadow).
 * - Logo glow: Sculpture avatar wrapped in ambient radial gold glow with hover scale and micro-bloom.
 * - Mobile navigation (<768px): collapsible drawer with fluid animated transitions, smooth anchor jumps, and quick CTA.
 * - Exact DOM contracts: preserves `#metodologia`, `#tracks`, `#precios`, and `/login` ("Entrar").
 */
export default function LandingNav({ cinzelClassName }: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fontClass = cinzelClassName || cinzel.className

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-[#c9a84c]/20 bg-[#0a0a0f]/92 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'border-b border-white/[0.04] bg-[#0a0a0f]/75 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 transition-all duration-300 md:py-5">
        {/* Logo & Brand Glow */}
        <Link
          href="/landing"
          className="group flex items-center gap-3 transition-opacity focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50 rounded-lg"
          aria-label="StoiCom Inicio"
        >
          <div className="relative flex items-center justify-center">
            {/* Ambient gold radial glow */}
            <div
              className="pointer-events-none absolute -inset-1 rounded-full bg-[#c9a84c]/25 blur-sm opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-[#c9a84c]/40"
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sculpture.png"
              alt="StoiCom"
              className="relative h-9 w-9 rounded-full object-cover border border-[#c9a84c]/40 shadow-[0_0_10px_rgba(201,168,76,0.15)] transition-all duration-300 group-hover:border-[#c9a84c] group-hover:scale-105"
            />
          </div>
          <span className={`${fontClass} text-lg tracking-[0.2em] text-slate-100 transition-colors group-hover:text-white`}>
            STOI<span style={{ color: GOLD }} className="drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]">COM</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navegación principal">
          <a
            href="#metodologia"
            className="group relative px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-slate-100 transition-colors rounded-md hover:bg-[#c9a84c]/5"
          >
            <span>Metodología</span>
            <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-[#c9a84c] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
          </a>
          <a
            href="#tracks"
            className="group relative px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-slate-100 transition-colors rounded-md hover:bg-[#c9a84c]/5"
          >
            <span>Tracks</span>
            <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-[#c9a84c] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
          </a>
          <a
            href="#precios"
            className="group relative px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-slate-100 transition-colors rounded-md hover:bg-[#c9a84c]/5"
          >
            <span>Precios</span>
            <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-[#c9a84c] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
          </a>
          <Link
            href="/login"
            className="ml-3 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded border border-[#c9a84c]/40 text-slate-200 hover:text-white bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 hover:border-[#c9a84c] hover:shadow-[0_0_15px_rgba(201,168,76,0.25)] active:scale-95 transition-all duration-200"
          >
            Entrar
          </Link>
        </nav>

        {/* Mobile Controls (<768px) */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/login"
            className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded border border-[#c9a84c]/40 text-slate-200 hover:bg-[#c9a84c]/10 transition-colors"
          >
            Entrar
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg border border-slate-800 bg-[#111116] text-slate-400 hover:text-slate-100 hover:border-[#c9a84c]/40 transition-colors focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/50"
            aria-label={mobileMenuOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#c9a84c]" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Framer Motion Height Expansion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-b border-[#c9a84c]/20 bg-[#0a0a0f]/95 backdrop-blur-2xl"
          >
            <nav className="flex flex-col space-y-2 px-6 py-4" aria-label="Navegación móvil">
              <a
                href="#metodologia"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-slate-300 hover:text-[#c9a84c] py-2.5 border-b border-slate-800/60 transition-colors"
              >
                <span>Metodología</span>
                <ChevronRight className="w-4 h-4 text-[#c9a84c]/60" />
              </a>
              <a
                href="#tracks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-slate-300 hover:text-[#c9a84c] py-2.5 border-b border-slate-800/60 transition-colors"
              >
                <span>Tracks</span>
                <ChevronRight className="w-4 h-4 text-[#c9a84c]/60" />
              </a>
              <a
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs font-bold tracking-widest uppercase text-slate-300 hover:text-[#c9a84c] py-2.5 border-b border-slate-800/60 transition-colors"
              >
                <span>Precios</span>
                <ChevronRight className="w-4 h-4 text-[#c9a84c]/60" />
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full text-center text-xs font-bold tracking-widest uppercase py-3 rounded-lg border border-[#c9a84c]/60 bg-[#c9a84c]/15 text-slate-100 hover:bg-[#c9a84c]/25 transition-all shadow-[0_0_15px_rgba(201,168,76,0.2)]"
              >
                Entrar a la app
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
