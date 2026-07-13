// ============================================================
// Plantillas del diario estoico (Frankl / Séneca / Marco Aurelio)
// Datos puros: los componentes de UI viven en components/journal
// ============================================================

import type { JournalEntryType } from '@/types'

export type JournalIcon = 'sun' | 'moon' | 'book' | 'feather'

export interface JournalField {
  key: string
  label: string
  placeholder: string
}

export interface JournalTemplate {
  label: string
  icon: JournalIcon
  fields: JournalField[]
}

export const JOURNAL_TEMPLATES: Record<JournalEntryType, JournalTemplate> = {
  morning: {
    label: 'Examen matutino',
    icon: 'sun',
    fields: [
      { key: 'identity', label: 'Hoy soy... (identidad deseada)', placeholder: 'Soy disciplinado, tranquilo, claro al hablar...' },
      { key: 'goals', label: 'Mis metas para hoy (1-2 tareas alineadas)', placeholder: 'Qué haré hoy que confirme esa identidad...' },
      { key: 'triggers', label: 'Obstáculos y gatillos probables de hoy', placeholder: 'Personas difíciles, retrasos, críticas... ¿qué depende de mí y qué no?' },
      { key: 'pattern_to_break', label: '¿Qué patrón limitante intento romper hoy?', placeholder: 'El hábito viejo que hoy no me gobernará...' },
    ],
  },
  evening: {
    label: 'Examen nocturno',
    icon: 'moon',
    fields: [
      { key: 'did_well', label: '¿Qué hice bien hoy?', placeholder: 'Al menos 2 decisiones alineadas con la nueva identidad...' },
      { key: 'to_improve', label: '¿Qué puedo mejorar?', placeholder: 'Sin juzgarte: un error o dificultad y su ajuste...' },
      { key: 'learned', label: '¿Qué aprendí hoy?', placeholder: 'El punto clave del día...' },
      { key: 'gratitude', label: 'Gratitud y avance de propósito', placeholder: 'Algo específico de hoy, conectado a tu porqué...' },
    ],
  },
  weekly: {
    label: 'Revisión semanal',
    icon: 'book',
    fields: [
      { key: 'why_wake_up', label: '¿Por qué me levanto cada día?', placeholder: 'El propósito de esta semana en tus palabras...' },
      { key: 'praise_self', label: 'Elogios a la persona en que me estoy convirtiendo', placeholder: 'Cualidades demostradas esta semana, con ejemplos...' },
      { key: 'sacrifice', label: 'Sacrificio asumido con valor', placeholder: 'Una renuncia o esfuerzo hecho conscientemente...' },
      { key: 'next_week', label: 'Proyección de la próxima semana', placeholder: 'Objetivos concretos alineados al propósito...' },
    ],
  },
  free: {
    label: 'Escritura libre',
    icon: 'feather',
    fields: [
      { key: 'text', label: 'Lo que necesites sacar', placeholder: 'Escribe sin filtro...' },
    ],
  },
}

export const MOODS = [
  { value: 1, emoji: '😞', label: 'Muy bajo' },
  { value: 2, emoji: '😕', label: 'Bajo' },
  { value: 3, emoji: '😐', label: 'Neutro' },
  { value: 4, emoji: '🙂', label: 'Bien' },
  { value: 5, emoji: '💪', label: 'Fuerte' },
] as const
