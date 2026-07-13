import type { ReactNode } from 'react'

interface StatCardProps {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  /** Clase de color para el valor (por defecto foreground) */
  valueClassName?: string
  /** 0-100: pinta barra de progreso bajo el valor */
  progress?: number
  /** Fondo elevado (card) o hundido (background). */
  variant?: 'card' | 'inset'
}

/** Tile de estadística: etiqueta pequeña + valor grande + detalle opcional */
export default function StatCard({
  label,
  value,
  sub,
  valueClassName = 'text-[var(--foreground)]',
  progress,
  variant = 'inset',
}: StatCardProps) {
  const bg = variant === 'card' ? 'bg-[var(--card-bg)]' : 'bg-[var(--background)]'
  return (
    <div className={`${bg} border border-[var(--border-color)] rounded-md p-3`}>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
        {label}
      </p>
      <p className={`text-2xl font-black mt-1 ${valueClassName}`}>{value}</p>
      {typeof progress === 'number' && (
        <div className="w-full h-1 rounded-full bg-[var(--border-color)] mt-1 overflow-hidden">
          <div className="h-full bg-[var(--primary-gold)]" style={{ width: `${progress}%` }} />
        </div>
      )}
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  )
}
