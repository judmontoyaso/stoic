import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// ¿La sesión actual es administradora? (el Sidebar decide si muestra
// el enlace al panel; la autorización real vive en /api/admin/stats)

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json({ admin: isAdminEmail(user?.email) })
}
