import React from 'react'

export interface SkeletonProps {
  className?: string
}

/** Base Shimmering Element (100% backward compatible with existing usage) */
export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--border-color)]/70 ${className}`}
      aria-hidden="true"
    />
  )
}

/** Contextual Text Line Placeholders */
export function SkeletonText({
  lines = 3,
  className = '',
  lastLineWidth = 'w-3/4',
}: {
  lines?: number
  className?: string
  lastLineWidth?: string
}) {
  return (
    <div className={`space-y-2 py-1 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? lastLineWidth : 'w-full'}`}
        />
      ))}
    </div>
  )
}

/** Contextual Card Placeholder */
export function SkeletonCard({
  className = '',
  lines = 3,
  hasHeader = true,
  hasFooter = false,
}: {
  className?: string
  lines?: number
  hasHeader?: boolean
  hasFooter?: boolean
}) {
  return (
    <div
      className={`p-5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] space-y-4 ${className}`}
      aria-hidden="true"
    >
      {hasHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}

      <SkeletonText lines={lines} />

      {hasFooter && (
        <div className="pt-2 flex justify-end">
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      )}
    </div>
  )
}

/** Contextual Header Placeholder */
export function SkeletonHeader({
  className = '',
  hasIcon = true,
}: {
  className?: string
  hasIcon?: boolean
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-3">
        {hasIcon && <Skeleton className="w-8 h-8 rounded-lg" />}
        <Skeleton className="h-7 w-48 rounded" />
      </div>
      <Skeleton className="h-4 w-80 rounded" />
    </div>
  )
}
