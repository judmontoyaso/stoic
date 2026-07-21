// Server-only. Captación de correos desde la landing: doble opt-in y
// secuencia de 7 días. Los leads NO son usuarios: viven en
// stoic.leads y solo se tocan con service role (RLS sin políticas).
// Requiere supabase_v9_leads.sql.

import { createClient } from '@supabase/supabase-js'
import { sendEmail, leadConfirmEmail, leadDripEmail } from '@/lib/email'
import { getQuoteForDay } from '@/lib/quotes'
import { getModuleLabel } from '@/lib/program'
import type { ProgramModule } from '@/types'

export const DRIP_LENGTH = 7
export const DRIP_TRACK_SLUG = 'comunicacion'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceClient = ReturnType<typeof createClient<any, any, any>>

export interface Lead {
  email: string
  token: string
  source: string | null
  created_at: string
  confirm_sent_at: string | null
  confirmed_at: string | null
  drip_day: number
  last_drip_sent: string | null
  unsubscribed_at: string | null
  converted_at: string | null
}

export function serviceClient(): ServiceClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { db: { schema: 'stoic' } })
}

export function appUrl(): string {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function normalizeEmail(raw: unknown): string | null {
  const email = String(raw ?? '').trim().toLowerCase()
  // Deliberadamente laxo: rechazar lo evidente sin pelear con RFC 5322
  if (email.length < 5 || email.length > 254) return null
  if (!/^[^\s@,;]+@[^\s@,;.]+\.[^\s@,;]{2,}$/.test(email)) return null
  return email
}

export function confirmUrl(token: string): string {
  return `${appUrl()}/api/leads/confirm?token=${token}`
}

export function unsubscribeUrl(token: string): string {
  return `${appUrl()}/api/leads/unsubscribe?token=${token}`
}

export async function sendConfirmation(lead: Lead): Promise<boolean> {
  return sendEmail(lead.email, leadConfirmEmail({ confirmUrl: confirmUrl(lead.token) }))
}

interface ProgramDayRow {
  day_number: number
  module: string
  title: string
  instructions: string
  rationale: string | null
  source_author: string | null
}

// Los 7 primeros días del track de comunicación, cacheados por
// invocación (la misma lambda sirve a varios leads en una pasada).
let daysCache: Map<number, ProgramDayRow> | null = null

export async function getDripDays(supabase: ServiceClient): Promise<Map<number, ProgramDayRow>> {
  if (daysCache) return daysCache

  const { data: tracks } = await supabase
    .from('tracks')
    .select('id')
    .eq('slug', DRIP_TRACK_SLUG)
    .limit(1)
  const trackId = tracks?.[0]?.id
  if (!trackId) return new Map()

  const { data } = await supabase
    .from('program_days')
    .select('day_number, module, title, instructions, rationale, source_author')
    .eq('track_id', trackId)
    .lte('day_number', DRIP_LENGTH)

  const map = new Map<number, ProgramDayRow>()
  for (const d of (data || []) as ProgramDayRow[]) map.set(d.day_number, d)
  daysCache = map
  return map
}

// Envía el día `dayNumber` de la secuencia y avanza el contador.
// localDate es la fecha con la que se marca el envío (dedupe diario).
export async function sendDripDay(
  supabase: ServiceClient,
  lead: Lead,
  dayNumber: number,
  localDate: string,
  opts: { markSent: boolean } = { markSent: true }
): Promise<boolean> {
  const days = await getDripDays(supabase)
  const day = days.get(dayNumber)
  if (!day) {
    console.error(`Drip: no existe el día ${dayNumber} del track ${DRIP_TRACK_SLUG}`)
    return false
  }

  const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || null

  const ok = await sendEmail(
    lead.email,
    leadDripEmail({
      dayNumber,
      title: day.title,
      instructions: day.instructions,
      rationale: day.rationale,
      sourceAuthor: day.source_author,
      moduleLabel: getModuleLabel(day.module as ProgramModule),
      quote: getQuoteForDay(dayNumber),
      appUrl: appUrl(),
      unsubscribeUrl: unsubscribeUrl(lead.token),
      checkoutUrl,
    })
  )

  if (ok && opts.markSent) {
    await supabase
      .from('leads')
      .update({ drip_day: dayNumber, last_drip_sent: localDate })
      .eq('email', lead.email)
  }
  return ok
}

// Marca como convertido al lead con ese correo, si existe. Se llama al
// aprobar por código y al comprar: sirve para medir qué tan bien
// convierte la secuencia. Nunca lanza.
export async function markLeadConverted(email: string | null | undefined): Promise<void> {
  const normalized = normalizeEmail(email)
  if (!normalized) return
  const supabase = serviceClient()
  if (!supabase) return
  try {
    await supabase
      .from('leads')
      .update({ converted_at: new Date().toISOString() })
      .eq('email', normalized)
      .is('converted_at', null)
  } catch (err) {
    console.error('No se pudo marcar el lead como convertido:', err)
  }
}
