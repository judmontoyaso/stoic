'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar as PrimeSidebar } from 'primereact/sidebar'
import { Button } from 'primereact/button'
import { ProgressBar } from 'primereact/progressbar'
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, Award, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { STOIC_QUOTES } from '@/lib/quotes'
import { getPhaseLabel, getToday } from '@/lib/utils'
import type { Habit, Challenge, HabitLog, ChallengeLog } from '@/types'

interface CalendarDay {
  dayNum: number
  dateStr: string
  phase: number
  week: number
  completedHabitsCount: number
  totalHabitsCount: number
  completedChallengesCount: number
  isFullyCompleted: boolean
}

export default function CalendarPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [challengeLogs, setChallengeLogs] = useState<ChallengeLog[]>([])
  const [weeklyReviews, setWeeklyReviews] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>('')
  
  // Drawer state
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const todayStr = getToday()

  const loadData = useCallback(async () => {
    try {
      const [allHabits, allChallenges, allHabitLogs, allChallengeLogs, reviews] = await Promise.all([
        StoicDB.getHabits(),
        StoicDB.getChallenges(),
        // Get all logs to populate the calendar
        StoicDB.getHabitLogsRange('1970-01-01', '2099-12-31'),
        StoicDB.getChallengeLogsRange('1970-01-01', '2099-12-31'),
        StoicDB.getWeeklyReviews(),
      ])

      setHabits(allHabits)
      setChallenges(allChallenges)
      setHabitLogs(allHabitLogs)
      setChallengeLogs(allChallengeLogs)
      setWeeklyReviews(reviews)

      // Resolve start date
      // Use the earliest log date, or default to 30 days ago if no logs exist
      let resolvedStartDate = ''
      if (allHabitLogs.length > 0 || allChallengeLogs.length > 0) {
        const dates = [
          ...allHabitLogs.map(l => l.date),
          ...allChallengeLogs.map(l => l.date)
        ].sort()
        resolvedStartDate = dates[0]
      } else {
        const d = new Date()
        d.setDate(d.getDate() - 30) // Default start 30 days ago
        resolvedStartDate = d.toISOString().split('T')[0]
      }
      setStartDate(resolvedStartDate)
    } catch (err) {
      console.error('Error loading calendar data:', err)
      toast.error('Error al cargar datos del planificador')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('stoic_data_changed', handler)
    return () => window.removeEventListener('stoic_data_changed', handler)
  }, [loadData])

  // Generate 90 days array
  const getCalendarDays = (): CalendarDay[] => {
    if (!startDate) return []
    const start = new Date(startDate)
    
    return Array.from({ length: 90 }, (_, i) => {
      const dayNum = i + 1
      const dateObj = new Date(start)
      dateObj.setDate(start.getDate() + i)
      const dateStr = dateObj.toISOString().split('T')[0]

      const phase = Math.min(3, Math.max(1, Math.ceil(dayNum / 30)))
      const week = Math.min(12, Math.max(1, Math.ceil(dayNum / 7)))

      // Habits active for this phase
      const phaseHabits = habits.filter(h => h.phase === phase)
      const completedHabits = habitLogs.filter(l => l.date === dateStr && l.completed && phaseHabits.some(h => h.id === l.habit_id))

      // Challenges active for this week
      const weekChallenges = challenges.filter(c => c.week === week)
      const completedChallenges = challengeLogs.filter(l => l.date === dateStr && l.completed && weekChallenges.some(c => c.id === l.challenge_id))

      const isFullyCompleted = phaseHabits.length > 0 && completedHabits.length === phaseHabits.length

      return {
        dayNum,
        dateStr,
        phase,
        week,
        completedHabitsCount: completedHabits.length,
        totalHabitsCount: phaseHabits.length,
        completedChallengesCount: completedChallenges.length,
        isFullyCompleted,
      }
    })
  };

  const calendarDays = getCalendarDays()

  // Toggle habit completed for past date
  const handleToggleHabit = async (habitId: string, dateStr: string) => {
    try {
      await StoicDB.toggleHabitLog(habitId, dateStr)
      // Reload and update drawer state
      const [allHabitLogs, allChallengeLogs] = await Promise.all([
        StoicDB.getHabitLogsRange('1970-01-01', '2099-12-31'),
        StoicDB.getChallengeLogsRange('1970-01-01', '2099-12-31'),
      ])
      setHabitLogs(allHabitLogs)
      setChallengeLogs(allChallengeLogs)
      
      // Update active day state
      if (selectedDay) {
        const phaseHabits = habits.filter(h => h.phase === selectedDay.phase)
        const completedHabits = allHabitLogs.filter(l => l.date === dateStr && l.completed && phaseHabits.some(h => h.id === l.habit_id))
        setSelectedDay(prev => prev ? {
          ...prev,
          completedHabitsCount: completedHabits.length,
          isFullyCompleted: phaseHabits.length > 0 && completedHabits.length === phaseHabits.length,
        } : null)
      }
      toast.success('Hábito actualizado')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar hábito')
    }
  }

  // Toggle challenge completed for past date
  const handleToggleChallenge = async (challengeId: string, dateStr: string) => {
    try {
      await StoicDB.toggleChallengeLog(challengeId, dateStr)
      // Reload and update drawer state
      const [allHabitLogs, allChallengeLogs] = await Promise.all([
        StoicDB.getHabitLogsRange('1970-01-01', '2099-12-31'),
        StoicDB.getChallengeLogsRange('1970-01-01', '2099-12-31'),
      ])
      setHabitLogs(allHabitLogs)
      setChallengeLogs(allChallengeLogs)

      if (selectedDay) {
        const weekChallenges = challenges.filter(c => c.week === selectedDay.week)
        const completedChallenges = allChallengeLogs.filter(l => l.date === dateStr && l.completed && weekChallenges.some(c => c.id === l.challenge_id))
        setSelectedDay(prev => prev ? {
          ...prev,
          completedChallengesCount: completedChallenges.length,
        } : null)
      }
      toast.success('Reto actualizado')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar reto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[var(--primary-gold)]" />
      </div>
    )
  }

  const completedDaysCount = calendarDays.filter(d => d.isFullyCompleted).length
  const totalCompletionPercent = calendarDays.length > 0 ? Math.round((completedDaysCount / calendarDays.length) * 100) : 0

  // Group days by week
  const weeks = Array.from({ length: 12 }, (_, w) => {
    const weekNum = w + 1
    return {
      weekNum,
      phase: Math.ceil(weekNum / 4),
      days: calendarDays.filter(d => d.week === weekNum),
    }
  })

  // Selected day items for detail sidebar
  const dayQuote = selectedDay ? STOIC_QUOTES[(selectedDay.dayNum - 1) % STOIC_QUOTES.length] : null
  const dayHabits = selectedDay ? habits.filter(h => h.phase === selectedDay.phase) : []
  const dayChallenges = selectedDay ? challenges.filter(c => c.week === selectedDay.week) : []
  const dayReview = selectedDay ? weeklyReviews.find(r => r.week_number === selectedDay.week) : null

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Planificador de 90 Días</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Sigue el mapa completo de tu entrenamiento de comunicación y disciplina estoica.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Días al 100%</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[var(--foreground)]">{completedDaysCount}</span>
            <span className="text-sm text-slate-400">/ 90 días</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Días con todos los hábitos de la fase completados.</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Tasa de Consistencia</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[var(--foreground)]">{totalCompletionPercent}%</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={totalCompletionPercent} showValue={false} style={{ height: '6px', borderRadius: '3px' }} />
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4 flex flex-col justify-between shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Fase Actual</p>
          <div className="flex items-baseline gap-2 mt-2">
            {calendarDays.length > 0 ? (
              (() => {
                const todayIndex = calendarDays.findIndex(d => d.dateStr === todayStr)
                const currentDay = todayIndex !== -1 ? todayIndex + 1 : 1
                const currentPhase = Math.ceil(currentDay / 30)
                return (
                  <>
                    <span className="text-3xl font-black text-[var(--foreground)]">Fase {currentPhase}</span>
                    <span className="text-xs text-slate-450 dark:text-slate-400 font-medium">Día {currentDay}</span>
                  </>
                )
              })()
            ) : (
              <span className="text-3xl font-black text-[var(--foreground)]">Fase 1</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Cada fase introduce hábitos y retos progresivos.</p>
        </div>
      </div>

      {/* Grid of Weeks */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[var(--primary-gold)]" />
          Calendario del Programa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeks.map((week) => (
            <div 
              key={week.weekNum}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1">
                  Semana {week.weekNum}
                  <span className="text-[9px] font-normal px-1.5 py-0.5 rounded-sm bg-[var(--primary-gold)]/10 text-[var(--primary-gold)] uppercase tracking-wider">
                    Fase {week.phase}
                  </span>
                </h3>
                {weeklyReviews.some(r => r.week_number === week.weekNum) && (
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Revisión hecha
                  </span>
                )}
              </div>

              {/* Days of this week */}
              <div className="grid grid-cols-7 gap-2">
                {week.days.map((day) => {
                  const isToday = day.dateStr === todayStr
                  let borderClass = 'border-[var(--border-color)]'
                  if (isToday) borderClass = 'border-[var(--primary-gold)] ring-1 ring-[var(--primary-gold)]/30'
                  
                  let bgClass = 'bg-[var(--background)] hover:bg-[var(--border-color)]/20'
                  if (day.isFullyCompleted) bgClass = 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/35 text-[var(--primary-gold)]'
                  
                  return (
                    <button
                      key={day.dayNum}
                      onClick={() => {
                        setSelectedDay(day)
                        setDrawerOpen(true)
                      }}
                      className={`h-11 rounded-sm border ${borderClass} ${bgClass} transition-all duration-150 flex flex-col items-center justify-between p-1.5 cursor-pointer relative group`}
                    >
                      <span className="text-xs font-bold">{day.dayNum}</span>
                      <div className="flex gap-0.5 mt-0.5">
                        {/* Habit bullet dot indicator */}
                        <span 
                          className={`w-1 h-1 rounded-full ${
                            day.completedHabitsCount === day.totalHabitsCount && day.totalHabitsCount > 0
                              ? 'bg-[var(--primary-gold)]' 
                              : day.completedHabitsCount > 0 
                                ? 'bg-amber-500/50' 
                                : 'bg-slate-400/30'
                          }`}
                        />
                        {/* Challenge bullet dot indicator */}
                        {day.completedChallengesCount > 0 && (
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slideout Detail Panel */}
      <PrimeSidebar
        visible={drawerOpen}
        position="right"
        onHide={() => {
          setDrawerOpen(false)
          setSelectedDay(null)
        }}
        style={{ width: '100%', maxWidth: '460px', background: 'var(--card-bg)', borderLeft: '1px solid var(--border-color)', padding: 0 }}
        className="stoic-sidebar-drawer"
      >
        {selectedDay && (
          <div className="h-full flex flex-col text-[var(--foreground)]">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--primary-gold)] uppercase tracking-widest block mb-1">
                Día {selectedDay.dayNum} · Fase {selectedDay.phase}
              </span>
              <h2 className="text-lg font-black text-[var(--foreground)]">
                {new Date(selectedDay.dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              {selectedDay.dateStr === todayStr && (
                <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[var(--primary-gold)]/20 text-[var(--primary-gold)] font-bold mt-2 inline-block">
                  Hoy
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Quote */}
              {dayQuote && (
                <div className="p-4 rounded-md bg-[var(--background)] border border-[var(--border-color)] border-l-4 border-l-[var(--primary-gold)]">
                  <p className="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <img src="/icons/papyrus.png" className="w-3.5 h-3.5 object-contain dark:invert dark:opacity-60" alt="Scroll" />
                    Reflexión del día
                  </p>
                  <p className="text-sm text-[var(--foreground)] italic leading-relaxed">&ldquo;{dayQuote.text}&rdquo;</p>
                  <p className="text-xs text-[var(--primary-gold)] font-bold text-right mt-2">— {dayQuote.author}</p>
                </div>
              )}

              {/* Habits checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <img src="/icons/skull.png" className="w-3.5 h-3.5 object-contain dark:invert dark:opacity-60" alt="Skull" />
                  Hábitos diarios ({selectedDay.completedHabitsCount}/{selectedDay.totalHabitsCount})
                </h3>
                <div className="space-y-2">
                  {dayHabits.map((habit) => {
                    const isDone = habitLogs.some(l => l.date === selectedDay.dateStr && l.habit_id === habit.id && l.completed)
                    return (
                      <button
                        key={habit.id}
                        onClick={() => handleToggleHabit(habit.id, selectedDay.dateStr)}
                        className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-all ${
                          isDone 
                            ? 'bg-[var(--primary-gold)]/10 border-[var(--primary-gold)]/30' 
                            : 'bg-[var(--background)] border-[var(--border-color)] hover:border-[var(--primary-gold)]/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isDone ? 'border-[var(--primary-gold)] bg-[var(--primary-gold)]' : 'border-slate-400 dark:border-slate-600'
                        }`}>
                          {isDone && <i className="pi pi-check text-[10px] text-white dark:text-[#0a0a0f] font-bold" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isDone ? 'text-[var(--primary-gold)] line-through' : 'text-[var(--foreground)]'}`}>
                            {habit.name}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Challenge */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <img src="/icons/armour.png" className="w-3.5 h-3.5 object-contain dark:invert dark:opacity-60" alt="Shield" />
                  Desafío de la semana
                </h3>
                {dayChallenges.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay retos configurados para esta semana</p>
                ) : (
                  dayChallenges.map((challenge) => {
                    const isDone = challengeLogs.some(l => l.date === selectedDay.dateStr && l.challenge_id === challenge.id && l.completed)
                    return (
                      <button
                        key={challenge.id}
                        onClick={() => handleToggleChallenge(challenge.id, selectedDay.dateStr)}
                        className={`w-full flex items-start gap-3 p-3 rounded-md border text-left transition-all ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-[var(--background)] border-[var(--border-color)] hover:border-emerald-500/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isDone ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 dark:border-slate-600'
                        }`}>
                          {isDone && <i className="pi pi-check text-[10px] text-white font-bold" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isDone ? 'text-emerald-500 dark:text-emerald-400 line-through' : 'text-[var(--foreground)]'}`}>
                            {challenge.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{challenge.description}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {/* Weekly review if available */}
              {dayReview && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <h3 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <img src="/icons/history-book.png" className="w-3.5 h-3.5 object-contain" alt="Book" />
                    Bitácora semanal
                  </h3>
                  <div className="p-3 bg-[var(--background)] border border-[var(--border-color)] rounded-md space-y-3">
                    {dayReview.bad_habits_resisted && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--primary-gold)]">Malos hábitos resistidos</p>
                        <p className="text-xs text-slate-650 dark:text-slate-300 mt-0.5">{dayReview.bad_habits_resisted}</p>
                      </div>
                    )}
                    {dayReview.progress_made && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--primary-gold)]">Progreso semanal</p>
                        <p className="text-xs text-slate-650 dark:text-slate-300 mt-0.5">{dayReview.progress_made}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </PrimeSidebar>
    </div>
  )
}
