'use client'

import { useEffect, useState, useCallback } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar, Sun, Moon, BookOpen, Feather, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday, formatDate } from '@/lib/utils'
import type { JournalEntry, JournalEntryType } from '@/types'

// Plantillas basadas en el plan de cambio de identidad (Frankl / Séneca / Marco Aurelio)
const TEMPLATES: Record<JournalEntryType, { label: string; icon: 'sun' | 'moon' | 'book' | 'feather'; fields: { key: string; label: string; placeholder: string }[] }> = {
  morning: {
    label: 'Examen matutino',
    icon: 'sun',
    fields: [
      { key: 'identity', label: 'Hoy soy... (identidad deseada)', placeholder: 'Soy disciplinado, tranquilo, claro al hablar...' },
      { key: 'goals', label: 'Mis metas para hoy (1-2 tareas alineadas)', placeholder: 'Qué haré hoy que confirme esa identidad...' },
      { key: 'triggers', label: 'Obstáculos y gatillos probables de hoy', placeholder: 'Personas difíciles, retrasos, críticas... ¿qué depende de mí y qué no?' },
      { key: 'pattern_to_break', label: '¿Qué patrón limitante intento romper hoy?', placeholder: 'El hábito viejo que hoy no me gobernará...' },
    ],
  },
  evening: {
    label: 'Examen nocturno',
    icon: 'moon',
    fields: [
      { key: 'did_well', label: '¿Qué hice bien hoy?', placeholder: 'Al menos 2 decisiones alineadas con la nueva identidad...' },
      { key: 'to_improve', label: '¿Qué puedo mejorar?', placeholder: 'Sin juzgarte: un error o dificultad y su ajuste...' },
      { key: 'learned', label: '¿Qué aprendí hoy?', placeholder: 'El punto clave del día...' },
      { key: 'gratitude', label: 'Gratitud y avance de propósito', placeholder: 'Algo específico de hoy, conectado a tu porqué...' },
    ],
  },
  weekly: {
    label: 'Revisión semanal',
    icon: 'book',
    fields: [
      { key: 'why_wake_up', label: '¿Por qué me levanto cada día?', placeholder: 'El propósito de esta semana en tus palabras...' },
      { key: 'praise_self', label: 'Elogios a la persona en que me estoy convirtiendo', placeholder: 'Cualidades demostradas esta semana, con ejemplos...' },
      { key: 'sacrifice', label: 'Sacrificio asumido con valor', placeholder: 'Una renuncia o esfuerzo hecho conscientemente...' },
      { key: 'next_week', label: 'Proyección de la próxima semana', placeholder: 'Objetivos concretos alineados al propósito...' },
    ],
  },
  free: {
    label: 'Escritura libre',
    icon: 'feather',
    fields: [
      { key: 'text', label: 'Lo que necesites sacar', placeholder: 'Escribe sin filtro...' },
    ],
  },
}

const MOODS = [
  { value: 1, emoji: '😞', label: 'Muy bajo' },
  { value: 2, emoji: '😕', label: 'Bajo' },
  { value: 3, emoji: '😐', label: 'Neutro' },
  { value: 4, emoji: '🙂', label: 'Bien' },
  { value: 5, emoji: '💪', label: 'Fuerte' },
]

function TemplateIcon({ icon, className }: { icon: 'sun' | 'moon' | 'book' | 'feather'; className?: string }) {
  switch (icon) {
    case 'sun': return <Sun className={className} />
    case 'moon': return <Moon className={className} />
    case 'book': return <BookOpen className={className} />
    case 'feather': return <Feather className={className} />
  }
}

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

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('stoic_data_changed', handler)
    return () => window.removeEventListener('stoic_data_changed', handler)
  }, [loadData])

  // Pre-cargar el borrador si ya existe entrada de hoy para el tipo activo
  useEffect(() => {
    const existing = entries.find(e => e.date === today && e.entry_type === activeType)
    setDraft(existing?.content || {})
    setMood(existing?.mood ?? null)
  }, [activeType, entries, today])

  const handleSave = async () => {
    const template = TEMPLATES[activeType]
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[var(--primary-gold)]" />
      </div>
    )
  }

  const template = TEMPLATES[activeType]
  const todayHas = (type: JournalEntryType) => entries.some(e => e.date === today && e.entry_type === type)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <img src="/icons/papyrus.png" className="w-8 h-8 object-contain" alt="Papiro" />
          Diario Estoico
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Examen matutino (Marco Aurelio), examen nocturno (Séneca) y revisión semanal. Lo que se escribe, se integra.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Type tabs */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(TEMPLATES) as JournalEntryType[]).map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  activeType === type
                    ? 'bg-[var(--primary-gold)]/15 border-[var(--primary-gold)]/40 text-[var(--primary-gold)]'
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-slate-500 hover:text-[var(--foreground)]'
                }`}
              >
                <TemplateIcon icon={TEMPLATES[type].icon} className="w-3.5 h-3.5" />
                {TEMPLATES[type].label}
                {todayHas(type) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
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
          </div>
        </div>

        {/* Historial */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Historial</h2>
          {entries.length === 0 ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-8 text-center text-slate-500">
              <img src="/icons/history-book.png" className="w-8 h-8 mx-auto mb-3 object-contain opacity-55" alt="Vacío" />
              <p className="text-sm">Aún no hay entradas.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {entries.map(entry => {
                const t = TEMPLATES[entry.entry_type]
                const moodEmoji = MOODS.find(m => m.value === entry.mood)?.emoji
                const isOpen = viewEntry?.id === entry.id
                return (
                  <div key={entry.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
