'use client'

import { useState } from 'react'
import { trackPublic } from '@/lib/analytics-public'

// Formulario de aplicación a las becas fundador (/becas). Misma paleta
// oscura de la landing. El honeypot "website" filtra bots.

const GOLD = '#c9a84c'

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-[#111116] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#c9a84c]/60 focus:outline-none'

export default function BecaForm() {
  const [form, setForm] = useState({ name: '', email: '', activity: '', reason: '', website: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/becas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'No se pudo enviar la aplicación')
        setStatus('error')
        return
      }
      trackPublic('beca_form_submitted')
      setStatus('sent')
    } catch {
      setError('No hay conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-[#c9a84c]/30 bg-[#111116] px-6 py-5 text-center">
        <p className="text-sm font-bold text-slate-100">Aplicación recibida</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Leemos todas. Si tu beca sale, el código llega a{' '}
          <span className="text-slate-200">{form.email}</span>. Mientras tanto puedes empezar
          con los 7 días gratis desde la página principal.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-3">
      <input
        type="text"
        required
        placeholder="Tu nombre"
        value={form.name}
        onChange={set('name')}
        className={inputClass}
      />
      <input
        type="email"
        required
        placeholder="tu@correo.com"
        value={form.email}
        onChange={set('email')}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="A qué te dedicas (opcional)"
        value={form.activity}
        onChange={set('activity')}
        className={inputClass}
      />
      <textarea
        required
        rows={4}
        placeholder="¿Por qué tú? Sé honesto: el porqué decide la beca."
        value={form.reason}
        onChange={set('reason')}
        className={inputClass}
      />
      {/* Honeypot: oculto para humanos; los bots lo llenan */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={set('website')}
        className="hidden"
        aria-hidden="true"
        placeholder="website"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0f] transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: GOLD }}
      >
        {status === 'sending' ? 'Enviando…' : 'Aplicar a la beca'}
      </button>
    </form>
  )
}
