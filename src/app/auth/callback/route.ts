import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

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
    // Sesión iniciada pero sin aprobar: pedir el código de acceso.
    // Se sobreescribe solo el destino para conservar las cookies de sesión.
    response.headers.set('location', `${origin}/auth/verify`)
  }

  return response
}
