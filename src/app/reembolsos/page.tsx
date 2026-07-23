import Link from 'next/link'

export const metadata = {
  title: 'Política de Reembolsos · StoiCom',
}

// Página pública (listada en el proxy): visible sin sesión.

const UPDATED = '23 de julio de 2026'

export default function ReembolsosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
      <div>
        <h1 className="text-2xl font-black tracking-wide">Política de Reembolsos</h1>
        <p className="text-xs text-slate-500 mt-1">Última actualización: {UPDATED}</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-bold text-base">1. Garantía de satisfacción de 7 días</h2>
        <p>
          El acceso de fundador es un pago único. Antes de comprar puedes probar
          gratis los primeros 7 días del programa por correo, así que sabes bien
          qué estás adquiriendo. Aun así, si dentro de los <strong>7 días
          calendario</strong> siguientes a tu compra sientes que no es para ti,
          escríbenos y te devolvemos el <strong>100%</strong>, sin interrogatorios.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">2. Derecho de retracto</h2>
        <p>
          Si compras desde Colombia, la Ley 1480 de 2011 (Estatuto del Consumidor)
          reconoce el derecho de retracto dentro de los <strong>5 días hábiles</strong>
          siguientes a la compra en ventas a distancia. Ten en cuenta que, al
          tratarse de contenido digital de acceso inmediato, al completar la compra
          y acceder al programa autorizas su entrega inmediata. Nuestra garantía de
          satisfacción de 7 días (punto 1) es más amplia que ese plazo legal y la
          aplicamos por igual a todos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">3. Cómo pedir tu reembolso</h2>
        <p>
          Escríbenos a <strong>hola@stoicom.app</strong> (o responde a cualquiera
          de nuestros correos) desde la misma dirección con la que te registraste,
          indicando que quieres el reembolso. No necesitas dar explicaciones. Te
          confirmamos por correo en cuanto lo procesemos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">4. Cómo se procesa</h2>
        <p>
          El reembolso se hace a través de la misma pasarela y al mismo medio de
          pago con el que compraste (Mercado Pago u otra). El tiempo en que se
          refleja el dinero depende de tu banco o medio de pago, normalmente entre
          unos días y un par de semanas. Al reembolsar, tu acceso de fundador se
          desactiva.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">5. Después del periodo de garantía</h2>
        <p>
          Pasados los 7 días, y salvo lo que exija la ley aplicable, el pago del
          acceso de fundador no es reembolsable, ya que se trata de acceso de por
          vida a contenido digital ya entregado. Si tienes un problema técnico que
          te impide usar el programa, escríbenos: preferimos resolverlo antes que
          dejarte sin lo que pagaste.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold text-base">6. Contacto</h2>
        <p>
          Cualquier duda sobre reembolsos: <strong>hola@stoicom.app</strong>.
        </p>
      </section>

      <div className="pt-4 border-t border-[var(--border-color)] flex gap-4 text-xs">
        <Link href="/terms" className="text-[var(--primary-gold)] hover:underline">Términos de Servicio</Link>
        <Link href="/privacy" className="text-[var(--primary-gold)] hover:underline">Política de Privacidad</Link>
        <Link href="/landing" className="text-slate-500 hover:underline">Volver al inicio</Link>
      </div>
    </div>
  )
}
