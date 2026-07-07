// ============================================================
// Utility Functions
// ============================================================

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get the current phase (1-3) based on days elapsed since start
 */
export function getCurrentPhase(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / 86400000)

  if (daysElapsed < 30) return 1
  if (daysElapsed < 60) return 2
  return 3
}

/**
 * Get the current week (1-12) based on days elapsed since start
 */
export function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return Math.min(12, Math.floor(daysElapsed / 7) + 1)
}

/**
 * Calculate days elapsed since a start date
 */
export function getDaysElapsed(startDate: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
}

/**
 * Calculate completion percentage
 */
export function getCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Get the phase label
 */
export function getPhaseLabel(phase: number): string {
  switch (phase) {
    case 1: return 'Fundamentos'
    case 2: return 'Persuasion y Storytelling'
    case 3: return 'Liderazgo Comunicativo'
    default: return 'General'
  }
}

/**
 * Get the phase description
 */
export function getPhaseDescription(phase: number): string {
  switch (phase) {
    case 1: return 'Voz, cuerpo y claridad'
    case 2: return 'Negociacion, historias e influencia'
    case 3: return 'Feedback, vulnerabilidad y liderazgo'
    default: return ''
  }
}

/**
 * Get the level label for social challenges
 */
export function getLevelLabel(level: number): string {
  switch (level) {
    case 1: return 'Casi sin friccion'
    case 2: return 'Un paso mas'
    case 3: return 'Conversacion real'
    case 4: return 'Sostener la conversacion'
    default: return `Nivel ${level}`
  }
}

/**
 * Get category display label
 */
export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'stoic': return 'Estoico'
    case 'communication': return 'Comunicacion'
    case 'social': return 'Social'
    case 'social_ladder': return 'Escalera Social'
    default: return category
  }
}

/**
 * Get resource type display label
 */
export function getResourceTypeLabel(type: string): string {
  switch (type) {
    case 'book': return 'Libro'
    case 'youtube': return 'YouTube'
    case 'course': return 'Curso'
    case 'diplomado': return 'Diplomado'
    default: return type
  }
}

/**
 * Generate an array of dates for the last N days
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}
