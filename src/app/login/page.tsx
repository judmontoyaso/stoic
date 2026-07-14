'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'

const OAUTH_ERRORS: Record<string, string> = {
  oauth: 'Error al iniciar sesión con Google. Intenta de nuevo.',
  sin_codigo: 'Google no devolvió el código de sesión. Intenta de nuevo.',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) toast.error(OAUTH_ERRORS[error] || 'Error de autenticación')
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error('No se pudo iniciar el login con Google')
        setGoogleLoading(false)
      }
      // Si no hay error, el navegador redirige a Google
    } catch (err) {
      console.error(err)
      toast.error('Error al conectar con Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-sm space-y-6">

        {/* Branding & Logo */}
        <div className="text-center space-y-2">
          <img
            src="/sculpture.png"
            alt="Escultura Estoica"
            className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-[var(--primary-gold)]/40 shadow-sm"
          />
          <h1 className="text-xl font-black tracking-wider text-[var(--foreground)] mt-2">
            Stoi<span className="text-[var(--primary-gold)]">Com</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 uppercase tracking-widest font-semibold">
            Preparación Estoica y Comunicación
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-sm font-bold text-[var(--foreground)] hover:border-[var(--primary-gold)]/50 transition-all disabled:opacity-50"
        >
          {googleLoading ? (
            <i className="pi pi-spin pi-spinner" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.96 10.96 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          Continuar con Google
        </button>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          La primera vez se te pedirá un código de acceso para aprobar tu correo.
        </p>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Al continuar aceptas los{' '}
          <a href="/terms" className="text-[var(--primary-gold)] hover:underline">Términos de Servicio</a>
          {' '}y la{' '}
          <a href="/privacy" className="text-[var(--primary-gold)] hover:underline">Política de Privacidad</a>.
        </p>

        {/* Memento Mori Footer */}
        <div className="text-center pt-2 border-t border-[var(--border-color)]">
          <p className="text-[9px] text-slate-550 dark:text-slate-450 uppercase tracking-widest font-black">
            Memento Mori · Carpe Diem
          </p>
        </div>

      </div>
    </div>
  )
}
