import type { ReactNode } from 'react'
import Card from './Card'

interface EmptyStateProps {
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export default function EmptyState({ children, icon, className = '' }: EmptyStateProps) {
  return (
    <Card className={`p-10 text-center text-slate-500 space-y-3 ${className}`}>
      {icon && <div className="flex justify-center opacity-60">{icon}</div>}
      {children}
    </Card>
  )
}
