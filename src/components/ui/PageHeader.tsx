import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Icono a la izquierda del título (img o componente lucide) */
  icon?: ReactNode
  /** Acciones a la derecha (botones, stats rápidas) */
  actions?: ReactNode
}

export default function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  )
}
