'use client'

import { useEffect, useRef } from 'react'
import { trackPublic, type PublicEventName } from '@/lib/analytics-public'

// Registra una vista de página pública. Se monta una sola vez por carga:
// el ref evita el doble disparo del modo estricto en desarrollo.
export default function PublicPageView({ name }: { name: PublicEventName }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    trackPublic(name, { ref: document.referrer ? new URL(document.referrer).hostname : 'directo' })
  }, [name])
  return null
}
