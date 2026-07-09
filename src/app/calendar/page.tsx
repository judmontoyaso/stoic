'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Sidebar as PrimeSidebar } from 'primereact/sidebar'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday, formatDate } from '@/lib/utils'
import {
  dateForDayNumber,
  dayStatus,
  currentStreak,
  getModuleLabel,
  getModuleColor,
} from '@/lib/program'
import type { Track, ProgramDay, ProgramWeek, DayLog, DayStatus } from '@/types'

export default function CalendarPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null)
  const [programDays, setProgramDays] = useState<ProgramDay[]>([])
  const [programWeeks, setProgramWeeks] = useState<ProgramWeek[]>([])
  const [dayLogs, setDayLogs] = useState<DayLog[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')

  const todayStr = getToday()

  const loadTracks = useCallback(async () => {
    try {
      const all = await StoicDB.getTracks()
      setTracks(all)
      setActiveTrackId(prev => prev ?? all[0]?.id ?? null)
    } catch (err) {
      console.error('Error loading tracks:', err)
      toast.error('Error al cargar los tracks')
    } finally {
      setLoading(false)
    }
  }, [])

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
      console.error('Error loading track data:', err)
      toast.error('Error al cargar el calendario')
    }
  }, [activeTrackId])

  useEffect(() => {
    loadTracks()
  }, [loadTracks])

  useEffect(() => {
    loadTrackData()
    const handler = () => {
      loadTracks()
      loadTrackData()
    }
    window.addEventListener('stoic_data_changed', handler)
    return () => window.removeEventListener('stoic_data_changed', handler)
  }, [loadTrackData, loadTracks])

  const activeTrack = tracks.find(t => t.id === activeTrackId) || null

  const handleToggleDay = async (dayNumber: number) => {
    if (!activeTrack?.start_date) return
    const dateStr = dateForDayNumber(activeTrack.start_date, dayNumber)
    if (dateStr > todayStr) {
      toast('Ese día aún no llega. Sin trampas.', { icon: '🏛️' })
      return
    }
    try {
      await StoicDB.toggleDayLog(activeTrack.id, dateStr, dayNumber)
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el día')
    }
  }

  const handleSaveNotes = async (dayNumber: number) => {
    if (!activeTrack?.start_date) return
    const dateStr = dateForDayNumber(activeTrack.start_date, dayNumber)
    try {
      await StoicDB.updateDayLogNotes(activeTrack.id, dateStr, dayNumber, notesDraft || null)
      toast.success('Nota guardada')
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar la nota')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[var(--primary-gold)]" />
      </div>
    )
  }

  const logByDate = new Map(dayLogs.map(l => [l.date, l]))

  const statusFor = (dayNumber: number): { status: DayStatus; dateStr: string; log: DayLog | undefined } | null => {
    if (!activeTrack?.start_date) return null
    const dateStr = dateForDayNumber(activeTrack.start_date, dayNumber)
    const log = logByDate.get(dateStr)
    return { status: dayStatus(dateStr, log, todayStr), dateStr, log }
  }

  const completedCount = dayLogs.filter(l => l.completed).length
  const missedCount = activeTrack?.start_date
    ? programDays.filter(d => {
        const s = statusFor(d.day_number)
        return s?.status === 'missed'
      }).length
    : 0
  const streak = activeTrack ? currentStreak(activeTrack, dayLogs, todayStr) : 0

  // Agrupar por semanas (1-13)
  const weeks = Array.from({ length: 13 }, (_, w) => {
    const weekNum = w + 1
    return {
      weekNum,
      programWeek: programWeeks.find(pw => pw.week_number === weekNum),
      days: programDays.filter(d => d.week === weekNum),
    }
  }).filter(w => w.days.length > 0)

  const selectedProgramDay = selectedDayNumber !== null
    ? programDays.find(d => d.day_number === selectedDayNumber) || null
    : null
  const selectedInfo = selectedDayNumber !== null ? statusFor(selectedDayNumber) : null

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Calendario de 90 Días</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Fechas reales. Si pierdes un día, se marca como perdido y sigues: el calendario nunca se reorganiza.
        </p>
      </div>

      {/* Track selector */}
      <div className="flex gap-2 flex-wrap">
        {tracks.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTrackId(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
              t.id === activeTrackId
                ? 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/40 text-[var(--primary-gold)]'
                : 'bg-[var(--card-bg)] border-[var(--border-color)] text-slate-500 hover:text-[var(--foreground)]'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {!activeTrack ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-10 text-center text-slate-500">
          <p className="text-sm">No hay tracks. Ejecuta el esquema y los seeds V2 en Supabase.</p>
        </div>
      ) : !activeTrack.start_date ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-10 text-center text-slate-500 space-y-3">
          <CalendarIcon className="w-8 h-8 mx-auto text-[var(--primary-gold)] opacity-60" />
          <p className="text-sm">Este track aún no tiene fecha de inicio.</p>
          <Link href="/" className="inline-block text-sm font-bold text-[var(--primary-gold)] hover:underline">
            Iniciarlo desde el Panel de Control
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completados</p>
              <p className="text-2xl font-black text-[var(--primary-gold)] mt-1">{completedCount}<span className="text-sm text-slate-400 font-normal"> / 90</span></p>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Perdidos</p>
              <p className="text-2xl font-black text-red-500 mt-1">{missedCount}</p>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Racha actual</p>
              <p className="text-2xl font-black text-orange-400 mt-1 flex items-center gap-1"><Flame className="w-5 h-5" />{streak}</p>
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inicio</p>
              <p className="text-sm font-bold text-[var(--foreground)] mt-2">{formatDate(activeTrack.start_date)}</p>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--primary-gold)]/60 border border-[var(--primary-gold)]" /> Completado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/50" /> Perdido</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--background)] border border-[var(--primary-gold)] ring-1 ring-[var(--primary-gold)]/40" /> Hoy</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--background)] border border-[var(--border-color)] opacity-50" /> Futuro</span>
          </div>

          {/* Grid de semanas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeks.map((week) => (
              <div key={week.weekNum} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-sm text-[var(--foreground)]">
                    Semana {week.weekNum}
                    {week.programWeek && (
                      <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 rounded-sm bg-[var(--primary-gold)]/10 text-[var(--primary-gold)] uppercase tracking-wider">
                        {week.programWeek.theme}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {week.days.map((pd) => {
                    const info = statusFor(pd.day_number)
                    if (!info) return null
                    let cellClass = 'bg-[var(--background)] border-[var(--border-color)]'
                    if (info.status === 'completed') cellClass = 'bg-[var(--primary-gold)]/20 border-[var(--primary-gold)]/50 text-[var(--primary-gold)]'
                    if (info.status === 'missed') cellClass = 'bg-red-500/10 border-red-500/40 text-red-500'
                    if (info.status === 'today') cellClass = 'bg-[var(--background)] border-[var(--primary-gold)] ring-1 ring-[var(--primary-gold)]/40'
                    if (info.status === 'future') cellClass = 'bg-[var(--background)] border-[var(--border-color)] opacity-50'

                    return (
                      <button
                        key={pd.day_number}
                        onClick={() => {
                          setSelectedDayNumber(pd.day_number)
                          setNotesDraft(info.log?.notes || '')
                          setDrawerOpen(true)
                        }}
                        title={`Día ${pd.day_number} · ${info.dateStr} · ${pd.title}`}
                        className={`h-11 rounded-sm border ${cellClass} transition-all duration-150 flex flex-col items-center justify-center p-1 cursor-pointer`}
                      >
                        <span className="text-xs font-bold">{pd.day_number}</span>
                        <span className="text-[8px] opacity-70">{info.dateStr.slice(5)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Drawer de detalle */}
      <PrimeSidebar
        visible={drawerOpen}
        position="right"
        onHide={() => {
          setDrawerOpen(false)
          setSelectedDayNumber(null)
        }}
        style={{ width: '100%', maxWidth: '460px', background: 'var(--card-bg)', borderLeft: '1px solid var(--border-color)', padding: 0 }}
        className="stoic-sidebar-drawer"
      >
        {selectedProgramDay && selectedInfo && activeTrack && (
          <div className="h-full flex flex-col text-[var(--foreground)]">
            <div className="p-5 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest">
                  Día {selectedProgramDay.day_number} · Semana {selectedProgramDay.week} · Fase {selectedProgramDay.phase}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getModuleColor(selectedProgramDay.module).bg} ${getModuleColor(selectedProgramDay.module).text}`}>
                  {getModuleLabel(selectedProgramDay.module)}
                </span>
              </div>
              <h2 className="text-lg font-black">
                {new Date(selectedInfo.dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </h2>
              <div className="mt-2 flex gap-2">
                {selectedInfo.status === 'today' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[var(--primary-gold)]/20 text-[var(--primary-gold)] font-bold">Hoy</span>
                )}
                {selectedInfo.status === 'missed' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-sm bg-red-500/15 text-red-500 font-bold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Día perdido
                  </span>
                )}
                {selectedInfo.status === 'completed' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">{selectedProgramDay.title}</h3>
                {selectedProgramDay.source_author && (
                  <p className="text-[11px] text-slate-500 mt-0.5">Fuente: {selectedProgramDay.source_author}</p>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {selectedProgramDay.instructions}
                </p>
                {selectedProgramDay.rationale && (
                  <div className="mt-3 p-3 rounded-md bg-[var(--background)] border border-[var(--border-color)] border-l-4 border-l-[var(--primary-gold)]">
                    <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest mb-1">Por qué funciona</p>
                    <p className="text-xs text-slate-500 italic leading-relaxed">{selectedProgramDay.rationale}</p>
                  </div>
                )}
              </div>

              {/* Toggle (solo hoy o pasado) */}
              {selectedInfo.status !== 'future' && (
                <button
                  onClick={() => handleToggleDay(selectedProgramDay.day_number)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    selectedInfo.log?.completed
                      ? 'bg-[var(--primary-gold)]/15 text-[var(--primary-gold)] border border-[var(--primary-gold)]/40'
                      : 'bg-[var(--primary-gold)] text-[#0a0a0f] hover:opacity-90'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedInfo.log?.completed ? 'Completado — tocar para deshacer' : 'Marcar como completado'}
                </button>
              )}

              {/* Notas */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notas del día</p>
                <InputTextarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  placeholder="Qué intenté, qué pasó, qué ajusto la próxima vez..."
                  className="w-full"
                />
                <button
                  onClick={() => handleSaveNotes(selectedProgramDay.day_number)}
                  className="mt-2 px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-color)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--primary-gold)]/40 transition-all"
                >
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        )}
      </PrimeSidebar>
    </div>
  )
}
