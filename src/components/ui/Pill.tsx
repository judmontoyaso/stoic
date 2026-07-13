'use client'

import type { ReactNode } from 'react'

interface PillProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  /** sm: selector de track / tabs. xs: filtros compactos */
  size?: 'sm' | 'xs'
}

/** Botón tipo píldora con estado activo dorado, usado en selectores y filtros */
export default function Pill({ active, onClick, children, size = 'sm' }: PillProps) {
  const sizeClass = size === 'sm'
    ? 'px-4 py-2 rounded-lg text-sm'
    : 'px-3 py-1 rounded-full text-[11px]'
  return (
    <button
      onClick={onClick}
      className={`${sizeClass} font-bold border transition-all flex items-center gap-2 ${
        active
          ? 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/40 text-[var(--primary-gold)]'
          : 'bg-[var(--card-bg)] border-[var(--border-color)] text-slate-500 hover:text-[var(--foreground)]'
      }`}
    >
      {children}
    </button>
  )
}
