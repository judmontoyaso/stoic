import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rutas que no requieren sesión
function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/cron') ||      // manejan su propio token
    pathname.startsWith('/auth/') ||         // callback OAuth + verificación de código
    pathname.startsWith('/api/auth/verify-code') ||
    pathname.startsWith('/icons/') ||
    pathname === '/login' ||
    pathname === '/landing' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname === '/sculpture.png' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js'
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  if (isPublicPath(pathname)) {
    return response
  }

  // Sesión Supabase (Google OAuth). getUser() valida el token y
  // refresca las cookies si es necesario.
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

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Logueado con Google pero sin aprobar: debe presentar el código una vez
    if (user.app_metadata?.stoicom_approved !== true) {
      return NextResponse.redirect(new URL('/auth/verify', request.url))
    }
    return response
  }

  // Visitante sin sesión: la raíz muestra la landing; el resto pide login
  const destination = pathname === '/' ? '/landing' : '/login'
  return NextResponse.redirect(new URL(destination, request.url))
}

// Configuración de las rutas a interceptar
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sculpture.png|icons/).*)'],
}
