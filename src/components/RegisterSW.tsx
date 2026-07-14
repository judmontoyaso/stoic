'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    // Registrar de inmediato: esperar al evento "load" perdía el registro
    // cuando la hidratación ocurría después de que load ya había disparado
    // (típico al reabrir la PWA), dejando navigator.serviceWorker.ready
    // colgado para siempre.
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado con éxito: ', registration.scope)
      })
      .catch((error) => {
        console.error('Fallo al registrar el Service Worker: ', error)
      })
  }, [])

  return null
}
