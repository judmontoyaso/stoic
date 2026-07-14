'use client'

import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'

// Primera entrada con Google: pide el código de acceso una única vez.
// Aprobado el correo, los siguientes logins pasan directo.

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

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
        toast.success('Correo aprobado. Bienvenido.')
        window.location.href = '/'
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
            Tu cuenta de Google inició sesión, pero este espacio es privado.
            Ingresa el código de acceso <span className="font-bold">una única vez</span> para aprobar tu correo.
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

          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-2 rounded-lg text-xs text-slate-500 hover:text-[var(--foreground)] transition-colors"
          >
            Salir y usar otra cuenta
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--border-color)]">
          <p className="text-[9px] text-slate-550 dark:text-slate-450 uppercase tracking-widest font-black">
            Memento Mori · Carpe Diem
          </p>
        </div>
      </div>
    </div>
  )
}
