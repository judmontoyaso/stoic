'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

// Reinicia el progreso de un usuario desde el panel. Pide el día en que
// quedará y una confirmación escrita: borra su diario y sus días
// cumplidos, y eso no se puede deshacer desde la app.

export default function ResetUserButton({
  email,
  onDone,
}: {
  email: string
  onDone?: () => void
}) {
  const [abierto, setAbierto] = useState(false)
  const [dia, setDia] = useState(1)
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setAbierto(false)
    setConfirmacion('')
    setDia(1)
  }

  const reiniciar = async () => {
    setEnviando(true)
    try {
      const res = await fetch('/api/admin/reset-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, startDay: dia }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'No se pudo reiniciar')
        return
      }
      toast.success(
        `${email}: reiniciado en el día ${data.startDay} (inicio ${data.startDate})`
      )
      cerrar()
      onDone?.()
    } catch {
      toast.error('Sin conexión')
    } finally {
      setEnviando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        title="Reiniciar progreso"
        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-[var(--border-color)] text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reiniciar
      </button>
    )
  }

  return (
    <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/5 space-y-2 min-w-[240px]">
      <p className="text-[11px] leading-relaxed text-slate-400">
        Borra días cumplidos, diario y reflexiones de{' '}
        <span className="text-[var(--foreground)] font-medium">{email}</span>. Conserva su
        cuenta, sus preferencias y sus notificaciones. <strong className="text-red-400">No se puede deshacer.</strong>
      </p>

      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        Queda en el día
      </label>
      <input
        type="number"
        min={1}
        max={90}
        value={dia}
        onChange={e => setDia(Number(e.target.value))}
        className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--foreground)]"
      />
      <p className="text-[10px] text-slate-500">
        1 = empieza hoy. Los días anteriores al de hoy se marcan cumplidos.
      </p>

      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        Escribe REINICIAR para confirmar
      </label>
      <input
        type="text"
        value={confirmacion}
        onChange={e => setConfirmacion(e.target.value)}
        placeholder="REINICIAR"
        className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--foreground)]"
      />

      <div className="flex gap-2 pt-1">
        <button
          onClick={reiniciar}
          disabled={confirmacion !== 'REINICIAR' || enviando}
          className="flex-1 px-2 py-1.5 rounded bg-red-600 text-white text-[11px] font-bold hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 transition-colors"
        >
          {enviando ? 'Reiniciando…' : 'Confirmar'}
        </button>
        <button
          onClick={cerrar}
          className="px-2 py-1.5 rounded border border-[var(--border-color)] text-slate-400 text-[11px] hover:text-[var(--foreground)]"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
