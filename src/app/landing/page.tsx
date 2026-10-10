import type { Metadata } from 'next'
import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import LeadForm from '@/components/LeadForm'
import PublicPageView from '@/components/PublicPageView'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import MethodologySection from '@/components/landing/MethodologySection'
import DailyFlowSection from '@/components/landing/DailyFlowSection'
import TracksCurriculumSection from '@/components/landing/TracksCurriculumSection'
import PlatformFeaturesSection from '@/components/landing/PlatformFeaturesSection'
import MementoSection from '@/components/landing/MementoSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQAccordion from '@/components/landing/FAQAccordion'
import MouseTrail from '@/components/landing/MouseTrail'
import { FAQS } from '@/data/faqs'
import { PROGRAM_PRICE } from '@/lib/pricing'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

const TITLE = 'StoiCom · Entrenamiento estoico de comunicación, un ejercicio al día'
const DESCRIPTION =
  '210 ejercicios diarios en 3 tracks: comunicación con los demás, diálogo interno e influencia. Estoicismo aplicado y frameworks de Robbins y Voss, con una lección escrita cada día. Primeros 7 días gratis por correo.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'comunicación estoica',
    'entrenamiento de comunicación',
    'hablar en público',
    'conversaciones difíciles',
    'escucha activa',
    'diario estoico',
    'examen nocturno de Séneca',
    'Marco Aurelio',
    'Epicteto',
    'anclaje de estado',
    'reencuadre',
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
      description: 'Entrenamiento diario de comunicación con estoicismo aplicado y frameworks de Robbins, Voss y Holiday.',
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
      offers: [
        { '@type': 'Offer', price: String(PROGRAM_PRICE.cop), priceCurrency: 'COP' },
        { '@type': 'Offer', price: String(PROGRAM_PRICE.usd), priceCurrency: 'USD' },
      ],
    },
    {
      '@type': 'Course',
      name: 'El Método StoiCom — Matrícula Anual de Comunicación, Maestría Interna e Influencia',
      description:
        'Matrícula anual con acceso completo por 1 año a 3 tracks (210 ejercicios prácticos): 1) Comunicación Interpersonal y Tensión, 2) Maestría Interna y Diario de Séneca, 3) Influencia y Liderazgo.',
      provider: { '@type': 'Organization', name: 'StoiCom', url: 'https://stoicom.app' },
      inLanguage: 'es',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT15M',
      },
      offers: [
        { '@type': 'Offer', category: 'Trial', price: '0', priceCurrency: 'COP' },
        { '@type': 'Offer', category: 'Annual', price: String(PROGRAM_PRICE.cop), priceCurrency: 'COP' },
        { '@type': 'Offer', category: 'Annual', price: String(PROGRAM_PRICE.usd), priceCurrency: 'USD' },
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
      <MouseTrail />

      {/* 1. Header Nav (Client Component: Sticky glassmorphic bar, sculpture, anchor links) */}
      <LandingNav cinzelClassName={cinzel.className} />

      {/* 2. Hero Section (Client Component: Staggered entrance, CSS ambient gold glows, LeadForm) */}
      <HeroSection cinzelClassName={cinzel.className}>
        <LeadForm source="landing-hero" />
      </HeroSection>

      {/* 3. Metodología (Client Component: 2 SpotlightCards, Lucide glow icons, id="metodologia") */}
      <MethodologySection cinzelClassName={cinzel.className} />

      {/* 4. Firma: un día real del programa (Client Component: Timeline interactivo & Artefacto real) */}
      <DailyFlowSection cinzelClassName={cinzel.className} />

      {/* 5 & 6. Las tres fases & Los 3 Tracks Guiados (Client Component: id="tracks", 210 ejercicios) */}
      <TracksCurriculumSection cinzelClassName={cinzel.className} />

      {/* 7 & 8. Medición honesta & Plataforma PWA (Client Component: Diagnóstico y App Toolkit) */}
      <PlatformFeaturesSection cinzelClassName={cinzel.className} />

      {/* 9. Sección de Precios (id="precios") */}
      <section id="precios" className="max-w-5xl mx-auto px-6 py-20 md:py-28 relative">
        <PricingSection />
      </section>

      {/* 10. Preguntas Frecuentes (FAQ) */}
      <section className="border-t border-slate-900 bg-[#0d0d13] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <Eyebrow>Resolviendo tus dudas</Eyebrow>
            <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100 font-semibold`}>
              Preguntas Frecuentes
            </h2>
          </div>
          <div className="mt-10">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* 11 & 12. Cita de Zenón & Memento Mori / Memento Vivere */}
      <MementoSection cinzelClassName={cinzel.className} />

      {/* 13. CTA final */}
      <section className="border-t border-[#c9a84c]/20 bg-[#09090d] relative overflow-hidden">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] rounded-full blur-[150px] opacity-15"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24 text-center relative z-10">
          <h2 className={`${cinzel.className} text-2xl md:text-4xl text-slate-100 font-semibold`}>
            Noventa días. Un ejercicio al día.
          </h2>
          <p className="mt-4 mb-8 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
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

      {/* 14. Footer */}
      <footer className="border-t border-slate-900 bg-[#07070a]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
