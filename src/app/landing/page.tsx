import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import LeadForm from '@/components/LeadForm'
import PublicPageView from '@/components/PublicPageView'
import PricingSection from '@/components/landing/PricingSection'
import FAQAccordion from '@/components/landing/FAQAccordion'
import { FAQS } from '@/data/faqs'
import { Sparkles, MessageSquare, Shield, Zap, BookOpen, Brain, Smartphone, CalendarCheck, CheckCircle2, Bot, Layers } from 'lucide-react'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const TITLE = 'StoiCom · Entrenamiento Estoico de Comunicación, Alto Rendimiento e IA'
const DESCRIPTION =
  'El sistema de 210 ejercicios prácticos (3 Tracks) que fusiona la Filosofía Estoica con la Psicología de Alto Rendimiento, PNL y Coaching con IA. Entrena cómo hablas con los demás y contigo mismo.'

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
              href="#metodologia"
              className="hidden md:inline-block text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Metodología
            </a>
            <a
              href="#tracks"
              className="hidden md:inline-block text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Los 3 Tracks
            </a>
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[11px] font-bold tracking-widest text-[#c9a84c] uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" /> 3 Tracks · 210 Prácticas · PNL Estoica & IA
        </div>

        <Eyebrow>Filosofía Estoica + Psicología de Alto Rendimiento</Eyebrow>

        <h1 className={`${cinzel.className} mt-6 text-4xl md:text-6xl font-bold leading-[1.15] text-slate-100`}>
          Entrena cómo hablas.
          <br />
          <span style={{ color: GOLD }}>Con los demás y contigo.</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-slate-400">
          Un sistema práctico que fusiona la sabiduría estoica de Séneca y Marco Aurelio con psicología de alto rendimiento (PNL, Tríada Emocional y Marcos) y coaching con IA. Domina las conversaciones difíciles, el diálogo interno y la templanza bajo presión.
        </p>

        {/* Features Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-400">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a84c]" /> 210 Ejercicios Diarios
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-[#c9a84c]" /> Evaluación con IA
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#c9a84c]" /> App PWA Offline
          </span>
        </div>

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

      {/* Sección La Fusión Científica: Estoicismo + PNL / Alto Rendimiento */}
      <section id="metodologia" className="border-t border-[#c9a84c]/15 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3">
            <Eyebrow>Bases Fundamentales</Eyebrow>
            <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
              La Fusión Estoica de Alto Rendimiento
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              No es filosofía teórica ni autoayuda blanda. StoiCom combina 2 pilares de transformación visceral de conducta.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-slate-800 bg-[#111116] p-8 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className={`${cinzel.className} text-xl text-slate-100 font-bold`}>
                1. Filosofía Estoica Clásica
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Basado en Epicteto, Marco Aurelio y Séneca. Dicotomía del control, examen nocturno de conciencia, amor fati y moderación verbal. Aprende a ver la realidad sin el filtro del juicio automático.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#111116] p-8 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className={`${cinzel.className} text-xl text-slate-100 font-bold`}>
                2. Psicología de Alto Rendimiento & PNL
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Inspirado en los desarrollos de Tony Robbins. Aplica la <em>Tríada Emocional</em> (fisiología, foco y lenguaje), <em>Condicionamiento Neuro-Asociativo (NAC)</em>, <em>Vocabulario Transformacional</em> y <em>Anclajes de Estado</em> a demanda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Los 3 Tracks Guiados (210 Ejercicios Únicos) */}
      <section id="tracks" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-3 mb-12">
          <Eyebrow>Currículum Completo</Eyebrow>
          <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
            Tres Tracks Guiados (210 Prácticas)
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Cada día entrega un ejercicio único con su explicación técnica de por qué funciona y cómo aplicarlo en el mundo real.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Track 1 */}
          <div className="rounded-xl border border-slate-800 bg-[#0d0d13] p-6 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#c9a84c]/10 text-[#c9a84c] uppercase">90 Días</span>
              <MessageSquare className="w-5 h-5 text-[#c9a84c]" />
            </div>
            <h3 className={`${cinzel.className} text-lg text-slate-100 font-bold`}>
              Comunicación Interpersonal
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Desarrolla templanza y firmeza en conversaciones de tensión. Pausas de 3 segundos, lenguaje no verbal, escucha profunda y establecimiento de límites sin agresión.
            </p>
          </div>

          {/* Track 2 */}
          <div className="rounded-xl border border-slate-800 bg-[#0d0d13] p-6 space-y-4 hover:border-[#c9a84c]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#c9a84c]/10 text-[#c9a84c] uppercase">90 Días</span>
              <Brain className="w-5 h-5 text-[#c9a84c]" />
            </div>
            <h3 className={`${cinzel.className} text-lg text-slate-100 font-bold`}>
              Maestría Interna & Diario
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Domina tu diálogo interno. El examen nocturno de Séneca con 3 preguntas por escrito, gestión de estados de ánimo, gráfico de serenidad y erradicación del autojuicio.
            </p>
          </div>

          {/* Track 3 */}
          <div className="rounded-xl border border-[#c9a84c]/40 bg-[#111118] p-6 space-y-4 shadow-[0_4px_25px_-5px_rgba(201,168,76,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#c9a84c] text-[#0a0a0f] uppercase">30 Días · Avanzado</span>
              <Zap className="w-5 h-5 text-[#c9a84c]" />
            </div>
            <h3 className={`${cinzel.className} text-lg text-slate-100 font-bold`}>
              Influencia & Liderazgo
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Temporada avanzada para graduados. Anclajes emocionales a demanda, redefinición de marcos en conversaciones complejas, lectura de metaprogramas y rapport no verbal.
            </p>
          </div>
        </div>
      </section>

      {/* Evaluación e Inteligencia Artificial */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Eyebrow>Tecnología & IA</Eyebrow>
            <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold leading-snug`}>
              Evaluación Diagnóstica y Coaching con IA
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              StoiCom no es estático. Cuenta con un motor de Inteligencia Artificial (impulsado por DeepSeek) que analiza tu punto de partida en comunicación estoica y te acompaña en el proceso:
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span><strong>Evaluación Inicial:</strong> Matriz de diagnóstico que mide tus fortalezas y sesgos emocionales al hablar.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span><strong>Análisis del Diario:</strong> Retroalimentación personalizada sobre tus reflexiones nocturnas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <span><strong>Lectura Adaptativa:</strong> Generación de insights adaptados a tus avances y dificultades reales.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#111116] p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Bot className="w-5 h-5 text-[#c9a84c]" />
              <span className="text-xs font-bold text-slate-200">Asistente Estoico IA</span>
            </div>
            <div className="text-xs leading-relaxed text-slate-400 space-y-3">
              <p className="p-3 rounded bg-slate-900/60 border border-slate-800 text-slate-300">
                &ldquo;En tu examen de anoche noté que la prisa en la reunión afectó tu filtro verbal. Aplica la técnica de la Tríada: ajusta tu postura antes de hablar hoy.&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 text-right">
                Insight generado en tiempo real según tu entrada de diario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plataforma PWA & Funcionalidades Completas */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-3 mb-12">
          <Eyebrow>Herramientas de la App</Eyebrow>
          <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
            Todo lo que incluye la Plataforma
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Layers className="w-5 h-5 text-[#c9a84c]" />,
              title: '13 Retos Semanales',
              body: 'Desafíos de campo cada 7 días con entregables concretos para llevar la práctica al mundo real.',
            },
            {
              icon: <CheckCircle2 className="w-5 h-5 text-[#c9a84c]" />,
              title: 'Tracker de Hábitos Estoicos',
              body: 'Monitoreo diario de hábitos clave: duchas frías, silencio consciente, ayuno de quejas.',
            },
            {
              icon: <Smartphone className="w-5 h-5 text-[#c9a84c]" />,
              title: 'PWA Multi-dispositivo',
              body: 'Instálala en iPhone, Android o PC. Funciona de manera fluida como una app nativa.',
            },
            {
              icon: <CalendarCheck className="w-5 h-5 text-[#c9a84c]" />,
              title: 'Calendario Honesto',
              body: 'Seguimiento de racha y días perdidos sin trampas. El calendario no miente para consolarte.',
            },
            {
              icon: <Sparkles className="w-5 h-5 text-[#c9a84c]" />,
              title: 'Horario Personalizado',
              body: 'Correos matutinos y notificaciones push a la hora exacta que elijas y en tu zona horaria.',
            },
            {
              icon: <Shield className="w-5 h-5 text-[#c9a84c]" />,
              title: 'Gráfico de Estados de Ánimo',
              body: 'Registra y analiza tu nivel de claridad y calma a lo largo de las 12 semanas del programa.',
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-[#0d0d13] p-6 space-y-3">
              <div>{item.icon}</div>
              <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabla Comparativa de Valor */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3 mb-12">
            <Eyebrow>Por qué es superior</Eyebrow>
            <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
              StoiCom vs. Métodos Tradicionales
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 font-bold">Funcionalidad</th>
                  <th className="py-4 px-4 font-bold text-[#c9a84c]">StoiCom App</th>
                  <th className="py-4 px-4 font-bold text-slate-500">Curso de Oratoria ($150+)</th>
                  <th className="py-4 px-4 font-bold text-slate-500">Libros de Filosofía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                <tr>
                  <td className="py-4 px-4 font-semibold text-slate-200">Práctica Diaria Guiada</td>
                  <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ 210 días (3 Tracks)</td>
                  <td className="py-4 px-4 text-slate-500">Teoría en video pasivo</td>
                  <td className="py-4 px-4 text-slate-500">Solo lectura</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-slate-200">Estoicismo + PNL / Alto Rendimiento</td>
                  <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ Fusión integrada</td>
                  <td className="py-4 px-4 text-slate-500">No aplica</td>
                  <td className="py-4 px-4 text-slate-500">Teórico sin método</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-slate-200">Evaluación & Insights con IA</td>
                  <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ IA DeepSeek en vivo</td>
                  <td className="py-4 px-4 text-slate-500">Sin seguimiento</td>
                  <td className="py-4 px-4 text-slate-500">No existe</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-slate-200">Examen Nocturno & Mood Chart</td>
                  <td className="py-4 px-4 text-[#c9a84c] font-bold">✓ Diario de Séneca</td>
                  <td className="py-4 px-4 text-slate-500">No incluye</td>
                  <td className="py-4 px-4 text-slate-500">Manual en libreta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sección de Precios (Lemon Squeezy Integration Ready) */}
      <section id="precios" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <PricingSection />
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3 mb-12">
            <Eyebrow>Resolviendo tus dudas</Eyebrow>
            <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100 font-bold`}>
              Preguntas Frecuentes
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* Cita Estoica Final */}
      <section className="py-16 text-center px-6">
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
              Sistema de 210 días de entrenamiento estoico de comunicación, PNL e Inteligencia Artificial.
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
