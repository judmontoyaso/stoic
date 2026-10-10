import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { getLemonSqueezyCheckoutUrl } from '@/lib/lemon'

// Endpoint de backend para iniciar el checkout de Lemon Squeezy con la sesión activa.
// Devuelve la URL de checkout personalizada con el ID del usuario autenticado.

export const maxDuration = 30

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })
  }

  // Ya aprobado: no tiene sentido cobrarle de nuevo
  if (user.app_metadata?.stoicom_approved === true) {
    return NextResponse.json({ error: 'Tu cuenta ya tiene acceso' }, { status: 409 })
  }

  const checkoutUrl = getLemonSqueezyCheckoutUrl({
    userId: user.id,
    email: user.email ?? null,
  })

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: 'Lemon Squeezy no está configurado (falta NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL)' },
      { status: 503 }
    )
  }

  return NextResponse.json({ checkoutUrl })
}
