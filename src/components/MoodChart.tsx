'use client'

import { useMemo, useRef, useState } from 'react'
import { formatDate } from '@/lib/utils'

interface MoodPoint {
  date: string // YYYY-MM-DD
  mood: number // 1-5
}

interface MoodChartProps {
  points: MoodPoint[]
  completedDates: Set<string> // fechas con al menos un track completado
  startDate: string // inicio del eje X
  endDate: string // fin del eje X (hoy)
}

const MOOD_LABELS: Record<number, string> = { 1: 'Muy bajo', 2: 'Bajo', 3: 'Neutro', 4: 'Bien', 5: 'Fuerte' }

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Dimensiones del lienzo (viewBox: escala con el contenedor)
const W = 720
const H = 200
const PAD = { top: 12, right: 12, bottom: 44, left: 34 }
const STRIP_H = 14 // banda inferior de días completados

export default function MoodChart({ points, completedDates, startDate, endDate }: MoodChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{ x: number; date: string } | null>(null)

  const totalDays = Math.max(1, daysBetween(startDate, endDate))
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const xFor = (date: string) => PAD.left + (daysBetween(startDate, date) / totalDays) * plotW
  const yFor = (mood: number) => PAD.top + (1 - (mood - 1) / 4) * plotH

  const sorted = useMemo(
    () => [...points].filter(p => p.date >= startDate && p.date <= endDate).sort((a, b) => a.date.localeCompare(b.date)),
    [points, startDate, endDate]
  )

  const linePath = useMemo(() => {
    if (sorted.length < 2) return ''
    return sorted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.date).toFixed(1)} ${yFor(p.mood).toFixed(1)}`).join(' ')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, totalDays])

  // Ticks del eje X: ~5 fechas repartidas
  const xTicks = useMemo(() => {
    const n = Math.min(5, totalDays + 1)
    return Array.from({ length: n }, (_, i) => addDays(startDate, Math.round((i / Math.max(1, n - 1)) * totalDays)))
  }, [startDate, totalDays])

  const completedList = useMemo(
    () => Array.from(completedDates).filter(d => d >= startDate && d <= endDate),
    [completedDates, startDate, endDate]
  )

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg || sorted.length === 0) return
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    // Punto de ánimo más cercano en X
    let best = sorted[0]
    let bestDist = Infinity
    for (const p of sorted) {
      const d = Math.abs(xFor(p.date) - px)
      if (d < bestDist) { bestDist = d; best = p }
    }
    if (bestDist < 28) setHover({ x: xFor(best.date), date: best.date })
    else setHover(null)
  }

  const hoverPoint = hover ? sorted.find(p => p.date === hover.date) : null

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic py-4">
        Aún no hay estados de ánimo registrados: márcalos al escribir en el diario y aquí aparecerá tu curva de 90 días.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[480px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Evolución del estado de ánimo durante el programa"
        >
          {/* Grid horizontal (recesivo) + etiquetas Y */}
          {[1, 2, 3, 4, 5].map(m => (
            <g key={m}>
              <line
                x1={PAD.left} x2={W - PAD.right}
                y1={yFor(m)} y2={yFor(m)}
                stroke="var(--border-color)" strokeWidth="1" strokeDasharray={m === 1 ? '' : '2 4'}
              />
              <text
                x={PAD.left - 8} y={yFor(m) + 3}
                textAnchor="end" fontSize="10" fill="var(--foreground)" opacity="0.45"
              >
                {m}
              </text>
            </g>
          ))}

          {/* Crosshair */}
          {hover && (
            <line x1={hover.x} x2={hover.x} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--foreground)" strokeWidth="1" opacity="0.25" />
          )}

          {/* Línea de ánimo */}
          {linePath && (
            <path d={linePath} fill="none" stroke="var(--primary-gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Puntos (con anillo de superficie) */}
          {sorted.map(p => (
            <circle
              key={p.date}
              cx={xFor(p.date)} cy={yFor(p.mood)} r="4.5"
              fill="var(--primary-gold)" stroke="var(--card-bg)" strokeWidth="2"
            />
          ))}

          {/* Banda de días completados (misma escala X, carril propio) */}
          <text x={PAD.left} y={H - PAD.bottom + 14} fontSize="9" fill="var(--foreground)" opacity="0.45">
            Días completados
          </text>
          {completedList.map(d => (
            <rect
              key={d}
              x={xFor(d) - 1.5} y={H - PAD.bottom + 18}
              width="3" height={STRIP_H - 6} rx="1"
              fill="#10b981"
            />
          ))}

          {/* Ticks del eje X */}
          {xTicks.map(d => (
            <text
              key={d}
              x={xFor(d)} y={H - 4}
              textAnchor="middle" fontSize="9" fill="var(--foreground)" opacity="0.45"
            >
              {d.slice(5)}
            </text>
          ))}
        </svg>

        {/* Tooltip */}
        {hover && hoverPoint && (
          <div
            className="absolute pointer-events-none px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg text-xs z-10"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: 0,
              transform: hover.x > W * 0.7 ? 'translateX(-105%)' : 'translateX(8px)',
            }}
          >
            <p className="font-bold text-[var(--foreground)]">{formatDate(hover.date)}</p>
            <p className="text-slate-500 mt-0.5">
              Ánimo: <span className="font-bold text-[var(--primary-gold)]">{hoverPoint.mood}/5</span> · {MOOD_LABELS[hoverPoint.mood]}
            </p>
            <p className="text-slate-500">
              {completedDates.has(hover.date) ? 'Día de programa completado' : 'Día sin completar'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
