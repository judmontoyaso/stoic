'use client'

// ============================================================
// Capa de datos (Supabase) dividida por dominios:
//   tracks.ts    - tracks + contenido estático del programa
//   logs.ts      - registros de días, semanas y meses
//   journal.ts   - diario estoico
//   resources.ts - recursos de estudio
//   client.ts    - cliente compartido + evento stoic_data_changed
//
// StoicDB se re-ensambla aquí para mantener la API existente
// (import { StoicDB } from '@/lib/db').
// ============================================================

import * as tracks from './tracks'
import * as logs from './logs'
import * as journal from './journal'
import * as resources from './resources'

export const StoicDB = {
  ...tracks,
  ...logs,
  ...journal,
  ...resources,
}

export * from './tracks'
export * from './logs'
export * from './journal'
export * from './resources'
export { notifyDataChanged } from './client'
