// Server-only. Integración con TikTok Events API v1.3 (/open_api/v1.3/event/track/).
// Envía conversiones servidor a servidor (ViewContent, InitiateCheckout,
// CompleteRegistration, Purchase, etc.) con deduplicación (event_id) y
// parámetros de cliente hasheados en SHA-256 (email, phone, external_id).

import crypto from 'node:crypto'
import { TIKTOK_PIXEL_ID } from '@/lib/tiktok-pixel'

const TIKTOK_EVENTS_ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

export type TikTokServerEventName =
  | 'ViewContent'
  | 'AddToWishlist'
  | 'Search'
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'PlaceAnOrder'
  | 'CompleteRegistration'
  | 'Purchase'
  | 'SubmitForm'
  | 'ClickButton'

export interface TikTokServerEventOptions {
  event: TikTokServerEventName
  eventId?: string
  url?: string
  request?: Request
  user?: {
    email?: string | null
    phone?: string | null
    externalId?: string | null
    ip?: string | null
    userAgent?: string | null
    ttclid?: string | null
    ttp?: string | null
  }
  properties?: {
    value?: number
    currency?: string
    content_id?: string
    content_type?: string
    content_name?: string
    search_string?: string
    contents?: Array<{
      content_id?: string
      content_type?: string
      content_name?: string
      quantity?: number
      price?: number
    }>
  }
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function parseCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match?.[1] ? decodeURIComponent(match[1].trim()) : undefined
}

function extractTtclidFromUrl(rawUrl?: string | null): string | undefined {
  if (!rawUrl) return undefined
  try {
    const parsed = new URL(rawUrl)
    return parsed.searchParams.get('ttclid') || undefined
  } catch {
    return undefined
  }
}

export async function sendTikTokServerEvent(opts: TikTokServerEventOptions): Promise<void> {
  const accessToken = process.env.TIKTOK_EVENTS_API_TOKEN
  if (!accessToken) return

  try {
    const req = opts.request
    const cookieHeader = req?.headers.get('cookie') ?? null
    const referer = req?.headers.get('referer') ?? undefined

    const ip =
      opts.user?.ip ||
      req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req?.headers.get('x-real-ip')?.trim() ||
      undefined

    const userAgent = opts.user?.userAgent || req?.headers.get('user-agent') || undefined
    const ttp = opts.user?.ttp || parseCookie(cookieHeader, '_ttp')
    const ttclid =
      opts.user?.ttclid ||
      parseCookie(cookieHeader, 'ttclid') ||
      extractTtclidFromUrl(opts.url) ||
      extractTtclidFromUrl(referer)

    const userPayload: Record<string, string> = {}
    if (opts.user?.email) {
      const normalizedEmail = opts.user.email.trim().toLowerCase()
      if (normalizedEmail) userPayload.email = sha256(normalizedEmail)
    }
    if (opts.user?.phone) {
      const normalizedPhone = opts.user.phone.replace(/\s+/g, '').trim()
      if (normalizedPhone) userPayload.phone = sha256(normalizedPhone)
    }
    if (opts.user?.externalId) {
      const normalizedExt = opts.user.externalId.trim()
      if (normalizedExt) userPayload.external_id = sha256(normalizedExt)
    }
    if (ip) userPayload.ip = ip
    if (userAgent) userPayload.user_agent = userAgent
    if (ttclid) userPayload.ttclid = ttclid
    if (ttp) userPayload.ttp = ttp

    const appUrl = (process.env.APP_URL || 'https://stoicom.app').replace(/\/$/, '')
    const pageUrl = opts.url || referer || `${appUrl}/landing`

    const eventId = opts.eventId || crypto.randomUUID()
    const eventTime = Math.floor(Date.now() / 1000)

    const payload = {
      event_source: 'web',
      event_source_id: TIKTOK_PIXEL_ID,
      data: [
        {
          event: opts.event,
          event_time: eventTime,
          event_id: eventId,
          user: userPayload,
          properties: opts.properties ?? {},
          page: {
            url: pageUrl,
          },
        },
      ],
    }

    const res = await fetch(TIKTOK_EVENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error('TikTok Events API HTTP error:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('TikTok Events API error:', err)
  }
}
