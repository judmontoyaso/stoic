// Integración con TikTok Pixel (stoicom — ID: DBB8ICRC77UF47DK11HG).
// Todas las llamadas son fire-and-forget y tolerantes a bloqueadores de anuncios.

export const TIKTOK_PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'DBB8ICRC77UF47DK11HG'

export type TikTokStandardEvent =
  | 'ViewContent'
  | 'ClickButton'
  | 'SubmitForm'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'CompletePayment'
  | 'Purchase'
  | 'PlaceAnOrder'
  | 'Subscribe'
  | 'Contact'

interface TikTokAnalytics {
  page: () => void
  track: (
    event: TikTokStandardEvent | string,
    params?: Record<string, unknown>,
    options?: { event_id?: string }
  ) => void
  identify: (params: { email?: string; phone_number?: string; external_id?: string }) => void
}

declare global {
  interface Window {
    ttq?: TikTokAnalytics
  }
}

export function generateEventId(prefix = 'tt'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function persistTtclidCookie(): void {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const ttclid = params.get('ttclid')
    if (ttclid && /^[A-Za-z0-9._-]+$/.test(ttclid)) {
      document.cookie = `ttclid=${encodeURIComponent(ttclid)}; path=/; max-age=2592000; SameSite=Lax`
    }
  } catch {
    // Ignorar errores de acceso a cookies/URL
  }
}

export function ttqPage(): void {
  if (typeof window === 'undefined') return
  try {
    window.ttq?.page()
  } catch {
    // Ignorar si un bloqueador impide cargar el pixel
  }
}

export function ttqIdentify(params: {
  email?: string
  phone_number?: string
  external_id?: string
}): void {
  if (typeof window === 'undefined') return
  try {
    const clean: Record<string, string> = {}
    if (params.email) clean.email = params.email.trim().toLowerCase()
    if (params.phone_number) clean.phone_number = params.phone_number.trim()
    if (params.external_id) clean.external_id = params.external_id.trim()
    if (Object.keys(clean).length > 0) {
      window.ttq?.identify(clean)
    }
  } catch {
    // Ignorar errores de terceros
  }
}

export function ttqTrack(
  event: TikTokStandardEvent,
  params?: Record<string, unknown>,
  options?: { event_id?: string }
): void {
  if (typeof window === 'undefined') return
  try {
    if (options?.event_id) {
      window.ttq?.track(event, params, { event_id: options.event_id })
    } else {
      window.ttq?.track(event, params)
    }
  } catch {
    // Nunca romper la experiencia por una métrica
  }
}
