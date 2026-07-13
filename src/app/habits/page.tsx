'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday } from '@/lib/utils'
import { dateForDayNumber, dayStatus } from '@/lib/program'
import { EmptyState, LoadingScreen, ModuleBadge, PageHeader, Pill, TrackSelector } from '@/components/ui'
import { useStoicSync } from '@/hooks/useStoicSync'
import { useTrackSelection } from '@/hooks/useTrackSelection'
import type { ProgramDay, ProgramWeek, DayLog, ProgramModule, DayStatus } from '@/types'

const MODULE_FILTERS: { value: ProgramModule | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'perception', label: 'Percepción' },
  { value: 'action', label: 'Acción' },
  { value: 'will', label: 'Voluntad' },
  { value: 'evaluation', label: 'Evaluación' },
]

export default function ProgramPage() {
  const { tracks, activeTrack, activeTrackId, setActiveTrackId, loading } = useTrackSelection()
  const [programDays, setProgramDays] = useState<ProgramDay[]>([])
  const [programWeeks, setProgramWeeks] = useState<ProgramWeek[]>([])
  const [dayLogs, setDayLogs] = useState<DayLog[]>([])
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [moduleFilter, setModuleFilter] = useState<ProgramModule | 'all'>('all')

  const todayStr = getToday()

  const loadTrackData = useCallback(async () => {
    if (!activeTrackId) return
    try {
      const [days, weeks, logs] = await Promise.all([
        StoicDB.getProgramDays(activeTrackId),
        StoicDB.getProgramWeeks(activeTrackId),
        StoicDB.getDayLogs(activeTrackId),
      ])
      setProgramDays(days)
      setProgramWeeks(weeks)
      setDayLogs(logs)
    } catch (err) {
      console.error('Error loading program:', err)
      toast.error('Error al cargar el programa')
    }
  }, [activeTrackId])

  useStoicSync(loadTrackData)

  if (loading) return <LoadingScreen />

  const logByDate = new Map(dayLogs.map(l => [l.date, l]))

  const statusFor = (dayNumber: number): { status: DayStatus; dateStr: string | null } => {
    if (!activeTrack?.start_date) return { status: 'pending', dateStr: null }
    const dateStr = dateForDayNumber(activeTrack.start_date, dayNumber)
    return { status: dayStatus(dateStr, logByDate.get(dateStr), todayStr), dateStr }
  }

  const filteredDays = moduleFilter === 'all'
    ? programDays
    : programDays.filter(d => d.module === moduleFilter)

  // Agrupar por semanas
  const weeks = Array.from({ length: 13 }, (_, w) => {
    const weekNum = w + 1
    return {
      weekNum,
      programWeek: programWeeks.find(pw => pw.week_number === weekNum),
      days: filteredDays.filter(d => d.week === weekNum),
    }
  }).filter(w => w.days.length > 0)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="El Programa"
        icon={<img src="/icons/skull.png" className="w-8 h-8 object-contain" alt="Programa" />}
        subtitle="Los 90 días completos de cada track: qué toca, cuándo, por qué funciona y de quién viene."
      />

      <TrackSelector
        tracks={tracks}
        activeTrackId={activeTrackId}
        onSelect={(id) => { setActiveTrackId(id); setExpandedDay(null) }}
      />

      {/* Filtro por módulo */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        {MODULE_FILTERS.map(f => (
          <Pill key={f.value} size="xs" active={moduleFilter === f.value} onClick={() => setModuleFilter(f.value)}>
            {f.label}
          </Pill>
        ))}
      </div>

      {!activeTrack ? (
        <EmptyState>
          <p className="text-sm">No hay tracks. Ejecuta el esquema y los seeds V2 en Supabase.</p>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {!activeTrack.start_date && (
            <div className="bg-[var(--primary-gold)]/5 border border-[var(--primary-gold)]/25 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300">
              Este track aún no tiene fecha de inicio: estás viendo el programa completo en modo lectura.{' '}
              <Link href="/" className="font-bold text-[var(--primary-gold)] hover:underline">Inícialo desde el Panel</Link> para activar el calendario.
            </div>
          )}

          {weeks.map(week => (
            <div key={week.weekNum} className="space-y-2">
              {/* Week header */}
              <div className="flex items-baseline gap-2 border-b border-[var(--border-color)] pb-2">
                <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider">
                  Semana {week.weekNum}
                </h2>
                {week.programWeek && (
                  <span className="text-xs text-[var(--primary-gold)] font-medium">{week.programWeek.theme}</span>
                )}
              </div>

              {/* Days */}
              <div className="space-y-2">
                {week.days.map(pd => {
                  const { status, dateStr } = statusFor(pd.day_number)
                  const isExpanded = expandedDay === pd.day_number
                  return (
                    <div key={pd.day_number} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : pd.day_number)}
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                          status === 'completed' ? 'bg-[var(--primary-gold)]/20 text-[var(--primary-gold)]'
                          : status === 'missed' ? 'bg-red-500/10 text-red-500'
                          : status === 'today' ? 'bg-[var(--primary-gold)] text-[#0a0a0f]'
                          : 'bg-[var(--background)] text-slate-500'
                        }`}>
                          {pd.day_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ModuleBadge module={pd.module} size="xs" />
                            {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary-gold)]" />}
                            {status === 'missed' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                            {dateStr && <span className="text-[10px] text-slate-500">{dateStr}</span>}
                          </div>
                          <p className={`text-sm font-bold mt-0.5 truncate ${status === 'completed' ? 'text-[var(--primary-gold)]' : 'text-[var(--foreground)]'}`}>
                            {pd.title}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-4 pt-1 border-t border-[var(--border-color)] space-y-3">
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{pd.instructions}</p>
                          {pd.rationale && (
                            <div className="p-3 rounded-md bg-[var(--background)] border border-[var(--border-color)] border-l-4 border-l-[var(--primary-gold)]">
                              <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest mb-1">Por qué funciona</p>
                              <p className="text-xs text-slate-500 italic leading-relaxed">{pd.rationale}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            {pd.source_author && (
                              <p className="text-[11px] text-slate-500">Fuente: {pd.source_author}</p>
                            )}
                            {dateStr && status !== 'future' && (
                              <Link href="/calendar" className="text-[11px] font-bold text-[var(--primary-gold)] hover:underline">
                                Registrar en el calendario →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
