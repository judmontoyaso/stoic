import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

// Callback de OAuth (Google via Supabase): intercambia el código por la
// sesión y aplica la lista de correos permitidos. Sin ALLOWED_EMAILS en
// producción se deniega todo login por Google: la app es personal.

function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

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

  const allowed = allowedEmails()
  const email = data.user.email?.toLowerCase() || ''
  const isAllowed = allowed.length > 0
    ? allowed.includes(email)
    : process.env.NODE_ENV !== 'production'

  if (!isAllowed) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_autorizado`)
  }

  return response
}
