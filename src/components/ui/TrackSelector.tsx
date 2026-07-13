'use client'

import Pill from './Pill'
import type { Track } from '@/types'

interface TrackSelectorProps {
  tracks: Track[]
  activeTrackId: string | null
  onSelect: (trackId: string) => void
}

/** Fila de píldoras para cambiar entre tracks del programa */
export default function TrackSelector({ tracks, activeTrackId, onSelect }: TrackSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tracks.map(t => (
        <Pill key={t.id} active={t.id === activeTrackId} onClick={() => onSelect(t.id)}>
          {t.name}
        </Pill>
      ))}
    </div>
  )
}
