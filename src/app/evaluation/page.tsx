'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Award, Flame, XCircle, CheckCircle2, TrendingUp, TrendingDown, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import MoodChart from '@/components/MoodChart'
import { getToday, formatDate } from '@/lib/utils'
import { buildTrackReport, getModuleColor, getModuleLabel, type TrackReport } from '@/lib/program'
import { Card, EmptyState, LoadingScreen, PageHeader, StatCard } from '@/components/ui'
import { useStoicSync } from '@/hooks/useStoicSync'
import type { Track, JournalEntry, ProgramModule, WeekLog, MonthLog } from '@/types'

interface TrackEvaluation {
  track: Track
  report: TrackReport | null
  weekLogs: WeekLog[]
  monthLogs: MonthLog[]
}

const MODULES: ProgramModule[] = ['perception', 'action', 'will', 'evaluation']

const MODULE_BAR_COLOR: Record<ProgramModule, string> = {
  perception: 'bg-sky-500',
  action: 'bg-emerald-500',
  will: 'bg-[var(--primary-gold)]',
  evaluation: 'bg-purple-500',
}

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<TrackEvaluation[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [tracks, journal] = await Promise.all([
        StoicDB.getTracks(),
        StoicDB.getJournalEntries(),
      ])
      const allCompleted = new Set<string>()
      const evals = await Promise.all(
        tracks.map(async (track) => {
          const [programDays, dayLogs, weekLogs, monthLogs] = await Promise.all([
            StoicDB.getProgramDays(track.id),
            StoicDB.getDayLogs(track.id),
            StoicDB.getWeekLogs(track.id),
            StoicDB.getMonthLogs(track.id),
          ])
          dayLogs.forEach(l => { if (l.completed) allCompleted.add(l.date) })
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
      setCompletedDates(allCompleted)
    } catch (err) {
      console.error('Error loading evaluation:', err)
      toast.error('Error al cargar la evaluación')
    } finally {
      setLoading(false)
    }
  }, [])

  useStoicSync(loadData)

  if (loading) return <LoadingScreen />

  // Métricas de journaling (frecuencia y ánimo) — solo lectura
  const journalDays = new Set(journalEntries.map(e => e.date)).size
  const moods = journalEntries.filter(e => e.mood !== null).map(e => e.mood as number)
  const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null

  // Serie de ánimo para el gráfico: un punto por día (promedio si hay varias entradas)
  const moodByDate = new Map<string, number[]>()
  journalEntries.forEach(e => {
    if (e.mood !== null) {
      const arr = moodByDate.get(e.date) || []
      arr.push(e.mood)
      moodByDate.set(e.date, arr)
    }
  })
  const moodPoints = Array.from(moodByDate.entries()).map(([date, arr]) => ({
    date,
    mood: Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10,
  }))
  const trackStarts = evaluations.map(e => e.track.start_date).filter((d): d is string => !!d)
  const chartStart = [...trackStarts, ...moodPoints.map(p => p.date)].sort()[0] || getToday()
  const byType = journalEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.entry_type] = (acc[e.entry_type] || 0) + 1
    return acc
  }, {})

  const activeEvals = evaluations.filter(e => e.report !== null)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Evaluación del Programa"
        icon={<Award className="w-7 h-7 text-[var(--primary-gold)]" />}
        subtitle={`Informe de solo lectura: consulta tus datos, nunca los modifica. Corte al ${formatDate(getToday())}.`}
      />

      {activeEvals.length === 0 ? (
        <EmptyState icon={<Award className="w-8 h-8 text-[var(--primary-gold)]" />}>
          <p className="text-sm">Aún no hay tracks iniciados que evaluar.</p>
          <Link href="/" className="inline-block text-sm font-bold text-[var(--primary-gold)] hover:underline">
            Iniciar un track desde el Panel de Control
          </Link>
        </EmptyState>
      ) : (
        activeEvals.map(({ track, report, weekLogs, monthLogs }) => {
          if (!report) return null
          const weeksCompleted = weekLogs.filter(w => w.completed).length
          const monthsCompleted = monthLogs.filter(m => m.completed).length
          return (
            <Card key={track.id} className="p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-bold text-[var(--foreground)]">{track.name}</h2>
                <span className="text-xs text-slate-500">
                  Inició {track.start_date ? formatDate(track.start_date) : '—'} · Día {report.elapsedDays} de {report.totalDays}
                </span>
              </div>

              {/* Stats principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label={<><CheckCircle2 className="w-3 h-3 text-[var(--primary-gold)]" /> Completados</>}
                  value={report.completedDays}
                  valueClassName="text-[var(--primary-gold)]"
                  sub={`de ${report.elapsedDays} transcurridos`}
                />
                <StatCard
                  label={<><XCircle className="w-3 h-3 text-red-500" /> Perdidos</>}
                  value={report.missedDays}
                  valueClassName="text-red-500"
                  sub="marcados, no reorganizados"
                />
                <StatCard
                  label="Consistencia"
                  value={`${report.consistencyRate}%`}
                  progress={report.consistencyRate}
                />
                <StatCard
                  label={<><Flame className="w-3 h-3 text-orange-400" /> Rachas</>}
                  value={report.currentStreak}
                  valueClassName="text-orange-400"
                  sub={`mejor: ${report.longestStreak} días`}
                />
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
                          <div className={`h-full ${MODULE_BAR_COLOR[mod]}`} style={{ width: `${pct}%` }} />
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
            </Card>
          )
        })
      )}

      {/* Ánimo y consistencia */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Ánimo a lo largo del programa</h2>
          <p className="text-xs text-slate-500 mt-1">
            Tu estado de ánimo reportado en el diario (1-5), junto a la banda verde de días completados: aquí se leen las correlaciones entre consistencia y ánimo.
          </p>
        </div>
        <MoodChart
          points={moodPoints.map(p => ({ date: p.date, mood: p.mood }))}
          completedDates={completedDates}
          startDate={chartStart}
          endDate={getToday()}
        />
      </Card>

      {/* Journaling (global) */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--primary-gold)]" />
          Journaling
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Días con escritura" value={journalDays} />
          <StatCard label="Entradas totales" value={journalEntries.length} />
          <StatCard
            label="Ánimo promedio"
            value={<>{avgMood ?? '—'}<span className="text-sm text-slate-500 font-normal">{avgMood ? ' / 5' : ''}</span></>}
          />
          <StatCard
            label="Por tipo"
            value={
              <span className="text-xs font-normal leading-relaxed">
                ☀️ {byType['morning'] || 0} · 🌙 {byType['evening'] || 0} · 📖 {byType['weekly'] || 0} · ✍️ {byType['free'] || 0}
              </span>
            }
          />
        </div>
        <p className="text-[10px] text-slate-500">
          La frecuencia de journaling y el ánimo reportado alimentan este informe. El módulo de evaluación solo lee: nunca escribe sobre los demás módulos.
        </p>
      </Card>
    </div>
  )
}
