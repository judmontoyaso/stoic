'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export default function Input({
  id,
  type = 'text',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  disabled,
  className = '',
  ref,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const computedType = isPassword && showPassword ? 'text' : type

  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={computedType}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full py-2.5 rounded-lg border text-sm transition-all duration-150 outline-none
            bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${leftIcon ? 'pl-9' : 'pl-3.5'}
            ${rightIcon || (isPassword && showPasswordToggle) ? 'pr-10' : 'pr-3.5'}
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-[var(--border-color)] focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/25'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            className="absolute right-3 p-1 rounded text-slate-400 hover:text-[var(--foreground)] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {!isPassword && rightIcon && (
          <div className="absolute right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  )
}
