'use client'

import { useEffect, useState } from 'react'
import { Users, Activity, Bell, Flame } from 'lucide-react'
import { Card, PageHeader, StatCard, LoadingScreen, EmptyState } from '@/components/ui'

// Panel del administrador: activación y actividad por usuario a partir
// de stoic.events y los registros. El acceso lo decide /api/admin/stats
// (ADMIN_EMAILS); para el resto de usuarios la página muestra el aviso.

interface AdminStats {
  generatedAt: string
  totals: { approvedUsers: number; activeUsers: number; withPush: number; active7d: number }
  users: {
    email: string
    tracks: { name: string; startDate: string; completed: number }[]
    completedTotal: number
    completed7d: number
    journalTotal: number
    journal7d: number
    streak: number
    lastActivity: string | null
    push: boolean
    prefs: { timezone: string; morning: number; evening: number } | null
  }[]
  events30d: Record<string, number>
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
        setStats(data)
      })
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState>
          <p className="font-bold text-[var(--foreground)]">Sin acceso</p>
          <p className="text-sm">{error}</p>
        </EmptyState>
      </div>
    )
  }
  if (!stats) return <LoadingScreen />

  const eventEntries = Object.entries(stats.events30d).sort((a, b) => b[1] - a[1])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Panel de métricas"
        subtitle={`Actualizado ${new Date(stats.generatedAt).toLocaleString('es-CO')}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={<><Users className="w-3 h-3" /> Usuarios aprobados</>} value={stats.totals.approvedUsers} />
        <StatCard label={<><Flame className="w-3 h-3" /> Con programa activo</>} value={stats.totals.activeUsers} />
        <StatCard label={<><Activity className="w-3 h-3" /> Activos últimos 7 días</>} value={stats.totals.active7d} />
        <StatCard label={<><Bell className="w-3 h-3" /> Con notificaciones</>} value={stats.totals.withPush} />
      </div>

      <Card className="p-5 overflow-x-auto">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Usuarios</h2>
        <table className="w-full text-xs min-w-[720px]">
          <thead>
            <tr className="text-left text-slate-500 uppercase tracking-wider">
              <th className="pb-2 pr-4">Usuario</th>
              <th className="pb-2 pr-4">Tracks</th>
              <th className="pb-2 pr-4">Días ✓</th>
              <th className="pb-2 pr-4">Últ. 7d</th>
              <th className="pb-2 pr-4">Racha</th>
              <th className="pb-2 pr-4">Diario</th>
              <th className="pb-2 pr-4">Push</th>
              <th className="pb-2 pr-4">Correo</th>
              <th className="pb-2">Últ. actividad</th>
            </tr>
          </thead>
          <tbody>
            {stats.users.map(u => (
              <tr key={u.email} className="border-t border-[var(--border-color)] text-[var(--foreground)]">
                <td className="py-2.5 pr-4 font-medium">{u.email}</td>
                <td className="py-2.5 pr-4">
                  {u.tracks.length === 0
                    ? <span className="text-slate-500">sin iniciar</span>
                    : u.tracks.map(t => (
                        <div key={t.name} className="whitespace-nowrap">
                          {t.name} <span className="text-slate-500">({t.completed} ✓ desde {t.startDate})</span>
                        </div>
                      ))}
                </td>
                <td className="py-2.5 pr-4">{u.completedTotal}</td>
                <td className="py-2.5 pr-4">{u.completed7d}</td>
                <td className="py-2.5 pr-4">{u.streak > 0 ? `${u.streak} 🔥` : '—'}</td>
                <td className="py-2.5 pr-4">{u.journalTotal} <span className="text-slate-500">({u.journal7d} en 7d)</span></td>
                <td className="py-2.5 pr-4">{u.push ? '✓' : '—'}</td>
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {u.prefs ? `${u.prefs.morning}h / ${u.prefs.evening}h` : 'default'}
                </td>
                <td className="py-2.5">{u.lastActivity || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Eventos · últimos 30 días</h2>
        {eventEntries.length === 0 ? (
          <p className="text-xs text-slate-500">
            Aún no hay eventos registrados. Se acumulan a medida que los usuarios usan la app.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {eventEntries.map(([name, count]) => (
              <div key={name} className="p-3 rounded-lg border border-[var(--border-color)]">
                <p className="text-lg font-bold text-[var(--primary-gold)]">{count}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{name}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
