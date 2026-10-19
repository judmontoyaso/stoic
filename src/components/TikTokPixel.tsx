'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { persistTtclidCookie, ttqPage } from '@/lib/tiktok-pixel'

export default function TikTokPixel() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    persistTtclidCookie()
    // La primera vista ya la dispara ttq.page() dentro del script base en <head>.
    // En navegaciones SPA posteriores, notificamos el cambio de ruta a TikTok.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    ttqPage()
  }, [pathname])

  return null
}
