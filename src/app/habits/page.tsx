'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Filter, CalendarRange, ArrowRight } from 'lucide-react'
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 max-w-4xl mx-auto space-y-6"
    >
      <PageHeader
        title="El Programa"
        icon={
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)] shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <CalendarRange className="w-5 h-5" />
          </div>
        }
        subtitle={activeTrack ? `Los ${activeTrack.duration_days || 90} días completos del track: qué toca, cuándo, por qué funciona y de quién viene.` : 'El programa completo de cada track.'}
      />

      <TrackSelector
        tracks={tracks}
        activeTrackId={activeTrackId}
        onSelect={(id) => { setActiveTrackId(id); setExpandedDay(null) }}
      />

      {/* Filtro por módulo */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5 text-[var(--primary-gold)]" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Módulo:</span>
        </div>
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
            <div className="bg-[var(--primary-gold)]/5 border border-[var(--primary-gold)]/25 rounded-xl p-4 text-sm text-slate-300">
              Este track aún no tiene fecha de inicio: estás viendo el programa completo en modo lectura.{' '}
              <Link href="/" className="font-bold text-[var(--primary-gold)] hover:underline inline-flex items-center gap-1">
                <span>Inícialo desde el Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link> para activar el calendario.
            </div>
          )}

          {weeks.map(week => (
            <div key={week.weekNum} className="space-y-3">
              {/* Week header */}
              <div className="flex items-baseline justify-between border-b border-[var(--border-color)] pb-2 pt-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary-gold)]" />
                  <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider">
                    Semana {week.weekNum}
                  </h2>
                </div>
                {week.programWeek && (
                  <span className="text-xs text-[var(--primary-gold)] font-medium italic">{week.programWeek.theme}</span>
                )}
              </div>

              {/* Days */}
              <div className="space-y-2">
                {week.days.map(pd => {
                  const { status, dateStr } = statusFor(pd.day_number)
                  const isExpanded = expandedDay === pd.day_number
                  return (
                    <div
                      key={pd.day_number}
                      className={`bg-[var(--card-bg)] border rounded-xl overflow-hidden transition-all duration-200 ${
                        isExpanded
                          ? 'border-[var(--primary-gold)]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                          : 'border-[var(--border-color)] hover:border-white/20'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : pd.day_number)}
                        className="w-full flex items-center gap-3.5 p-3.5 text-left cursor-pointer transition-colors hover:bg-white/[0.02]"
                      >
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-transform ${
                          status === 'completed' ? 'bg-[var(--primary-gold)]/20 text-[var(--primary-gold)] border border-[var(--primary-gold)]/40'
                          : status === 'missed' ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                          : status === 'today' ? 'bg-[var(--primary-gold)] text-[#0a0a0f] font-bold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                          : 'bg-[var(--background)] text-slate-400 border border-[var(--border-color)]'
                        }`}>
                          {pd.day_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ModuleBadge module={pd.module} size="xs" />
                            {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary-gold)]" />}
                            {status === 'missed' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                            {dateStr && <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>}
                          </div>
                          <p className={`text-sm font-bold mt-1 truncate ${status === 'completed' ? 'text-[var(--primary-gold)]' : 'text-[var(--foreground)]'}`}>
                            {pd.title}
                          </p>
                        </div>
                        <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[var(--primary-gold)]' : ''}`}>
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-[var(--border-color)]/60 space-y-3 bg-[var(--background)]/40">
                              <p className="text-sm text-slate-300 leading-relaxed pt-2">{pd.instructions}</p>
                              {pd.rationale && (
                                <div className="p-3.5 rounded-lg bg-[var(--background)] border border-[var(--border-color)] border-l-3 border-l-[var(--primary-gold)]">
                                  <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest mb-1">Por qué funciona</p>
                                  <p className="text-xs text-slate-300 italic leading-relaxed">{pd.rationale}</p>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-1">
                                {pd.source_author && (
                                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                                    Fuente: <span className="text-slate-200 font-medium">{pd.source_author}</span>
                                  </p>
                                )}
                                {dateStr && status !== 'future' && (
                                  <Link href="/calendar" className="text-xs font-bold text-[var(--primary-gold)] hover:underline inline-flex items-center gap-1">
                                    <span>Registrar en el calendario</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
