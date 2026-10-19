import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin'
import { nextExpiry } from '@/lib/access'

// Callback de OAuth (Google via Supabase): intercambia el código por la
// sesión. Si el correo aún no está aprobado (app_metadata.stoicom_approved),
// se envía a /auth/verify donde debe presentar el código de acceso una vez.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=sin_codigo`)
  }

  const response = NextResponse.redirect(`${origin}/`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  if (data.user.app_metadata?.stoicom_approved !== true) {
    if (isAdminEmail(data.user.email)) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceKey) {
        const admin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
        await admin.auth.admin.updateUserById(data.user.id, {
          app_metadata: { ...data.user.app_metadata, stoicom_approved: true, stoicom_plan: 'annual' },
        })
        return response
      }
    }

    // Comprobar si el usuario pagó previamente antes de crear su cuenta (Lemon Squeezy o Mercado Pago)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey && data.user.email) {
      try {
        const adminDb = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
          db: { schema: 'stoic' },
        })
        const { data: paidRecords } = await adminDb
          .from('payments')
          .select('id, plan')
          .eq('email', data.user.email.toLowerCase())
          .eq('status', 'approved')
          .limit(1)

        if (paidRecords && paidRecords.length > 0) {
          const adminAuth = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
          const expiresAt = nextExpiry(null).toISOString()
          await adminAuth.auth.admin.updateUserById(data.user.id, {
            app_metadata: {
              ...data.user.app_metadata,
              stoicom_approved: true,
              stoicom_plan: paidRecords[0].plan || 'founder',
              stoicom_paid_at: new Date().toISOString(),
              stoicom_expires_at: expiresAt,
            },
          })
          await adminDb
            .from('payments')
            .update({ user_id: data.user.id })
            .eq('id', paidRecords[0].id)

          return response
        }
      } catch (err) {
        console.error('Error comprobando pagos previos al iniciar sesión:', err)
      }
    }

    // Sesión iniciada pero sin aprobar: pedir el código de acceso o redirigir a verificación.
    // Se sobreescribe solo el destino para conservar las cookies de sesión.
    const intent = searchParams.get('intent')
    const verifyUrl = `${origin}/auth/verify${intent ? `?intent=${encodeURIComponent(intent)}` : ''}`
    response.headers.set('location', verifyUrl)
  }

  return response
}
