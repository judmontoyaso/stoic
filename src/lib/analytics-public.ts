// Métricas del embudo público (visitantes sin sesión).
// Fire-and-forget con sendBeacon: no bloquea la navegación ni se pierde
// si el visitante se va justo después de disparar el evento.

import { generateEventId, ttqTrack } from '@/lib/tiktok-pixel'

export type PublicEventName =
  | 'landing_view'
  | 'landing_cta_click'
  | 'lead_form_submitted'
  | 'becas_view'
  | 'beca_form_submitted'
  | 'login_view'

export function trackPublic(
  name: PublicEventName,
  props?: Record<string, string | number | boolean>,
  customEventId?: string
): void {
  if (typeof window === 'undefined') return

  const eventId = customEventId || generateEventId(name)

  // Reenviar eventos equivalentes al TikTok Pixel (con event_id para deduplicar con Events API)
  switch (name) {
    case 'landing_view':
      ttqTrack(
        'ViewContent',
        { content_id: 'landing', content_type: 'product', content_name: 'Landing StoiCom', ...props },
        { event_id: eventId }
      )
      break
    case 'becas_view':
      ttqTrack(
        'ViewContent',
        { content_id: 'becas', content_type: 'product', content_name: 'Becas de Mérito', ...props },
        { event_id: eventId }
      )
      break
    case 'landing_cta_click':
      ttqTrack('ClickButton', { content_name: 'Landing CTA', ...props }, { event_id: eventId })
      break
    case 'lead_form_submitted':
      ttqTrack(
        'CompleteRegistration',
        { content_id: 'lead-7-dias', content_type: 'product', content_name: '7 días gratis', ...props },
        { event_id: eventId }
      )
      break
    case 'beca_form_submitted':
      ttqTrack(
        'CompleteRegistration',
        { content_id: 'beca-merito', content_type: 'product', content_name: 'Beca de Mérito', ...props },
        { event_id: eventId }
      )
      break
  }

  try {
    const payload = JSON.stringify({
      name,
      props,
      event_id: eventId,
      url: window.location.href,
    })
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
