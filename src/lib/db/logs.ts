'use client'

// Registros de progreso del programa: días (fechas reales), retos
// semanales e hitos mensuales.

import { supabase, notifyDataChanged } from './client'
import { track } from '@/lib/analytics'
import type { DayLog, WeekLog, MonthLog } from '@/types'

// --- DAY LOGS (fechas reales) ---

export async function getDayLogs(trackId: string): Promise<DayLog[]> {
  const { data, error } = await supabase
    .from('day_logs')
    .select('*')
    .eq('track_id', trackId)

  if (error) throw error
  return (data || []) as DayLog[]
}

export async function toggleDayLog(trackId: string, date: string, dayNumber: number): Promise<DayLog> {
  const { data: existing, error: fetchError } = await supabase
    .from('day_logs')
    .select('*')
    .eq('track_id', trackId)
    .eq('date', date)
    .maybeSingle()

  if (fetchError) throw fetchError

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('day_logs')
      .update({ completed: !existing.completed })
      .eq('id', existing.id)
      .select()
    if (error) throw error
    result = data[0]
  } else {
    const { data, error } = await supabase
      .from('day_logs')
      .insert({ track_id: trackId, date, day_number: dayNumber, completed: true })
      .select()
    if (error) throw error
    result = data[0]
  }

  if ((result as DayLog).completed) {
    track('day_completed', { track_id: trackId, date, day_number: dayNumber })
  }
  notifyDataChanged()
  return result as DayLog
}

export async function updateDayLogNotes(trackId: string, date: string, dayNumber: number, notes: string | null): Promise<DayLog> {
  const { data: existing, error: fetchError } = await supabase
    .from('day_logs')
    .select('*')
    .eq('track_id', trackId)
    .eq('date', date)
    .maybeSingle()

  if (fetchError) throw fetchError

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('day_logs')
      .update({ notes })
      .eq('id', existing.id)
      .select()
    if (error) throw error
    result = data[0]
  } else {
    const { data, error } = await supabase
      .from('day_logs')
      .insert({ track_id: trackId, date, day_number: dayNumber, completed: false, notes })
      .select()
    if (error) throw error
    result = data[0]
  }

  notifyDataChanged()
  return result as DayLog
}

// --- WEEK LOGS ---

export async function getWeekLogs(trackId: string): Promise<WeekLog[]> {
  const { data, error } = await supabase
    .from('week_logs')
    .select('*')
    .eq('track_id', trackId)

  if (error) throw error
  return (data || []) as WeekLog[]
}

export async function toggleWeekLog(trackId: string, weekNumber: number, reflection?: string | null): Promise<WeekLog> {
  const { data: existing, error: fetchError } = await supabase
    .from('week_logs')
    .select('*')
    .eq('track_id', trackId)
    .eq('week_number', weekNumber)
    .maybeSingle()

  if (fetchError) throw fetchError

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('week_logs')
      .update({ completed: !existing.completed, reflection: reflection ?? existing.reflection })
      .eq('id', existing.id)
      .select()
    if (error) throw error
    result = data[0]
  } else {
    const { data, error } = await supabase
      .from('week_logs')
      .insert({ track_id: trackId, week_number: weekNumber, completed: true, reflection: reflection || null })
      .select()
    if (error) throw error
    result = data[0]
  }

  notifyDataChanged()
  return result as WeekLog
}

export async function updateWeekLogReflection(trackId: string, weekNumber: number, reflection: string | null): Promise<WeekLog> {
  const { data: existing, error: fetchError } = await supabase
    .from('week_logs')
    .select('*')
    .eq('track_id', trackId)
    .eq('week_number', weekNumber)
    .maybeSingle()

  if (fetchError) throw fetchError

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('week_logs')
      .update({ reflection })
      .eq('id', existing.id)
      .select()
    if (error) throw error
    result = data[0]
  } else {
    const { data, error } = await supabase
      .from('week_logs')
      .insert({ track_id: trackId, week_number: weekNumber, completed: false, reflection })
      .select()
    if (error) throw error
    result = data[0]
  }

  notifyDataChanged()
  return result as WeekLog
}

// --- MONTH LOGS ---

export async function getMonthLogs(trackId: string): Promise<MonthLog[]> {
  const { data, error } = await supabase
    .from('month_logs')
    .select('*')
    .eq('track_id', trackId)

  if (error) throw error
  return (data || []) as MonthLog[]
}

export async function toggleMonthLog(trackId: string, monthNumber: number, reflection?: string | null): Promise<MonthLog> {
  const { data: existing, error: fetchError } = await supabase
    .from('month_logs')
    .select('*')
    .eq('track_id', trackId)
    .eq('month_number', monthNumber)
    .maybeSingle()

  if (fetchError) throw fetchError

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('month_logs')
      .update({ completed: !existing.completed, reflection: reflection ?? existing.reflection })
      .eq('id', existing.id)
      .select()
    if (error) throw error
    result = data[0]
  } else {
    const { data, error } = await supabase
      .from('month_logs')
      .insert({ track_id: trackId, month_number: monthNumber, completed: true, reflection: reflection || null })
      .select()
    if (error) throw error
    result = data[0]
  }

  notifyDataChanged()
  return result as MonthLog
}
