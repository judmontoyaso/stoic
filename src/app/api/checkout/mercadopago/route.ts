import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { mpConfig, createPreference } from '@/lib/mercadopago'

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

  // Ya aprobado: no tiene sentido cobrarle de nuevo
  if (user.app_metadata?.stoicom_approved === true) {
    return NextResponse.json({ error: 'Tu cuenta ya tiene acceso' }, { status: 409 })
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
