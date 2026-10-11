'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getTodayQuote, getQuoteForDay } from '@/lib/quotes'
import { getToday, formatDate } from '@/lib/utils'
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      <PageHeader
        title="Panel de Control"
        icon={
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)] shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <LayoutDashboard className="w-5 h-5" />
          </div>
        }
        subtitle={formatDate(today)}
        actions={activeStates.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-[var(--card-bg)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-gold)]" />
              <span className="text-[var(--foreground)] font-bold">{todayDone}/{todayTotal}</span>
              <span className="text-slate-400 text-xs">tracks hoy</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-[var(--card-bg)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-[var(--foreground)] font-bold">{bestStreak}</span>
              <span className="text-slate-400 text-xs">racha</span>
            </div>
          </div>
        )}
      />

      <QuoteCard quote={quote} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {trackStates.map((state, idx) => (
          <motion.div
            key={state.track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
          >
            <TrackCard state={state} today={today} />
          </motion.div>
        ))}
      </div>

      {trackStates.length === 0 && (
        <EmptyState>
          <p className="text-sm">No hay tracks configurados. Ejecuta <code className="text-[var(--primary-gold)]">supabase_v2_schema.sql</code> y los seeds en Supabase.</p>
        </EmptyState>
      )}
    </motion.div>
  )
}
