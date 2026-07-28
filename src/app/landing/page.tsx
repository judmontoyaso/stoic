import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import LeadForm from '@/components/LeadForm'
import PublicPageView from '@/components/PublicPageView'
import PricingSection from '@/components/landing/PricingSection'
import FAQAccordion, { FAQS } from '@/components/landing/FAQAccordion'
import { Sparkles, MessageSquare, Shield, Zap, Award, BookOpen, Brain, Users, ArrowRight } from 'lucide-react'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const TITLE = 'StoiCom · 90 Días de Entrenamiento Estoico de Comunicación y Liderazgo'
const DESCRIPTION =
  'El programa guiado de 90 días que entrena cómo hablas con los demás y contigo mismo. Un ejercicio diario, filosofía estoica aplicada de Marco Aurelio y Séneca. Primeros 7 días gratis por correo.'

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'comunicación estoica',
    'desarrollo personal',
    'inteligencia emocional',
    'entrenamiento de oratoria',
    'conversaciones difíciles',
    'diario estoico',
    'Marco Aurelio',
    'Séneca',
    'Epicteto',
    'hablar en público',
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
      description: 'Plataforma de entrenamiento estoico de comunicación y diálogo interno.',
    },
    {
      '@type': 'WebSite',
      name: 'StoiCom',
      url: 'https://stoicom.app/landing',
      inLanguage: 'es',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'StoiCom App',
      operatingSystem: 'All (Web / PWA)',
      applicationCategory: 'EducationalApplication',
      offers: {
        '@type': 'Offer',
        price: '4.99',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'Course',
      name: 'Programa Estoico de 90 Días de Comunicación',
      description:
        'Programa guiado de 90 días con 180 ejercicios prácticos divididos en 3 fases: Percepción, Acción y Voluntad.',
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
    <p className={`${cinzel.className} text-[11px] tracking-[0.35em] uppercase text-[#c9a84c]`}>
      {children}
    </p>
  )
}

