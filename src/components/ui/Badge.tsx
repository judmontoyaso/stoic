import React from 'react'
import type { ProgramModule, DayStatus } from '@/types'
import { getModuleColor, getModuleLabel } from '@/lib/program'

export type BadgeVariant =
  | 'today'
  | 'completed'
  | 'missed'
  | 'future'
  | 'pending'
  | 'gold'
  | 'emerald'
  | 'danger'
  | 'sky'
  | 'purple'
  | 'neutral'

export interface BadgeProps {
  children?: React.ReactNode
  variant?: BadgeVariant
  module?: ProgramModule
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  icon?: React.ReactNode
  className?: string
}

const VARIANT_MAP: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  today: { bg: 'bg-[var(--primary-gold)]/20', text: 'text-[var(--primary-gold)]', border: 'border-[var(--primary-gold)]/40' },
  completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  missed: { bg: 'bg-red-500/15', text: 'text-red-500', border: 'border-red-500/30' },
  future: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-500', border: 'border-amber-500/30' },
  gold: { bg: 'bg-[var(--primary-gold)]/15', text: 'text-[var(--primary-gold)]', border: 'border-[var(--primary-gold)]/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
  neutral: { bg: 'bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-[var(--border-color)]' },
}

const SIZE_MAP = {
  xs: 'text-[9px] px-1.5 py-0.5 gap-1',
  sm: 'text-[10px] px-2 py-0.5 gap-1.5',
  md: 'text-xs px-2.5 py-1 gap-1.5',
}

export default function Badge({
  children,
  variant = 'neutral',
  module,
  size = 'sm',
  dot = false,
  icon,
  className = '',
}: BadgeProps) {
  if (module) {
    const modColor = getModuleColor(module)
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border
          ${SIZE_MAP[size]} ${modColor.bg} ${modColor.text} ${modColor.border} ${className}`}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {icon}
        {children || getModuleLabel(module)}
      </span>
    )
  }

  const style = VARIANT_MAP[variant]

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border
        ${SIZE_MAP[size]} ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  )
}
