'use client'

import { motion } from 'framer-motion'
import { Sliders } from 'lucide-react'
import PreferencesForm from '@/components/PreferencesForm'
import ReferralCodes from '@/components/ReferralCodes'
import { PageHeader } from '@/components/ui'

// Preferencias del usuario: zona horaria y hora de los correos.
// Los tracks se gestionan desde el panel (la fecha de inicio no se
// mueve una vez arrancado el programa).

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto px-4 py-8 space-y-6"
    >
      <PageHeader
        title="Preferencias"
        icon={
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/30 flex items-center justify-center text-[var(--primary-gold)] shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <Sliders className="w-5 h-5" />
          </div>
        }
        subtitle="Zona horaria y horario de tus correos diarios"
      />
      <PreferencesForm afterSaveHref="/settings" />
      <ReferralCodes />
    </motion.div>
  )
}
