'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Flame, Target, CheckCircle2, Zap, Play, BookOpen, Award, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import DailyReading from '@/components/DailyReading'
import { getTodayQuote, getQuoteForDay } from '@/lib/quotes'
import { getToday } from '@/lib/utils'
import {
  currentDayNumber,
  currentStreak,
  dateForDayNumber,
  getModuleLabel,
  getModuleColor,
} from '@/lib/program'
import type { Track, ProgramDay, ProgramWeek, ProgramMonth, DayLog, WeekLog } from '@/types'

interface TrackState {
  track: Track
  programDays: ProgramDay[]
  programWeeks: ProgramWeek[]
  programMonths: ProgramMonth[]
  dayLogs: DayLog[]
  weekLogs: WeekLog[]
}

export default function DashboardPage() {
  const [trackStates, setTrackStates] = useState<TrackState[]>([])
  const [loading, setLoading] = useState(true)
  const [startDateDraft, setStartDateDraft] = useState<Record<string, string>>({})
  const [expandedRationale, setExpandedRationale] = useState<Record<string, boolean>>({})
  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const tracks = await StoicDB.getTracks()
      const states = await Promise.all(
        tracks.map(async (track) => {
          const [programDays, programWeeks, programMonths, dayLogs, weekLogs] = await Promise.all([
            StoicDB.getProgramDays(track.id),
            StoicDB.getProgramWeeks(track.id),
            StoicDB.getProgramMonths(track.id),
            StoicDB.getDayLogs(track.id),
            StoicDB.getWeekLogs(track.id),
          ])
          return { track, programDays, programWeeks, programMonths, dayLogs, weekLogs }
        })
      )
      setTrackStates(states)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      toast.error('Error al cargar el programa')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('stoic_data_changed', handler)
    return () => window.removeEventListener('stoic_data_changed', handler)
  }, [loadData])

  const handleStartTrack = async (track: Track) => {
    const date = startDateDraft[track.id] || today
    try {
      await StoicDB.setTrackStartDate(track.id, date)
      toast.success(`${track.name}: programa iniciado el ${date}`)
    } catch (err) {
      console.error(err)
      toast.error('Error al iniciar el track')
    }
  }

  const handleToggleToday = async (state: TrackState, dayNumber: number) => {
    try {
      await StoicDB.toggleDayLog(state.track.id, today, dayNumber)
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el día')
    }
  }

  const handleToggleWeek = async (state: TrackState, weekNumber: number) => {
    try {
      await StoicDB.toggleWeekLog(state.track.id, weekNumber)
      toast.success('Reto semanal actualizado')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el reto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[#c9a84c]" />
      </div>
    )
  }

  // Stats globales (vista unificada del PairingEngine: solo lectura de ambos tracks)
  const activeStates = trackStates.filter(s => s.track.start_date)

  // Cita alineada al dia del programa; si no hay track activo, rota por fecha
  const firstDayNumber = activeStates
    .map(s => currentDayNumber(s.track))
    .find((n): n is number => n !== null)
  const quote = firstDayNumber ? getQuoteForDay(firstDayNumber) : getTodayQuote()
  const todayTotal = activeStates.filter(s => currentDayNumber(s.track) !== null).length
  const todayDone = activeStates.filter(s => {
    return s.dayLogs.some(l => l.date === today && l.completed)
  }).length
  const bestStreak = Math.max(0, ...activeStates.map(s => currentStreak(s.track, s.dayLogs)))

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Panel de Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {activeStates.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-gold)]" />
              <span className="text-[var(--foreground)] font-bold">{todayDone}/{todayTotal}</span>
              <span className="text-slate-500">tracks hoy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-[var(--foreground)] font-bold">{bestStreak}</span>
              <span className="text-slate-500">racha</span>
            </div>
          </div>
        )}
      </div>

      {/* Stoic Quote */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] border border-[#c9a84c]/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-bookmark text-[#c9a84c]" />
            <span className="text-xs uppercase tracking-widest text-[#c9a84c] font-medium">Reflexión del día</span>
          </div>
          <p className="text-slate-200 text-lg italic leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-[#c9a84c] mt-3 text-sm font-medium">
            — {quote.author}
          </p>
        </div>
      </div>

      {/* Tracks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {trackStates.map((state) => {
          const { track } = state

          // Track sin iniciar: selector de fecha de inicio
          if (!track.start_date) {
            return (
              <div key={track.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[var(--primary-gold)]" />
                    {track.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{track.description}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={startDateDraft[track.id] || today}
                      min={today}
                      onChange={(e) => setStartDateDraft(prev => ({ ...prev, [track.id]: e.target.value }))}
                      className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                  </div>
                  <button
                    onClick={() => handleStartTrack(track)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar 90 días
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Desde esa fecha se desbloquea un ejercicio por día con fechas reales. Si pierdes un día, se marca como perdido y sigues: sin trampas.
                </p>
              </div>
            )
          }

          const dayNumber = currentDayNumber(track)
          const streak = currentStreak(track, state.dayLogs)
          const completedCount = state.dayLogs.filter(l => l.completed).length

          // Programa terminado o aun no comienza
          if (dayNumber === null) {
            const finished = today > dateForDayNumber(track.start_date, track.duration_days)
            return (
              <div key={track.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-[var(--foreground)]">{track.name}</h2>
                {finished ? (
                  <>
                    <p className="text-sm text-slate-500">Programa de 90 días finalizado. {completedCount} días completados.</p>
                    <Link href="/evaluation" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary-gold)] hover:underline">
                      <Award className="w-4 h-4" />
                      Ver evaluación final
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    El programa comienza el {track.start_date}. Prepárate.
                  </p>
                )}
              </div>
            )
          }

          const programDay = state.programDays.find(d => d.day_number === dayNumber)
          const todayLog = state.dayLogs.find(l => l.date === today)
          const isDone = !!todayLog?.completed
          const weekNumber = programDay?.week ?? Math.min(13, Math.ceil(dayNumber / 7))
          const programWeek = state.programWeeks.find(w => w.week_number === weekNumber)
          const weekLog = state.weekLogs.find(w => w.week_number === weekNumber)
          const monthNumber = programDay?.phase ?? Math.min(3, Math.ceil(dayNumber / 30))
          const programMonth = state.programMonths.find(m => m.month_number === monthNumber)
          const moduleColor = programDay ? getModuleColor(programDay.module) : null
          const showRationale = expandedRationale[track.id]

          return (
            <div key={track.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-4">
              {/* Track header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">{track.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Día {dayNumber} de {track.duration_days} · Semana {weekNumber} · Fase {monthNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-sm font-bold text-orange-400">
                    <Flame className="w-4 h-4" /> {streak}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-500">
                    <Zap className="w-4 h-4" /> {completedCount}/{track.duration_days}
                  </span>
                </div>
              </div>

              {/* Progress bar por dia */}
              <div className="w-full h-1.5 rounded-full bg-[var(--background)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-gold)] transition-all"
                  style={{ width: `${Math.round((dayNumber / track.duration_days) * 100)}%` }}
                />
              </div>

              {/* Ejercicio de hoy */}
              {programDay ? (
                <div className={`rounded-lg border p-4 ${isDone ? 'bg-[var(--primary-gold)]/5 border-[var(--primary-gold)]/30' : 'bg-[var(--background)] border-[var(--border-color)]'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {moduleColor && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${moduleColor.bg} ${moduleColor.text}`}>
                        {getModuleLabel(programDay.module)}
                      </span>
                    )}
                    {programDay.source_author && (
                      <span className="text-[10px] text-slate-500">· {programDay.source_author}</span>
                    )}
                  </div>
                  <h3 className={`text-base font-bold ${isDone ? 'text-[var(--primary-gold)]' : 'text-[var(--foreground)]'}`}>
                    {programDay.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {programDay.instructions}
                  </p>
                  {programDay.rationale && (
                    <button
                      onClick={() => setExpandedRationale(prev => ({ ...prev, [track.id]: !prev[track.id] }))}
                      className="flex items-center gap-1 text-xs text-[var(--primary-gold)] mt-3 font-medium"
                    >
                      {showRationale ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Por qué funciona
                    </button>
                  )}
                  {showRationale && programDay.rationale && (
                    <p className="text-xs text-slate-500 italic mt-2 leading-relaxed border-l-2 border-[var(--primary-gold)]/40 pl-3">
                      {programDay.rationale}
                    </p>
                  )}
                  <button
                    onClick={() => handleToggleToday(state, dayNumber)}
                    className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      isDone
                        ? 'bg-[var(--primary-gold)]/15 text-[var(--primary-gold)] border border-[var(--primary-gold)]/40'
                        : 'bg-[var(--primary-gold)] text-[#0a0a0f] hover:opacity-90'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isDone ? 'Completado hoy — tocar para deshacer' : 'Marcar día como completado'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No hay contenido para este día. Ejecuta los seeds V2 en Supabase.</p>
              )}

              {/* Lectura del día (lección completa del mentor) */}
              {programDay && (
                <DailyReading trackId={track.id} dayNumber={dayNumber} />
              )}

              {/* Reto semanal */}
              {programWeek && (
                <button
                  onClick={() => handleToggleWeek(state, weekNumber)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    weekLog?.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-[var(--background)] border-[var(--border-color)] hover:border-emerald-500/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    weekLog?.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {weekLog?.completed && <i className="pi pi-check text-[10px] text-white font-bold" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                      Reto semana {weekNumber}: {programWeek.theme}
                    </p>
                    <p className={`text-sm font-bold mt-0.5 ${weekLog?.completed ? 'text-emerald-500 line-through' : 'text-[var(--foreground)]'}`}>
                      {programWeek.challenge_title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{programWeek.challenge_description}</p>
                    {programWeek.deliverable && (
                      <p className="text-[11px] text-slate-500 mt-1"><span className="font-bold">Entregable:</span> {programWeek.deliverable}</p>
                    )}
                  </div>
                </button>
              )}

              {/* Hito mensual */}
              {programMonth && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border-color)]">
                  <BookOpen className="w-4 h-4 text-[var(--primary-gold)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary-gold)]">
                      Hito del mes {monthNumber}
                    </p>
                    <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">{programMonth.title}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {trackStates.length === 0 && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-10 text-center text-slate-500">
          <p className="text-sm">No hay tracks configurados. Ejecuta <code className="text-[var(--primary-gold)]">supabase_v2_schema.sql</code> y los seeds en Supabase.</p>
        </div>
      )}
    </div>
  )
}
