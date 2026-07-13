'use client'

import { useState, useCallback } from 'react'
import { TabView, TabPanel } from 'primereact/tabview'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { ExternalLink, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import { getResourceTypeLabel, getPhaseLabel } from '@/lib/utils'
import { LoadingScreen, PageHeader } from '@/components/ui'
import { useStoicSync } from '@/hooks/useStoicSync'
import type { Resource, ResourceType } from '@/types'

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [newResource, setNewResource] = useState({
    title: '',
    author: '',
    type: 'book' as ResourceType,
    url: '',
    description: '',
    phase: null as number | null,
  })

  const loadResources = useCallback(async () => {
    try {
      const data = await StoicDB.getResources()
      setResources(data)
    } catch (err) {
      console.error('Error loading resources:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useStoicSync(loadResources)

  const handleToggleCompleted = async (id: string) => {
    try {
      await StoicDB.toggleResourceCompleted(id)
      toast.success('Estado actualizado')
      await loadResources()
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar recurso')
    }
  }

  const handleAddResource = async () => {
    if (!newResource.title.trim()) {
      toast.error('El titulo es requerido')
      return
    }
    try {
      await StoicDB.addResource(
        newResource.title,
        newResource.author || null,
        newResource.type,
        newResource.url || null,
        newResource.description || null,
        newResource.phase
      )
      setShowDialog(false)
      setNewResource({ title: '', author: '', type: 'book', url: '', description: '', phase: null })
      toast.success('Recurso agregado')
      await loadResources()
    } catch (err) {
      console.error(err)
      toast.error('Error al agregar recurso')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <img src="/icons/history-book.png" className="w-5 h-5 object-contain" alt="Libro" />
      case 'youtube': return <img src="/icons/time.png" className="w-5 h-5 object-contain dark:invert dark:opacity-60" alt="YouTube" />
      case 'course':
      case 'diplomado': return <img src="/icons/papyrus.png" className="w-5 h-5 object-contain" alt="Curso" />
      default: return <img src="/icons/history-book.png" className="w-5 h-5 object-contain" alt="Recurso" />
    }
  }

  const renderResourceList = (filtered: Resource[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {filtered.length === 0 ? (
        <div className="col-span-full text-center py-12 text-slate-500">
          <i className="pi pi-bookmark text-4xl mb-3 block" />
          <p>No hay recursos en esta categoria</p>
        </div>
      ) : (
        filtered.map((res) => (
          <div 
            key={res.id}
            className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
              res.completed 
                ? 'bg-[var(--primary-gold)]/5 border-[var(--border-color)]' 
                : 'bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary-gold)]/20'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    {getIcon(res.type)}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {getResourceTypeLabel(res.type)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleToggleCompleted(res.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    res.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {res.completed ? 'Completado' : 'Pendiente'}
                </button>
              </div>

              <h3 className={`text-base font-bold text-[var(--foreground)] ${res.completed ? 'line-through text-slate-450 dark:text-slate-500' : ''}`}>
                {res.title}
              </h3>
              {res.author && (
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Autor: {res.author}</p>
              )}
              {res.description && (
                <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[var(--border-color)]">
              <span className="text-[10px] text-slate-450 dark:text-slate-400 flex items-center gap-1 font-medium">
                {res.phase ? (
                  <>
                    <Award className="w-3.5 h-3.5 text-[var(--primary-gold)]" />
                    Fase {res.phase}: {getPhaseLabel(res.phase)}
                  </>
                ) : (
                  'General'
                )}
              </span>
              
              {res.url && (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--primary-gold)] hover:underline flex items-center gap-1"
                >
                  Ver enlace
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )

  if (loading) return <LoadingScreen />

  const typeOptions = [
    { label: 'Libro', value: 'book' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'Curso', value: 'course' },
    { label: 'Diplomado', value: 'diplomado' },
  ]

  const phaseOptions = [
    { label: 'Ninguna (General)', value: null },
    { label: 'Fase 1: Fundamentos', value: 1 },
    { label: 'Fase 2: Persuadir', value: 2 },
    { label: 'Fase 3: Liderar', value: 3 },
  ]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <PageHeader
          title="Recursos"
          subtitle="Libros, canales y diplomados recomendados para tu estudio"
          actions={
            <Button
              icon="pi pi-plus"
              label="Nuevo"
              className="p-button-sm"
              onClick={() => setShowDialog(true)}
              style={{ backgroundColor: 'var(--primary-gold)', borderColor: 'var(--primary-gold)', color: 'var(--background)' }}
            />
          }
        />
      </div>

      <TabView className="stoic-tabs">
        <TabPanel header="Todos" leftIcon="pi pi-bookmark mr-2">
          {renderResourceList(resources)}
        </TabPanel>
        <TabPanel header="Libros" leftIcon="pi pi-book mr-2">
          {renderResourceList(resources.filter(r => r.type === 'book'))}
        </TabPanel>
        <TabPanel header="YouTube" leftIcon="pi pi-video mr-2">
          {renderResourceList(resources.filter(r => r.type === 'youtube'))}
        </TabPanel>
        <TabPanel header="Cursos / Diplomados" leftIcon="pi pi-briefcase mr-2">
          {renderResourceList(resources.filter(r => r.type === 'course' || r.type === 'diplomado'))}
        </TabPanel>
      </TabView>

      {/* Add Resource Dialog */}
      <Dialog
        header="Nuevo Recurso"
        visible={showDialog}
        style={{ width: '95vw', maxWidth: '480px' }}
        onHide={() => setShowDialog(false)}
        className="stoic-dialog"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Titulo</label>
            <InputText
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="Ej: Never Split the Difference"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Autor / Canal</label>
            <InputText
              value={newResource.author}
              onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
              placeholder="Ej: Chris Voss"
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Tipo</label>
              <Dropdown
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.value })}
                options={typeOptions}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Fase del plan</label>
              <Dropdown
                value={newResource.phase}
                onChange={(e) => setNewResource({ ...newResource, phase: e.value })}
                options={phaseOptions}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Enlace (URL)</label>
            <InputText
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              placeholder="https://..."
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Descripcion</label>
            <InputTextarea
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              placeholder="De que trata este recurso?"
              rows={3}
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
              label="Agregar"
              icon="pi pi-check"
              className="p-button-sm"
              onClick={handleAddResource}
              style={{ backgroundColor: 'var(--primary-gold)', borderColor: 'var(--primary-gold)', color: 'var(--background)' }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
