import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidad · StoiCom',
}

// Página pública (listada en el proxy): visible sin sesión.

const UPDATED = '14 de julio de 2026'

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
      <div>
        <h1 className="text-2xl font-black tracking-wide">Política de Privacidad</h1>
        <p className="text-xs text-slate-500 mt-1">Última actualización: {UPDATED}</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-bold text-base">1. Qué datos guardamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="font-semibold">Cuenta:</span> tu correo y nombre de tu cuenta de Google (no vemos tu contraseña).</li>
          <li><span className="font-semibold">Progreso:</span> qué días del programa completas, retos y fechas de inicio.</li>
          <li><span className="font-semibold">Diario:</span> las entradas que escribes, incluido tu estado de ánimo si lo registras.</li>
          <li><span className="font-semibold">Preferencias:</span> zona horaria, horarios de correo y suscripciones de notificaciones push.</li>
          <li><span className="font-semibold">Uso:</span> eventos básicos de producto (p. ej. &ldquo;completó un día&rdquo;, &ldquo;guardó una entrada&rdquo;) para mejorar la aplicación. Sin rastreadores de terceros ni publicidad.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">2. Para qué los usamos</h2>
        <p>
          Exclusivamente para prestarte el servicio: mostrar tu progreso, enviarte
          tus correos y notificaciones diarias, y generar tu contenido personalizado.
          Las lecciones y evaluaciones con inteligencia artificial se generan
          enviando el texto necesario a un proveedor de IA (DeepSeek); tus entradas
          de diario solo se procesan con este fin y no se usan para entrenar modelos
          por nuestra parte. No vendemos ni compartimos tus datos con anunciantes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">3. Dónde viven tus datos</h2>
        <p>
          Usamos proveedores de infraestructura estándar: Supabase (base de datos y
          autenticación), Vercel (alojamiento) y Resend (envío de correo). Cada uno
          procesa solo lo necesario para su función. Tus datos de progreso y diario
          están protegidos por aislamiento por usuario (Row Level Security): ninguna
          otra cuenta puede leerlos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">4. Tus derechos</h2>
        <p>
          Conforme a la Ley 1581 de 2012 (Colombia) y, si aplica, el RGPD europeo,
          puedes solicitar acceso, corrección o eliminación de tus datos en cualquier
          momento. Borrar tu cuenta elimina en cascada tu progreso, diario,
          preferencias y suscripciones. Escríbenos al correo desde el que recibes las
          notificaciones del servicio y respondemos en un máximo de 15 días hábiles.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">5. Cookies</h2>
        <p>
          Solo usamos las cookies estrictamente necesarias para mantener tu sesión
          iniciada. No hay cookies de publicidad ni de seguimiento de terceros.
        </p>
      </section>

      <div className="pt-4 border-t border-[var(--border-color)] flex gap-4 text-xs">
        <Link href="/terms" className="text-[var(--primary-gold)] hover:underline">Términos de Servicio</Link>
        <Link href="/login" className="text-slate-500 hover:underline">Volver al inicio</Link>
      </div>
    </div>
  )
}
