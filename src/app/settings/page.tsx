'use client'

import PreferencesForm from '@/components/PreferencesForm'
import { PageHeader } from '@/components/ui'

// Preferencias del usuario: zona horaria y hora de los correos.
// Los tracks se gestionan desde el panel (la fecha de inicio no se
// mueve una vez arrancado el programa).

export default function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Preferencias"
        subtitle="Zona horaria y horario de tus correos diarios"
      />
      <PreferencesForm afterSaveHref="/settings" />
    </div>
  )
}
