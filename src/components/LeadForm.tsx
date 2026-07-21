'use client'

import { useState } from 'react'

// Captura de correo de la landing. Doble opt-in: aquí solo se pide el
// correo; el acceso real llega tras confirmar desde el buzón.
// Se mantiene con la paleta de la landing (oscura siempre, sin tema).

const GOLD = '#c9a84c'

export default function LeadForm({ source = 'landing' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError('')

    try {
      const res = await fetch('/api/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'No se pudo completar el registro')
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      setError('No hay conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-[#c9a84c]/30 bg-[#111116] px-6 py-5 text-center">
        <p className="text-sm font-bold text-slate-100">Revisa tu correo</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Te envié un enlace a <span className="text-slate-200">{email}</span>. Confírmalo y
          el día 1 llega enseguida. Si no aparece, mira en spam o promociones.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`lead-email-${source}`} className="sr-only">
          Tu correo
        </label>
        <input
          id={`lead-email-${source}`}
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          disabled={status === 'sending'}
          className="flex-1 rounded border border-slate-700 bg-[#111116] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-[#c9a84c]/60 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0f] transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: GOLD }}
        >
          {status === 'sending' ? 'Enviando…' : 'Quiero los 7 días'}
        </button>
      </div>
      {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
      <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
        Siete correos, uno por día, con ejercicios reales del programa. Sin costo y sin
        tarjeta. Te das de baja con un clic cuando quieras.
      </p>
    </form>
  )
}
