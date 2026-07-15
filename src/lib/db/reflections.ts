'use client'

// Consejo del mentor: la reflexión IA que el cron matutino genera para
// el correo queda guardada por (usuario, fecha) y la app la muestra en
// "Hoy". Solo lectura desde el cliente (la escribe el cron).

import { supabase } from './client'

export interface DailyReflection {
  reflection: string
  actionable_tip: string | null
}

export async function getReflectionForDate(date: string): Promise<DailyReflection | null> {
  const { data, error } = await supabase
    .from('daily_reflections')
    .select('reflection, actionable_tip')
    .eq('date', date)
    .maybeSingle()

  if (error || !data) return null
  return data as DailyReflection
}
