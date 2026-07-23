'use client'

// "Hoy": el día completo en un solo lugar — cita, ejercicio(s) del día
// con su lectura, consejo del mentor, reto de la semana y cierre
// nocturno. El resto de páginas navegan el programa; esta lo vive.

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Moon, Sparkles, Target } from 'lucide-react'
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
        const [days, weeks, logs] = await Promise.all([
          StoicDB.getProgramDays(track.id),
          StoicDB.getProgramWeeks(track.id),
          StoicDB.getDayLogs(track.id),
        ])
        const todayLog: DayLog | undefined = logs.find(l => l.date === today)
        result.push({
          track,
          dayNumber,
          day: days.find(d => d.day_number === dayNumber) || null,
          week: weeks.find(w => w.week_number === weekNumber) || null,
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
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5">
      <PageHeader
        title="Hoy"
        icon={<img src="/icons/time.png" className="w-8 h-8 object-contain" alt="Hoy" />}
        subtitle={formatDate(today)}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<img src="/icons/skull.png" className="w-10 h-10 object-contain" alt="" />}
        >
          <p className="text-sm font-bold text-[var(--foreground)]">
            {hasTracks ? 'Tu programa no tiene día activo hoy.' : 'Aún no has iniciado tu programa.'}
          </p>
          <p className="text-sm">
            {hasTracks
              ? 'Revisa tus fechas de inicio en el panel.'
              : 'Elige tu track y tu fecha de inicio: tu Día 1 empieza cuando tú digas.'}
          </p>
          <Link
            href={hasTracks ? '/' : '/welcome'}
            className="inline-block mt-2 px-5 py-2.5 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {hasTracks ? 'Ir al panel' : 'Configurar mi programa'}
          </Link>
        </EmptyState>
      ) : (
        <>
          <QuoteCard quote={quote} />

          {/* Consejo del mentor (lo genera el correo matutino) */}
          {reflection && (
            <Card className="p-5 border-[var(--primary-gold)]/25">
              <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Consejo del mentor
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{reflection.reflection}</p>
              {reflection.actionable_tip && (
                <p className="text-sm text-[var(--foreground)] leading-relaxed mt-2">
                  <span className="font-bold text-[var(--primary-gold)]">Accionable: </span>
                  {reflection.actionable_tip}
                </p>
              )}
            </Card>
          )}

          {/* Un bloque por track activo: el ejercicio del día completo */}
          {items.map(item => (
            <Card key={item.track.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest">
                  {item.track.name} · Día {item.dayNumber} de {item.track.duration_days}
                </p>
                <div className="flex items-center gap-2">
                  {item.day && <ModuleBadge module={item.day.module} size="xs" />}
                  {item.streak > 0 && (
                    <span className="text-[10px] font-bold text-slate-500">🔥 {item.streak}</span>
                  )}
                </div>
              </div>

              {item.day ? (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--foreground)]">{item.day.title}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                      {item.day.instructions}
                    </p>
                    {item.day.rationale && (
                      <div className="mt-3 px-3 py-2 rounded-r-lg border-l-2 border-[var(--primary-gold)]/50 bg-[var(--background)]">
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                          <span className="font-bold not-italic text-[var(--primary-gold)]">Por qué funciona: </span>
                          {item.day.rationale}
                        </p>
                      </div>
                    )}
                    {item.day.source_author && (
                      <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
                        Fuente: {item.day.source_author}
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
                <p className="text-sm text-slate-500">No hay ejercicio configurado para este día.</p>
              )}

              {/* Reto de la semana: aquí se LEE; se marca en Retos */}
              {item.week && (
                <div className="px-3 py-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Reto de la semana {item.week.week_number}
                  </p>
                  <p className="text-sm font-bold text-[var(--foreground)] mt-1">{item.week.challenge_title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.week.challenge_description}</p>
                  <Link href="/challenges" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-block mt-1.5">
                    Ver y marcar en Retos →
                  </Link>
                </div>
              )}
            </Card>
          ))}

          {/* Cierre del día */}
          <Card className={`p-5 ${eveningDone ? 'border-emerald-500/30' : ''}`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" /> Examen nocturno de Séneca
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {eveningDone
                    ? 'El día quedó cerrado por escrito. Bien hecho.'
                    : 'El día se cierra por escrito, no en la cabeza.'}
                </p>
              </div>
              <Link
                href="/journal"
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  eveningDone
                    ? 'border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[var(--primary-gold)] text-[#0a0a0f] hover:opacity-90'
                }`}
              >
                {eveningDone ? '✓ Escrito hoy' : 'Escribir ahora'}
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
