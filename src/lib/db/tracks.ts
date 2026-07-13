'use client'

// Tracks del programa de 90 días y su contenido estático
// (días, semanas, meses: solo lectura, sembrado por los seeds V2).

import { supabase, notifyDataChanged } from './client'
import type { Track, ProgramDay, ProgramWeek, ProgramMonth } from '@/types'

export async function getTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as Track[]
}

export async function setTrackStartDate(trackId: string, startDate: string | null): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .update({ start_date: startDate })
    .eq('id', trackId)
    .select()

  if (error) throw error
  notifyDataChanged()
  return data[0] as Track
}

export async function getProgramDays(trackId: string): Promise<ProgramDay[]> {
  const { data, error } = await supabase
    .from('program_days')
    .select('*')
    .eq('track_id', trackId)
    .order('day_number', { ascending: true })

  if (error) throw error
  return (data || []) as ProgramDay[]
}

export async function getProgramWeeks(trackId: string): Promise<ProgramWeek[]> {
  const { data, error } = await supabase
    .from('program_weeks')
    .select('*')
    .eq('track_id', trackId)
    .order('week_number', { ascending: true })

  if (error) throw error
  return (data || []) as ProgramWeek[]
}

export async function getProgramMonths(trackId: string): Promise<ProgramMonth[]> {
  const { data, error } = await supabase
    .from('program_months')
    .select('*')
    .eq('track_id', trackId)
    .order('month_number', { ascending: true })

  if (error) throw error
  return (data || []) as ProgramMonth[]
}
