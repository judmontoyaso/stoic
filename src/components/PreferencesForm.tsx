'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sunrise, Moon, Globe2, Play, Check, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB, DEFAULT_PREFS, type UserPrefs } from '@/lib/db'
import { track as trackEvent } from '@/lib/analytics'
import { Card, LoadingScreen, Button } from '@/components/ui'
import type { Track } from '@/types'

// Zonas horarias del público objetivo (LATAM + España + EE.UU.)
const TIMEZONES = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Lima',
  'America/Guayaquil',
  'America/Caracas',
  'America/La_Paz',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/Asuncion',
  'America/Montevideo',
  'America/Panama',
  'America/Costa_Rica',
  'America/Guatemala',
  'America/Santo_Domingo',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Atlantic/Canary',
]

function hourLabel(h: number): string {
  const ampm = h < 12 ? 'am' : 'pm'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:00 ${ampm}`
}

function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA')
}

interface PreferencesFormProps {
  /** Modo bienvenida: además de correos, permite iniciar tracks */
  showTracks?: boolean
  /** A dónde ir tras guardar */
  afterSaveHref?: string
  submitLabel?: string
}

export default function PreferencesForm({
  showTracks = false,
  afterSaveHref = '/',
  submitLabel = 'Guardar preferencias',
}: PreferencesFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState<UserPrefs>({ ...DEFAULT_PREFS })
  const [tracks, setTracks] = useState<Track[]>([])
  const [startDates, setStartDates] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const detectedTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_PREFS.timezone
    } catch {
      return DEFAULT_PREFS.timezone
    }
  }, [])

  const tzOptions = useMemo(
    () => (TIMEZONES.includes(detectedTz) ? TIMEZONES : [detectedTz, ...TIMEZONES]),
    [detectedTz]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [myPrefs, allTracks] = await Promise.all([
          StoicDB.getMyPrefs(),
          showTracks ? StoicDB.getTracks() : Promise.resolve([] as Track[]),
        ])
        if (cancelled) return
        // Con la zona por defecto guardada (o sin fila aún) se propone
        // la del dispositivo si es distinta
        setPrefs(
          myPrefs.timezone === DEFAULT_PREFS.timezone && detectedTz !== DEFAULT_PREFS.timezone
            ? { ...myPrefs, timezone: detectedTz }
            : myPrefs
        )
        setTracks(allTracks)
        const dates: Record<string, string> = {}
        const sel: Record<string, boolean> = {}
        for (const t of allTracks) {
          dates[t.id] = t.start_date || todayLocal()
          sel[t.id] = !!t.start_date
        }
        setStartDates(dates)
        setSelected(sel)
      } catch (err) {
        console.error('Error cargando preferencias:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [showTracks, detectedTz])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (showTracks) {
        for (const t of tracks) {
          const wasStarted = !!t.start_date
          const wantsStart = selected[t.id]
          const date = startDates[t.id]
          if (wantsStart && !wasStarted && date) {
            await StoicDB.setTrackStartDate(t.id, date)
            trackEvent('track_started', { track_id: t.id, track_name: t.name, start_date: date })
          }
        }
      }
      await StoicDB.saveMyPrefs(prefs)
      trackEvent(showTracks ? 'onboarding_completed' : 'prefs_updated', {
        timezone: prefs.timezone,
        morning_hour: prefs.morning_hour,
        evening_hour: prefs.evening_hour,
      })
      toast.success('Preferencias guardadas')
      router.push(afterSaveHref)
    } catch (err) {
      console.error('Error guardando preferencias:', err)
      toast.error('No se pudieron guardar las preferencias')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  const selectClass =
    'w-full text-sm rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-3 focus:outline-none focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 transition-all cursor-pointer'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {showTracks && tracks.length > 0 && (
        <Card className="p-6 space-y-4 border border-white/[0.08] hover:border-[var(--primary-gold)]/30 transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)]">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Tu programa de 90 días</h2>
              <p className="text-xs text-slate-400">Elige con qué track comienzas tu entrenamiento.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            La fecha marca tu Día 1 real: los días que se pierdan se marcan en tu calendario.
          </p>
          <div className="space-y-3 pt-1">
            {tracks.map(t => (
              <div
                key={t.id}
                className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                  selected[t.id]
                    ? 'border-[var(--primary-gold)]/40 bg-[var(--primary-gold)]/5'
                    : 'border-[var(--border-color)] bg-[var(--background)]/50'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selected[t.id]}
                    disabled={!!t.start_date}
                    onChange={e => setSelected(s => ({ ...s, [t.id]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[var(--primary-gold)] cursor-pointer"
                  />
                  <span className="text-sm font-bold text-[var(--foreground)]">{t.name}</span>
                  {t.start_date && (
                    <span className="text-[10px] bg-[var(--primary-gold)]/15 text-[var(--primary-gold)] border border-[var(--primary-gold)]/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-auto">
                      Iniciado el {t.start_date}
                    </span>
                  )}
                </label>
                {selected[t.id] && !t.start_date && (
                  <div className="pt-2 border-t border-[var(--border-color)]/60">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Fecha de inicio (Día 1):
                    </label>
                    <input
                      type="date"
                      value={startDates[t.id] || ''}
                      min={todayLocal()}
                      onChange={e => setStartDates(d => ({ ...d, [t.id]: e.target.value }))}
                      className={selectClass}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 space-y-4 border border-white/[0.08] hover:border-[var(--primary-gold)]/30 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)]">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Zona horaria</h2>
            <p className="text-xs text-slate-400">Para sincronizar los envíos con tu horario local.</p>
          </div>
        </div>
        <select
          value={prefs.timezone}
          onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))}
          className={selectClass}
        >
          {tzOptions.map(tz => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}{tz === detectedTz ? ' (tu dispositivo actual)' : ''}
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-6 space-y-4 border border-white/[0.08] hover:border-[var(--primary-gold)]/30 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Correos diarios</h2>
            <p className="text-xs text-slate-400">Horarios de recepción de lecciones y examen nocturno.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sunrise className="w-4 h-4 text-[var(--primary-gold)]" />
              Ejercicio del día (Mañana)
            </label>
            <select
              value={prefs.morning_hour}
              onChange={e => setPrefs(p => ({ ...p, morning_hour: Number(e.target.value) }))}
              className={selectClass}
            >
              {Array.from({ length: 12 }, (_, i) => i + 4).map(h => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-[var(--primary-gold)]" />
              Cierre del día (Noche)
            </label>
            <select
              value={prefs.evening_hour}
              onChange={e => setPrefs(p => ({ ...p, evening_hour: Number(e.target.value) }))}
              className={selectClass}
            >
              {Array.from({ length: 7 }, (_, i) => i + 17).map(h => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          Los correos se despachan dentro de la hora elegida según tu huso horario local.
        </p>
      </Card>

      <Button
        variant="primary"
        size="lg"
        isLoading={saving}
        loadingText="Guardando preferencias..."
        onClick={handleSave}
        className="w-full shadow-[0_0_25px_rgba(201,168,76,0.25)] cursor-pointer"
      >
        {submitLabel}
      </Button>
    </motion.div>
  )
}
