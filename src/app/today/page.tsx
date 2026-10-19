'use client'

// "Hoy": el día completo en un solo lugar — cita, ejercicio(s) del día
// con su lectura, consejo del mentor, reto de la semana y cierre
// nocturno. El resto de páginas navegan el programa; esta lo vive.

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Sparkles, Target, Sun, Compass, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB, type DailyReflection } from '@/lib/db'
import { getToday, formatDate } from '@/lib/utils'
import { getQuoteForDay } from '@/lib/quotes'
import { currentDayNumber, currentStreak } from '@/lib/program'
import DailyReading from '@/components/DailyReading'
import QuoteCard from '@/components/dashboard/QuoteCard'
import { Card, CompleteButton, EmptyState, LoadingScreen, ModuleBadge, PageHeader } from '@/components/ui'
import { useStoicSync } from '@/hooks/useStoicSync'
import type { Track, ProgramDay, ProgramWeek, DayLog, JournalEntry } from '@/types'

interface TodayTrack {
  track: Track
  dayNumber: number
  day: ProgramDay | null
  week: ProgramWeek | null
  completedToday: boolean
  streak: number
}

export default function TodayPage() {
  const [items, setItems] = useState<TodayTrack[]>([])
  const [hasTracks, setHasTracks] = useState(false)
  const [reflection, setReflection] = useState<DailyReflection | null>(null)
  const [eveningDone, setEveningDone] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const tracks = await StoicDB.getTracks()
      setHasTracks(tracks.some(t => t.start_date))

      const active = tracks.filter(t => t.start_date && currentDayNumber(t) !== null)
      const result: TodayTrack[] = []
      for (const track of active) {
        const dayNumber = currentDayNumber(track)!
        const weekNumber = Math.min(13, Math.ceil(dayNumber / 7))
        const [day, week, logs] = await Promise.all([
          StoicDB.getProgramDay(track.id, dayNumber),
          StoicDB.getProgramWeek(track.id, weekNumber),
          StoicDB.getDayLogs(track.id),
        ])
        const todayLog: DayLog | undefined = logs.find(l => l.date === today)
        result.push({
          track,
          dayNumber,
          day,
          week,
          completedToday: !!todayLog?.completed,
          streak: currentStreak(track, logs),
        })
      }
      setItems(result)

      const [refl, journalToday] = await Promise.all([
        StoicDB.getReflectionForDate(today),
        StoicDB.getJournalEntries(today, today),
      ])
      setReflection(refl)
      setEveningDone(journalToday.some((e: JournalEntry) => e.entry_type === 'evening'))
    } catch (err) {
      console.error('Error cargando Hoy:', err)
      toast.error('Error al cargar el día')
    } finally {
      setLoading(false)
    }
  }, [today])

  useStoicSync(loadData)

  const handleToggle = async (item: TodayTrack) => {
    try {
      await StoicDB.toggleDayLog(item.track.id, today, item.dayNumber)
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el día')
    }
  }

  if (loading) return <LoadingScreen />

  const quote = getQuoteForDay(items[0]?.dayNumber || 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 max-w-3xl mx-auto space-y-6"
    >
      <PageHeader
        title="Hoy"
        icon={
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)] shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <Sun className="w-5 h-5" />
          </div>
        }
        subtitle={formatDate(today)}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)] mb-3 shadow-[0_0_20px_rgba(201,168,76,0.15)]">
              <Compass className="w-6 h-6" />
            </div>
          }
        >
          <p className="text-base font-bold text-[var(--foreground)]">
            {hasTracks ? 'Tu programa no tiene día activo hoy.' : 'Aún no has iniciado tu programa.'}
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            {hasTracks
              ? 'Revisa tus fechas de inicio en el panel de control.'
              : 'Elige tu track y tu fecha de inicio: tu Día 1 empieza cuando tú digas.'}
          </p>
          <Link
            href={hasTracks ? '/' : '/welcome'}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:bg-[var(--primary-gold-hover)] transition-all shadow-[0_0_20px_rgba(201,168,76,0.2)]"
          >
            <span>{hasTracks ? 'Ir al panel' : 'Configurar mi programa'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          <QuoteCard quote={quote} />

          {/* Consejo del mentor (lo genera el correo matutino) */}
          {reflection && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-5 border-[var(--primary-gold)]/30 bg-gradient-to-br from-[var(--card-bg)] to-[var(--primary-gold)]/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary-gold)]" />
                <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5" /> Consejo del mentor
                </p>
                <p className="text-sm text-slate-300 leading-relaxed font-serif italic">{reflection.reflection}</p>
                {reflection.actionable_tip && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">
                      <span className="font-bold text-[var(--primary-gold)]">Accionable: </span>
                      {reflection.actionable_tip}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Un bloque por track activo: el ejercicio del día completo */}
          {items.map((item, index) => (
            <motion.div
              key={item.track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <Card className="p-6 space-y-5 border border-white/[0.08] hover:border-[var(--primary-gold)]/30 transition-all duration-300">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[var(--primary-gold)] shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
                    <p className="text-xs font-bold text-[var(--primary-gold)] uppercase tracking-widest">
                      {item.track.name} · Día {item.dayNumber} de {item.track.duration_days}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.day && <ModuleBadge module={item.day.module} size="xs" />}
                    {item.streak > 0 && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        🔥 {item.streak} d
                      </span>
                    )}
                  </div>
                </div>

                {item.day ? (
                  <>
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">{item.day.title}</h2>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {item.day.instructions}
                      </p>
                      {item.day.rationale && (
                        <div className="mt-3 px-4 py-3 rounded-lg border-l-2 border-[var(--primary-gold)] bg-[var(--background)]/70 backdrop-blur-xs">
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            <span className="font-bold not-italic text-[var(--primary-gold)] uppercase text-[10px] tracking-wider block mb-0.5">
                              Por qué funciona
                            </span>
                            {item.day.rationale}
                          </p>
                        </div>
                      )}
                      {item.day.source_author && (
                        <p className="text-[11px] text-slate-400 uppercase tracking-widest pt-1">
                          Fuente: <span className="text-slate-200 font-medium">{item.day.source_author}</span>
                        </p>
                      )}
                    </div>

                    <CompleteButton
                      completed={item.completedToday}
                      onClick={() => handleToggle(item)}
                      labelDone={`Día ${item.dayNumber} completado`}
                      labelTodo="Marcar día como completado"
                      doneVariant="emerald"
                    />

                    <DailyReading trackId={item.track.id} dayNumber={item.dayNumber} />
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No hay ejercicio configurado para este día.</p>
                )}

                {/* Reto de la semana: aquí se LEE; se marca en Retos */}
                {item.week && (
                  <div className="px-4 py-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 transition-all">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> Reto de la semana {item.week.week_number}
                    </p>
                    <p className="text-sm font-bold text-[var(--foreground)] mt-1.5">{item.week.challenge_title}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.week.challenge_description}</p>
                    <Link href="/challenges" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 mt-2">
                      <span>Ver y marcar en Retos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}

          {/* Cierre del día */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className={`p-6 transition-all duration-300 ${eveningDone ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.08] hover:border-[var(--primary-gold)]/30'}`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" /> Examen nocturno de Séneca
                  </p>
                  <p className="text-sm text-slate-300">
                    {eveningDone
                      ? 'El día quedó cerrado por escrito. Bien hecho.'
                      : 'El día se cierra por escrito, no en la cabeza.'}
                  </p>
                </div>
                <Link
                  href="/journal"
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 ${
                    eveningDone
                      ? 'border border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      : 'bg-[var(--primary-gold)] text-[#0a0a0f] hover:bg-[var(--primary-gold-hover)] shadow-[0_0_15px_rgba(201,168,76,0.2)]'
                  }`}
                >
                  {eveningDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Escrito hoy</span>
                    </>
                  ) : (
                    <>
                      <span>Escribir ahora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
