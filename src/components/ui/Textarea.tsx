'use client'

import React, { useEffect, useRef, useImperativeHandle } from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  autoResize?: boolean
  showCount?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
}

export default function Textarea({
  id,
  label,
  error,
  helperText,
  autoResize = true,
  showCount = false,
  maxLength,
  value,
  defaultValue,
  onChange,
  disabled,
  rows = 3,
  className = '',
  ref,
  ...props
}: TextareaProps) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null)

  // Support forwarding ref in React 19
  useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement)

  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  // Compute character length
  const currentLength = typeof value === 'string'
    ? value.length
    : typeof defaultValue === 'string'
      ? defaultValue.length
      : 0

  // Adjust height on input if autoResize is active
  const adjustHeight = () => {
    if (!autoResize || !internalRef.current) return
    const el = internalRef.current
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    adjustHeight()
  }, [value, defaultValue, autoResize])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight()
    onChange?.(e)
  }

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        {showCount && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-auto">
            {currentLength}{maxLength ? ` / ${maxLength}` : ' caracteres'}
          </span>
        )}
      </div>

      <textarea
        ref={internalRef}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        className={`w-full p-3 rounded-lg border text-sm transition-all duration-150 outline-none
          bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-slate-500
          ${autoResize ? 'resize-none overflow-hidden' : 'resize-y'}
          ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-[var(--border-color)] focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/25'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />

      {error && (
        <p id={`${textareaId}-error`} className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${textareaId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  )
}
