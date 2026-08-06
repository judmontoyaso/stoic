import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'

// ¿Ya autorizó el dictado?
//
// Lo consulta el botón al montarse, para poder pedir el permiso ANTES de
// grabar. Antes se descubría al recibir el 403 del POST, o sea después
// de que la persona ya había hablado: pésima experiencia.

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ autorizado: false }, { status: 401 })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ autorizado: false })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })
  const { data } = await admin
    .from('user_prefs')
    .select('voice_consent_at')
    .eq('user_id', user.id)
    .limit(1)

  return NextResponse.json({ autorizado: Boolean(data?.[0]?.voice_consent_at) })
}
