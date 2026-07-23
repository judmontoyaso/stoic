'use client'

import { motion } from 'framer-motion'

// Carga con estética de marca: anillo dorado girando + el nombre latiendo
// tenue. Más digno que un spinner genérico, y consistente en toda la app.
export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <motion.div
        className="w-9 h-9 rounded-full border-2 border-[var(--primary-gold)]/25 border-t-[var(--primary-gold)]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      />
      <motion.span
        className="text-[10px] tracking-[0.35em] uppercase text-slate-500"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      >
        StoiCom
      </motion.span>
    </div>
  )
}
