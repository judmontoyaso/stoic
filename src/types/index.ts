// ============================================================
// StoiComunication - Type Definitions
// ============================================================

export type HabitCategory = 'stoic' | 'communication' | 'social'
export type ChallengeCategory = 'social_ladder' | 'communication' | 'stoic'
export type ResourceType = 'book' | 'youtube' | 'course' | 'diplomado'

export interface Habit {
  id: string
  name: string
  description: string | null
  category: HabitCategory
  phase: number | null
  week: number | null
  sort_order: number
  is_custom: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string
  completed: boolean
  notes: string | null
  created_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string | null
  category: ChallengeCategory
  level: number
  phase: number | null
  week: number | null
  sort_order: number
  is_custom: boolean
  created_at: string
}

export interface ChallengeLog {
  id: string
  challenge_id: string
  date: string
  completed: boolean
  notes: string | null
  reflection: string | null
  created_at: string
}

export interface WeeklyReview {
  id: string
  week_number: number
  phase: number
  date: string
  bad_habits_resisted: string | null
  progress_made: string | null
  next_week_plan: string | null
  gratitude: string | null
  stoic_quote: string | null
}

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

// Enriched types with logs joined
export interface HabitWithLog extends Habit {
  todayLog?: HabitLog
}

export interface ChallengeWithLog extends Challenge {
  todayLog?: ChallengeLog
}

// ============================================================
// V2 - Programa de 90 dias con fechas reales
// ============================================================

export type ProgramModule = 'perception' | 'action' | 'will' | 'evaluation'
export type JournalEntryType = 'morning' | 'evening' | 'weekly' | 'free'

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

// Estado derivado de un dia del calendario (fechas reales)
export type DayStatus = 'completed' | 'missed' | 'today' | 'future' | 'pending'

// Dashboard stats
export interface DashboardStats {
  totalHabits: number
  completedToday: number
  currentStreak: number
  longestStreak: number
  totalChallengesCompleted: number
  currentPhase: number
  currentWeek: number
  daysElapsed: number
  completionRate: number
}
