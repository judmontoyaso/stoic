'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, Target, Zap, Play, BookOpen, Award, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { track as trackEvent } from '@/lib/analytics'
import DailyReading from '@/components/DailyReading'
import { Card, CompleteButton, ModuleBadge } from '@/components/ui'
import {
  currentDayNumber,
  currentStreak,
  dateForDayNumber,
} from '@/lib/program'
import type { Track, ProgramDay, ProgramWeek, ProgramMonth, DayLog, WeekLog } from '@/types'

export interface TrackState {
  track: Track
  programDays: ProgramDay[]
  programWeeks: ProgramWeek[]
  programMonths: ProgramMonth[]
  dayLogs: DayLog[]
  weekLogs: WeekLog[]
}

interface TrackCardProps {
  state: TrackState
  today: string
}

/** Tarjeta de track del dashboard: inicio, ejercicio de hoy, reto semanal e hito mensual */
export default function TrackCard({ state, today }: TrackCardProps) {
  const { track } = state
  const [startDateDraft, setStartDateDraft] = useState(today)
  const [showRationale, setShowRationale] = useState(false)

  const handleStart = async () => {
    try {
      await StoicDB.setTrackStartDate(track.id, startDateDraft)
      trackEvent('track_started', { track_id: track.id, track_name: track.name, start_date: startDateDraft })
      toast.success(`${track.name}: programa iniciado el ${startDateDraft}`)
    } catch (err) {
      console.error(err)
      toast.error('Error al iniciar el track')
    }
  }

  const handleToggleToday = async (dayNumber: number) => {
    try {
      await StoicDB.toggleDayLog(track.id, today, dayNumber)
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el día')
    }
  }

  const handleToggleWeek = async (weekNumber: number) => {
    try {
      await StoicDB.toggleWeekLog(track.id, weekNumber)
      toast.success('Reto semanal actualizado')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el reto')
    }
  }

  // Track sin iniciar: selector de fecha de inicio
  if (!track.start_date) {
    return (
      <Card className="p-6 flex flex-col gap-4">
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
              value={startDateDraft}
              min={today}
              onChange={(e) => setStartDateDraft(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>
          <button
            onClick={handleStart}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4" />
            Iniciar 90 días
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Desde esa fecha se desbloquea un ejercicio por día con fechas reales. Si pierdes un día, se marca como perdido y sigues: sin trampas.
        </p>
      </Card>
    )
  }

  const dayNumber = currentDayNumber(track)
  const streak = currentStreak(track, state.dayLogs)
  const completedCount = state.dayLogs.filter(l => l.completed).length

  // Programa terminado o aún no comienza
  if (dayNumber === null) {
    const finished = today > dateForDayNumber(track.start_date, track.duration_days)
    return (
      <Card className="p-6 flex flex-col gap-3">
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
      </Card>
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

  return (
    <Card className="p-6 space-y-4">
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

      {/* Progress bar por día */}
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
            <ModuleBadge module={programDay.module} />
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
              onClick={() => setShowRationale(prev => !prev)}
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
          <CompleteButton
            completed={isDone}
            onClick={() => handleToggleToday(dayNumber)}
            labelDone="Completado hoy — tocar para deshacer"
            labelTodo="Marcar día como completado"
            doneVariant="gold"
            className="mt-4"
          />
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
          onClick={() => handleToggleWeek(weekNumber)}
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
    </Card>
  )
}
