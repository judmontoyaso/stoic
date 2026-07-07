'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Shield, ArrowUpRight, MessageCircle, Footprints } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday, getLevelLabel } from '@/lib/utils'
import type { Challenge, ChallengeLog } from '@/types'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [logs, setLogs] = useState<ChallengeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLevel, setActiveLevel] = useState<number | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [noteDialog, setNoteDialog] = useState<{ id: string; open: boolean }>({ id: '', open: false })
  const [noteText, setNoteText] = useState('')
  const [reflectionText, setReflectionText] = useState('')
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', level: 1 })
  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const [allChallenges, todayLogs] = await Promise.all([
        StoicDB.getChallenges(),
        StoicDB.getChallengeLogs(today),
      ])
      setChallenges(allChallenges)
      setLogs(todayLogs)
    } catch (err) {
      console.error('Error:', err)
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

  const handleToggle = async (challengeId: string) => {
    try {
      await StoicDB.toggleChallengeLog(challengeId, today)
      await loadData()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al actualizar reto')
    }
  }

  const handleSaveNote = async () => {
    try {
      await StoicDB.updateChallengeLogNotes(noteDialog.id, today, noteText, reflectionText)
      setNoteDialog({ id: '', open: false })
      setNoteText('')
      setReflectionText('')
      toast.success('Notas guardadas')
      await loadData()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al guardar notas')
    }
  }

  const handleAddChallenge = async () => {
    if (!newChallenge.title.trim()) {
      toast.error('El titulo es requerido')
      return
    }
    try {
      await StoicDB.addChallenge(
        newChallenge.title,
        newChallenge.description,
        'social_ladder',
        newChallenge.level
      )
      setShowDialog(false)
      setNewChallenge({ title: '', description: '', level: 1 })
      toast.success('Reto creado')
      await loadData()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al crear reto')
    }
  }

  const isCompleted = (challengeId: string) => {
    return logs.some(l => l.challenge_id === challengeId && l.completed)
  }

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return <Footprints className="w-4 h-4" />
      case 2: return <ArrowUpRight className="w-4 h-4" />
      case 3: return <MessageCircle className="w-4 h-4" />
      case 4: return <Shield className="w-4 h-4" />
      default: return <Footprints className="w-4 h-4" />
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }
      case 2: return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' }
      case 3: return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' }
      case 4: return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[#c9a84c]" />
      </div>
    )
  }

  const filteredChallenges = activeLevel
    ? challenges.filter(c => c.level === activeLevel)
    : challenges

  const completedCount = filteredChallenges.filter(c => isCompleted(c.id)).length
  const levels = [1, 2, 3, 4]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Retos</h1>
          <p className="text-slate-400 text-sm mt-1">Escalera de exposicion social</p>
        </div>
        <Button
          icon="pi pi-plus"
          label="Nuevo"
          className="p-button-sm"
          onClick={() => setShowDialog(true)}
          style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#0a0a0f' }}
        />
      </div>

      {/* Level filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveLevel(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeLevel === null
              ? 'bg-[#c9a84c] text-[#0a0a0f]'
              : 'bg-[#111116] text-slate-400 border border-[#1e1e28] hover:border-[#c9a84c]/30'
          }`}
        >
          <i className="pi pi-list mr-2" />
          Todos ({challenges.length})
        </button>
        {levels.map(level => {
          const levelChallenges = challenges.filter(c => c.level === level)
          const levelCompleted = levelChallenges.filter(c => isCompleted(c.id)).length
          const colors = getLevelColor(level)
          return (
            <button
              key={level}
              onClick={() => setActiveLevel(activeLevel === level ? null : level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeLevel === level
                  ? `${colors.bg} ${colors.text} border ${colors.border}`
                  : 'bg-[#111116] text-slate-400 border border-[#1e1e28] hover:border-[#c9a84c]/30'
              }`}
            >
              {getLevelIcon(level)}
              {getLevelLabel(level)}
              <span className="text-xs opacity-70">({levelCompleted}/{levelChallenges.length})</span>
            </button>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="bg-[#111116] border border-[#1e1e28] rounded-xl p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Completados hoy</span>
          <span className="text-[#c9a84c] font-medium">{completedCount}/{filteredChallenges.length}</span>
        </div>
      </div>

      {/* Challenge list */}
      <div className="space-y-3">
        {filteredChallenges.map((challenge) => {
          const colors = getLevelColor(challenge.level)
          const completed = isCompleted(challenge.id)
          const log = logs.find(l => l.challenge_id === challenge.id)

          return (
            <div
              key={challenge.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 group ${
                completed
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-[#0a0a0f] border-[#1e1e28] hover:border-[#c9a84c]/20'
              }`}
            >
              <button
                onClick={() => handleToggle(challenge.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  completed
                    ? `border-current bg-current ${colors.text}`
                    : 'border-slate-600 hover:border-[#c9a84c]/50'
                }`}
              >
                {completed && <i className="pi pi-check text-xs text-[#0a0a0f] font-bold" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium ${completed ? `${colors.text} line-through` : 'text-slate-200'}`}>
                    {challenge.title}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                    Nv.{challenge.level}
                  </span>
                </div>
                {challenge.description && (
                  <p className="text-xs text-slate-500 mt-1">{challenge.description}</p>
                )}
                {log?.notes && (
                  <div className="mt-2 p-2 rounded-lg bg-[#111116] border border-[#1e1e28]">
                    <p className="text-xs text-slate-400"><i className="pi pi-pencil mr-1" />{log.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    const existingLog = logs.find(l => l.challenge_id === challenge.id)
                    setNoteText(existingLog?.notes || '')
                    setReflectionText(existingLog?.reflection || '')
                    setNoteDialog({ id: challenge.id, open: true })
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#c9a84c]/10"
                  title="Agregar nota"
                >
                  <i className="pi pi-pencil text-xs text-[#c9a84c]" />
                </button>
                {challenge.is_custom && (
                  <button
                    onClick={async () => {
                      await StoicDB.deleteChallenge(challenge.id)
                      toast.success('Reto eliminado')
                      await loadData()
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    <i className="pi pi-trash text-xs text-red-400" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Note Dialog */}
      <Dialog
        header="Notas del reto"
        visible={noteDialog.open}
        style={{ width: '90vw', maxWidth: '480px' }}
        onHide={() => setNoteDialog({ id: '', open: false })}
        className="stoic-dialog"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Que paso?</label>
            <InputTextarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Describe brevemente la interaccion..."
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Reflexion</label>
            <InputTextarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Que aprendiste? Como te sentiste?"
              rows={3}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text p-button-sm"
              onClick={() => setNoteDialog({ id: '', open: false })}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              className="p-button-sm"
              onClick={handleSaveNote}
              style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#0a0a0f' }}
            />
          </div>
        </div>
      </Dialog>

      {/* Add Challenge Dialog */}
      <Dialog
        header="Nuevo Reto"
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '480px' }}
        onHide={() => setShowDialog(false)}
        className="stoic-dialog"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Titulo</label>
            <InputText
              value={newChallenge.title}
              onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              placeholder="Ej: Iniciar conversacion con el portero"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Descripcion</label>
            <InputTextarea
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              placeholder="Descripcion opcional"
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Nivel de dificultad</label>
            <Dropdown
              value={newChallenge.level}
              onChange={(e) => setNewChallenge({ ...newChallenge, level: e.value })}
              options={[
                { label: 'Nivel 1 - Casi sin friccion', value: 1 },
                { label: 'Nivel 2 - Un paso mas', value: 2 },
                { label: 'Nivel 3 - Conversacion real', value: 3 },
                { label: 'Nivel 4 - Sostener la conversacion', value: 4 },
              ]}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text p-button-sm"
              onClick={() => setShowDialog(false)}
            />
            <Button
              label="Crear"
              icon="pi pi-check"
              className="p-button-sm"
              onClick={handleAddChallenge}
              style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#0a0a0f' }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
