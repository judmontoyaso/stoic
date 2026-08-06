'use client'

import { useCallback, useEffect, useState } from 'react'
import { MessageSquareQuote } from 'lucide-react'
import toast from 'react-hot-toast'

// Campaña de reseñas fundadoras: regala el año a los leads que
// terminaron los siete días gratis y no compraron, a cambio de una
// opinión honesta al mes.
//
// Es la vía legítima para tener reseñas reales antes de tener clientes.
// Inventarlas es publicidad engañosa y motivo de cierre de cuenta en las
// pasarelas; esto cuesta el mismo trabajo y sale verdadero.

interface Estado {
  pendientes: number
  correos: string[]
  invitados: number
  activados: number
}

export default function ResenasPanel() {
  const [estado, setEstado] = useState<Estado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cuantos, setCuantos] = useState(25)
  const [enviando, setEnviando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  // Cadena de promesas y no async/await: es la forma que usa el resto
  // del panel, y la que no dispara react-hooks/set-state-in-effect.
  const cargar = useCallback(
    () =>
      fetch('/api/admin/resenas')
        .then(async res => {
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'No se pudo cargar la campaña')
          setEstado(data)
          setError(null)
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Sin conexión')),
    []
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  const invitar = async () => {
    setEnviando(true)
    try {
      const res = await fetch('/api/admin/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: cuantos }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'No se pudo enviar')
        return
      }
      toast.success(
        data.enviados > 0
          ? `${data.enviados} invitaciones enviadas`
          : 'No quedaban candidatos por invitar'
      )
      if (data.fallidos > 0) {
        toast.error(`${data.fallidos} fallaron; revisa los logs`)
      }
      setConfirmando(false)
      await cargar()
    } catch {
      toast.error('Sin conexión')
    } finally {
      setEnviando(false)
    }
  }

  if (error) {
    return <p className="text-xs text-slate-500">{error}</p>
  }
  if (!estado) {
    return <p className="text-xs text-slate-500">Cargando…</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {([
          ['Sin invitar', estado.pendientes],
          ['Invitados', estado.invitados],
          ['Activaron', estado.activados],
        ] as const).map(([label, value]) => (
          <div key={label} className="p-3 rounded-lg border border-[var(--border-color)]">
            <p className="text-lg font-bold text-[var(--primary-gold)]">{value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {estado.pendientes === 0 ? (
        <p className="text-xs text-slate-500">
          No hay leads pendientes. Aparecen aquí cuando terminan los siete días del correo
          sin comprar.
        </p>
      ) : !confirmando ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-500">
            Invitar a
            <input
              type="number"
              min={1}
              max={Math.min(estado.pendientes, 50)}
              value={cuantos}
              onChange={e => setCuantos(Number(e.target.value))}
              className="mx-2 w-16 rounded border border-[var(--border-color)] bg-transparent px-2 py-1 text-center text-[var(--foreground)]"
            />
            de {estado.pendientes}
          </label>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-gold)] px-4 py-2 text-xs font-bold text-[#0a0a0f] transition-opacity hover:opacity-90"
          >
            <MessageSquareQuote className="h-4 w-4" />
            Enviar invitaciones
          </button>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-[var(--primary-gold)]/40 p-4">
          <p className="text-xs text-slate-400">
            Se le regala un año completo a {Math.min(cuantos, estado.pendientes)} persona
            {Math.min(cuantos, estado.pendientes) === 1 ? '' : 's'}, con un código único cada
            una. El correo sale de inmediato y no se puede recoger.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={invitar}
              disabled={enviando}
              className="rounded-lg bg-[var(--primary-gold)] px-4 py-2 text-xs font-bold text-[#0a0a0f] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {enviando ? 'Enviando…' : 'Confirmar y enviar'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={enviando}
              className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-xs font-bold text-slate-400 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
