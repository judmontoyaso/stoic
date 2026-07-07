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
