import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { hasProgramAccess } from '@/lib/access'

// Dictado del diario: audio → texto con Deepgram.
//
// El audio NUNCA pasa por el navegador hacia Deepgram: la llave vive en
// el servidor y el cliente solo habla con esta ruta. Si la llave saliera
// al bundle, cualquiera podría gastar la cuota.
//
// Tres frenos, en orden:
//   1. Sesión con vigencia viva (es función de pago).
//   2. Consentimiento explícito guardado en user_prefs.voice_consent_at.
//      Mandar la voz de alguien a un procesador en el exterior exige
//      autorización previa e informada (Ley 1581): no basta con tenerlo
//      escrito en /privacy.
//   3. Tope mensual de minutos. Deepgram cobra por minuto y sin tope un
//      micrófono abierto se come el margen del año entero.
//
// POST /api/transcribe  (body: el audio crudo; content-type = su mime)

export const maxDuration = 60

/** Tope mensual por usuario. 60 min ≈ $0,26 USD al mes en el peor caso. */
const MAX_MINUTES_MONTH = 60
/** Deepgram cobra por audio subido: un archivo enorme es dinero y latencia. */
const MAX_BYTES = 12 * 1024 * 1024

const ALLOWED_MIME = /^audio\/(webm|ogg|mp4|mpeg|wav|x-m4a|aac)(;.*)?$/i

/**
 * PUT → registra el consentimiento del dictado.
 *
 * Lo llama el aviso que sale la primera vez que el usuario toca el
 * micrófono. Se guarda con fecha para poder demostrar cuándo autorizó.
 */
export async function PUT() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  const { error } = await admin
    .from('user_prefs')
    .upsert(
      { user_id: user.id, voice_consent_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) {
    console.error('Error guardando consentimiento de voz:', error.message)
    return NextResponse.json(
      { error: 'No se pudo guardar la autorización (¿falta supabase_v15?)' },
      { status: 503 }
    )
  }
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const key = process.env.DEEPGRAM_SECRET
  if (!key) {
    return NextResponse.json({ error: 'El dictado no está habilitado' }, { status: 503 })
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })
  }
  if (!hasProgramAccess(user.app_metadata)) {
    return NextResponse.json({ error: 'Tu acceso no está vigente' }, { status: 403 })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!ALLOWED_MIME.test(contentType)) {
    return NextResponse.json({ error: `Formato de audio no admitido: ${contentType}` }, { status: 415 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  // Consentimiento
  const { data: prefs } = await admin
    .from('user_prefs')
    .select('voice_consent_at')
    .eq('user_id', user.id)
    .limit(1)
  if (!prefs?.[0]?.voice_consent_at) {
    return NextResponse.json(
      { error: 'Falta autorizar el dictado', needsConsent: true },
      { status: 403 }
    )
  }

  // Tope mensual (se consulta antes de gastar, se suma después)
  const month = new Date().toISOString().slice(0, 7)
  const { data: usage } = await admin
    .from('transcription_usage')
    .select('seconds')
    .eq('user_id', user.id)
    .eq('month', month)
    .limit(1)
  const usados = usage?.[0]?.seconds ?? 0
  if (usados >= MAX_MINUTES_MONTH * 60) {
    return NextResponse.json(
      {
        error: `Llegaste al tope de ${MAX_MINUTES_MONTH} minutos de dictado este mes. Se reinicia el día 1.`,
        capReached: true,
      },
      { status: 429 }
    )
  }

  const audio = await request.arrayBuffer()
  if (audio.byteLength === 0) {
    return NextResponse.json({ error: 'No llegó audio' }, { status: 400 })
  }
  if (audio.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'La grabación es demasiado larga' }, { status: 413 })
  }

  // nova-2 con español: smart_format mete puntuación y mayúsculas, que es
  // justo lo que evita que el diario quede en un solo bloque sin comas.
  const params = new URLSearchParams({
    model: process.env.DEEPGRAM_MODEL || 'nova-2',
    language: 'es',
    smart_format: 'true',
    punctuate: 'true',
  })

  let payload: {
    results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> }
    metadata?: { duration?: number }
  }
  try {
    const res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': contentType },
      body: audio,
    })
    if (!res.ok) {
      const detalle = await res.text()
      console.error('Deepgram respondió %d:', res.status, detalle.slice(0, 400))
      return NextResponse.json({ error: 'No se pudo transcribir el audio' }, { status: 502 })
    }
    payload = await res.json()
  } catch (err) {
    console.error('Error llamando a Deepgram:', err)
    return NextResponse.json({ error: 'No se pudo transcribir el audio' }, { status: 502 })
  }

  const transcript = payload.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ''
  const duration = Math.ceil(payload.metadata?.duration ?? 0)

  // Se cobra lo consumido aunque la transcripción venga vacía: Deepgram
  // ya facturó ese audio.
  let totalMes = usados
  if (duration > 0) {
    const { data: nuevoTotal } = await admin.rpc('add_transcription_seconds', {
      p_user: user.id,
      p_month: month,
      p_seconds: duration,
    })
    if (typeof nuevoTotal === 'number') totalMes = nuevoTotal
  }

  return NextResponse.json({
    transcript,
    seconds: duration,
    minutosRestantes: Math.max(0, Math.round((MAX_MINUTES_MONTH * 60 - totalMes) / 60)),
  })
}
