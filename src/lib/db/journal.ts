'use client'

// Entradas del diario estoico (plantillas mañana / noche / semanal / libre).

import { supabase, notifyDataChanged } from './client'
import type { JournalEntry, JournalEntryType } from '@/types'

export async function getJournalEntries(startDate?: string, endDate?: string): Promise<JournalEntry[]> {
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
}

export async function upsertJournalEntry(
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

  notifyDataChanged()
  return result as JournalEntry
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
  notifyDataChanged()
}
