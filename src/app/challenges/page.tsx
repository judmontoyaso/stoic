'use client'

import { useEffect, useState, useCallback } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { Award, Target, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday } from '@/lib/utils'
import { currentDayNumber } from '@/lib/program'
import type { Track, ProgramWeek, ProgramMonth, WeekLog, MonthLog } from '@/types'

export default function ChallengesPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null)
  const [programWeeks, setProgramWeeks] = useState<ProgramWeek[]>([])
  const [programMonths, setProgramMonths] = useState<ProgramMonth[]>([])
  const [weekLogs, setWeekLogs] = useState<WeekLog[]>([])
  const [monthLogs, setMonthLogs] = useState<MonthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [reflectionDraft, setReflectionDraft] = useState<Record<number, string>>({})
  const [openReflection, setOpenReflection] = useState<number | null>(null)

  const loadTracks = useCallback(async () => {
    try {
      const all = await StoicDB.getTracks()
      setTracks(all)
      setActiveTrackId(prev => prev ?? all[0]?.id ?? null)
    } catch (err) {
      console.error('Error loading tracks:', err)
      toast.error('Error al cargar los tracks')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTrackData = useCallback(async () => {
    if (!activeTrackId) return
    try {
      const [weeks, months, wLogs, mLogs] = await Promise.all([
        StoicDB.getProgramWeeks(activeTrackId),
        StoicDB.getProgramMonths(activeTrackId),
        StoicDB.getWeekLogs(activeTrackId),
        StoicDB.getMonthLogs(activeTrackId),
      ])
      setProgramWeeks(weeks)
      setProgramMonths(months)
      setWeekLogs(wLogs)
      setMonthLogs(mLogs)
    } catch (err) {
      console.error('Error loading challenges:', err)
      toast.error('Error al cargar los retos')
    }
  }, [activeTrackId])

  useEffect(() => { loadTracks() }, [loadTracks])

  useEffect(() => {
    loadTrackData()
    const handler = () => loadTrackData()
    window.addEventListener('stoic_data_changed', handler)
    return () => window.removeEventListener('stoic_data_changed', handler)
  }, [loadTrackData])

  const activeTrack = tracks.find(t => t.id === activeTrackId) || null
  const dayNumber = activeTrack ? currentDayNumber(activeTrack) : null
  const currentWeek = dayNumber ? Math.min(13, Math.ceil(dayNumber / 7)) : null
  const currentMonth = dayNumber ? Math.min(3, Math.ceil(dayNumber / 30)) : null

  const handleToggleWeek = async (weekNumber: number) => {
    if (!activeTrack) return
    try {
      await StoicDB.toggleWeekLog(activeTrack.id, weekNumber, reflectionDraft[weekNumber] || null)
      toast.success('Reto semanal actualizado')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el reto')
    }
  }

  const handleToggleMonth = async (monthNumber: number) => {
    if (!activeTrack) return
    try {
      await StoicDB.toggleMonthLog(activeTrack.id, monthNumber)
      toast.success('Hito mensual actualizado')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar el hito')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[var(--primary-gold)]" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <img src="/icons/armour.png" className="w-8 h-8 object-contain" alt="Retos" />
          Retos del Programa
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          13 retos semanales con entregable verificable y 3 hitos mensuales por track. Sin trampas: el entregable existe o no existe.
        </p>
      </div>

      {/* Track selector */}
      <div className="flex gap-2 flex-wrap">
        {tracks.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTrackId(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
              t.id === activeTrackId
                ? 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/40 text-[var(--primary-gold)]'
                : 'bg-[var(--card-bg)] border-[var(--border-color)] text-slate-500 hover:text-[var(--foreground)]'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Hitos mensuales */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-[var(--primary-gold)]" />
          Hitos mensuales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {programMonths.map(pm => {
            const log = monthLogs.find(l => l.month_number === pm.month_number)
            const isCurrent = currentMonth === pm.month_number
            return (
              <button
                key={pm.month_number}
                onClick={() => handleToggleMonth(pm.month_number)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  log?.completed
                    ? 'bg-[var(--primary-gold)]/10 border-[var(--primary-gold)]/40'
                    : isCurrent
                      ? 'bg-[var(--card-bg)] border-[var(--primary-gold)]/40 ring-1 ring-[var(--primary-gold)]/20'
                      : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--primary-gold)]/25'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest">
                    Mes {pm.month_number} {isCurrent && '· actual'}
                  </span>
                  {log?.completed && <CheckCircle2 className="w-4 h-4 text-[var(--primary-gold)]" />}
                </div>
                <p className={`text-sm font-bold ${log?.completed ? 'text-[var(--primary-gold)]' : 'text-[var(--foreground)]'}`}>
                  {pm.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-4">{pm.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Retos semanales */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          Retos semanales
        </h2>
        <div className="space-y-2">
          {programWeeks.map(pw => {
            const log = weekLogs.find(l => l.week_number === pw.week_number)
            const isCurrent = currentWeek === pw.week_number
            const isOpen = openReflection === pw.week_number
            return (
              <div
                key={pw.week_number}
                className={`rounded-xl border overflow-hidden transition-all ${
                  log?.completed
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : isCurrent
                      ? 'bg-[var(--card-bg)] border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-[var(--card-bg)] border-[var(--border-color)]'
                }`}
              >
                <div className="p-4 flex items-start gap-3">
                  <button
                    onClick={() => handleToggleWeek(pw.week_number)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      log?.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {log?.completed && <i className="pi pi-check text-[10px] text-white font-bold" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                      Semana {pw.week_number}: {pw.theme} {isCurrent && '· actual'}
                    </p>
                    <p className={`text-sm font-bold mt-0.5 ${log?.completed ? 'text-emerald-500 line-through' : 'text-[var(--foreground)]'}`}>
                      {pw.challenge_title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pw.challenge_description}</p>
                    {pw.deliverable && (
                      <p className="text-[11px] text-slate-500 mt-2">
                        <span className="font-bold text-[var(--foreground)]">Entregable:</span> {pw.deliverable}
                      </p>
                    )}
                    {log?.reflection && !isOpen && (
                      <p className="text-[11px] text-slate-500 italic mt-2 border-l-2 border-emerald-500/40 pl-2">{log.reflection}</p>
                    )}
                    <button
                      onClick={() => {
                        setOpenReflection(isOpen ? null : pw.week_number)
                        setReflectionDraft(prev => ({ ...prev, [pw.week_number]: log?.reflection || '' }))
                      }}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 hover:underline"
                    >
                      {isOpen ? 'Cerrar' : log?.reflection ? 'Editar reflexión' : 'Añadir reflexión'}
                    </button>
                    {isOpen && (
                      <div className="mt-2 space-y-2">
                        <InputTextarea
                          value={reflectionDraft[pw.week_number] || ''}
                          onChange={(e) => setReflectionDraft(prev => ({ ...prev, [pw.week_number]: e.target.value }))}
                          rows={3}
                          placeholder="Qué pasó con el reto, qué costó, qué aprendiste..."
                          className="w-full"
                        />
                        <button
                          onClick={async () => {
                            if (!activeTrack) return
                            try {
                              await StoicDB.updateWeekLogReflection(activeTrack.id, pw.week_number, reflectionDraft[pw.week_number] || null)
                              setOpenReflection(null)
                              toast.success('Reflexión guardada')
                            } catch (err) {
                              console.error(err)
                              toast.error('Error al guardar')
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--foreground)] hover:border-emerald-500/40"
                        >
                          Guardar reflexión
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
