'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cinzel } from 'next/font/google'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'
import { readAccess, type Access } from '@/lib/access'
import { copLabel, usdLabel } from '@/lib/pricing'

// Destino de quien se le venció el año. El proxy manda aquí a todo
// aprobado sin vigencia viva.
//
// Dos salidas, y la segunda importa tanto como la primera: renovar, o
// descargar el diario y llevárselo. Poner la descarga al lado del botón
// de pago es deliberado — si el borrado se anuncia sin dar la salida,
// suena a rehén.

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const GOLD = '#c9a84c'
const MP_ENABLED = process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED === 'true'

function fechaLarga(d: Date | null): string {
  if (!d) return ''
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function RenovarPage() {
  const [access, setAccess] = useState<Access | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [mpLoading, setMpLoading] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }
      const estado = readAccess(user.app_metadata)
      // Vigente: no pinta nada aquí
      if (estado.state === 'active' || estado.state === 'lifetime') {
        window.location.href = '/today'
        return
      }
      setAccess(estado)
      setEmail(user.email ?? null)

      const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL
      if (base) {
        const sep = base.includes('?') ? '&' : '?'
        const params = `checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || '')}`
        setCheckoutUrl(`${base}${sep}${params}`)
      }
    })
  }, [])

  const handleMercadoPago = async () => {
    setMpLoading(true)
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
  }

  if (!access) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0f]">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-600">Cargando</span>
      </div>
    )
  }

  const enGracia = access.state === 'grace'
  const vencio = fechaLarga(access.expiresAt)
  const borra = fechaLarga(access.purgeAt)
  const diasRestantes = access.daysToPurge ?? 0

  return (
    <div
      className={`${cinzel.variable} flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0f] px-6 py-16 text-slate-300`}
    >
      <Link href="/landing" className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sculpture.png"
          alt=""
          className="h-9 w-9 rounded-full border border-[#c9a84c]/40 object-cover"
        />
        <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100`}>
          STOI<span style={{ color: GOLD }}>COM</span>
        </span>
      </Link>

      <div className="mt-12 w-full max-w-md rounded-lg border border-[#c9a84c]/20 bg-[#111116] p-8">
        <h1 className={`${cinzel.className} text-center text-2xl leading-snug text-slate-100`}>
          {enGracia ? 'Tu año se acabó' : 'Tu acceso venció hace tiempo'}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          {enGracia ? (
            <>
              Venció el {vencio}. Tienes hasta el{' '}
              <strong className="text-slate-200">{borra}</strong> — quedan{' '}
              {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} — para renovar y seguir donde
              ibas, o para descargar tu diario y llevártelo.
            </>
          ) : (
            <>
              Venció el {vencio} y el {borra} se borró lo que habías escrito, como te avisamos.
              Tu cuenta sigue abierta: si vuelves, el programa arranca otra vez en el día uno.
            </>
          )}
        </p>

        {enGracia && (
          <div className="mt-6 rounded border border-[#c9a84c]/25 bg-[#16161d] p-4">
            <p className="text-xs leading-relaxed text-slate-400">
              Descarga tu diario completo: cada entrada, cada examen nocturno, cada día que
              marcaste. Es gratis, no pide nada y puedes hacerlo aunque no pienses volver.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/api/export/journal"
                className="rounded border border-[#c9a84c]/50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/10"
              >
                Descargar (legible)
              </a>
              <a
                href="/api/export/journal?format=json"
                className="rounded border border-slate-700 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-800"
              >
                Descargar (JSON)
              </a>
            </div>
          </div>
        )}

        <div className="mt-7 border-t border-slate-800 pt-6">
          <p className="text-xs leading-relaxed text-slate-500">
            {enGracia
              ? 'Renuevas al mismo precio que pagaste la primera vez. Ese precio es tuyo mientras no dejes vencer el acceso.'
              : 'El precio que tenías ya no aplica cuando se deja vencer el acceso. Este es el de hoy.'}
          </p>

          {MP_ENABLED && (
            <button
              type="button"
              onClick={handleMercadoPago}
              disabled={mpLoading}
              className="mt-4 w-full rounded px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0f] transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: GOLD }}
            >
              {mpLoading ? 'Abriendo el pago…' : `Renovar un año · ${copLabel} COP`}
            </button>
          )}

          {checkoutUrl && (
            <a
              href={checkoutUrl}
              className="mt-3 block w-full rounded border border-slate-700 px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-slate-300 transition-colors hover:bg-slate-800"
            >
              Pagar en USD · {usdLabel}
            </a>
          )}
        </div>

        {email && (
          <p className="mt-6 text-center text-[10px] uppercase tracking-wider text-slate-600">
            {email}
          </p>
        )}
      </div>

      <p
        className={`${cinzel.className} mt-10 text-[10px] uppercase tracking-[0.35em] text-slate-600`}
      >
        Memento Mori · Carpe Diem
      </p>
    </div>
  )
}
