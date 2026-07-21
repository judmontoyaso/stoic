import { NextResponse } from 'next/server'
import { serviceClient, sendDripDay, appUrl, type Lead } from '@/lib/leads'

// GET /api/leads/confirm?token=...
// Cierra el doble opt-in y manda el día 1 en el acto (esperar al cron
// del día siguiente enfriaría la intención). El cron se encarga del 2 al 7.
// Siempre redirige a /suscripcion, que es donde se le explica al visitante.

export const maxDuration = 60

function redirect(request: Request, estado: string) {
  const base = appUrl() || new URL(request.url).origin
  return NextResponse.redirect(`${base}/suscripcion?estado=${estado}`, { status: 303 })
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return redirect(request, 'error')

  const supabase = serviceClient()
  if (!supabase) return redirect(request, 'error')

  const { data, error } = await supabase.from('leads').select('*').eq('token', token).limit(1)
  if (error) {
    console.error('Leads confirm:', error.message)
    return redirect(request, 'error')
  }

  const lead = data?.[0] as Lead | undefined
  if (!lead) return redirect(request, 'error')
  if (lead.unsubscribed_at) return redirect(request, 'baja')
  // Reabrir el enlace no reenvía el día 1
  if (lead.confirmed_at) return redirect(request, 'confirmado')

  const today = new Date().toISOString().slice(0, 10)
  const { error: updateError } = await supabase
    .from('leads')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('email', lead.email)
  if (updateError) {
    console.error('Leads confirm: no se pudo marcar confirmado', updateError.message)
    return redirect(request, 'error')
  }

  // Best effort: si el día 1 no sale, el cron lo reintenta mañana
  try {
    await sendDripDay(supabase, lead, 1, today)
  } catch (err) {
    console.error('Leads confirm: falló el envío del día 1', err)
  }

  return redirect(request, 'confirmado')
}
