'use client'

import { useState, useCallback } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday, formatDate } from '@/lib/utils'
import { JOURNAL_TEMPLATES, MOODS } from '@/lib/journal'
import TemplateIcon from '@/components/journal/TemplateIcon'
import { Card, EmptyState, LoadingScreen, PageHeader, Pill } from '@/components/ui'
import { useStoicSync } from '@/hooks/useStoicSync'
import type { JournalEntry, JournalEntryType } from '@/types'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<JournalEntryType>('morning')
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [mood, setMood] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null)

  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const data = await StoicDB.getJournalEntries()
      setEntries(data)
    } catch (err) {
      console.error('Error loading journal:', err)
      toast.error('Error al cargar el diario')
    } finally {
      setLoading(false)
    }
  }, [])

  useStoicSync(loadData)

  // Pre-cargar el borrador si ya existe entrada de hoy para el tipo activo.
  // Ajuste de estado durante el render (patrón React) en vez de useEffect:
  // se re-siembra cuando cambia el tipo activo o aparece la entrada de hoy.
  const existingEntry = entries.find(e => e.date === today && e.entry_type === activeType)
  const draftKey = `${today}|${activeType}|${existingEntry?.id ?? 'new'}`
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(null)
  if (loadedDraftKey !== draftKey) {
    setLoadedDraftKey(draftKey)
    setDraft(existingEntry?.content || {})
    setMood(existingEntry?.mood ?? null)
  }

  const handleSave = async () => {
    const template = JOURNAL_TEMPLATES[activeType]
    const hasContent = template.fields.some(f => (draft[f.key] || '').trim().length > 0)
    if (!hasContent) {
      toast('Escribe algo antes de guardar', { icon: '✍️' })
      return
    }
    setSaving(true)
    try {
      await StoicDB.upsertJournalEntry(today, activeType, draft, mood)
      toast.success(`${template.label} guardado`)
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entry: JournalEntry) => {
    try {
      await StoicDB.deleteJournalEntry(entry.id)
      if (viewEntry?.id === entry.id) setViewEntry(null)
      toast.success('Entrada eliminada')
    } catch (err) {
      console.error(err)
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <LoadingScreen />

  const template = JOURNAL_TEMPLATES[activeType]
  const todayHas = (type: JournalEntryType) => entries.some(e => e.date === today && e.entry_type === type)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Diario Estoico"
        icon={<img src="/icons/papyrus.png" className="w-8 h-8 object-contain" alt="Papiro" />}
        subtitle="Examen matutino (Marco Aurelio), examen nocturno (Séneca) y revisión semanal. Lo que se escribe, se integra."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Type tabs */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(JOURNAL_TEMPLATES) as JournalEntryType[]).map(type => (
              <Pill key={type} size="xs" active={activeType === type} onClick={() => setActiveType(type)}>
                <TemplateIcon icon={JOURNAL_TEMPLATES[type].icon} className="w-3.5 h-3.5" />
                {JOURNAL_TEMPLATES[type].label}
                {todayHas(type) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </Pill>
            ))}
          </div>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <TemplateIcon icon={template.icon} className="w-4 h-4 text-[var(--primary-gold)]" />
                {template.label} — hoy
              </h2>
              <span className="text-xs text-slate-500">{formatDate(today)}</span>
            </div>

            {template.fields.map(field => (
              <div key={field.key}>
                <label className="text-sm text-slate-600 dark:text-slate-400 font-medium block mb-1">{field.label}</label>
                <InputTextarea
                  value={draft[field.key] || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={activeType === 'free' ? 8 : 3}
                  className="w-full"
                />
              </div>
            ))}

            {/* Mood */}
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400 font-medium block mb-2">Estado de ánimo</label>
              <div className="flex gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMood(mood === m.value ? null : m.value)}
                    title={m.label}
                    className={`w-10 h-10 rounded-lg border text-lg transition-all ${
                      mood === m.value
                        ? 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/50 scale-110'
                        : 'bg-[var(--background)] border-[var(--border-color)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Guardando...' : todayHas(activeType) ? 'Actualizar entrada de hoy' : 'Guardar entrada'}
            </button>
          </Card>
        </div>

        {/* Historial */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Historial</h2>
          {entries.length === 0 ? (
            <EmptyState
              className="p-8"
              icon={<img src="/icons/history-book.png" className="w-8 h-8 object-contain" alt="Vacío" />}
            >
              <p className="text-sm">Aún no hay entradas.</p>
            </EmptyState>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {entries.map(entry => {
                const t = JOURNAL_TEMPLATES[entry.entry_type]
                const moodEmoji = MOODS.find(m => m.value === entry.mood)?.emoji
                const isOpen = viewEntry?.id === entry.id
                return (
                  <Card key={entry.id} className="overflow-hidden">
                    <button
                      onClick={() => setViewEntry(isOpen ? null : entry)}
                      className="w-full p-3 text-left flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TemplateIcon icon={t.icon} className="w-3.5 h-3.5 text-[var(--primary-gold)] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--foreground)] truncate">{t.label}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(entry.date)}
                          </p>
                        </div>
                      </div>
                      {moodEmoji && <span className="text-sm flex-shrink-0">{moodEmoji}</span>}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 space-y-2 border-t border-[var(--border-color)] pt-2">
                        {t.fields.map(f => {
                          const value = entry.content[f.key]
                          if (!value) return null
                          return (
                            <div key={f.key}>
                              <p className="text-[10px] font-bold text-[var(--primary-gold)]">{f.label}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{value}</p>
                            </div>
                          )
                        })}
                        <button
                          onClick={() => handleDelete(entry)}
                          className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-400 mt-1"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
