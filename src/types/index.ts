// ============================================================
// StoiComunication - Type Definitions
// Programa de 90 días con fechas reales (V2)
// ============================================================

export type ResourceType = 'book' | 'youtube' | 'course' | 'diplomado'
export type ProgramModule = 'perception' | 'action' | 'will' | 'evaluation'
export type JournalEntryType = 'morning' | 'evening' | 'weekly' | 'free'

export interface Resource {
  id: string
  title: string
  author: string | null
  type: ResourceType
  url: string | null
  description: string | null
  phase: number | null
  completed: boolean
  created_at: string
}

export interface Track {
  id: string
  slug: string
  name: string
  description: string | null
  duration_days: number
  start_date: string | null
  created_at: string
}

export interface ProgramDay {
  id: string
  track_id: string
  day_number: number
  phase: number
  week: number
  module: ProgramModule
  title: string
  instructions: string
  rationale: string | null
  source_author: string | null
}

export interface ProgramWeek {
  id: string
  track_id: string
  week_number: number
  theme: string
  challenge_title: string
  challenge_description: string
  deliverable: string | null
}

export interface ProgramMonth {
  id: string
  track_id: string
  month_number: number
  title: string
  description: string
}

export interface DayLog {
  id: string
  track_id: string
  date: string
  day_number: number
  completed: boolean
  notes: string | null
  created_at: string
}

export interface WeekLog {
  id: string
  track_id: string
  week_number: number
  completed: boolean
  reflection: string | null
  created_at: string
}

export interface MonthLog {
  id: string
  track_id: string
  month_number: number
  completed: boolean
  reflection: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  date: string
  entry_type: JournalEntryType
  mood: number | null
  content: Record<string, string>
  created_at: string
}

// Estado derivado de un día del calendario (fechas reales)
export type DayStatus = 'completed' | 'missed' | 'today' | 'future' | 'pending'
