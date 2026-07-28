'use client'

import { useState } from 'react'
import { trackPublic } from '@/lib/analytics-public'

// Formulario de aplicación a las Becas Fundador (/becas).
// Diseño elegante y oscuro con microcopy persuasivo, humano y directo.
// Honeypot "website" para filtrado pasivo de bots.

const GOLD = '#c9a84c'

const inputClass =
  'w-full rounded-lg border border-slate-700/80 bg-[#111116] px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/50 focus:outline-none transition-all'

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
        setError(data.error || 'No se pudo registrar la postulación. Inténtalo nuevamente.')
        setStatus('error')
        return
      }
      trackPublic('beca_form_submitted')
      setStatus('sent')
    } catch {
      setError('Ocurrió un inconveniente de conexión. Por favor intenta de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-[#c9a84c]/40 bg-[#111118] p-8 text-center shadow-lg space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-100">Postulación Recibida</h3>
        <p className="text-sm leading-relaxed text-slate-300">
          Agradecemos tu honestidad al compartir tu contexto. Leemos detenidamente cada candidatura de manera individual y rigurosa.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Si tu postulación resulta seleccionada entre las 20 Becas Fundador, nos pondremos en contacto contigo a través de{' '}
          <span className="font-semibold text-slate-200">{form.email}</span> para otorgarte tu acceso vitalicio completo. Mientras tanto, puedes explorar las lecciones de introducción.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-800 bg-[#0d0d14] p-6 sm:p-8 shadow-xl">
      <div className="mb-6 space-y-2 text-center sm:text-left">
        <h3 className="text-lg font-bold text-slate-100">Formulario de Postulación</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Buscamos personas verdaderamente comprometidas a transformar su voz y fortaleza mental. Completa este espacio con franqueza.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Nombre completo
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Mateo Restrepo"
            value={form.name}
            onChange={set('name')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            placeholder="tu.correo@ejemplo.com"
            value={form.email}
            onChange={set('email')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            ¿A qué te dedicas actualmente? <span className="text-slate-500 font-normal lowercase">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Ej. Profesional, estudiante, emprendedor, líder de equipo..."
            value={form.activity}
            onChange={set('activity')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Tu motivación y compromiso <span className="text-[#c9a84c]">*</span>
          </label>
          <textarea
            required
            rows={5}
            placeholder="Cuéntanos con libertad: ¿qué desafío específico enfrentas hoy al comunicarte y qué disposición tienes para asumir los 90 días de entrenamiento con disciplina diaria?"
            value={form.reason}
            onChange={set('reason')}
            className={inputClass}
          />
        </div>

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

        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-lg px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#0a0a0f] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 shadow-md"
          style={{ backgroundColor: GOLD }}
        >
          {status === 'sending' ? 'Procesando postulación…' : 'Enviar Postulación a la Beca'}
        </button>
      </form>
    </div>
  )
}

