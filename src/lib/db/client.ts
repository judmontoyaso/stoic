'use client'

// Cliente Supabase compartido por los módulos de datos + notificación de cambios.
// Toda mutación llama a notifyDataChanged() para que las vistas suscritas
// (via useStoicSync) se refresquen.

import { createClient } from '@/utils/supabase/client'

export const supabase = createClient()

export function notifyDataChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('stoic_data_changed'))
  }
}
