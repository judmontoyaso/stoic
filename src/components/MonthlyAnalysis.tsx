'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui'

// Lectura del diario del mes hecha por IA. No es un puntaje ni una
// gráfica: es el único sitio de la app donde alguien le devuelve al
// usuario lo que escribió, citándolo.
//
// Se genera bajo demanda y se cachea por mes en el servidor, porque cada
// generación cuesta dinero y tarda cerca de un minuto.

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function etiqueta(month: string): string {
  const [anio, mes] = month.split('-')
  return `${MESES[Number(mes) - 1] ?? mes} de ${anio}`
}

/** Los últimos n meses, del más reciente hacia atrás. */
function ultimosMeses(n: number): string[] {
  const out: string[] = []
  const hoy = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export default function MonthlyAnalysis() {
  const meses = ultimosMeses(6)
  const [mes, setMes] = useState(meses[0])
  const [texto, setTexto] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  // Qué mes hay pintado. Comparado con el elegido da el estado de carga
  // sin tener que llamar a setState dentro del efecto.
  const [mesCargado, setMesCargado] = useState<string | null>(null)

  const cargar = useCallback(
    (m: string) =>
      fetch(`/api/analysis/monthly?month=${m}`)
        .then(async res => {
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'No se pudo cargar')
          setTexto(data.analysis?.analysis ?? null)
          setAviso(null)
        })
        .catch(err => {
          setTexto(null)
          setAviso(err instanceof Error ? err.message : 'No se pudo cargar')
        })
        .finally(() => setMesCargado(m)),
    []
  )

  useEffect(() => {
    cargar(mes)
  }, [mes, cargar])

  const cargando = mesCargado !== mes

  const generar = async (refresh: boolean) => {
    setGenerando(true)
    setAviso(null)
    try {
      const res = await fetch('/api/analysis/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: mes, refresh }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAviso(data.error || 'No se pudo generar')
        return
      }
      setTexto(data.analysis)
      toast.success(data.cached ? 'Análisis recuperado' : 'Análisis listo')
    } catch {
      toast.error('Sin conexión')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary-gold)]" />
          Lectura de tu diario
        </h2>
        <select
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="rounded border border-[var(--border-color)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
        >
          {meses.map(m => (
            <option key={m} value={m}>
              {etiqueta(m)}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p className="text-xs text-slate-500">Cargando…</p>
      ) : texto ? (
        <>
          <div className="space-y-3">
            {texto.split(/\n\n+/).map((parrafo, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {parrafo}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => generar(true)}
            disabled={generando}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-[var(--primary-gold)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generando ? 'animate-spin' : ''}`} />
            {generando ? 'Releyendo tu mes…' : 'Volver a leer con lo nuevo'}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 leading-relaxed">
            Nadie ha leído tu {etiqueta(mes)} todavía. Se lee lo que escribiste ese mes y se
            te devuelve el patrón que se repite, lo que evitas y lo que cambió — citando tus
            propias frases, con su fecha.
          </p>
          {aviso && <p className="text-xs text-amber-500">{aviso}</p>}
          <button
            type="button"
            onClick={() => generar(false)}
            disabled={generando}
            className="rounded-lg bg-[var(--primary-gold)] px-4 py-2 text-xs font-bold text-[#0a0a0f] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generando ? 'Leyendo tu mes… (tarda cerca de un minuto)' : `Leer mi ${etiqueta(mes)}`}
          </button>
        </div>
      )}
    </Card>
  )
}
