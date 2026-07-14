// Server-only. Envío de notificaciones Web Push por usuario.

import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cliente con cualquier esquema (la app usa el esquema "stoic")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

export interface PushPayload {
  title: string
  body: string
  url?: string // ruta a abrir al tocar la notificación
  tag?: string // agrupa/reemplaza notificaciones del mismo tipo
}

function configureVapid(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(
    'mailto:' + (process.env.NOTIFICATION_EMAIL || 'no-reply@example.com'),
    publicKey,
    privateKey
  )
  return true
}

/**
 * Envía un push a las suscripciones de UN usuario (cada quien recibe
 * su propio contenido; una suscripción sin user_id no recibe nada).
 * Limpia automáticamente las suscripciones expiradas (410/404).
 * Best effort: nunca lanza, devuelve conteos.
 */
export async function sendPushToUser(
  supabase: AnySupabaseClient,
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number; removed: number }> {
  if (!configureVapid()) {
    return { sent: 0, failed: 0, removed: 0 }
  }

  let subs: { id: string; endpoint: string; keys: { p256dh: string; auth: string } }[] = []
  try {
    const { data } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, keys')
      .eq('user_id', userId)
    subs = data || []
  } catch {
    return { sent: 0, failed: 0, removed: 0 }
  }

  let sent = 0
  let failed = 0
  let removed = 0

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload)
      )
      sent++
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        // Suscripción expirada: eliminarla
        try {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          removed++
        } catch { /* ignorar */ }
      } else {
        console.error('Error enviando push:', statusCode, err)
        failed++
      }
    }
  }

  return { sent, failed, removed }
}
