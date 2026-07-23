'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface CircleCheckProps {
  completed: boolean
  onClick: () => void
  /** Color del estado completado. 'emerald' (por defecto) o 'gold'. */
  variant?: 'emerald' | 'gold'
  title?: string
  className?: string
}

// Toggle circular con micro-celebración, para hitos/retos donde marcar es
// una decisión explícita (no un botón full-width). Al completar, el check
// entra con rebote y un anillo estalla desde el círculo. El estallido solo
// se dispara en la transición pendiente→hecho.
export default function CircleCheck({
  completed,
  onClick,
  variant = 'emerald',
  title,
  className = '',
}: CircleCheckProps) {
  const [burst, setBurst] = useState(false)
  const prev = useRef(completed)

  useEffect(() => {
    if (completed && !prev.current) {
      setBurst(true)
      const t = setTimeout(() => setBurst(false), 650)
      prev.current = completed
      return () => clearTimeout(t)
    }
    prev.current = completed
  }, [completed])

  const on = variant === 'gold' ? 'var(--primary-gold)' : '#10b981'
  const hoverBorder = variant === 'gold' ? 'hover:border-[var(--primary-gold)]' : 'hover:border-emerald-500'

  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        completed ? '' : `border-slate-400 dark:border-slate-600 ${hoverBorder}`
      } ${className}`}
      style={completed ? { borderColor: on, background: on } : undefined}
    >
      {burst && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.9 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ boxShadow: `0 0 0 2px ${on}` }}
        />
      )}
      {completed && (
        <motion.span
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 15 }}
        >
          <Check className="w-3.5 h-3.5 text-[#0a0a0f]" strokeWidth={3} />
        </motion.span>
      )}
    </button>
  )
}
