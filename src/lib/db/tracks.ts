'use client'

// Tracks del programa de 90 días y su contenido estático.
// V3: la fecha de inicio vive en user_tracks (una por usuario); el tipo
// Track expone start_date ya fusionada para que las vistas no cambien.

import { supabase, notifyDataChanged } from './client'
import type { Track, ProgramDay, ProgramWeek, ProgramMonth } from '@/types'

interface TrackRow extends Omit<Track, 'start_date'> {
  start_date: string | null
  user_tracks?: { start_date: string | null }[]
}

export async function getTracks(): Promise<Track[]> {
  // user_tracks viene filtrado por RLS: solo las filas del usuario logueado
  const { data, error } = await supabase
    .from('tracks')
    .select('*, user_tracks(start_date)')
    .order('created_at', { ascending: true })

  if (error) throw error
  return ((data || []) as TrackRow[]).map(({ user_tracks, ...track }) => ({
    ...track,
    start_date: user_tracks?.[0]?.start_date ?? null,
  }))
}

export async function setTrackStartDate(trackId: string, startDate: string | null): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Necesitas iniciar sesión con Google para iniciar un track')

  const { error } = await supabase
    .from('user_tracks')
    .upsert(
      { user_id: user.id, track_id: trackId, start_date: startDate },
      { onConflict: 'user_id,track_id' }
    )

  if (error) throw error
  notifyDataChanged()
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
