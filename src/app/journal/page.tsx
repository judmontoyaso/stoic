'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { PenSquare, Calendar, ChevronRight, BookOpen, Heart, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { formatDate, getPhaseLabel } from '@/lib/utils'
import type { WeeklyReview } from '@/types'

export default function JournalPage() {
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [activeReview, setActiveReview] = useState<WeeklyReview | null>(null)
  
  const [newReview, setNewReview] = useState({
    weekNumber: 1,
    phase: 1,
    badHabitsResisted: '',
    progressMade: '',
    nextWeekPlan: '',
    gratitude: '',
    stoicQuote: '',
  })

  const loadData = useCallback(async () => {
    try {
      const data = await StoicDB.getWeeklyReviews()
      setReviews(data)
    } catch (err) {
      console.error('Error loading reviews:', err)
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

  const handleSaveReview = async () => {
    try {
      await StoicDB.addWeeklyReview(
        newReview.weekNumber,
        newReview.phase,
        newReview.badHabitsResisted || null,
        newReview.progressMade || null,
        newReview.nextWeekPlan || null,
        newReview.gratitude || null,
        newReview.stoicQuote || null
      )
      setShowDialog(false)
      setNewReview({
        weekNumber: reviews.length + 2,
        phase: 1,
        badHabitsResisted: '',
        progressMade: '',
        nextWeekPlan: '',
        gratitude: '',
        stoicQuote: '',
      })
      toast.success('Revision semanal guardada')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar revision')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[var(--primary-gold)]" />
      </div>
    )
  }

  const phaseOptions = [
    { label: 'Fase 1: Fundamentos', value: 1 },
    { label: 'Fase 2: Persuasion', value: 2 },
    { label: 'Fase 3: Liderazgo', value: 3 },
  ]

  const weekOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Semana ${i + 1}`,
    value: i + 1,
  }))

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
            Diario de Revision
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Reflexiones semanales estructuradas al estilo de Seneca
          </p>
        </div>
        <Button
          icon="pi pi-pencil"
          label="Nueva revision"
          className="p-button-sm"
          onClick={() => {
            setNewReview(prev => ({
              ...prev,
              weekNumber: reviews.length > 0 ? Math.min(12, reviews[0].week_number + 1) : 1,
              phase: reviews.length > 0 ? reviews[0].phase : 1,
            }))
            setShowDialog(true)}
          }
          style={{ backgroundColor: 'var(--primary-gold)', borderColor: 'var(--primary-gold)', color: 'var(--background)' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column - Past Reviews list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-2">Historial</h2>
          {reviews.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-8 text-center text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">Aun no has creado ninguna revision.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <button
                key={rev.id}
                onClick={() => setActiveReview(rev)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  activeReview?.id === rev.id
                    ? 'bg-[var(--primary-gold)]/10 border-[var(--primary-gold)]/30 text-[var(--primary-gold)]'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-slate-450 dark:text-slate-300 hover:border-[var(--primary-gold)]/20'
                }`}
              >
                <div>
                  <h3 className="font-bold text-sm text-[var(--foreground)]">
                    Semana {rev.week_number} -- Fase {rev.phase}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(rev.date.split('T')[0])}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))
          )}
        </div>

        {/* Right Column - Active Review Details */}
        <div className="lg:col-span-2">
          {activeReview ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">
                    Semana {activeReview.week_number}
                  </h2>
                  <p className="text-xs text-slate-550 dark:text-slate-550 mt-0.5">
                    Fase {activeReview.phase}: {getPhaseLabel(activeReview.phase)}
                  </p>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
                  {formatDate(activeReview.date.split('T')[0])}
                </span>
              </div>

              {activeReview.bad_habits_resisted && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--primary-gold)] mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Que malos habitos resististe o evitaste?
                  </h4>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border-color)]">
                    {activeReview.bad_habits_resisted}
                  </p>
                </div>
              )}

              {activeReview.progress_made && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--primary-gold)] mb-1 flex items-center gap-2">
                    <PenSquare className="w-4 h-4" />
                    Que progreso lograste esta semana?
                  </h4>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border-color)]">
                    {activeReview.progress_made}
                  </p>
                </div>
              )}

              {activeReview.next_week_plan && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--primary-gold)] mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Como sera mejor la proxima semana?
                  </h4>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border-color)]">
                    {activeReview.next_week_plan}
                  </p>
                </div>
              )}

              {activeReview.gratitude && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--primary-gold)] mb-1 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Agradecimiento
                  </h4>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] p-3 rounded-lg border border-[var(--border-color)]">
                    {activeReview.gratitude}
                  </p>
                </div>
              )}

              {activeReview.stoic_quote && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--background)] to-[var(--card-bg)] border border-[var(--primary-gold)]/20 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Cita de la semana</p>
                  <p className="text-sm text-[var(--foreground)] italic">&ldquo;{activeReview.stoic_quote}&rdquo;</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-12 text-center text-slate-500 h-64 flex flex-col items-center justify-center">
              <PenSquare className="w-10 h-10 mb-3 text-slate-600" />
              <h3 className="text-base font-semibold text-slate-400">Detalles de la revision</h3>
              <p className="text-xs mt-1">Selecciona una revision del historial para ver los detalles.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Review Dialog */}
      <Dialog
        header="Nueva Revision Semanal"
        visible={showDialog}
        style={{ width: '95vw', maxWidth: '640px' }}
        onHide={() => setShowDialog(false)}
        className="stoic-dialog"
      >
        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Numero de Semana</label>
              <Dropdown
                value={newReview.weekNumber}
                onChange={(e) => setNewReview({ ...newReview, weekNumber: e.value })}
                options={weekOptions}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Fase del plan</label>
              <Dropdown
                value={newReview.phase}
                onChange={(e) => setNewReview({ ...newReview, phase: e.value })}
                options={phaseOptions}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Que malos habitos resististe o evitaste?</label>
            <InputTextarea
              value={newReview.badHabitsResisted}
              onChange={(e) => setNewReview({ ...newReview, badHabitsResisted: e.target.value })}
              placeholder="Reflexiona sobre lo que superaste..."
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Que progreso lograste esta semana?</label>
            <InputTextarea
              value={newReview.progressMade}
              onChange={(e) => setNewReview({ ...newReview, progressMade: e.target.value })}
              placeholder="Habitos consolidados, retos completados..."
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Como sera mejor la proxima semana?</label>
            <InputTextarea
              value={newReview.nextWeekPlan}
              onChange={(e) => setNewReview({ ...newReview, nextWeekPlan: e.target.value })}
              placeholder="Que ajustes haras en tus habitos o retos?"
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Agradecimiento</label>
            <InputTextarea
              value={newReview.gratitude}
              onChange={(e) => setNewReview({ ...newReview, gratitude: e.target.value })}
              placeholder="De que estas agradecido esta semana?"
              rows={2}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Cita estoica de la semana (opcional)</label>
            <InputTextarea
              value={newReview.stoicQuote}
              onChange={(e) => setNewReview({ ...newReview, stoicQuote: e.target.value })}
              placeholder="Alguna frase que te haya servido de guia..."
              rows={2}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text p-button-sm"
              onClick={() => setShowDialog(false)}
            />
            <Button
              label="Guardar revision"
              icon="pi pi-check"
              className="p-button-sm"
              onClick={handleSaveReview}
              style={{ backgroundColor: 'var(--primary-gold)', borderColor: 'var(--primary-gold)', color: 'var(--background)' }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
