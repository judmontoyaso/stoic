'use client'

import { useCallback, useEffect, useState } from 'react'
import { Ticket, GraduationCap, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, PageHeader, StatCard, LoadingScreen, EmptyState } from '@/components/ui'

// Gestión de códigos de acceso y becas. El acceso lo decide el backend
// (ADMIN_EMAILS); aquí solo se muestra el aviso si no autoriza.

interface CodeRow {
  code: string
  campaign: string
  note: string | null
  redeemed_email: string | null
  redeemed_at: string | null
  created_at: string
}

interface CodesData {
  total: number
  usados: number
  byCampaign: Record<string, { total: number; usados: number }>
  codes: CodeRow[]
}

interface BecaRow {
  id: string
  name: string
  email: string
  activity: string | null
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  code: string | null
  created_at: string
}

interface BecasData {
  total: number
  pendientes: number
  aprobadas: number
  applications: BecaRow[]
}

export default function AdminBecasPage() {
  const [codes, setCodes] = useState<CodesData | null>(null)
  const [becas, setBecas] = useState<BecasData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [n, setN] = useState(10)
  const [campaign, setCampaign] = useState('creador')
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    () =>
      Promise.all([fetch('/api/admin/codes'), fetch('/api/admin/becas')])
        .then(async ([cRes, bRes]) => {
          const cData = await cRes.json()
          const bData = await bRes.json()
          if (!cRes.ok) throw new Error(cData.error || 'No autorizado')
          setCodes(cData)
          setBecas(bRes.ok ? bData : null)
        })
        .catch(err => setError(err.message || 'No se pudo cargar')),
    []
  )

  useEffect(() => {
    load()
  }, [load])

  const crear = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n, campaign }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error creando códigos')
        return
      }
      toast.success(`${data.codes.length} códigos creados`)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const decidir = async (id: string, decision: 'approved' | 'rejected') => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/becas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error')
        return
      }
      toast.success(
        decision === 'approved'
          ? `Beca otorgada${data.emailSent ? ' y correo enviado' : ' (el correo falló)'}`
          : 'Aplicación descartada'
      )
      await load()
    } finally {
      setBusy(false)
    }
  }

  const copiar = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <EmptyState>
          <p className="text-sm font-bold text-[var(--foreground)]">Sin acceso</p>
          <p className="text-sm">{error}</p>
        </EmptyState>
      </div>
    )
  }
  if (!codes) return <LoadingScreen />

  const libres = codes.codes.filter(c => !c.redeemed_at)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <PageHeader title="Códigos y becas" subtitle="Acceso por invitación con atribución por campaña" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={<><Ticket className="w-3 h-3" /> Códigos</>} value={codes.total} />
        <StatCard label="Usados" value={codes.usados} />
        <StatCard label="Disponibles" value={codes.total - codes.usados} />
        <StatCard
          label={<><GraduationCap className="w-3 h-3" /> Becas pendientes</>}
          value={becas?.pendientes ?? 0}
        />
      </div>

      {/* Crear códigos */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-3">Crear códigos</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="w-24">
            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={n}
              onChange={e => setN(Number(e.target.value))}
              className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Campaña (atribución)
            </label>
            <input
              type="text"
              value={campaign}
              onChange={e => setCampaign(e.target.value)}
              placeholder="creador, beca, referido…"
              className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>
          <button
            onClick={crear}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 disabled:opacity-50"
          >
            Generar
          </button>
        </div>
        {Object.keys(codes.byCampaign).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(codes.byCampaign).map(([c, v]) => (
              <span key={c} className="text-xs px-2 py-1 rounded bg-[var(--sidebar-bg)] text-slate-400">
                {c}: {v.usados}/{v.total} usados
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Códigos disponibles */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-1">Códigos disponibles</h2>
        <p className="text-xs text-slate-500 mb-3">Toca uno para copiarlo y mandarlo por DM.</p>
        {libres.length === 0 ? (
          <p className="text-sm text-slate-500">No quedan códigos sin usar.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {libres.map(c => (
              <button
                key={c.code}
                onClick={() => copiar(c.code)}
                className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--foreground)] hover:border-[var(--primary-gold)]/60 transition-colors"
                title={`${c.campaign}${c.note ? ` · ${c.note}` : ''}`}
              >
                {c.code}
                {copied === c.code ? (
                  <Check className="w-3 h-3 text-[var(--primary-gold)]" />
                ) : (
                  <Copy className="w-3 h-3 opacity-40" />
                )}
              </button>
            ))}
          </div>
        )}
        {codes.usados > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--border-color)]">
            <p className="text-xs text-slate-500 mb-2">Ya redimidos</p>
            <div className="space-y-1">
              {codes.codes
                .filter(c => c.redeemed_at)
                .map(c => (
                  <p key={c.code} className="text-xs text-slate-400">
                    <span className="font-mono">{c.code}</span> · {c.campaign} →{' '}
                    <span className="text-[var(--foreground)]">{c.redeemed_email}</span>{' '}
                    <span className="text-slate-500">({c.redeemed_at?.slice(0, 10)})</span>
                  </p>
                ))}
            </div>
          </div>
        )}
      </Card>

      {/* Aplicaciones a becas */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-1">Aplicaciones a becas</h2>
        {!becas ? (
          <p className="text-sm text-slate-500">Ejecuta supabase_v13_access_codes.sql.</p>
        ) : becas.applications.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay aplicaciones.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {becas.applications.map(a => (
              <div key={a.id} className="p-4 rounded-lg border border-[var(--border-color)]">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{a.name}</p>
                    <p className="text-xs text-slate-500">
                      {a.email}
                      {a.activity ? ` · ${a.activity}` : ''} · {a.created_at.slice(0, 10)}
                    </p>
                  </div>
                  {a.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => decidir(a.id, 'approved')}
                        disabled={busy}
                        className="px-3 py-1.5 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-xs font-bold hover:opacity-90 disabled:opacity-50"
                      >
                        Otorgar beca
                      </button>
                      <button
                        onClick={() => decidir(a.id, 'rejected')}
                        disabled={busy}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-slate-400 text-xs font-bold hover:text-[var(--foreground)] disabled:opacity-50"
                      >
                        Descartar
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-bold ${
                        a.status === 'approved' ? 'text-[var(--primary-gold)]' : 'text-slate-500'
                      }`}
                    >
                      {a.status === 'approved' ? `Otorgada · ${a.code}` : 'Descartada'}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {a.reason}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
