'use client'

import { useState, useCallback } from 'react'
import { Flame, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getTodayQuote, getQuoteForDay } from '@/lib/quotes'
import { getToday } from '@/lib/utils'
import { currentDayNumber, currentStreak } from '@/lib/program'
import { LoadingScreen, PageHeader, EmptyState } from '@/components/ui'
import QuoteCard from '@/components/dashboard/QuoteCard'
import TrackCard, { type TrackState } from '@/components/dashboard/TrackCard'
import { useStoicSync } from '@/hooks/useStoicSync'

export default function DashboardPage() {
  const [trackStates, setTrackStates] = useState<TrackState[]>([])
  const [loading, setLoading] = useState(true)
  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const tracks = await StoicDB.getTracks()
      const states = await Promise.all(
        tracks.map(async (track) => {
          const [programDays, programWeeks, programMonths, dayLogs, weekLogs] = await Promise.all([
            StoicDB.getProgramDays(track.id),
            StoicDB.getProgramWeeks(track.id),
            StoicDB.getProgramMonths(track.id),
            StoicDB.getDayLogs(track.id),
            StoicDB.getWeekLogs(track.id),
          ])
          return { track, programDays, programWeeks, programMonths, dayLogs, weekLogs }
        })
      )
      setTrackStates(states)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      toast.error('Error al cargar el programa')
    } finally {
      setLoading(false)
    }
  }, [])

  useStoicSync(loadData)

  if (loading) return <LoadingScreen />

  // Stats globales (vista unificada del PairingEngine: solo lectura de ambos tracks)
  const activeStates = trackStates.filter(s => s.track.start_date)

  // Cita alineada al día del programa; si no hay track activo, rota por fecha
  const firstDayNumber = activeStates
    .map(s => currentDayNumber(s.track))
    .find((n): n is number => n !== null)
  const quote = firstDayNumber ? getQuoteForDay(firstDayNumber) : getTodayQuote()
  const todayTotal = activeStates.filter(s => currentDayNumber(s.track) !== null).length
  const todayDone = activeStates.filter(s => s.dayLogs.some(l => l.date === today && l.completed)).length
  const bestStreak = Math.max(0, ...activeStates.map(s => currentStreak(s.track, s.dayLogs)))

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Panel de Control"
        subtitle={new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={activeStates.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-gold)]" />
              <span className="text-[var(--foreground)] font-bold">{todayDone}/{todayTotal}</span>
              <span className="text-slate-500">tracks hoy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-[var(--foreground)] font-bold">{bestStreak}</span>
              <span className="text-slate-500">racha</span>
            </div>
          </div>
        )}
      />

      <QuoteCard quote={quote} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {trackStates.map((state) => (
          <TrackCard key={state.track.id} state={state} today={today} />
        ))}
      </div>

      {trackStates.length === 0 && (
        <EmptyState>
          <p className="text-sm">No hay tracks configurados. Ejecuta <code className="text-[var(--primary-gold)]">supabase_v2_schema.sql</code> y los seeds en Supabase.</p>
        </EmptyState>
      )}
    </div>
  )
}
