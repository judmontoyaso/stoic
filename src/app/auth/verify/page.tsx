'use client'

import { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'
import { track } from '@/lib/analytics'
import { PROGRAM_PRICE, copLabel, usdLabel } from '@/lib/pricing'
import { ttqIdentify, ttqTrack } from '@/lib/tiktok-pixel'

// Primera entrada con Google: hasta tres puertas, una sola vez.
//   1. Fundador vía Mercado Pago (LatAm: tarjeta, PSE, Nequi; el webhook aprueba)
//   2. Fundador vía Lemon Squeezy (internacional/USD; el webhook aprueba)
//   3. Código de invitación o beca (gratis)

const DEFAULT_LS_URL =
  'https://stoicom.lemonsqueezy.com/checkout/buy/3bb96131-5e7d-41cd-b253-97173f19ca0a'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || DEFAULT_LS_URL
  )
  const [mpLoading, setMpLoading] = useState(false)

  const handleMercadoPago = useCallback(async () => {
    setMpLoading(true)
    ttqTrack('InitiateCheckout', {
      contents: [
        {
          content_id: 'stoicom-anual',
          content_type: 'product',
          content_name: 'Matrícula Anual StoiCom',
          quantity: 1,
          price: PROGRAM_PRICE.cop,
        },
      ],
      value: PROGRAM_PRICE.cop,
      currency: 'COP',
    })
    try {
      const res = await fetch('/api/checkout/mercadopago', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.initPoint) {
        window.location.href = data.initPoint
      } else {
        toast.error(data.error || 'No se pudo iniciar el pago')
        setMpLoading(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo iniciar el pago')
      setMpLoading(false)
    }
  }, [])

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || DEFAULT_LS_URL
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      ttqIdentify({ email: user.email, external_id: user.id })
      const sep = base.includes('?') ? '&' : '?'
      const params = `checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || '')}`
      setCheckoutUrl(`${base}${sep}${params}`)
    })

    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('intent') === 'mercadopago') {
        handleMercadoPago()
      }
    } catch {
      // Ignorar si no hay window
    }
  }, [handleMercadoPago])

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
        ttqTrack('CompleteRegistration', { content_name: 'Código de acceso', status: 'approved' })
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
            Activa tu acceso
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            Tu cuenta de Google inició sesión. Elige tu método de pago para activar tu
            <span className="font-bold"> Matrícula Anual</span> o ingresa tu código de invitación.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
            Matrícula Anual · Pago único (sin suscripción)
          </p>

          <button
            type="button"
            onClick={handleMercadoPago}
            disabled={mpLoading}
            className="block w-full py-2.5 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-center text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mpLoading ? 'Abriendo Mercado Pago…' : `Pagar ${copLabel} COP (Mercado Pago / PSE)`}
          </button>

          {checkoutUrl && (
            <a
              href={checkoutUrl}
              onClick={() =>
                ttqTrack('InitiateCheckout', {
                  contents: [
                    {
                      content_id: 'stoicom-anual',
                      content_type: 'product',
                      content_name: 'Matrícula Anual StoiCom',
                      quantity: 1,
                      price: PROGRAM_PRICE.usd,
                    },
                  ],
                  value: PROGRAM_PRICE.usd,
                  currency: 'USD',
                })
              }
              className="block w-full py-2.5 rounded-lg border border-[var(--primary-gold)]/50 text-center text-sm font-bold text-[var(--primary-gold)] hover:bg-[var(--primary-gold)]/10 transition-colors"
            >
              Pagar {usdLabel} USD (Tarjeta Internacional / PayPal)
            </a>
          )}

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            Un año completo (210 prácticas, 3 tracks). Garantía de 7 días. Consulta la{' '}
            <a href="/reembolsos" className="text-[var(--primary-gold)] hover:underline">política de reembolsos</a>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3 pt-4 border-t border-[var(--border-color)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
              ¿Tienes código de invitación o beca?
            </label>
            <Input
              id="code"
              type="password"
              placeholder="Ingresa tu código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              showPasswordToggle
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg border border-[var(--border-color)] text-[var(--foreground)] text-xs font-bold hover:border-[var(--primary-gold)]/50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Canjear código de acceso'}
          </button>
        </form>

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
