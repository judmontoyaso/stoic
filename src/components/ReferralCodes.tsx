'use client'

import { useEffect, useState } from 'react'
import { Gift, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui'

// Invitaciones del usuario: sus códigos para regalar, con estado.
// Silencioso si la tabla aún no existe (no ensucia Preferencias).

interface Referral {
  code: string
  usado: boolean
  usadoPor: string | null
}

export default function ReferralCodes() {
  const [codes, setCodes] = useState<Referral[] | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/referidos')
      .then(async res => {
        if (!res.ok) return
        const data = await res.json()
        setCodes(data.codes || [])
      })
      .catch(() => {})
  }, [])

  if (!codes || codes.length === 0) return null

  const copiar = (code: string) => {
    navigator.clipboard.writeText(
      `Te comparto una invitación a StoiCom, el programa de 90 días que estoy haciendo. Entra en https://stoicom.app/login y usa este código: ${code}`
    )
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  const libres = codes.filter(c => !c.usado)

  return (
    <Card className="p-5">
      <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
        <Gift className="w-4 h-4 text-[var(--primary-gold)]" />
        Tus invitaciones
      </h2>
      <p className="text-xs text-slate-500 mt-1 mb-4">
        {libres.length > 0
          ? 'Esto se sostiene mejor acompañado. Toca un código para copiar el mensaje completo.'
          : 'Ya entregaste tus dos invitaciones.'}
      </p>
      <div className="space-y-2">
        {codes.map(c =>
          c.usado ? (
            <div
              key={c.code}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--sidebar-bg)] text-xs"
            >
              <span className="font-mono text-slate-500 line-through">{c.code}</span>
              <span className="text-slate-500">
                {c.usadoPor ? `usado por ${c.usadoPor}` : 'usado'}
              </span>
            </div>
          ) : (
            <button
              key={c.code}
              onClick={() => copiar(c.code)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--border-color)] text-xs hover:border-[var(--primary-gold)]/60 transition-colors"
            >
              <span className="font-mono text-[var(--foreground)]">{c.code}</span>
              {copied === c.code ? (
                <span className="flex items-center gap-1 text-[var(--primary-gold)]">
                  <Check className="w-3 h-3" /> copiado
                </span>
              ) : (
                <Copy className="w-3 h-3 opacity-40" />
              )}
            </button>
          )
        )}
      </div>
    </Card>
  )
}
