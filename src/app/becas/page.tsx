import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import BecaForm from '@/components/BecaForm'

// Página pública de aplicación a las becas fundador. No regala acceso:
// se aplica y el admin decide. La aplicación filtra al curioso y protege
// el precio — no es autoservicio, es mérito.

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const GOLD = '#c9a84c'

const TITLE = 'Becas fundador · StoiCom'
const DESCRIPTION =
  '20 becas de acceso completo al programa de 90 días de entrenamiento estoico de comunicación. Se aplica, no se compra.'

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/becas' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/becas',
    siteName: 'StoiCom',
    locale: 'es_CO',
    type: 'website',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'StoiCom' }],
  },
  robots: { index: true, follow: true },
}

export default function BecasPage() {
  return (
    <div className={`${cinzel.variable} min-h-screen w-full bg-[#0a0a0f] text-slate-300`}>
      <header className="max-w-3xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/landing" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sculpture.png"
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-[#c9a84c]/40"
          />
          <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100`}>
            STOI<span style={{ color: GOLD }}>COM</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-bold tracking-wider uppercase px-4 py-2 rounded border border-[#c9a84c]/40 text-slate-200 hover:bg-[#c9a84c]/10 transition-colors"
        >
          Entrar
        </Link>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-20 md:pt-16">
        <p
          className={`${cinzel.className} text-[11px] tracking-[0.35em] uppercase text-center`}
          style={{ color: GOLD }}
        >
          20 becas · acceso de por vida
        </p>
        <h1
          className={`${cinzel.className} mt-6 text-3xl md:text-5xl leading-[1.15] text-slate-100 text-center`}
        >
          No se compra.
          <br />
          <span style={{ color: GOLD }}>Se aplica.</span>
        </h1>

        <div className="mt-8 max-w-xl mx-auto space-y-4 text-center text-slate-400 leading-relaxed">
          <p>
            Veinte personas entran gratis al programa completo: 90 días de entrenamiento
            diario de comunicación, la temporada avanzada, y acceso de por vida. Lo mismo
            que paga un fundador.
          </p>
          <p className="text-slate-500 text-sm">
            A cambio no pido dinero: pido que lo ejecutes. El día 1 es grabarte tres minutos
            hablando y mirarlo dos veces. Si eso ya te da pereza, esta beca no es para ti —
            y no pasa nada, los primeros 7 días siguen gratis para todos.
          </p>
        </div>

        <div className="mt-12">
          <BecaForm />
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500">
            ¿Prefieres probar antes?{' '}
            <Link href="/landing" className="underline hover:text-slate-300" style={{ color: GOLD }}>
              Los primeros 7 días, gratis por correo
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
