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
  ResourceType
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

  // --- EVENTS ---
  dispatchEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stoic_data_changed'))
    }
  }
}