export default function LandingPage() {
  return (
    <div className={`${cinzel.variable} min-h-screen w-full bg-[#0a0a0f] text-slate-300 antialiased selection:bg-[#c9a84c]/30 selection:text-white`}>
      {/* JSON-LD Schemas para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <PublicPageView name="landing_view" />

      {/* Header Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-slate-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sculpture.png"
              alt="Escultura Estoica"
              className="w-9 h-9 rounded-full object-cover border border-[#c9a84c]/40 shadow-sm"
            />
            <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100 font-bold`}>
              STOI<span style={{ color: GOLD }}>COM</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#precios"
              className="hidden sm:inline-block text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[11px] font-bold tracking-widest text-[#c9a84c] uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Programa Guiado de 90 Días
        </div>

        <Eyebrow>Filosofía Estoica Aplicada a la Vida Real</Eyebrow>

        <h1 className={`${cinzel.className} mt-6 text-4xl md:text-6xl font-bold leading-[1.15] text-slate-100`}>
          Entrena cómo hablas.
          <br />
          <span style={{ color: GOLD }}>Con los demás y contigo.</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-slate-400">
          Un ejercicio práctico cada día para dejar de sonar dubitativo, dominar las conversaciones difíciles y cultivar claridad mental. Sin frases clichés: percepción, acción y voluntad entrenadas contra el reloj de un día real.
        </p>

        {/* Lead Capture Box */}
        <div className="mt-10 max-w-md mx-auto bg-[#111118] p-6 rounded-xl border border-[#c9a84c]/20 shadow-xl">
          <p className="mb-4 text-sm font-bold text-slate-200">
            Empieza hoy gratis: los primeros 7 días en tu correo
          </p>
          <LeadForm source="landing-hero" />
          <p className="mt-4 text-xs text-slate-500">
            Sin tarjeta de crédito. ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="underline hover:text-slate-300 transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </section>

      {/* 2 Tracks Principales */}
      <section className="border-t border-[#c9a84c]/15 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3">
            <Eyebrow>Doble Entrenamiento</Eyebrow>
            <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
              Dos Tracks Complementarios
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              La comunicación externa es solo el reflejo de tu diálogo interno. StoiCom entrena ambas dimensiones simultáneamente.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {/* Track 1 */}
            <div className="rounded-xl border border-slate-800 bg-[#111116] p-8 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className={`${cinzel.className} text-xl text-slate-100 font-bold`}>
                1. Comunicación Interpersonal
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Aprende a pausar la primera reacción impulsiva, articular respuestas claras bajo presión, escuchar sin interrumpir y comunicar límites firmes con serenidad.
              </p>
              <ul className="pt-2 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                  Auditoría de lenguaje verbal y corporal
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                  Gestión de desacuerdos sin reactividad
                </li>
              </ul>
            </div>

            {/* Track 2 */}
            <div className="rounded-xl border border-slate-800 bg-[#111116] p-8 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className={`${cinzel.className} text-xl text-slate-100 font-bold`}>
                2. Maestría Interna & Diario
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                El examen nocturno de Séneca. Evalúa objetivamente tus decisiones del día, elimina el autojuicio destructivo y fortalece tu voluntad con disciplinas de sobriedad mental.
              </p>
              <ul className="pt-2 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                  Plantillas de journaling matutino y nocturno
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                  Registro de estado de ánimo y claridad
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demostración de un día real del programa */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Eyebrow>Metodología Diaria</Eyebrow>
          <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100 font-bold leading-snug`}>
            El programa no se lee.
            <br />
            Se ejecuta.
          </h2>
          <ul className="mt-8 space-y-6">
            <li className="flex gap-4">
              <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right font-bold`} style={{ color: GOLD }}>
                6:00
              </span>
              <p className="text-sm leading-relaxed text-slate-400">
                Llega tu correo matutino con el ejercicio del día y una lección completa escrita para ese momento exacto de tu proceso.
              </p>
            </li>
            <li className="flex gap-4">
              <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right font-bold`} style={{ color: GOLD }}>
                El día
              </span>
              <p className="text-sm leading-relaxed text-slate-400">
                Ejecutas la práctica en la vida real. Lo marcas en la app. Si fallas un día, queda registrado: el calendario es transparente y honesto.
              </p>
            </li>
            <li className="flex gap-4">
              <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right font-bold`} style={{ color: GOLD }}>
                20:00
              </span>
              <p className="text-sm leading-relaxed text-slate-400">
                El examen nocturno estoico: 3 preguntas esenciales por escrito para cerrar el día con serenidad y aprendizaje.
              </p>
            </li>
          </ul>
        </div>

        {/* Tarjeta de Ejemplo de Ejercicio Real */}
        <div className="relative">
          <div className="rounded-xl border border-[#c9a84c]/30 bg-[#111116] p-7 shadow-[0_20px_60px_-20px_rgba(201,168,76,0.15)] space-y-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
                Comunicación · Día 12
              </p>
              <p className="text-[10px] tracking-wider uppercase text-slate-500">Módulo Percepción</p>
            </div>
            <h3 className={`${cinzel.className} text-xl text-slate-100 font-bold`}>
              Auditoría de la Primera Reacción
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Hoy, en cada conversación tensa, no respondas a la primera frase que se te pase por la cabeza. Toma 3 segundos de silencio deliberado. Anota en la noche: ¿cuántas de tus reacciones iniciales habrían sido impulsivas?
            </p>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs leading-relaxed text-slate-500 italic">
                <span className="not-italic font-bold" style={{ color: GOLD }}>Fundamento estoico: </span>
                Epicteto señala que entre el estímulo y tu respuesta hay un espacio. Ese espacio es tu libertad de juicio.
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-600">
            Ejercicio real del programa — hay 180 prácticas como esta.
          </p>
        </div>
      </section>

      {/* Las tres fases */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3">
            <Eyebrow>Progreso Estructurado</Eyebrow>
            <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
              Las Tres Fases del Entrenamiento
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                numeral: 'I',
                title: 'Percepción (Días 1–30)',
                body: 'Aprender a ver los eventos y las palabras de los demás tal como son, filtrando la carga emocional inmediata. Entrenar el juicio imparcial.',
              },
              {
                numeral: 'II',
                title: 'Acción (Días 31–60)',
                body: 'Comunicación en el mundo real. Ejercicios de asertividad, silencios estratégicos, tono vocal y sostenimiento de conversaciones complejas.',
              },
              {
                numeral: 'III',
                title: 'Voluntad (Días 61–90)',
                body: 'Sostener el estándar estoico cuando las circunstancias no acompañan. Consolidación de carácter, hábito y maestría emocional.',
              },
            ].map((f) => (
              <div key={f.numeral} className="rounded-xl border border-slate-800 bg-[#111116] p-6 space-y-3">
                <span className={`${cinzel.className} text-3xl font-bold`} style={{ color: GOLD }}>
                  {f.numeral}
                </span>
                <h3 className={`${cinzel.className} text-lg text-slate-100 font-bold`}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabla Comparativa de Valor */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-3 mb-12">
          <Eyebrow>Por qué es diferente</Eyebrow>
          <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
            StoiCom vs. Métodos Tradicionales
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 font-bold">Característica</th>
                <th className="py-4 px-4 font-bold text-[#c9a84c]">StoiCom</th>
                <th className="py-4 px-4 font-bold text-slate-500">Curso de Oratoria ($150+)</th>
                <th className="py-4 px-4 font-bold text-slate-500">Libros de Autoayuda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-200">Práctica Diaria Guiada</td>
                <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ 90 días seguidos</td>
                <td className="py-4 px-4 text-slate-500">Solo teoría en video</td>
                <td className="py-4 px-4 text-slate-500">Pasivo (solo lectura)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-200">Filosofía Estoica Aplicada</td>
                <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ Marco Aurelio / Séneca</td>
                <td className="py-4 px-4 text-slate-500">No aplica</td>
                <td className="py-4 px-4 text-slate-500">Teórico sin plan</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-200">Diario & Coaching IA</td>
                <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ Integrado en la app</td>
                <td className="py-4 px-4 text-slate-500">Sin seguimiento</td>
                <td className="py-4 px-4 text-slate-500">No existe</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-200">Formato de Acceso</td>
                <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ Web + PWA Móvil</td>
                <td className="py-4 px-4 text-slate-500">Plataforma de video</td>
                <td className="py-4 px-4 text-slate-500">Físico / PDF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección de Precios (Lemon Squeezy Integration Ready) */}
      <section id="precios" className="border-t border-[#c9a84c]/15 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <PricingSection />
        </div>
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-3 mb-12">
          <Eyebrow>Resolviendo tus dudas</Eyebrow>
          <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
            Preguntas Frecuentes
          </h2>
        </div>
        <FAQAccordion />
      </section>

      {/* Cita Estoica Final */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className={`${cinzel.className} text-xl md:text-2xl leading-relaxed text-slate-200 italic`}>
            &ldquo;Tenemos dos oídos y una sola boca para escuchar el doble de lo que hablamos.&rdquo;
          </p>
          <p className="text-xs tracking-[0.3em] uppercase font-bold" style={{ color: GOLD }}>
            Zenón de Citio · Fundador del Estoicismo
          </p>
        </div>
      </section>

      {/* Footer SEO & Legales */}
      <footer className="border-t border-slate-900 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sculpture.png" alt="" className="w-6 h-6 rounded-full border border-[#c9a84c]/40" />
              <span className={`${cinzel.className} text-sm tracking-[0.2em] text-slate-100 font-bold`}>
                STOI<span style={{ color: GOLD }}>COM</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Programa de 90 días de entrenamiento estoico de comunicación y diálogo interno.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <Link href="/becas" className="hover:text-slate-200 transition-colors">
              Becas
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors">
              Privacidad
            </Link>
            <Link href="/reembolsos" className="hover:text-slate-200 transition-colors">
              Garantía & Reembolsos
            </Link>
          </div>
        </div>
        <div className="py-4 border-t border-slate-950 text-center">
          <p className={`${cinzel.className} text-[10px] tracking-[0.35em] uppercase text-slate-600`}>
            Memento Mori · Carpe Diem
          </p>
        </div>
      </footer>
    </div>
  )
}
