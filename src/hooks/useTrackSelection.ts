'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { StoicDB } from '@/lib/db'
import type { Track } from '@/types'

/**
 * Carga los tracks y mantiene la selección activa (por defecto el primero).
 * Compartido por Calendario, Programa y Retos.
 */
export function useTrackSelection() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reloadTracks = useCallback(async () => {
    try {
      const all = await StoicDB.getTracks()
      setTracks(all)
      setActiveTrackId(prev => prev ?? all[0]?.id ?? null)
    } catch (err) {
      console.error('Error loading tracks:', err)
      toast.error('Error al cargar los tracks')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial: el setState ocurre tras el await, no es síncrono dentro del efecto
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { reloadTracks() }, [reloadTracks])

  const activeTrack = tracks.find(t => t.id === activeTrackId) ?? null

  return { tracks, activeTrack, activeTrackId, setActiveTrackId, loading, reloadTracks }
}
