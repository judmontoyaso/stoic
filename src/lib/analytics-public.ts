// Métricas del embudo público (visitantes sin sesión).
// Fire-and-forget con sendBeacon: no bloquea la navegación ni se pierde
// si el visitante se va justo después de disparar el evento.

export type PublicEventName =
  | 'landing_view'
  | 'landing_cta_click'
  | 'lead_form_submitted'
  | 'becas_view'
  | 'beca_form_submitted'
  | 'login_view'

export function trackPublic(name: PublicEventName, props?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return
  try {
    const payload = JSON.stringify({ name, props })
    // sendBeacon sobrevive a que la pestaña se cierre; fetch es el respaldo
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }))
      return
    }
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
    // Nunca romper la página por una métrica
  }
}
