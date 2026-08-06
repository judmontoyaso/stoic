import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { mpConfig, createPreference } from '@/lib/mercadopago'
import { readAccess } from '@/lib/access'

// Crea la preferencia de Mercado Pago para el usuario logueado y devuelve
// el init_point (URL de checkout). El front redirige ahí.
//
// A diferencia de Lemon Squeezy (URL estática en el bundle), MP necesita
// una preferencia por comprador para colgarle el user_id, y por eso hace
// falta este paso de backend. El proxy deja pasar /api/checkout/ y la
// autorización real se resuelve aquí con la sesión.

export const maxDuration = 30

export async function POST() {
  const config = mpConfig()
  if (!config) {
    return NextResponse.json({ error: 'Mercado Pago no está habilitado' }, { status: 503 })
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })
  }

  // Quién puede pagar: el que no tiene acceso, el vencido que renueva, y
  // el vigente al que le quedan menos de RENEW_WINDOW_DAYS (renovar
  // temprano no le cuesta días, nextExpiry los suma).
  //
  // Se bloquea al vitalicio —no vence nunca, cobrarle sería robarle— y al
  // que aún tiene el año largo por delante, para que no pague dos veces
  // por olvido. Ese doble cobro es la queja de soporte más cara que hay.
  const RENEW_WINDOW_DAYS = 60
  const access = readAccess(user.app_metadata)
  if (access.state === 'lifetime') {
    return NextResponse.json({ error: 'Tu acceso no vence: no necesitas pagar' }, { status: 409 })
  }
  if (access.state === 'active' && (access.daysToExpiry ?? 0) > RENEW_WINDOW_DAYS) {
    return NextResponse.json(
      { error: `Tu acceso sigue vigente. Podrás renovar cuando falten ${RENEW_WINDOW_DAYS} días.` },
      { status: 409 }
    )
  }

  const appUrl = process.env.APP_URL || new URL('http://localhost:3000').origin
  const pref = await createPreference({
    config,
    userId: user.id,
    email: user.email ?? null,
    appUrl,
  })
  if (!pref) {
    return NextResponse.json({ error: 'No se pudo iniciar el pago' }, { status: 502 })
  }

  return NextResponse.json({ initPoint: pref.initPoint })
}
