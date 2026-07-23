'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface CompleteButtonProps {
  completed: boolean
  onClick: () => void
  labelDone: string
  labelTodo: string
  /** Color del estado completado. 'emerald' (por defecto) o 'gold'. */
  doneVariant?: 'emerald' | 'gold'
  disabled?: boolean
  className?: string
}

// Botón de "marcar completado" con micro-celebración: al pasar de pendiente
// a hecho, un anillo dorado/esmeralda estalla hacia afuera y el check entra
// con un rebote. Sutil y austero, acorde a la marca. El estallido solo se
// dispara en la transición pendiente→hecho, nunca al cargar la página.
export default function CompleteButton({
  completed,
  onClick,
  labelDone,
  labelTodo,
  doneVariant = 'emerald',
  disabled,
  className = '',
}: CompleteButtonProps) {
  const [burst, setBurst] = useState(false)
  const prev = useRef(completed)

  useEffect(() => {
    if (completed && !prev.current) {
      setBurst(true)
      const t = setTimeout(() => setBurst(false), 700)
      prev.current = completed
      return () => clearTimeout(t)
    }
    prev.current = completed
  }, [completed])

  const doneClasses =
    doneVariant === 'gold'
      ? 'bg-[var(--primary-gold)]/15 text-[var(--primary-gold)] border border-[var(--primary-gold)]/40'
      : 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
  const ringColor = doneVariant === 'gold' ? 'var(--primary-gold)' : '#10b981'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
        completed ? doneClasses : 'bg-[var(--primary-gold)] text-[#0a0a0f] hover:opacity-90'
      } ${className}`}
    >
      {burst && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.18 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          style={{ boxShadow: `0 0 0 2px ${ringColor}` }}
        />
      )}
      <motion.span
        key={completed ? 'done' : 'todo'}
        className="flex items-center gap-2"
        initial={{ scale: 0.8, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 16 }}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> {labelDone}
          </>
        ) : (
          <>
            <Circle className="w-4 h-4" /> {labelTodo}
          </>
        )}
      </motion.span>
    </button>
  )
}
