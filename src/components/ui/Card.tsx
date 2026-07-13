import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

/** Contenedor base de tarjeta: fondo, borde y radio consistentes en toda la app */
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl ${className}`}>
      {children}
    </div>
  )
}
