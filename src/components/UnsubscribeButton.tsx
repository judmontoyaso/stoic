'use client'

import { useState } from 'react'

// La baja se ejecuta con un POST desde aquí, nunca al abrir el enlace:
// los escáneres de correo visitan los enlaces por su cuenta y darían
// de baja a gente que nunca lo pidió.

export default function UnsubscribeButton({ token }: { token: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  if (status === 'done') {
    return (
      <p className="mt-6 text-sm leading-relaxed text-slate-400">
        Listo, no recibirás más correos de la secuencia. Gracias por haberlo intentado.
      </p>
    )
  }

  async function handleClick() {
    setStatus('sending')
    try {
      const res = await fetch('/api/leads/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleClick}
        disabled={status === 'sending'}
        className="rounded border border-slate-700 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:opacity-60"
      >
        {status === 'sending' ? 'Dando de baja…' : 'Confirmar la baja'}
      </button>
      {status === 'error' && (
        <p className="mt-3 text-xs text-red-400">
          No se pudo completar la baja. Inténtalo de nuevo en un momento.
        </p>
      )}
    </div>
  )
}
