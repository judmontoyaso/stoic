// ============================================================
// CalendarEngine - fuente unica de verdad para fechas y progreso
// Principios:
//  - Fechas reales (YYYY-MM-DD), no dias relativos.
//  - Un dia perdido se marca como perdido; el calendario nunca
//    se reorganiza para "recuperar" dias.
//  - Cada track tiene su propia fecha de inicio, independiente.
// ============================================================

import type { DayLog, DayStatus, ProgramModule, Track } from '@/types'
import { getToday } from '@/lib/utils'

/** Suma n dias a una fecha YYYY-MM-DD y devuelve YYYY-MM-DD */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Fecha real (YYYY-MM-DD) que corresponde a un numero de dia del programa */
export function dateForDayNumber(startDate: string, dayNumber: number): string {
  return addDays(startDate, dayNumber - 1)
}

/**
 * Numero de dia del programa (1-90) que corresponde a una fecha real.
 * Devuelve null si la fecha cae fuera del programa.
 */
export function dayNumberForDate(track: Track, dateStr: string): number | null {
  if (!track.start_date) return null
  const start = new Date(track.start_date + 'T00:00:00')
  const date = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((date.getTime() - start.getTime()) / 86400000)
  const dayNumber = diff + 1
  if (dayNumber < 1 || dayNumber > track.duration_days) return null
  return dayNumber
}

/** Numero de dia del programa que corresponde a HOY, o null si no aplica */
export function currentDayNumber(track: Track): number | null {
  return dayNumberForDate(track, getToday())
}

/**
 * Estado de un dia del calendario segun la fecha real y los logs.
 * Un dia pasado sin log completado esta perdido: se marca, no se reorganiza.
 */
export function dayStatus(dateStr: string, log: DayLog | undefined, todayStr: string = getToday()): DayStatus {
  if (log?.completed) return 'completed'
  if (dateStr === todayStr) return 'today'
  if (dateStr > todayStr) return 'future'
  return 'missed'
}

/** Racha actual: dias consecutivos completados terminando hoy o ayer */
export function currentStreak(track: Track, logs: DayLog[], todayStr: string = getToday()): number {
  if (!track.start_date) return 0
  const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date))
  // La racha puede terminar hoy (si ya se completo) o ayer (si hoy aun esta pendiente)
  let cursor = completedDates.has(todayStr) ? todayStr : addDays(todayStr, -1)
  let streak = 0
  while (completedDates.has(cursor) && cursor >= track.start_date) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Racha mas larga registrada en el track */
export function longestStreak(logs: DayLog[]): number {
  const dates = logs.filter(l => l.completed).map(l => l.date).sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const d of dates) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1
    if (run > best) best = run
    prev = d
  }
  return best
}

export function getModuleLabel(module: ProgramModule): string {
  switch (module) {
    case 'perception': return 'Percepción'
    case 'action': return 'Acción'
    case 'will': return 'Voluntad'
    case 'evaluation': return 'Evaluación'
  }
}

export function getModuleDescription(module: ProgramModule): string {
  switch (module) {
    case 'perception': return 'Disciplina del asentimiento: claridad mental y juicio'
    case 'action': return 'Disciplina de la acción: práctica en el mundo real'
    case 'will': return 'Disciplina del deseo: regulación interna y aceptación'
    case 'evaluation': return 'Cierre del ciclo: solo lectura de lo recorrido'
  }
}

/** Colores por modulo (clases tailwind ya presentes en la app) */
export function getModuleColor(module: ProgramModule): { text: string; bg: string; border: string } {
  switch (module) {
    case 'perception':
      return { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
    case 'action':
      return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    case 'will':
      return { text: 'text-[var(--primary-gold)]', bg: 'bg-[var(--primary-gold)]/10', border: 'border-[var(--primary-gold)]/30' }
    case 'evaluation':
      return { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
  }
}

// ============================================================
// EvaluationModule - SOLO LECTURA: consulta datos, nunca escribe
// ============================================================

export interface TrackReport {
  totalDays: number
  elapsedDays: number
  completedDays: number
  missedDays: number
  consistencyRate: number // % de dias transcurridos completados
  currentStreak: number
  longestStreak: number
  byModule: Record<ProgramModule, { total: number; completed: number }>
  bestWeek: { week: number; completed: number } | null
  worstWeek: { week: number; completed: number } | null
}

export function buildTrackReport(
  track: Track,
  programDays: { day_number: number; module: ProgramModule; week: number }[],
  logs: DayLog[],
  todayStr: string = getToday()
): TrackReport | null {
  if (!track.start_date) return null

  const logByDay = new Map(logs.map(l => [l.day_number, l]))
  const byModule: Record<ProgramModule, { total: number; completed: number }> = {
    perception: { total: 0, completed: 0 },
    action: { total: 0, completed: 0 },
    will: { total: 0, completed: 0 },
    evaluation: { total: 0, completed: 0 },
  }
  const byWeek = new Map<number, { completed: number; elapsed: number }>()

  let elapsedDays = 0
  let completedDays = 0
  let missedDays = 0

  for (const pd of programDays) {
    const dateStr = dateForDayNumber(track.start_date, pd.day_number)
    const log = logByDay.get(pd.day_number)
    const isElapsed = dateStr <= todayStr
    const isCompleted = !!log?.completed

    if (isElapsed) {
      elapsedDays++
      byModule[pd.module].total++
      const wk = byWeek.get(pd.week) || { completed: 0, elapsed: 0 }
      wk.elapsed++
      if (isCompleted) {
        completedDays++
        byModule[pd.module].completed++
        wk.completed++
      } else if (dateStr < todayStr) {
        missedDays++
      }
      byWeek.set(pd.week, wk)
    }
  }

  let bestWeek: TrackReport['bestWeek'] = null
  let worstWeek: TrackReport['worstWeek'] = null
  for (const [week, w] of byWeek.entries()) {
    if (w.elapsed < 7) continue // solo semanas completas transcurridas
    if (!bestWeek || w.completed > bestWeek.completed) bestWeek = { week, completed: w.completed }
    if (!worstWeek || w.completed < worstWeek.completed) worstWeek = { week, completed: w.completed }
  }

  return {
    totalDays: track.duration_days,
    elapsedDays,
    completedDays,
    missedDays,
    consistencyRate: elapsedDays > 0 ? Math.round((completedDays / elapsedDays) * 100) : 0,
    currentStreak: currentStreak(track, logs, todayStr),
    longestStreak: longestStreak(logs),
    byModule,
    bestWeek,
    worstWeek,
  }
}
