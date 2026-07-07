'use client'

import { useEffect, useState, useCallback } from 'react'
import { ProgressBar } from 'primereact/progressbar'
import { Card } from 'primereact/card'
import { Flame, Target, BookOpen, TrendingUp, Calendar, CheckCircle2, Zap } from 'lucide-react'
import { StoicDB } from '@/lib/db'
import { getTodayQuote } from '@/lib/quotes'
import { getToday, getPhaseLabel, getPhaseDescription } from '@/lib/utils'
import type { HabitWithLog, ChallengeWithLog } from '@/types'

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitWithLog[]>([])
  const [challenges, setChallenges] = useState<ChallengeWithLog[]>([])
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    totalChallengesCompleted: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const quote = getTodayQuote()
  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const [allHabits, habitLogs, allChallenges, challengeLogs] = await Promise.all([
        StoicDB.getHabits(),
        StoicDB.getHabitLogs(today),
        StoicDB.getChallenges(),
        StoicDB.getChallengeLogs(today),
      ])

      const habitsWithLogs: HabitWithLog[] = allHabits.map(h => ({
        ...h,
        todayLog: habitLogs.find(l => l.habit_id === h.id),
      }))

      const challengesWithLogs: ChallengeWithLog[] = allChallenges.map(c => ({
        ...c,
        todayLog: challengeLogs.find(l => l.challenge_id === c.id),
      }))

      const completedToday = habitLogs.filter(l => l.completed).length
      const totalChallengesCompleted = challengeLogs.filter(l => l.completed).length

      setHabits(habitsWithLogs)
      setChallenges(challengesWithLogs)
      setStats({
        totalHabits: allHabits.length,
        completedToday,
        currentStreak: 0,
        totalChallengesCompleted,
        completionRate: allHabits.length > 0 ? Math.round((completedToday / allHabits.length) * 100) : 0,
      })
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('stoic_data_changed', handler)
    return () => window.removeEventListener('stoic_data_changed', handler)
  }, [loadData])

  const handleToggleHabit = async (habitId: string) => {
    try {
      await StoicDB.toggleHabitLog(habitId, today)
      await loadData()
    } catch (err) {
      console.error('Error toggling habit:', err)
    }
  }

  const handleToggleChallenge = async (challengeId: string) => {
    try {
      await StoicDB.toggleChallengeLog(challengeId, today)
      await loadData()
    } catch (err) {
      console.error('Error toggling challenge:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[#c9a84c]" />
      </div>
    )
  }

  // Get today's habits (communication phase habits)
  const todayHabits = habits.filter(h => h.category === 'communication').slice(0, 4)
  // Get a few social challenges
  const todayChallenges = challenges.filter(c => c.category === 'social_ladder').slice(0, 3)

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Panel de Control
          </h1>
          <p className="text-slate-400 mt-1">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stoic Quote */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] border border-[#c9a84c]/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-bookmark text-[#c9a84c]" />
            <span className="text-xs uppercase tracking-widest text-[#c9a84c] font-medium">Reflexion del dia</span>
          </div>
          <p className="text-slate-200 text-lg italic leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-[#c9a84c] mt-3 text-sm font-medium">
            -- {quote.author}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--primary-gold)]/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-gold)]/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[var(--primary-gold)]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.completedToday}/{stats.totalHabits}</p>
          <p className="text-xs text-slate-400 mt-1">Habitos hoy</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--primary-gold)]/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.completionRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Cumplimiento</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--primary-gold)]/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.currentStreak}</p>
          <p className="text-xs text-slate-400 mt-1">Racha actual</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--primary-gold)]/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stats.totalChallengesCompleted}</p>
          <p className="text-xs text-slate-400 mt-1">Retos completados</p>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--primary-gold)]" />
            Progreso del dia
          </h2>
          <span className="text-sm text-[var(--primary-gold)] font-medium">{stats.completionRate}%</span>
        </div>
        <ProgressBar
          value={stats.completionRate}
          showValue={false}
          style={{ height: '8px', borderRadius: '4px' }}
          className="stoic-progress"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--primary-gold)]" />
            Habitos de hoy
          </h2>
          <div className="space-y-3">
            {todayHabits.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No hay habitos configurados aun</p>
            ) : (
              todayHabits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                    habit.todayLog?.completed
                      ? 'bg-[var(--primary-gold)]/10 border-[var(--primary-gold)]/30'
                      : 'bg-[var(--background)] border-[var(--border-color)] hover:border-[var(--primary-gold)]/20'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    habit.todayLog?.completed
                      ? 'border-[var(--primary-gold)] bg-[var(--primary-gold)]'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {habit.todayLog?.completed && (
                      <i className="pi pi-check text-xs text-white dark:text-[#0a0a0f]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      habit.todayLog?.completed ? 'text-[var(--primary-gold)] line-through' : 'text-[var(--foreground)]'
                    }`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{habit.description}</p>
                    )}
                  </div>
                  {habit.phase && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-gold)]/10 text-[var(--primary-gold)] font-medium flex-shrink-0">
                      F{habit.phase}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Social Challenges */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[var(--primary-gold)]" />
            Retos sociales de hoy
          </h2>
          <div className="space-y-3">
            {todayChallenges.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No hay retos configurados aun</p>
            ) : (
              todayChallenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => handleToggleChallenge(challenge.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                    challenge.todayLog?.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-[var(--background)] border-[var(--border-color)] hover:border-emerald-500/20'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    challenge.todayLog?.completed
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {challenge.todayLog?.completed && (
                      <i className="pi pi-check text-xs text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      challenge.todayLog?.completed ? 'text-emerald-500 dark:text-emerald-400 line-through' : 'text-[var(--foreground)]'
                    }`}>
                      {challenge.title}
                    </p>
                    {challenge.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{challenge.description}</p>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    challenge.level <= 2 ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400' : 'bg-orange-500/10 text-orange-650 dark:text-orange-400'
                  }`}>
                    Nv.{challenge.level}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
