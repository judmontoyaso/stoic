'use client'

// Métricas de producto: eventos a stoic.events (sin servicios externos).
// Fire-and-forget: nunca lanza ni bloquea la UI; si la tabla no existe
// todavía o no hay sesión, el evento simplemente se pierde.

import { supabase } from '@/lib/db/client'

export type EventName =
  | 'code_approved'
  | 'onboarding_completed'
  | 'track_started'
  | 'day_completed'
  | 'journal_entry_saved'
  | 'push_subscribed'
  | 'push_unsubscribed'
  | 'prefs_updated'

export function track(name: EventName, props?: Record<string, unknown>): void {
  try {
    void supabase
      .from('events')
      .insert({ name, props: props ?? null })
      .then(({ error }) => {
        if (error) console.debug('Evento no registrado:', name, error.message)
      })
  } catch {
    /* nunca romper la app por métricas */
  }
}
