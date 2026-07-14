'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sunrise, Moon, Globe2, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoicDB, DEFAULT_PREFS, type UserPrefs } from '@/lib/db'
import { track as trackEvent } from '@/lib/analytics'
import { Card, LoadingScreen } from '@/components/ui'
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
    'w-full text-sm rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-3 py-2.5 focus:outline-none focus:border-[var(--primary-gold)]/60'

  return (
    <div className="space-y-5">
      {showTracks && tracks.length > 0 && (
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <Play className="w-4 h-4 text-[var(--primary-gold)]" />
            Tu programa de 90 días
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            Elige con qué track empiezas y desde qué fecha. Puedes activar el otro
            más adelante desde el panel. La fecha marca tu Día 1 real: los días
            que se pierdan se marcan, el calendario nunca se reorganiza.
          </p>
          {tracks.map(t => (
            <div key={t.id} className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--border-color)]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selected[t.id]}
                  disabled={!!t.start_date}
                  onChange={e => setSelected(s => ({ ...s, [t.id]: e.target.checked }))}
                  className="w-4 h-4 accent-[var(--primary-gold)]"
                />
                <span className="text-sm font-semibold text-[var(--foreground)]">{t.name}</span>
                {t.start_date && (
                  <span className="text-[10px] text-[var(--primary-gold)] font-bold uppercase tracking-wide">
                    Iniciado el {t.start_date}
                  </span>
                )}
              </label>
              {selected[t.id] && !t.start_date && (
                <input
                  type="date"
                  value={startDates[t.id] || ''}
                  min={todayLocal()}
                  onChange={e => setStartDates(d => ({ ...d, [t.id]: e.target.value }))}
                  className={selectClass}
                />
              )}
            </div>
          ))}
        </Card>
      )}

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[var(--primary-gold)]" />
          Zona horaria
        </h2>
        <select
          value={prefs.timezone}
          onChange={e => setPrefs(p => ({ ...p, timezone: e.target.value }))}
          className={selectClass}
        >
          {tzOptions.map(tz => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}{tz === detectedTz ? ' (tu dispositivo)' : ''}
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Correos diarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5 text-[var(--primary-gold)]" />
              Ejercicio del día
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[var(--primary-gold)]" />
              Cierre del día
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
        <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
          El correo llega dentro de la hora elegida, en tu zona horaria.
        </p>
      </Card>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-lg bg-[var(--primary-gold)] text-[#0a0a0f] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Guardando...' : submitLabel}
      </button>
    </div>
  )
}
