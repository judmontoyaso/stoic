'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'right' | 'left'
  maxWidth?: string
  className?: string
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-[460px]',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'right',
  maxWidth,
  className = '',
}: DrawerProps) {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const isRight = position === 'right'
  const slideInitial = isRight ? { x: '100%' } : { x: '-100%' }
  const slideAnimate = { x: 0 }
  const slideExit = isRight ? { x: '100%' } : { x: '-100%' }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex ${isRight ? 'justify-end' : 'justify-start'}`}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : 'Panel lateral'}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Surface */}
          <motion.div
            initial={slideInitial}
            animate={slideAnimate}
            exit={slideExit}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={maxWidth ? { maxWidth } : undefined}
            className={`relative h-full w-full ${!maxWidth ? SIZE_CLASSES[size] : ''} flex flex-col
              bg-[var(--card-bg)] text-[var(--foreground)] border-${isRight ? 'l' : 'r'} border-[var(--border-color)]
              shadow-2xl z-10 ${className}`}
          >
            {/* Header */}
            {(title || description) && (
              <div className="p-5 border-b border-[var(--border-color)] flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  {title && (
                    <div className="text-lg font-black tracking-tight text-[var(--foreground)]">
                      {title}
                    </div>
                  )}
                  {description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar panel"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {!title && !description && (
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar panel"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
