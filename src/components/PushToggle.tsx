'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, BellOff } from 'lucide-react'
import toast from 'react-hot-toast'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

interface PushToggleProps {
  collapsed?: boolean
}

export default function PushToggle({ collapsed = false }: PushToggleProps) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    // Detección de capacidades del navegador: solo posible tras montar en cliente
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(ok)
    if (!ok) return
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => {
        setSubscribed(!!sub)
        if (!sub) return
        // Re-sincroniza la suscripción del navegador con el servidor:
        // repara filas perdidas y la liga al usuario de la sesión actual
        const json = sub.toJSON()
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
        })
      })
      .catch(() => {})
  }, [])

  const toggle = useCallback(async () => {
    if (busy) return
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()

      if (existing) {
        // Desactivar
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        })
        await existing.unsubscribe()
        setSubscribed(false)
        toast('Notificaciones desactivadas', { icon: '🔕' })
        return
      }

      // Activar
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permiso de notificaciones denegado')
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        toast.error('Falta configurar la llave VAPID')
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      })

      const json = sub.toJSON()
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys }),
      })
      if (!res.ok) throw new Error('No se pudo registrar')

      setSubscribed(true)
      toast.success('Notificaciones activadas: recibirás el recordatorio matutino y el cierre del día')
    } catch (err) {
      console.error('Error con las notificaciones push:', err)
      toast.error('No se pudieron activar las notificaciones')
    } finally {
      setBusy(false)
    }
  }, [busy])

  if (!supported) return null

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={subscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
      className={`p-2 rounded-lg bg-slate-800/10 dark:bg-slate-800/20 transition-colors flex items-center justify-center w-full ${
        subscribed
          ? 'text-[var(--primary-gold)] hover:text-slate-500'
          : 'text-slate-500 hover:text-[var(--primary-gold)]'
      } ${busy ? 'opacity-50' : ''}`}
    >
      {subscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {!collapsed && (
        <span className="text-xs ml-2">
          {subscribed ? 'Notificaciones on' : 'Notificaciones off'}
        </span>
      )}
    </button>
  )
}
