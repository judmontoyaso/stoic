import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { seedVeteranUser } from '@/lib/seed-veteran'

// Endpoint seguro para poblar los datos de un usuario para grabación de demostración
export async function GET(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Faltan credenciales de Supabase en el servidor' }, { status: 500 })
  }

  // 1. Verificar si hay sesión activa
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  let targetUserId = user?.id
  let targetUserEmail = user?.email

  // 2. Si no hay sesión o se pide explícitamente cirosteven278@gmail.com
  if (!targetUserId) {
    const admin = createSupabaseAdmin(supabaseUrl, serviceKey)
    const { data: usersData, error: userErr } = await admin.auth.admin.listUsers()
    if (userErr || !usersData?.users) {
      return NextResponse.json({ error: 'No se pudieron consultar los usuarios' }, { status: 500 })
    }
    const foundUser = usersData.users.find(u => u.email?.toLowerCase() === 'cirosteven278@gmail.com')
    if (!foundUser) {
      return NextResponse.json({
        error: 'El usuario cirosteven278@gmail.com no se ha registrado aún en la base de datos. Inicia sesión una vez con Google.',
      }, { status: 404 })
    }
    targetUserId = foundUser.id
    targetUserEmail = foundUser.email
  }

  const result = await seedVeteranUser(targetUserId, targetUserEmail)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  return GET(request)
}
