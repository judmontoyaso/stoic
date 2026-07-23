'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// Transición de entrada a nivel de página: un fade + leve subida al navegar.
// Se re-anima al cambiar de ruta (key = pathname), NUNCA en los re-renders
// internos de la página (buscar, filtrar, marcar) — por eso no se siente
// "saltón". Enter-only a propósito: sin salida, evita el parpadeo de
// salir-y-entrar entre páginas.
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
