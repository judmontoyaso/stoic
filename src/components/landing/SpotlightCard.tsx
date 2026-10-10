'use client'

import React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
  spotlightColor?: string // Surface ambient reflection color
  borderColor?: string // Illuminated border highlight color
  radius?: number // Radius of the cursor spotlight in pixels
}

/**
 * SpotlightCard
 * Neo-stoic tactile card with GPU-accelerated cursor-following radial lighting.
 * 
 * Performance:
 * - Uses Framer Motion's useMotionValue and useMotionTemplate to update cursor
 *   coordinates without triggering React component re-renders.
 * - Double-layered lighting: An illuminated hairline border reveals dynamically
 *   under the cursor, paired with a subtle inner surface ambient gold reflection.
 * - Touch friendly: Defaults to elegant static border on touch/mobile devices.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(201, 168, 76, 0.10)',
  borderColor = 'rgba(201, 168, 76, 0.40)',
  radius = 350,
  onMouseMove,
  onMouseLeave,
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
    onMouseMove?.(e)
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    mouseX.set(-1000)
    mouseY.set(-1000)
    onMouseLeave?.(e)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-xl bg-slate-800/80 p-[1px] transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(201,168,76,0.12)] ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Border Glow (revealed through 1px padding) */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              ${borderColor},
              transparent 80%
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Inner Card Container */}
      <div className="relative h-full w-full rounded-[11px] bg-[#111116] p-7 transition-colors duration-300 group-hover:bg-[#131319]">
        {/* Dynamic Cursor Spotlight Surface Glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[11px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                ${radius}px circle at ${mouseX}px ${mouseY}px,
                ${spotlightColor},
                transparent 70%
              )
            `,
          }}
          aria-hidden="true"
        />

        {/* Interactive Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
