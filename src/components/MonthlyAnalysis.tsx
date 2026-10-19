'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui'

// Lectura del diario del mes o semana hecha por IA. No es un puntaje ni una
// gráfica: es el único sitio de la app donde alguien le devuelve al
// usuario lo que escribió, citándolo.
//
// Se genera bajo demanda y se cachea por periodo en el servidor, porque cada
// generación cuesta dinero y tarda cerca de un minuto.

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const ES_SEMANA = /^\d{4}-W\d{2}$/

function lunesDe(fecha: Date): Date {
  const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()))
  const desplazamiento = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - desplazamiento)
  return d
}

function claveSemana(fecha: Date): string {
  const lunes = lunesDe(fecha)
  const jueves = new Date(lunes)
  jueves.setUTCDate(jueves.getUTCDate() + 3)
  const primeroDeAnio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 1))
  const semana = Math.ceil(((jueves.getTime() - primeroDeAnio.getTime()) / 86400000 + 1) / 7)
  return `${jueves.getUTCFullYear()}-W${String(semana).padStart(2, '0')}`
}

function etiqueta(periodo: string): string {
  if (ES_SEMANA.test(periodo)) {
    const [anioStr, semanaStr] = periodo.split('-W')
    const base = lunesDe(new Date(Date.UTC(Number(anioStr), 0, 4)))
    base.setUTCDate(base.getUTCDate() + (Number(semanaStr) - 1) * 7)
    const fin = new Date(base)
    fin.setUTCDate(fin.getUTCDate() + 6)
    const mesD = MESES[base.getUTCMonth()]
    const mesH = MESES[fin.getUTCMonth()]
    return mesD === mesH
      ? `Semana del ${base.getUTCDate()} al ${fin.getUTCDate()} de ${mesD}`
      : `Semana del ${base.getUTCDate()} de ${mesD} al ${fin.getUTCDate()} de ${mesH}`
  }
  const [anio, mes] = periodo.split('-')
  return `${MESES[Number(mes) - 1] ?? mes} de ${anio}`
}

/** Las últimas n semanas ISO, de la más reciente hacia atrás. */
function ultimasSemanas(n: number): string[] {
  const out: string[] = []
  const hoy = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - i * 7))
    const clave = claveSemana(d)
    if (!out.includes(clave)) out.push(clave)
  }
  return out
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
  const semanas = ultimasSemanas(6)
  const meses = ultimosMeses(6)
  const [periodo, setPeriodo] = useState(semanas[0] || meses[0])
  const [texto, setTexto] = useState<string | null>(null)
  // Qué periodo hay pintado. Comparado con el elegido da el estado de carga
  // sin tener que llamar a setState dentro del efecto.
  const [periodoCargado, setPeriodoCargado] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const cargar = useCallback(
    (p: string) => {
      setAviso(null)
      return fetch(`/api/analysis/monthly?month=${p}`)
        .then(async res => {
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'No se pudo cargar')
          setTexto(data.analysis?.analysis ?? null)
        })
        .catch(() => setTexto(null))
        .finally(() => setPeriodoCargado(p))
    },
    []
  )

  useEffect(() => {
    cargar(periodo)
  }, [periodo, cargar])

  const handleGenerar = async () => {
    setGenerando(true)
    setAviso(null)
    try {
      const res = await fetch('/api/analysis/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: periodo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAviso(data.error || 'No se pudo generar la lectura en este momento.')
        return
      }
      if (data.analysis) {
        setTexto(data.analysis)
      }
    } catch {
      setAviso('Error de conexión al generar la lectura.')
    } finally {
      setGenerando(false)
    }
  }

  const cargando = periodoCargado !== periodo

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary-gold)]" />
          Lectura de tu diario
        </h2>
        <select
          value={periodo}
          onChange={e => setPeriodo(e.target.value)}
          className="rounded border border-[var(--border-color)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
        >
          <optgroup label="Semanas recientes">
            {semanas.map(s => (
              <option key={s} value={s}>
                {etiqueta(s)}
              </option>
            ))}
          </optgroup>
          <optgroup label="Meses">
            {meses.map(m => (
              <option key={m} value={m}>
                {etiqueta(m)}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {cargando ? (
        <p className="text-xs text-slate-500">Cargando…</p>
      ) : texto ? (
        <div className="space-y-3">
          {texto.split(/\n\n+/).map((parrafo, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
              {parrafo}
            </p>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Tu lectura de {etiqueta(periodo).toLowerCase()} todavía no está generada. Llega sola
            cada domingo (semanal) y a comienzos de mes (mensual), o puedes generarla ahora si ya
            tienes al menos 4 entradas escritas en este periodo.
          </p>
          {aviso && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{aviso}</p>
          )}
          <button
            type="button"
            onClick={handleGenerar}
            disabled={generando}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--primary-gold)]/40 bg-[var(--primary-gold)]/10 px-3.5 py-2 text-xs font-bold text-[var(--primary-gold)] hover:bg-[var(--primary-gold)]/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generando ? 'animate-spin' : ''}`} />
            {generando ? 'Leyendo tu diario…' : 'Generar lectura ahora'}
          </button>
        </div>
      )}
    </Card>
  )
}
