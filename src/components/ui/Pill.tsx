'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface PillProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  /** sm: selector de track / tabs. xs: filtros compactos */
  size?: 'sm' | 'xs'
  className?: string
}

/** Botón tipo píldora con microinteracción táctil y estado activo dorado */
export default function Pill({
  active,
  onClick,
  children,
  size = 'sm',
  className = '',
}: PillProps) {
  const sizeClass = size === 'sm'
    ? 'px-4 py-2 rounded-lg text-sm'
    : 'px-3 py-1 rounded-full text-[11px]'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
      className={`${sizeClass} font-bold border transition-colors flex items-center gap-2 cursor-pointer
        ${
          active
            ? 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/40 text-[var(--primary-gold)] shadow-xs'
            : 'bg-[var(--card-bg)] border-[var(--border-color)] text-slate-500 hover:text-[var(--foreground)] hover:border-[var(--primary-gold)]/30'
        }
        ${className}`}
    >
      {children}
    </motion.button>
  )
}
