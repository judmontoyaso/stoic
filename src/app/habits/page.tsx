'use client'

import { useEffect, useState, useCallback } from 'react'
import { TabView, TabPanel } from 'primereact/tabview'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { ProgressBar } from 'primereact/progressbar'
import { Plus, Flame, MessageSquare, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getToday, getPhaseLabel } from '@/lib/utils'
import type { Habit, HabitLog, HabitCategory } from '@/types'

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', description: '', category: 'communication' as HabitCategory })
  const today = getToday()

  const loadData = useCallback(async () => {
    try {
      const [allHabits, todayLogs] = await Promise.all([
        StoicDB.getHabits(),
        StoicDB.getHabitLogs(today),
      ])
      setHabits(allHabits)
      setLogs(todayLogs)
    } catch (err) {
      console.error('Error loading habits:', err)
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

  const handleToggle = async (habitId: string) => {
    try {
      await StoicDB.toggleHabitLog(habitId, today)
      await loadData()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al actualizar habito')
    }
  }

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    try {
      await StoicDB.addHabit(newHabit.name, newHabit.description, newHabit.category)
      setShowDialog(false)
      setNewHabit({ name: '', description: '', category: 'communication' })
      toast.success('Habito creado')
      await loadData()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al crear habito')
    }
  }

  const handleDeleteHabit = async (id: string) => {
    try {
      await StoicDB.deleteHabit(id)
      toast.success('Habito eliminado')
      await loadData()
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al eliminar')
    }
  }

  const isCompleted = (habitId: string) => {
    return logs.some(l => l.habit_id === habitId && l.completed)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <MessageSquare className="w-4 h-4" />
      case 'stoic': return <Flame className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      default: return <Flame className="w-4 h-4" />
    }
  }

  const renderHabitList = (filteredHabits: Habit[]) => (
    <div className="space-y-3 mt-4">
      {filteredHabits.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <i className="pi pi-inbox text-4xl mb-3 block" />
          <p>No hay habitos en esta categoria</p>
        </div>
      ) : (
        filteredHabits.map((habit) => (
          <div
            key={habit.id}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 group ${
              isCompleted(habit.id)
                ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30'
                : 'bg-[#0a0a0f] border-[#1e1e28] hover:border-[#c9a84c]/20'
            }`}
          >
            <button
              onClick={() => handleToggle(habit.id)}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                isCompleted(habit.id)
                  ? 'border-[#c9a84c] bg-[#c9a84c] scale-110'
                  : 'border-slate-600 hover:border-[#c9a84c]/50'
              }`}
            >
              {isCompleted(habit.id) && (
                <i className="pi pi-check text-xs text-[#0a0a0f] font-bold" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isCompleted(habit.id) ? 'text-[#c9a84c] line-through' : 'text-slate-200'}`}>
                {habit.name}
              </p>
              {habit.description && (
                <p className="text-xs text-slate-500 mt-1">{habit.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {habit.phase && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c]">
                    Fase {habit.phase}: {getPhaseLabel(habit.phase)}
                  </span>
                )}
                {habit.week && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                    Semana {habit.week}
                  </span>
                )}
              </div>
            </div>

            {habit.is_custom && (
              <button
                onClick={() => handleDeleteHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10"
              >
                <i className="pi pi-trash text-xs text-red-400" />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-[#c9a84c]" />
      </div>
    )
  }

  const categoryOptions = [
    { label: 'Comunicacion', value: 'communication' },
    { label: 'Estoico', value: 'stoic' },
    { label: 'Social', value: 'social' },
  ]

  const completedCount = habits.filter(h => isCompleted(h.id)).length

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Habitos</h1>
          <p className="text-slate-400 text-sm mt-1">
            {completedCount} de {habits.length} completados hoy
          </p>
        </div>
        <Button
          icon="pi pi-plus"
          label="Nuevo"
          className="p-button-sm"
          onClick={() => setShowDialog(true)}
          style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#0a0a0f' }}
        />
      </div>

      {/* Progress */}
      <div className="mb-6 bg-[#111116] border border-[#1e1e28] rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Progreso de hoy</span>
          <span className="text-[#c9a84c] font-medium">
            {habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%
          </span>
        </div>
        <ProgressBar
          value={habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}
          showValue={false}
          style={{ height: '6px', borderRadius: '3px' }}
        />
      </div>

      {/* Tabs by category */}
      <TabView className="stoic-tabs">
        <TabPanel header="Todos" leftIcon="pi pi-list mr-2">
          {renderHabitList(habits)}
        </TabPanel>
        <TabPanel header="Comunicacion" leftIcon="pi pi-comments mr-2">
          {renderHabitList(habits.filter(h => h.category === 'communication'))}
        </TabPanel>
        <TabPanel header="Estoico" leftIcon="pi pi-sun mr-2">
          {renderHabitList(habits.filter(h => h.category === 'stoic'))}
        </TabPanel>
        <TabPanel header="Social" leftIcon="pi pi-users mr-2">
          {renderHabitList(habits.filter(h => h.category === 'social'))}
        </TabPanel>
      </TabView>

      {/* Add Habit Dialog */}
      <Dialog
        header="Nuevo Habito"
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '480px' }}
        onHide={() => setShowDialog(false)}
        className="stoic-dialog"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Nombre</label>
            <InputText
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              placeholder="Ej: Meditar 10 minutos"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Descripcion</label>
            <InputTextarea
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              placeholder="Descripcion opcional"
              rows={3}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Categoria</label>
            <Dropdown
              value={newHabit.category}
              onChange={(e) => setNewHabit({ ...newHabit, category: e.value })}
              options={categoryOptions}
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
              onClick={handleAddHabit}
              style={{ backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#0a0a0f' }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
