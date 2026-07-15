'use client'

import { useEffect, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'
import { track } from '@/lib/analytics'

// Primera entrada con Google: dos puertas, una sola vez.
//   1. Código de invitación (gratis, beta privada)
//   2. Compra fundador vía Lemon Squeezy (pago único; el webhook aprueba)

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL
    if (!base) return
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const sep = base.includes('?') ? '&' : '?'
      const params = `checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || '')}`
      setCheckoutUrl(`${base}${sep}${params}`)
    })
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('Ingresa el código de acceso')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        track('code_approved')
        toast.success('Correo aprobado. Bienvenido.')
        window.location.href = '/welcome'
      } else {
        toast.error(data.error || 'Código incorrecto')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error verificando el código')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await createClient().auth.signOut()
    } catch { /* ignorar */ }
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/sculpture.png"
            alt="Escultura Estoica"
            className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-[var(--primary-gold)]/40 shadow-sm"
          />
          <h1 className="text-xl font-black tracking-wider text-[var(--foreground)] mt-2">
            Un paso más
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            Tu cuenta de Google inició sesión. Para entrar necesitas
            <span className="font-bold"> una única vez</span> un código de
            invitación, o el acceso de fundador.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
              Código de acceso
            </label>
            <InputText
              id="code"
              type="password"
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-sm"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Aprobar mi correo'}
          </button>

        </form>

        {checkoutUrl && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
              ¿Sin código?
            </p>
            <a
              href={checkoutUrl}
              className="block w-full py-2.5 rounded-lg border border-[var(--primary-gold)]/50 text-center text-sm font-bold text-[var(--primary-gold)] hover:bg-[var(--primary-gold)]/10 transition-colors"
            >
              Hazte fundador — pago único
            </a>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Acceso de por vida al programa completo. El pago se procesa en
              Lemon Squeezy; al confirmarse, tu cuenta entra sola (recarga esta
              página al volver).
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-2 rounded-lg text-xs text-slate-500 hover:text-[var(--foreground)] transition-colors"
        >
          Salir y usar otra cuenta
        </button>

        <div className="text-center pt-2 border-t border-[var(--border-color)]">
          <p className="text-[9px] text-slate-550 dark:text-slate-450 uppercase tracking-widest font-black">
            Memento Mori · Carpe Diem
          </p>
        </div>
      </div>
    </div>
  )
}
