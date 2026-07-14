// Server-only. Preferencias de correo por usuario para los crons.
//
// Diseño: los crons pueden dispararse cada hora (n8n) y además quedan
// los de Vercel como respaldo diario. Un correo se envía cuando la hora
// local del usuario ya alcanzó su hora elegida Y no se le ha enviado
// ese tipo de correo en su fecha local de hoy (last_*_sent). Eso hace
// los disparos idempotentes: más ejecuciones nunca duplican correos.

import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

export interface EmailPrefs {
  timezone: string
  morning_hour: number
  evening_hour: number
  last_morning_sent: string | null
  last_evening_sent: string | null
}

export const DEFAULT_EMAIL_PREFS: EmailPrefs = {
  timezone: 'America/Bogota',
  morning_hour: 6,
  evening_hour: 20,
  last_morning_sent: null,
  last_evening_sent: null,
}

/** Preferencias de todos los usuarios (una sola query por corrida del cron) */
export async function getPrefsMap(supabase: AnySupabaseClient): Promise<Map<string, EmailPrefs>> {
  const map = new Map<string, EmailPrefs>()
  try {
    const { data, error } = await supabase
      .from('user_prefs')
      .select('user_id, timezone, morning_hour, evening_hour, last_morning_sent, last_evening_sent')
    if (error) {
      // Tabla aún no creada (supabase_v5): todos con defaults
      console.error('user_prefs no disponible, usando defaults:', error.message)
      return map
    }
    for (const row of data || []) {
      map.set(row.user_id, {
        timezone: row.timezone || DEFAULT_EMAIL_PREFS.timezone,
        morning_hour: row.morning_hour ?? DEFAULT_EMAIL_PREFS.morning_hour,
        evening_hour: row.evening_hour ?? DEFAULT_EMAIL_PREFS.evening_hour,
        last_morning_sent: row.last_morning_sent,
        last_evening_sent: row.last_evening_sent,
      })
    }
  } catch (err) {
    console.error('Error leyendo user_prefs:', err)
  }
  return map
}

/** Fecha (YYYY-MM-DD) y hora (0-23) actuales en la zona horaria dada */
export function localParts(timezone: string, now: Date = new Date()): { date: string; hour: number } {
  let tz = timezone
  try {
    Intl.DateTimeFormat('en-CA', { timeZone: tz })
  } catch {
    tz = DEFAULT_EMAIL_PREFS.timezone
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
  }).formatToParts(now)
  const get = (type: string) => parts.find(p => p.type === type)?.value || ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    // Algunos runtimes devuelven "24" para medianoche
    hour: Number(get('hour')) % 24,
  }
}

/** Marca el correo como enviado en la fecha local del usuario */
export async function markEmailSent(
  supabase: AnySupabaseClient,
  userId: string,
  field: 'last_morning_sent' | 'last_evening_sent',
  localDate: string,
  prefs: EmailPrefs
): Promise<void> {
  try {
    await supabase.from('user_prefs').upsert(
      {
        user_id: userId,
        timezone: prefs.timezone,
        morning_hour: prefs.morning_hour,
        evening_hour: prefs.evening_hour,
        [field]: localDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  } catch (err) {
    console.error('Error marcando correo enviado:', err)
  }
}
