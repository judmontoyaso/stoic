'use client'

import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  decay: number
  color: string
}

const GOLD_COLORS = [
  'rgba(201, 168, 76, ',  // Imperial Gold #c9a84c
  'rgba(245, 215, 120, ', // Warm Highlights
  'rgba(230, 190, 85, ',  // Radiant Amber
]

export default function MouseTrail() {
  const isMounted = useIsMounted()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!isMounted) return

    // Solo activar en dispositivos con puntero fino (mouse/trackpad)
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Particle[] = []
    let mouseX = -1000
    let mouseY = -1000
    let prevMouseX = -1000
    let prevMouseY = -1000
    let smoothX = -1000
    let smoothY = -1000
    let isMoving = false
    let hasMoved = false
    let idleTimer: NodeJS.Timeout

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      // clientX y clientY son coordenadas del viewport
      mouseX = e.clientX
      mouseY = e.clientY

      if (!hasMoved) {
        hasMoved = true
        smoothX = mouseX
        smoothY = mouseY
        prevMouseX = mouseX
        prevMouseY = mouseY
        return
      }

      isMoving = true

      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        isMoving = false
      }, 120)

      // Calcular distancia y velocidad del cursor
      const dx = mouseX - prevMouseX
      const dy = mouseY - prevMouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Emitir partículas doradas orgánicas a lo largo del trazo
      if (dist > 2 && particles.length < 60) {
        const count = Math.min(3, Math.floor(dist / 6) + 1)
        for (let i = 0; i < count; i++) {
          const t = i / count
          const interpX = prevMouseX + dx * t
          const interpY = prevMouseY + dy * t

          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 1.5 + 0.3
          const colorBase = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)]

          particles.push({
            x: interpX + (Math.random() - 0.5) * 6,
            y: interpY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed * 0.4,
            vy: Math.sin(angle) * speed * 0.4 - 0.35, // Leve flotación ascendente
            size: Math.random() * 2.2 + 1.2,
            alpha: Math.random() * 0.4 + 0.3,
            decay: Math.random() * 0.02 + 0.014,
            color: colorBase,
          })
        }
      }

      prevMouseX = mouseX
      prevMouseY = mouseY
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      if (hasMoved) {
        // Suavizado del centro del cursor (Lerp)
        smoothX += (mouseX - smoothX) * 0.2
        smoothY += (mouseY - smoothY) * 0.2

        // 1. Aura luminosa ambiental dorada que sigue al cursor en todo momento
        if (isMoving || particles.length > 0) {
          const glowRadius = 180
          const glow = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, glowRadius)
          glow.addColorStop(0, 'rgba(201, 168, 76, 0.12)')
          glow.addColorStop(0.35, 'rgba(201, 168, 76, 0.045)')
          glow.addColorStop(0.7, 'rgba(201, 168, 76, 0.012)')
          glow.addColorStop(1, 'rgba(201, 168, 76, 0)')

          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(smoothX, smoothY, glowRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // 2. Render y actualización de la estela de partículas doradas
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.95
          p.vy *= 0.95
          p.alpha -= p.decay

          if (p.alpha <= 0.01) {
            particles.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${p.alpha})`
          ctx.shadowColor = 'rgba(201, 168, 76, 0.7)'
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.restore()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(idleTimer)
    }
  }, [isMounted])

  // Montar directamente en document.body para escapar de cualquier stacking context
  if (!isMounted || typeof document === 'undefined') return null

  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}
      aria-hidden="true"
    />,
    document.body
  )
}
