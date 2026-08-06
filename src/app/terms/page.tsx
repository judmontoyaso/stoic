import Link from 'next/link'

export const metadata = {
  title: 'Términos de Servicio · StoiCom',
}

// Página pública (listada en el proxy): visible sin sesión.

const UPDATED = '6 de agosto de 2026'

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
        <p>
          Puedes descargar tu diario completo cuando quieras desde la aplicación,
          en formato legible o en JSON, sin costo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">4. Vigencia del acceso y borrado</h2>
        <p>
          El acceso completo es un <strong>pago único que da 12 meses</strong>. No
          es una suscripción: no se realizan cobros automáticos ni hay nada que
          cancelar. Te avisamos por correo cuatro veces antes de que venza.
        </p>
        <p>
          Al vencer, dispones de <strong>30 días calendario</strong> para renovar
          conservando todo tu progreso, o para descargar tu diario. Cumplido ese
          plazo eliminamos tu contenido personal —diario, reflexiones y registro de
          días— de forma <strong>definitiva e irreversible</strong>: no conservamos
          copia y un pago posterior no lo restaura. Conservamos tu cuenta y tu
          correo para que puedas volver a acceder, y los registros de pago por el
          tiempo que exija la normativa contable y tributaria.
        </p>
        <p>
          Si adquiriste el acceso cuando se anunciaba como vitalicio, ese acceso se
          respeta y no vence.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">5. Contenido del programa</h2>
        <p>
          Los ejercicios, lecciones y textos del programa son contenido original de
          StoiCom. No puedes copiarlos, redistribuirlos ni revenderlos fuera de tu
          uso personal.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">6. Disponibilidad y cambios</h2>
        <p>
          El servicio está en desarrollo activo: pueden cambiar funciones, y aunque
          cuidamos la continuidad, no garantizamos disponibilidad ininterrumpida.
          Estos términos pueden actualizarse; los cambios relevantes se anunciarán
          dentro de la aplicación o por correo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">7. Contacto</h2>
        <p>
          Preguntas sobre estos términos, tu cuenta o el servicio:{' '}
          <a href="mailto:ayuda@stoicom.app" className="font-bold underline">
            ayuda@stoicom.app
          </a>
          . También puedes responder a cualquiera de nuestros correos.
        </p>
      </section>

      <div className="pt-4 border-t border-[var(--border-color)] flex gap-4 text-xs">
        <Link href="/privacy" className="text-[var(--primary-gold)] hover:underline">Política de Privacidad</Link>
        <Link href="/login" className="text-slate-500 hover:underline">Volver al inicio</Link>
      </div>
    </div>
  )
}
