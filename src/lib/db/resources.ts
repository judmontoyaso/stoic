'use client'

// Recursos de estudio (libros, canales, cursos).

import { supabase, notifyDataChanged } from './client'
import type { Resource, ResourceType } from '@/types'

export async function getResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('title', { ascending: true })

  if (error) throw error
  return (data || []) as Resource[]
}

export async function toggleResourceCompleted(id: string): Promise<Resource> {
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
  notifyDataChanged()
  return data[0] as Resource
}

export async function addResource(
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
  notifyDataChanged()
  return data[0] as Resource
}
