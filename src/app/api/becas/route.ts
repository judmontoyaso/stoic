import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Recibe aplicaciones a las becas fundador (formulario público /becas).
// No otorga nada: guarda la aplicación; el admin decide en /admin/becas.

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }

  let body: { name?: string; email?: string; activity?: string; reason?: string; website?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  // Honeypot: el campo "website" está oculto en el formulario; si viene
  // lleno es un bot. Se responde ok para no darle señal.
  if (body.website) return NextResponse.json({ ok: true })

  const name = String(body.name || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().toLowerCase().slice(0, 200)
  const activity = String(body.activity || '').trim().slice(0, 300)
  const reason = String(body.reason || '').trim().slice(0, 1500)

  if (!name || !reason || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Completa nombre, correo válido y tu porqué' }, { status: 400 })
  }
  if (reason.length < 30) {
    return NextResponse.json(
      { error: 'Cuéntanos un poco más: el porqué decide la beca (mínimo 30 caracteres)' },
      { status: 400 }
    )
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  const { error } = await admin
    .from('beca_applications')
    .insert({ name, email, activity: activity || null, reason })

  if (error) {
    // 23505 = ya aplicó con ese correo
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, repeat: true })
    }
    console.error('Error guardando aplicación de beca:', error.message)
    return NextResponse.json({ error: 'No se pudo guardar. Intenta de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
