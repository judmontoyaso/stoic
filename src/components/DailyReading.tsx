'use client'

import { useEffect, useState, useCallback } from 'react'
import { BookOpen, RefreshCw } from 'lucide-react'

interface DailyReadingProps {
  trackId: string
  dayNumber: number
  /** Si es true, carga la lección automáticamente al montar */
  autoLoad?: boolean
}

export default function DailyReading({ trackId, dayNumber, autoLoad = true }: DailyReadingProps) {
  const [reading, setReading] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const load = useCallback(async (refresh = false) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/daily-reading?track_id=${trackId}&day=${dayNumber}${refresh ? '&refresh=1' : ''}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setReading(data.reading)
    } catch (err) {
      console.error('Error cargando la lectura del día:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [trackId, dayNumber])

  useEffect(() => {
    setReading(null)
    setExpanded(false)
    if (autoLoad) load()
  }, [load, autoLoad])

  const paragraphs = reading ? reading.split(/\n\n+/).filter(p => p.trim()) : []
  const visibleParagraphs = expanded ? paragraphs : paragraphs.slice(0, 2)

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Lectura del día
        </p>
        {reading && !loading && (
          <button
            onClick={() => load(true)}
            title="Regenerar la lección"
            className="text-slate-500 hover:text-[var(--primary-gold)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-3">
          <i className="pi pi-spin pi-spinner text-[var(--primary-gold)]" />
          El mentor está escribiendo tu lección de hoy...
        </div>
      )}

      {error && !loading && (
        <div className="text-xs text-slate-500 py-2">
          No se pudo cargar la lección.{' '}
          <button onClick={() => load()} className="font-bold text-[var(--primary-gold)] hover:underline">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && reading && (
        <div className="space-y-3">
          {visibleParagraphs.map((p, i) => (
            <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {p}
            </p>
          ))}
          {paragraphs.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-bold text-[var(--primary-gold)] hover:underline"
            >
              {expanded ? 'Mostrar menos' : `Seguir leyendo (${paragraphs.length - 2} párrafos más)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
