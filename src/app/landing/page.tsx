import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import LeadForm from '@/components/LeadForm'
import PublicPageView from '@/components/PublicPageView'
import PricingSection from '@/components/landing/PricingSection'
import FAQAccordion from '@/components/landing/FAQAccordion'
import { FAQS } from '@/data/faqs'
import { Sparkles, MessageSquare, Shield, Zap, BookOpen, Brain, Smartphone, CalendarCheck, CheckCircle2, Bot, Layers } from 'lucide-react'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const TITLE = 'StoiCom · 90 Días de Entrenamiento Estoico de Comunicación y Liderazgo'
const DESCRIPTION =
  'El programa de 90 días que entrena cómo hablas — con los demás y contigo mismo. Un ejercicio al día, filosofía estoica aplicada de Marco Aurelio y Séneca. Primeros 7 días gratis por correo.'

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'comunicación estoica',
    'psicología de alto rendimiento',
    'PNL estoica',
    'coaching con IA',
    'inteligencia emocional',
    'entrenamiento de oratoria',
    'conversaciones difíciles',
    'diario estoico',
    'Marco Aurelio',
    'Séneca',
    'Epicteto',
    'Tony Robbins frameworks',
    'liderazgo e influencia',
  ],
  alternates: { canonical: 'https://stoicom.app/landing' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://stoicom.app/landing',
    siteName: 'StoiCom',
    locale: 'es_CO',
    type: 'website',
    images: [{ url: 'https://stoicom.app/icon-512.png', width: 512, height: 512, alt: 'StoiCom App' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['https://stoicom.app/icon-512.png'],
  },
  robots: { index: true, follow: true },
}

// Datos estructurados SEO (JSON-LD)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'StoiCom',
      url: 'https://stoicom.app',
      logo: 'https://stoicom.app/icon-512.png',
      description: 'Sistema de entrenamiento estoico de comunicación, PNL y alto rendimiento.',
    },
    {
      '@type': 'WebSite',
      name: 'StoiCom',
      url: 'https://stoicom.app/landing',
      inLanguage: 'es',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'StoiCom App (PWA)',
      operatingSystem: 'iOS, Android, Windows, macOS',
      applicationCategory: 'EducationalApplication',
      offers: {
        '@type': 'Offer',
        price: '4.99',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'Course',
      name: 'Sistema Estoico de Comunicación, Maestría Interna e Influencia',
      description:
        'Programa completo con 3 Tracks (210 ejercicios prácticos): 1) Comunicación Interpersonal, 2) Maestría Interna & Diario, 3) Influencia & Liderazgo con PNL.',
      provider: { '@type': 'Organization', name: 'StoiCom', url: 'https://stoicom.app' },
      inLanguage: 'es',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT15M',
      },
      offers: [
        { '@type': 'Offer', category: 'Trial', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', category: 'Subscription', price: '29.99', priceCurrency: 'USD' },
        { '@type': 'Offer', category: 'Lifetime', price: '59', priceCurrency: 'USD' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
}

const GOLD = '#c9a84c'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={`${cinzel.className} text-[11px] tracking-[0.35em] uppercase`}
      style={{ color: GOLD }}
    >
      {children}
    </p>
  )
}

export default function LandingPage() {
  return (
    <div className={`${cinzel.variable} min-h-screen w-full bg-[#0a0a0f] text-slate-300`}>
      {/* JSON-LD Schemas para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicPageView name="landing_view" />

      {/* Header Nav */}
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sculpture.png"
            alt="StoiCom"
            className="w-9 h-9 rounded-full object-cover border border-[#c9a84c]/40"
          />
          <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100`}>
            STOI<span style={{ color: GOLD }}>COM</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#metodologia"
            className="hidden md:inline-block text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-slate-200 transition-colors"
          >
            Metodología
          </a>
          <a
            href="#tracks"
            className="hidden md:inline-block text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-slate-200 transition-colors"
          >
            Tracks
          </a>
          <a
            href="#precios"
            className="hidden sm:inline-block text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-slate-200 transition-colors"
          >
            Precios
          </a>
          <Link
            href="/login"
            className="text-xs font-bold tracking-wider uppercase px-4 py-2 rounded border border-[#c9a84c]/40 text-slate-200 hover:bg-[#c9a84c]/10 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-20 md:pt-24 md:pb-28 text-center">
        <Eyebrow>Programa Guiado · Filosofía Estoica & Alto Rendimiento</Eyebrow>

        <h1
          className={`${cinzel.className} mt-6 text-4xl md:text-6xl leading-[1.15] text-slate-100`}
        >
          Entrena cómo hablas.
          <br />
          <span style={{ color: GOLD }}>Con los demás y contigo.</span>
        </h1>

        <p className="mt-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed text-slate-400">
          Un ejercicio real cada día para dejar de sonar dubitativo, escuchar de verdad y sostener la conversación difícil. Sin frases de taza, sin atajos: percepción, acción y voluntad, entrenadas como los estoicos — por escrito y contra el reloj de un día real.
        </p>

        <div className="mt-10">
          <p className="mb-5 text-sm font-bold text-slate-200">
            Empieza gratis: los primeros 7 días del programa, en tu correo.
          </p>
          <LeadForm source="landing-hero" />
          <p className="mt-6 text-xs text-slate-500">
            ¿Ya tienes acceso?{' '}
            <Link href="/login" className="underline hover:text-slate-300 transition-colors">
              Entrar con Google
            </Link>
          </p>
        </div>
      </section>

      {/* Sección La Fusión Estoicismo + PNL / Alto Rendimiento */}
      <section id="metodologia" className="border-y border-[#c9a84c]/15 bg-[#0d0d13]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <Eyebrow>Fundamento Científico y Práctico</Eyebrow>
            <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100 leading-snug`}>
              Filosofía Estoica + Psicología de Alto Rendimiento
            </h2>
            <p className="mt-4 text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Unimos los principios antiguos de Marco Aurelio, Séneca y Epicteto con herramientas avanzadas de PNL y psicología moderna (Tríada Emocional, Condicionamiento Neuro-Asociativo NAC y Reencuadre de Marcos).
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="rounded-lg border border-slate-800 bg-[#111116] p-7 space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#c9a84c]" />
                <h3 className={`${cinzel.className} text-lg text-slate-100`}>
                  Estoicismo Clásico
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Dicotomía del control, examen nocturno de conciencia y serenidad ante la provocación. Ver los hechos como son, eliminando el juicio apresurado.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#111116] p-7 space-y-3">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-[#c9a84c]" />
                <h3 className={`${cinzel.className} text-lg text-slate-100`}>
                  Psicología de Alto Rendimiento
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Tríada emocional (fisiología, foco y lenguaje), vocabulario transformacional y anclaje de estado a demanda para actuar con aplomo bajo presión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Firma: un día real del programa */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Eyebrow>Así se ve un día</Eyebrow>
          <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100 leading-snug`}>
            El programa no se lee.
            <br />
            Se ejecuta.
          </h2>
          <ul className="mt-8 space-y-6">
            <li className="flex gap-4">
              <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right`} style={{ color: GOLD }}>
                6:00
              </span>
              <p className="text-sm leading-relaxed text-slate-400">
                Llega tu correo con el ejercicio del día y una lección completa
                escrita para ese día exacto de tu proceso. A la hora que tú fijes,
                en tu zona horaria.
              </p>
            </li>
            <li className="flex gap-4">
              <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right`} style={{ color: GOLD }}>
                El día
              </span>
              <p className="text-sm leading-relaxed text-slate-400">
                Ejecutas el ejercicio en tu vida real: una conversación, una
                auditoría de tu lenguaje, un silencio a tiempo. Lo marcas en la
                app. Los días perdidos se marcan — el calendario nunca se
                reorganiza para consolarte.
              </p>
            </li>
            <li className="flex gap-4">
              <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right`} style={{ color: GOLD }}>
                20:00
              </span>
              <p className="text-sm leading-relaxed text-slate-400">
                El examen nocturno de Séneca: tres preguntas, por escrito. El día
                se cierra en el diario, no en la cabeza.
              </p>
            </li>
          </ul>
        </div>

        {/* Carta del día: artefacto real */}
        <div className="relative">
          <div className="rounded-lg border border-[#c9a84c]/25 bg-[#111116] p-7 shadow-[0_20px_60px_-20px_rgba(201,168,76,0.15)]">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
                Comunicación · Día 12
              </p>
              <p className="text-[10px] tracking-wider uppercase text-slate-500">Percepción</p>
            </div>
            <h3 className={`${cinzel.className} mt-4 text-xl text-slate-100`}>
              Auditoría de la primera reacción
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Hoy, en cada conversación que te incomode, no respondas a la primera
              frase que se te forme. Anota (mentalmente o en el teléfono) qué fue
              lo primero que quisiste decir. En la noche revisa la lista: ¿cuántas
              de esas primeras reacciones eran juicio y cuántas eran información?
            </p>
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-xs leading-relaxed text-slate-500 italic">
                <span className="not-italic font-bold" style={{ color: GOLD }}>
                  Por qué funciona:{' '}
                </span>
                Epicteto separa lo que ocurre de tu opinión sobre lo que ocurre.
                La primera reacción casi siempre es la opinión. Verla escrita le
                quita el disfraz de &ldquo;verdad&rdquo;.
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-600">
            Ejercicio real del programa — hay 210 como este, uno por día y por track.
          </p>
        </div>
      </section>

      {/* Las tres fases: secuencia real del programa */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <Eyebrow>Tres fases de 30 días</Eyebrow>
            <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100`}>
              La disciplina estoica, en orden
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                numeral: 'I',
                title: 'Percepción',
                body: 'Días 1–30. Ver las conversaciones y tus pensamientos como son, no como los tiñe la primera emoción. Aquí se entrena el juicio.',
              },
              {
                numeral: 'II',
                title: 'Acción',
                body: 'Días 31–60. Hablar, callar, preguntar y sostener lo difícil — a propósito. Aquí el entrenamiento sale al mundo.',
              },
              {
                numeral: 'III',
                title: 'Voluntad',
                body: 'Días 61–90. Sostener el estándar cuando nadie aplaude y el ánimo no acompaña. Aquí se consolida el carácter.',
              },
            ].map((f) => (
              <div key={f.numeral} className="rounded-lg border border-slate-800 bg-[#111116] p-6">
                <span className={`${cinzel.className} text-3xl`} style={{ color: GOLD }}>
                  {f.numeral}
                </span>
                <h3 className={`${cinzel.className} mt-3 text-lg text-slate-100`}>{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Los 3 Tracks Guiados */}
      <section id="tracks" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center">
          <Eyebrow>Currículum Completo</Eyebrow>
          <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100`}>
            Tres Tracks Guiados
          </h2>
          <p className="mt-4 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            210 ejercicios en total. Dos programas base de 90 días y una temporada avanzada de 30 días.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-slate-800 bg-[#0d0d13] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#c9a84c]">90 Días</span>
              <MessageSquare className="w-4 h-4 text-[#c9a84c]" />
            </div>
            <h3 className={`${cinzel.className} text-lg text-slate-100`}>
              Comunicación Interpersonal
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Manejo de tensión en vivo, silencios estratégicos, tono de voz y establecimiento de límites sin reactividad.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#0d0d13] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#c9a84c]">90 Días</span>
              <Brain className="w-4 h-4 text-[#c9a84c]" />
            </div>
            <h3 className={`${cinzel.className} text-lg text-slate-100`}>
              Maestría Interna & Diario
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Diálogo interno, examen nocturno de Séneca, gráficos de estado de ánimo y autorregulación estoica.
            </p>
          </div>

          <div className="rounded-lg border border-[#c9a84c]/30 bg-[#111116] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#c9a84c]">30 Días · Avanzado</span>
              <Zap className="w-4 h-4 text-[#c9a84c]" />
            </div>
            <h3 className={`${cinzel.className} text-lg text-slate-100`}>
              Influencia & Liderazgo
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Temporada avanzada. Anclajes de estado a demanda, redefinición de marcos en vivo y metaprogramas.
            </p>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="border-y border-[#c9a84c]/15 bg-[#0d0d13]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center">
            <Eyebrow>Qué incluye la plataforma</Eyebrow>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl mx-auto">
            {[
              ['Tres tracks, un sistema', 'Comunicación con los demás, diálogo interno y la temporada avanzada Influencia (210 prácticas).'],
              ['Evaluación e IA (DeepSeek)', 'Diagnóstico continuo de competencias comunicativas y retroalimentación personalizada sobre tu diario.'],
              ['Lección diaria escrita', 'Cada día trae una lección completa de 400–550 palabras para ese punto exacto del proceso.'],
              ['Diario con examen nocturno', 'Plantillas de mañana y noche basadas en Séneca y Marco Aurelio, con registro de ánimo y su gráfico.'],
              ['Retos semanales y hábitos', '13 retos de campo cada 7 días más monitoreo de hábitos estoicos (duchas frías, ayuno de quejas).'],
              ['App PWA Multi-dispositivo', 'Instálala en iPhone, Android o PC. Notificaciones Push y correos en tu zona horaria exacta.'],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                <div>
                  <p className="text-sm font-bold text-slate-200">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Precios */}
      <section id="precios" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <PricingSection />
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <Eyebrow>Resolviendo tus dudas</Eyebrow>
            <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100`}>
              Preguntas Frecuentes
            </h2>
          </div>
          <div className="mt-10">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Cita */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <p className={`${cinzel.className} text-xl md:text-2xl leading-relaxed text-slate-200`}>
          &ldquo;Tenemos dos oídos y una boca para escuchar el doble de lo que hablamos.&rdquo;
        </p>
        <p className="mt-4 text-xs tracking-[0.3em] uppercase" style={{ color: GOLD }}>
          Zenón de Citio
        </p>
      </section>

      {/* CTA final */}
      <section className="border-t border-[#c9a84c]/15">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100`}>
            Noventa días. Un ejercicio al día.
          </h2>
          <p className="mt-4 mb-8 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Prueba los siete primeros sin pagar nada. Si para el día 7 el
            programa no te ha movido nada, te das de baja y ya está.
          </p>
          <LeadForm source="landing-footer" />
          <p className="mt-6 text-xs text-slate-500">
            ¿Ya tienes acceso?{' '}
            <Link href="/login" className="underline hover:text-slate-300 transition-colors">
              Entrar con Google
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`${cinzel.className} text-[10px] tracking-[0.35em] uppercase text-slate-600`}>
            Memento Mori · Carpe Diem
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/becas" className="hover:text-slate-300 transition-colors">Becas</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacidad</Link>
            <Link href="/reembolsos" className="hover:text-slate-300 transition-colors">Reembolsos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
