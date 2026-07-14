import Link from 'next/link'

export const metadata = {
  title: 'Términos de Servicio · StoiCom',
}

// Página pública (listada en el proxy): visible sin sesión.

const UPDATED = '14 de julio de 2026'

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
      <div>
        <h1 className="text-2xl font-black tracking-wide">Términos de Servicio</h1>
        <p className="text-xs text-slate-500 mt-1">Última actualización: {UPDATED}</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-bold text-base">1. El servicio</h2>
        <p>
          StoiCom es una aplicación de entrenamiento personal basada en filosofía
          estoica: un programa de 90 días con ejercicios diarios, diario personal,
          recordatorios por correo y notificaciones. El servicio se ofrece tal cual,
          como herramienta de desarrollo personal; no constituye asesoría psicológica,
          médica ni profesional de ningún tipo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">2. Tu cuenta</h2>
        <p>
          El acceso se hace con tu cuenta de Google y, durante la fase privada, un
          código de acceso. Eres responsable de mantener el control de tu cuenta de
          Google. Podemos suspender cuentas que abusen del servicio (automatización,
          intentos de acceso no autorizado, uso que degrade el servicio para otros).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">3. Tu contenido</h2>
        <p>
          Lo que escribes en tu diario y tus registros de progreso es tuyo. Nos
          otorgas únicamente el permiso técnico de almacenarlo y procesarlo para
          prestarte el servicio (por ejemplo, generar tu evaluación con IA o tus
          correos personalizados). Puedes borrar tus entradas en cualquier momento
          y solicitar la eliminación completa de tu cuenta y sus datos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">4. Contenido del programa</h2>
        <p>
          Los ejercicios, lecciones y textos del programa son contenido original de
          StoiCom. No puedes copiarlos, redistribuirlos ni revenderlos fuera de tu
          uso personal.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">5. Disponibilidad y cambios</h2>
        <p>
          El servicio está en desarrollo activo: pueden cambiar funciones, y aunque
          cuidamos la continuidad, no garantizamos disponibilidad ininterrumpida.
          Estos términos pueden actualizarse; los cambios relevantes se anunciarán
          dentro de la aplicación o por correo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">6. Contacto</h2>
        <p>
          Preguntas sobre estos términos: escríbenos al correo desde el que recibes
          las notificaciones del servicio.
        </p>
      </section>

      <div className="pt-4 border-t border-[var(--border-color)] flex gap-4 text-xs">
        <Link href="/privacy" className="text-[var(--primary-gold)] hover:underline">Política de Privacidad</Link>
        <Link href="/login" className="text-slate-500 hover:underline">Volver al inicio</Link>
      </div>
    </div>
  )
}
