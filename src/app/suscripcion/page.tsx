import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import UnsubscribeButton from '@/components/UnsubscribeButton'

// Página pública de la secuencia de captación: confirmación de correo
// y baja. Todos los estados caen aquí para no dejar al visitante en un
// JSON. Misma estética oscura de la landing.

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const GOLD = '#c9a84c'

export const metadata = {
  title: 'Tu suscripción · StoiCom',
  robots: { index: false },
}

type Estado = 'confirmado' | 'baja-confirmar' | 'baja' | 'error'

const COPY: Record<Estado, { heading: string; body: string }> = {
  confirmado: {
    heading: 'Correo confirmado',
    body: 'El día 1 va en camino a tu buzón; los seis siguientes llegan uno por día. Empieza hoy mismo con el ejercicio: el programa se ejecuta, no se lee.',
  },
  'baja-confirmar': {
    heading: '¿Cancelar los correos?',
    body: 'Confirma abajo y dejas de recibir la secuencia de siete días. No se borra nada más, y puedes volver a suscribirte cuando quieras.',
  },
  baja: {
    heading: 'Ya no estás en la lista',
    body: 'Ese correo se dio de baja antes. No recibirás más mensajes de la secuencia.',
  },
  error: {
    heading: 'Este enlace ya no sirve',
    body: 'Puede que haya caducado o que se haya copiado incompleto. Vuelve a pedir los siete días desde la página principal.',
  },
}

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; token?: string }>
}) {
  const params = await searchParams
  const estado: Estado = (['confirmado', 'baja-confirmar', 'baja', 'error'] as const).includes(
    params.estado as Estado
  )
    ? (params.estado as Estado)
    : 'error'
  const copy = COPY[estado]
  const token = typeof params.token === 'string' ? params.token : ''

  return (
    <div
      className={`${cinzel.variable} flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0f] px-6 py-16 text-slate-300`}
    >
      <Link href="/landing" className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sculpture.png"
          alt=""
          className="h-9 w-9 rounded-full border border-[#c9a84c]/40 object-cover"
        />
        <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100`}>
          STOI<span style={{ color: GOLD }}>COM</span>
        </span>
      </Link>

      <div className="mt-12 w-full max-w-md rounded-lg border border-[#c9a84c]/20 bg-[#111116] p-8 text-center">
        <h1 className={`${cinzel.className} text-2xl leading-snug text-slate-100`}>
          {copy.heading}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{copy.body}</p>

        {estado === 'baja-confirmar' && token && <UnsubscribeButton token={token} />}

        {estado === 'error' && (
          <Link
            href="/landing"
            className="mt-6 inline-block rounded px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0f] transition-opacity hover:opacity-90"
            style={{ background: GOLD }}
          >
            Ir a la página principal
          </Link>
        )}
      </div>

      <p
        className={`${cinzel.className} mt-10 text-[10px] uppercase tracking-[0.35em] text-slate-600`}
      >
        Memento Mori · Carpe Diem
      </p>
    </div>
  )
}
