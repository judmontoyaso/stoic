import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import BecaForm from '@/components/BecaForm'
import PublicPageView from '@/components/PublicPageView'

// Convocatoria pública a las Becas Fundador StoiCom.
// No es un obsequio pasivo ni un gancho publicitario: es un pacto de mérito y disciplina
// para personas comprometidas con transformar su voz y su pensamiento.

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const GOLD = '#c9a84c'

const TITLE = 'Becas Fundador · StoiCom | Entrenamiento Estoico de Comunicación'
const DESCRIPTION =
  'Convocatoria a las 20 Becas Fundador: un año completo del programa de comunicación estoica, sin pagar nada. 210 prácticas diarias, 3 tracks y herramientas de templanza.'

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
    <div className={`${cinzel.variable} min-h-screen w-full bg-[#0a0a0f] text-slate-300 font-sans selection:bg-[#c9a84c]/30 selection:text-slate-100`}>
      <PublicPageView name="becas_view" />

      {/* Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/landing" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sculpture.png"
            alt="StoiCom"
            className="w-9 h-9 rounded-full object-cover border border-[#c9a84c]/40 group-hover:border-[#c9a84c] transition-colors"
          />
          <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100`}>
            STOI<span style={{ color: GOLD }}>COM</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-bold tracking-wider uppercase px-4 py-2 rounded border border-[#c9a84c]/40 text-slate-200 hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-all"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero & Manifesto Section */}
      <section className="max-w-3xl mx-auto px-6 pt-10 pb-20 md:pt-16">
        <div className="text-center space-y-4">
          <p
            className={`${cinzel.className} text-[11px] md:text-xs tracking-[0.35em] uppercase`}
            style={{ color: GOLD }}
          >
            20 becas fundador · un año completo
          </p>

          <h1
            className={`${cinzel.className} text-3xl sm:text-4xl md:text-5xl leading-[1.2] text-slate-100 font-normal`}
          >
            No se compra.
            <br className="hidden sm:inline" />
            <span style={{ color: GOLD }}> Se aplica.</span>
          </h1>
        </div>

        <div className="mt-8 space-y-6 text-slate-300 leading-relaxed text-base md:text-lg font-light">
          <p>
            Veinte personas entran gratis al programa completo. El mismo acceso que paga un
            fundador: 210 ejercicios diarios en tres tracks, el diario con el examen nocturno,
            los retos semanales y la temporada avanzada de Influencia. Un año entero, sin pagar
            nada.
          </p>

          <p>
            No pido dinero. Pido que lo ejecutes. El día 1 es grabarte tres minutos hablando y
            mirarlo dos veces: una escuchando, otra mirando. Vas a odiarlo. Ese es el punto —
            es el diagnóstico más honesto que existe, y el que nadie hace.
          </p>

          <div className="border-l-2 border-[#c9a84c]/60 pl-5 py-2 my-8 bg-[#111118]/60 rounded-r-xl">
            <p className="text-slate-300 text-sm md:text-base italic leading-relaxed">
              «Si te da pereza grabarte, esta beca no es para ti. Y no pasa nada: los primeros
              siete días siguen siendo gratis para todo el mundo.»
            </p>
          </div>
        </div>

        {/* Form Component */}
        <div className="mt-12">
          <BecaForm />
        </div>

        {/* Footer Navigation */}
        <div className="mt-14 text-center border-t border-slate-800/80 pt-8">
          <p className="text-xs md:text-sm text-slate-400">
            ¿Prefieres conocer el entrenamiento antes de postular?{' '}
            <Link href="/landing" className="underline hover:text-slate-200 font-medium transition-colors" style={{ color: GOLD }}>
              Explora los 7 días de lecciones gratuitas por correo
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

