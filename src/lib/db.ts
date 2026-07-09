'use client'

import { createClient } from '@/utils/supabase/client'
import type {
  Habit,
  HabitLog,
  Challenge,
  ChallengeLog,
  WeeklyReview,
  Resource,
  HabitCategory,
  ChallengeCategory,
  ResourceType,
  Track,
  ProgramDay,
  ProgramWeek,
  ProgramMonth,
  DayLog,
  WeekLog,
  MonthLog,
  JournalEntry,
  JournalEntryType
} from '@/types'

const supabase = createClient()

export const StoicDB = {
  // --- HABITS ---
  async getHabits(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as Habit[]
  },

  async getHabitsByPhase(phase: number): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('phase', phase)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as Habit[]
  },

  async addHabit(
    name: string, 
    description: string | null, 
    category: HabitCategory, 
    phase?: number | null, 
    week?: number | null
  ): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        name,
        description,
        category,
        phase: phase || null,
        week: week || null,
        is_custom: true,
        sort_order: 100 // default high order for custom
      })
      .select()

    if (error) throw error
    this.dispatchEvent()
    return data[0] as Habit
  },

  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)

    if (error) throw error
    this.dispatchEvent()
  },

  // --- HABIT LOGS ---
  async getHabitLogs(date: string): Promise<HabitLog[]> {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('date', date)

    if (error) throw error
    return (data || []) as HabitLog[]
  },

  async getHabitLogsRange(startDate: string, endDate: string): Promise<HabitLog[]> {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error
    return (data || []) as HabitLog[]
  },

  async toggleHabitLog(habitId: string, date: string): Promise<HabitLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('date', date)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('habit_logs')
        .update({ completed: !existing.completed })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          date,
          completed: true
        })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as HabitLog
  },

  async updateHabitLogNotes(habitId: string, date: string, notes: string | null): Promise<HabitLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('date', date)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('habit_logs')
        .update({ notes })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          date,
          completed: false,
          notes
        })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as HabitLog
  },

  // --- CHALLENGES ---
  async getChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as Challenge[]
  },

  async getChallengesByLevel(level: number): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('level', level)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as Challenge[]
  },

  async getChallengesByPhase(phase: number): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('phase', phase)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as Challenge[]
  },

  async addChallenge(
    title: string, 
    description: string | null, 
    category: ChallengeCategory, 
    level: number,
    phase?: number | null, 
    week?: number | null
  ): Promise<Challenge> {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        title,
        description,
        category,
        level,
        phase: phase || null,
        week: week || null,
        is_custom: true,
        sort_order: 100
      })
      .select()

    if (error) throw error
    this.dispatchEvent()
    return data[0] as Challenge
  },

  async deleteChallenge(id: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    if (error) throw error
    this.dispatchEvent()
  },

  // --- CHALLENGE LOGS ---
  async getChallengeLogs(date: string): Promise<ChallengeLog[]> {
    const { data, error } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('date', date)

    if (error) throw error
    return (data || []) as ChallengeLog[]
  },

  async getChallengeLogsRange(startDate: string, endDate: string): Promise<ChallengeLog[]> {
    const { data, error } = await supabase
      .from('challenge_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error
    return (data || []) as ChallengeLog[]
  },

  async toggleChallengeLog(challengeId: string, date: string): Promise<ChallengeLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('date', date)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('challenge_logs')
        .update({ completed: !existing.completed })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('challenge_logs')
        .insert({
          challenge_id: challengeId,
          date,
          completed: true
        })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as ChallengeLog
  },

  async updateChallengeLogNotes(
    challengeId: string, 
    date: string, 
    notes: string | null, 
    reflection?: string | null
  ): Promise<ChallengeLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('date', date)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('challenge_logs')
        .update({ notes, reflection: reflection || null })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('challenge_logs')
        .insert({
          challenge_id: challengeId,
          date,
          completed: false,
          notes,
          reflection: reflection || null
        })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as ChallengeLog
  },

  // --- RESOURCES ---
  async getResources(): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('title', { ascending: true })

    if (error) throw error
    return (data || []) as Resource[]
  },

  async toggleResourceCompleted(id: string): Promise<Resource> {
    const { data: existing, error: fetchError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('resources')
      .update({ completed: !existing.completed })
      .eq('id', id)
      .select()

    if (error) throw error
    this.dispatchEvent()
    return data[0] as Resource
  },

  async addResource(
    title: string, 
    author: string | null, 
    type: ResourceType, 
    url?: string | null, 
    description?: string | null, 
    phase?: number | null
  ): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title,
        author,
        type,
        url: url || null,
        description: description || null,
        phase: phase || null,
        completed: false
      })
      .select()

    if (error) throw error
    this.dispatchEvent()
    return data[0] as Resource
  },

  // --- WEEKLY REVIEWS ---
  async getWeeklyReviews(): Promise<WeeklyReview[]> {
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return (data || []) as WeeklyReview[]
  },

  async addWeeklyReview(
    weekNumber: number,
    phase: number,
    badHabitsResisted: string | null,
    progressMade: string | null,
    nextWeekPlan: string | null,
    gratitude: string | null,
    stoicQuote: string | null
  ): Promise<WeeklyReview> {
    const { data, error } = await supabase
      .from('weekly_reviews')
      .insert({
        week_number: weekNumber,
        phase,
        bad_habits_resisted: badHabitsResisted,
        progress_made: progressMade,
        next_week_plan: nextWeekPlan,
        gratitude,
        stoic_quote: stoicQuote
      })
      .select()

    if (error) throw error
    this.dispatchEvent()
    return data[0] as WeeklyReview
  },

  // ============================================================
  // V2 - PROGRAMA DE 90 DIAS (tracks, fechas reales)
  // ============================================================

  // --- TRACKS ---
  async getTracks(): Promise<Track[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as Track[]
  },

  async setTrackStartDate(trackId: string, startDate: string | null): Promise<Track> {
    const { data, error } = await supabase
      .from('tracks')
      .update({ start_date: startDate })
      .eq('id', trackId)
      .select()

    if (error) throw error
    this.dispatchEvent()
    return data[0] as Track
  },

  // --- PROGRAM CONTENT (estatico) ---
  async getProgramDays(trackId: string): Promise<ProgramDay[]> {
    const { data, error } = await supabase
      .from('program_days')
      .select('*')
      .eq('track_id', trackId)
      .order('day_number', { ascending: true })

    if (error) throw error
    return (data || []) as ProgramDay[]
  },

  async getProgramWeeks(trackId: string): Promise<ProgramWeek[]> {
    const { data, error } = await supabase
      .from('program_weeks')
      .select('*')
      .eq('track_id', trackId)
      .order('week_number', { ascending: true })

    if (error) throw error
    return (data || []) as ProgramWeek[]
  },

  async getProgramMonths(trackId: string): Promise<ProgramMonth[]> {
    const { data, error } = await supabase
      .from('program_months')
      .select('*')
      .eq('track_id', trackId)
      .order('month_number', { ascending: true })

    if (error) throw error
    return (data || []) as ProgramMonth[]
  },

  // --- DAY LOGS (fechas reales) ---
  async getDayLogs(trackId: string): Promise<DayLog[]> {
    const { data, error } = await supabase
      .from('day_logs')
      .select('*')
      .eq('track_id', trackId)

    if (error) throw error
    return (data || []) as DayLog[]
  },

  async toggleDayLog(trackId: string, date: string, dayNumber: number): Promise<DayLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('day_logs')
      .select('*')
      .eq('track_id', trackId)
      .eq('date', date)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('day_logs')
        .update({ completed: !existing.completed })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('day_logs')
        .insert({ track_id: trackId, date, day_number: dayNumber, completed: true })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as DayLog
  },

  async updateDayLogNotes(trackId: string, date: string, dayNumber: number, notes: string | null): Promise<DayLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('day_logs')
      .select('*')
      .eq('track_id', trackId)
      .eq('date', date)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('day_logs')
        .update({ notes })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('day_logs')
        .insert({ track_id: trackId, date, day_number: dayNumber, completed: false, notes })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as DayLog
  },

  // --- WEEK LOGS ---
  async getWeekLogs(trackId: string): Promise<WeekLog[]> {
    const { data, error } = await supabase
      .from('week_logs')
      .select('*')
      .eq('track_id', trackId)

    if (error) throw error
    return (data || []) as WeekLog[]
  },

  async toggleWeekLog(trackId: string, weekNumber: number, reflection?: string | null): Promise<WeekLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('week_logs')
      .select('*')
      .eq('track_id', trackId)
      .eq('week_number', weekNumber)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('week_logs')
        .update({ completed: !existing.completed, reflection: reflection ?? existing.reflection })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('week_logs')
        .insert({ track_id: trackId, week_number: weekNumber, completed: true, reflection: reflection || null })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as WeekLog
  },

  async updateWeekLogReflection(trackId: string, weekNumber: number, reflection: string | null): Promise<WeekLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('week_logs')
      .select('*')
      .eq('track_id', trackId)
      .eq('week_number', weekNumber)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('week_logs')
        .update({ reflection })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('week_logs')
        .insert({ track_id: trackId, week_number: weekNumber, completed: false, reflection })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as WeekLog
  },

  // --- MONTH LOGS ---
  async getMonthLogs(trackId: string): Promise<MonthLog[]> {
    const { data, error } = await supabase
      .from('month_logs')
      .select('*')
      .eq('track_id', trackId)

    if (error) throw error
    return (data || []) as MonthLog[]
  },

  async toggleMonthLog(trackId: string, monthNumber: number, reflection?: string | null): Promise<MonthLog> {
    const { data: existing, error: fetchError } = await supabase
      .from('month_logs')
      .select('*')
      .eq('track_id', trackId)
      .eq('month_number', monthNumber)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('month_logs')
        .update({ completed: !existing.completed, reflection: reflection ?? existing.reflection })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('month_logs')
        .insert({ track_id: trackId, month_number: monthNumber, completed: true, reflection: reflection || null })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as MonthLog
  },

  // --- JOURNAL ENTRIES (plantillas manana / noche / semanal / libre) ---
  async getJournalEntries(startDate?: string, endDate?: string): Promise<JournalEntry[]> {
    let query = supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error
    return (data || []) as JournalEntry[]
  },

  async upsertJournalEntry(
    date: string,
    entryType: JournalEntryType,
    content: Record<string, string>,
    mood?: number | null
  ): Promise<JournalEntry> {
    const { data: existing, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('date', date)
      .eq('entry_type', entryType)
      .maybeSingle()

    if (fetchError) throw fetchError

    let result
    if (existing) {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ content, mood: mood ?? existing.mood })
        .eq('id', existing.id)
        .select()
      if (error) throw error
      result = data[0]
    } else {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ date, entry_type: entryType, content, mood: mood || null })
        .select()
      if (error) throw error
      result = data[0]
    }

    this.dispatchEvent()
    return result as JournalEntry
  },

  async deleteJournalEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
    this.dispatchEvent()
  },

  // --- EVENTS ---
  dispatchEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stoic_data_changed'))
    }
  }
}
