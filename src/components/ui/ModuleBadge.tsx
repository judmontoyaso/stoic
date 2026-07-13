import { getModuleColor, getModuleLabel } from '@/lib/program'
import type { ProgramModule } from '@/types'

interface ModuleBadgeProps {
  module: ProgramModule
  size?: 'sm' | 'xs'
  className?: string
}

/** Badge de módulo (percepción/acción/voluntad/evaluación) con su color */
export default function ModuleBadge({ module, size = 'sm', className = '' }: ModuleBadgeProps) {
  const color = getModuleColor(module)
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[9px] px-1.5 py-0.5'
  return (
    <span className={`${sizeClass} rounded-full font-bold uppercase tracking-wider ${color.bg} ${color.text} ${className}`}>
      {getModuleLabel(module)}
    </span>
  )
}
