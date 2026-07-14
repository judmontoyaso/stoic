'use client'

import PreferencesForm from '@/components/PreferencesForm'

// Bienvenida tras aprobar el código de acceso: iniciar track(s) y
// configurar zona horaria y hora de los correos, todo en una pantalla.

export default function WelcomePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-3">
        <img
          src="/sculpture.png"
          alt="Escultura Estoica"
          className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-[var(--primary-gold)]/40"
        />
        <h1 className="text-2xl font-black tracking-wider text-[var(--foreground)]">
          Bienvenido a Stoi<span className="text-[var(--primary-gold)]">Com</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed max-w-md mx-auto">
          90 días de entrenamiento estoico, un ejercicio al día. Configura tu
          programa: esto toma menos de un minuto y puedes cambiarlo después
          en Preferencias.
        </p>
      </div>

      <PreferencesForm
        showTracks
        afterSaveHref="/"
        submitLabel="Comenzar mi entrenamiento"
      />
    </div>
  )
}
