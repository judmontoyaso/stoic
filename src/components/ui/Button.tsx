'use client'

import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  ref?: React.Ref<HTMLButtonElement>
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--primary-gold)] text-[#0a0a0f] hover:bg-[var(--primary-gold-hover)] border border-transparent font-bold shadow-xs',
  secondary:
    'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--primary-gold)]/50 hover:bg-[var(--background)] font-semibold',
  ghost:
    'bg-transparent text-slate-500 hover:text-[var(--foreground)] hover:bg-[var(--primary-gold)]/10 border border-transparent font-medium',
  danger:
    'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 font-semibold',
  outline:
    'bg-transparent border border-[var(--primary-gold)] text-[var(--primary-gold)] hover:bg-[var(--primary-gold)]/10 font-bold',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  icon: 'p-2 rounded-lg text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      transition={{ duration: 0.12 }}
      className={`inline-flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}
