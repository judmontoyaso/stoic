// ============================================================
// Utility Functions
// ============================================================

/**
 * Format a Date as YYYY-MM-DD using the local timezone
 * (toISOString daría la fecha UTC: en UTC-5 "hoy" saltaría al día
 * siguiente desde las 7pm)
 */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 */
export function getToday(): string {
  return toLocalDateString(new Date())
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
