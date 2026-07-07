import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const appPassword = process.env.APP_PASSWORD || 'stoic2026'

    if (password === appPassword) {
      const response = NextResponse.json({ success: true })
      
      // Establecer cookie de sesión segura (duración: 30 días)
      response.cookies.set('stoic_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 días
        sameSite: 'lax',
      })

      return response
    }

    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  } catch (error) {
    console.error('Error en login API:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
