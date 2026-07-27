import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Eventos del embudo PÚBLICO (visitantes sin sesión). Los eventos de
// usuarios logueados van por lib/analytics.ts directo a la tabla con RLS;
// aquí entran los anónimos, que no tienen sesión con que escribir.
//
// Es un endpoint de escritura abierto: por eso solo acepta nombres de una
// lista blanca, props recortadas, y nunca devuelve datos.

const ALLOWED = new Set([
  'landing_view',
  'landing_cta_click',
  'lead_form_submitted',
  'becas_view',
  'beca_form_submitted',
  'login_view',
])

/** Props: máximo 6 claves, valores cortos. Evita que el endpoint sea un depósito. */
function sanitizeProps(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== 'object') return null
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Object.keys(out).length >= 6) break
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k.slice(0, 40)] = String(v).slice(0, 120)
    }
  }
  return Object.keys(out).length ? out : null
}

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ ok: false }, { status: 204 })

  let body: { name?: string; props?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const name = String(body.name || '')
  // Nombre desconocido: se ignora en silencio (no es error del visitante)
  if (!ALLOWED.has(name)) return NextResponse.json({ ok: true })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  // user_id queda NULL: es un visitante anónimo, y esa es justo la señal
  // que faltaba para calcular conversión (visitas -> leads).
  await admin.from('events').insert({ name, props: sanitizeProps(body.props) })

  return NextResponse.json({ ok: true })
}
