'use client'

// Preferencias por usuario: zona horaria y hora de los correos.
// Si la fila no existe todavía, se devuelven los valores por defecto
// (los mismos que usa el cron cuando no encuentra preferencias).

import { supabase } from './client'

export interface UserPrefs {
  timezone: string
  morning_hour: number
  evening_hour: number
}

export const DEFAULT_PREFS: UserPrefs = {
  timezone: 'America/Bogota',
  morning_hour: 6,
  evening_hour: 20,
}

export async function getMyPrefs(): Promise<UserPrefs> {
  const { data, error } = await supabase
    .from('user_prefs')
    .select('timezone, morning_hour, evening_hour')
    .maybeSingle()

  if (error || !data) return { ...DEFAULT_PREFS }
  return data as UserPrefs
}

export async function saveMyPrefs(prefs: UserPrefs): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sin sesión activa')

  const { error } = await supabase
    .from('user_prefs')
    .upsert(
      {
        user_id: user.id,
        timezone: prefs.timezone,
        morning_hour: prefs.morning_hour,
        evening_hour: prefs.evening_hour,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) throw error
}
