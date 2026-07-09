'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Award, Flame, XCircle, CheckCircle2, TrendingUp, TrendingDown, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday, formatDate } from '@/lib/utils'
import { buildTrackReport, getModuleLabel, getModuleColor, type TrackReport } from '@/lib/program'
import type { Track, JournalEntry, ProgramModule, WeekLog, MonthLog } from '@/types'

interface TrackEvaluation {
  track: Track
  report: TrackReport | null
  weekLogs: WeekLog[]
  monthLogs: MonthLog[]
}

const MODULES: ProgramModule[] = ['perception', 'action', 'will', 'evaluation']

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<TrackEvaluation[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [tracks, journal] = await Promise.all([
        StoicDB.getTracks(),
        StoicDB.getJournalEntries(),
      ])
      const evals = await Promise.all(
        tracks.map(async (track) => {
          const [programDays, dayLogs, weekLogs, monthLogs] = await Promise.all([
            StoicDB.getProgramDays(track.id),
            StoicDB.getDayLogs(track.id),
            StoicDB.getWeekLogs(track.id),
            StoicDB.getMonthLogs(track.id),
          ])
          return {
            track,
            report: buildTrackReport(track, programDays, dayLogs),
            weekLogs,
            monthLogs,
          }
        })
      )
      setEvaluations(evals)
      setJournalEntries(journal)
    } catch (err) {
      console.error('Error loading evaluation:', err)
      toast.error('Error al cargar la evaluación')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[var(--primary-gold)]" />
      </div>
    )
  }

  // Metricas de journaling (frecuencia y animo) — solo lectura
  const journalDays = new Set(journalEntries.map(e => e.date)).size
  const moods = journalEntries.filter(e => e.mood !== null).map(e => e.mood as number)
  const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null
  const byType = journalEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.entry_type] = (acc[e.entry_type] || 0) + 1
    return acc
  }, {})

  const activeEvals = evaluations.filter(e => e.report !== null)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <Award className="w-7 h-7 text-[var(--primary-gold)]" />
          Evaluación del Programa
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Informe de solo lectura: consulta tus datos, nunca los modifica. Corte al {formatDate(getToday())}.
        </p>
      </div>

      {activeEvals.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-10 text-center text-slate-500 space-y-3">
          <Award className="w-8 h-8 mx-auto text-[var(--primary-gold)] opacity-60" />
          <p className="text-sm">Aún no hay tracks iniciados que evaluar.</p>
          <Link href="/" className="inline-block text-sm font-bold text-[var(--primary-gold)] hover:underline">
            Iniciar un track desde el Panel de Control
          </Link>
        </div>
      ) : (
        activeEvals.map(({ track, report, weekLogs, monthLogs }) => {
          if (!report) return null
          const weeksCompleted = weekLogs.filter(w => w.completed).length
          const monthsCompleted = monthLogs.filter(m => m.completed).length
          return (
            <div key={track.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-bold text-[var(--foreground)]">{track.name}</h2>
                <span className="text-xs text-slate-500">
                  Inició {track.start_date ? formatDate(track.start_date) : '—'} · Día {report.elapsedDays} de {report.totalDays}
                </span>
              </div>

              {/* Stats principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--primary-gold)]" /> Completados
                  </p>
                  <p className="text-2xl font-black text-[var(--primary-gold)] mt-1">{report.completedDays}</p>
                  <p className="text-[10px] text-slate-500">de {report.elapsedDays} transcurridos</p>
                </div>
                <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" /> Perdidos
                  </p>
                  <p className="text-2xl font-black text-red-500 mt-1">{report.missedDays}</p>
                  <p className="text-[10px] text-slate-500">marcados, no reorganizados</p>
                </div>
                <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Consistencia</p>
                  <p className="text-2xl font-black text-[var(--foreground)] mt-1">{report.consistencyRate}%</p>
                  <div className="w-full h-1 rounded-full bg-[var(--border-color)] mt-1 overflow-hidden">
                    <div className="h-full bg-[var(--primary-gold)]" style={{ width: `${report.consistencyRate}%` }} />
                  </div>
                </div>
                <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Rachas
                  </p>
                  <p className="text-2xl font-black text-orange-400 mt-1">{report.currentStreak}</p>
                  <p className="text-[10px] text-slate-500">mejor: {report.longestStreak} días</p>
                </div>
              </div>

              {/* Progreso por módulo */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Progreso por módulo</h3>
                <div className="space-y-2">
                  {MODULES.map(mod => {
                    const m = report.byModule[mod]
                    if (m.total === 0) return null
                    const pct = Math.round((m.completed / m.total) * 100)
                    const color = getModuleColor(mod)
                    return (
                      <div key={mod} className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-24 text-center flex-shrink-0 ${color.bg} ${color.text}`}>
                          {getModuleLabel(mod)}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-[var(--background)] border border-[var(--border-color)] overflow-hidden">
                          <div className={`h-full ${mod === 'will' ? 'bg-[var(--primary-gold)]' : mod === 'action' ? 'bg-emerald-500' : mod === 'perception' ? 'bg-sky-500' : 'bg-purple-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)] w-16 text-right flex-shrink-0">
                          {m.completed}/{m.total}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Semanas destacadas + retos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {report.bestWeek && (
                  <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mejor semana</p>
                      <p className="text-sm font-bold text-[var(--foreground)]">Semana {report.bestWeek.week} · {report.bestWeek.completed}/7 días</p>
                    </div>
                  </div>
                )}
                {report.worstWeek && report.worstWeek.week !== report.bestWeek?.week && (
                  <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3 flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Semana más difícil</p>
                      <p className="text-sm font-bold text-[var(--foreground)]">Semana {report.worstWeek.week} · {report.worstWeek.completed}/7 días</p>
                    </div>
                  </div>
                )}
                <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3 flex items-center gap-3">
                  <Award className="w-5 h-5 text-[var(--primary-gold)] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Retos cumplidos</p>
                    <p className="text-sm font-bold text-[var(--foreground)]">{weeksCompleted}/13 semanales · {monthsCompleted}/3 mensuales</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* Journaling (global) */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--primary-gold)]" />
          Journaling
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Días con escritura</p>
            <p className="text-2xl font-black text-[var(--foreground)] mt-1">{journalDays}</p>
          </div>
          <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Entradas totales</p>
            <p className="text-2xl font-black text-[var(--foreground)] mt-1">{journalEntries.length}</p>
          </div>
          <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Ánimo promedio</p>
            <p className="text-2xl font-black text-[var(--foreground)] mt-1">{avgMood ?? '—'}<span className="text-sm text-slate-500 font-normal">{avgMood ? ' / 5' : ''}</span></p>
          </div>
          <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-md p-3">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Por tipo</p>
            <p className="text-xs text-[var(--foreground)] mt-2 leading-relaxed">
              ☀️ {byType['morning'] || 0} · 🌙 {byType['evening'] || 0} · 📖 {byType['weekly'] || 0} · ✍️ {byType['free'] || 0}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500">
          La frecuencia de journaling y el ánimo reportado alimentan este informe. El módulo de evaluación solo lee: nunca escribe sobre los demás módulos.
        </p>
      </div>
    </div>
  )
}
