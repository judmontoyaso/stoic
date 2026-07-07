import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Excluir de la redirección de autenticación a:
  // - Archivos estáticos de Next.js (_next)
  // - Peticiones del cron (api/cron) que manejan su propio token
  // - Ruta de API de login (api/auth/login)
  // - Iconos y logotipo principal
  // - Ruta de la página de Login
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/icons/') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname === '/sculpture.png' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  }

  const session = request.cookies.get('stoic_session')?.value

  if (session !== 'authenticated') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })
}

// Configuración de las rutas a interceptar
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sculpture.png|icons/).*)'],
}
