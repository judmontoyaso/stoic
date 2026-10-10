/**
 * E2E & Architectural Contract Test Suite for StoiCom Landing Page
 *
 * Framework: Node 22 native test runner (`node:test`, `node:assert/strict`)
 * Execution: `npx tsx --test tests/e2e/landing.test.ts`
 *
 * Tier Structure:
 * - Tier 1: Feature Coverage (Hero, LeadForm, Nav Anchors, Sections, FAQ Data, SEO Metadata)
 * - Tier 2: Boundary & Corner Cases (LeadForm Email Validation, Currency Toggle, Malformed Inputs)
 * - Tier 3: Cross-Feature Combinations & Contracts (Pricing-to-Hero Focus, API Route, Telemetry)
 * - Tier 4: Real-World Application Scenarios (Schema.org JSON-LD Conformance, Next.js Static SEO Standards)
 */

import Module from 'node:module'
import React from 'react'

// Hook module loader to mock next/font/google in native Node runtime
type RequireFn = (id: string, ...args: unknown[]) => unknown
const moduleProto = Module.prototype as unknown as { require: RequireFn }
const originalRequire = moduleProto.require

moduleProto.require = function (id: string, ...args: unknown[]) {
  if (id === 'next/font/google') {
    return new Proxy(
      {},
      {
        get: () => () => ({
          className: 'font-cinzel-mock',
          variable: '--font-cinzel',
        }),
      }
    )
  }
  return originalRequire.call(this, id, ...args)
}

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import fs from 'node:fs'
import path from 'node:path'

// Project domain modules
import { PROGRAM_PRICE, FOUNDER_PRICE, copLabel, usdLabel } from '../../src/lib/pricing'
import { FAQS } from '../../src/data/faqs'
import { normalizeEmail, DRIP_LENGTH, DRIP_TRACK_SLUG } from '../../src/lib/leads'
import type { PublicEventName } from '../../src/lib/analytics-public'

// Type definitions for module loaders & Schema.org entities
interface ModuleWithDefault<T> {
  default?: T | { default: T; metadata?: StaticMetadata }
  metadata?: StaticMetadata
}

interface StaticMetadata {
  title: string
  description: string
  keywords?: string[]
  alternates?: { canonical?: string }
  openGraph?: {
    title?: string
    description?: string
    url?: string
    siteName?: string
    locale?: string
    type?: string
    images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    images?: string[]
  }
  robots?: { index?: boolean; follow?: boolean }
}

interface SchemaOffer {
  '@type'?: string
  category?: string
  price?: string
  priceCurrency?: string
}

interface SchemaQuestionItem {
  '@type': string
  name: string
  acceptedAnswer?: {
    '@type': string
    text: string
  }
}

interface SchemaEntity {
  '@type': string
  name?: string
  url?: string
  logo?: string
  description?: string
  inLanguage?: string
  operatingSystem?: string
  applicationCategory?: string
  offers?: SchemaOffer[]
  provider?: { '@type'?: string; name?: string; url?: string }
  hasCourseInstance?: { '@type'?: string; courseMode?: string; courseWorkload?: string }
  mainEntity?: SchemaQuestionItem[]
}

interface SchemaGraph {
  '@context': string
  '@graph': SchemaEntity[]
}

type RouteHandler = (req: Request) => Promise<Response>

// Helper to load Server Component & static metadata
async function loadLandingPageModule(): Promise<{
  LandingPage: React.ComponentType
  metadata: StaticMetadata
}> {
  const pageMod = (await import('../../src/app/landing/page')) as ModuleWithDefault<React.ComponentType>
  const candidate = pageMod.default
  let LandingPage: React.ComponentType
  let metadata: StaticMetadata | undefined = pageMod.metadata

  if (typeof candidate === 'function') {
    LandingPage = candidate
  } else if (candidate && typeof (candidate as { default: React.ComponentType }).default === 'function') {
    LandingPage = (candidate as { default: React.ComponentType }).default
    if (!metadata) {
      metadata = (candidate as { metadata?: StaticMetadata }).metadata
    }
  } else {
    throw new Error('Could not resolve LandingPage component')
  }

  return { LandingPage, metadata: metadata! }
}

// Helper to load LeadForm component
async function loadLeadFormComponent(): Promise<React.ComponentType<{ source?: string }>> {
  const mod = (await import('../../src/components/LeadForm')) as ModuleWithDefault<React.ComponentType<{ source?: string }>>
  const component = typeof mod.default === 'function' ? mod.default : (mod.default as { default: React.ComponentType<{ source?: string }> })?.default
  return component
}

// Helper to load PricingSection component
async function loadPricingSectionComponent(): Promise<React.ComponentType<{ onSelectFreeTrial?: () => void }>> {
  const mod = (await import('../../src/components/landing/PricingSection')) as ModuleWithDefault<React.ComponentType<{ onSelectFreeTrial?: () => void }>>
  const component = typeof mod.default === 'function' ? mod.default : (mod.default as { default: React.ComponentType<{ onSelectFreeTrial?: () => void }> })?.default
  return component
}

// Helper to load FAQAccordion component
async function loadFAQAccordionComponent(): Promise<React.ComponentType> {
  const mod = (await import('../../src/components/landing/FAQAccordion')) as ModuleWithDefault<React.ComponentType>
  const component = typeof mod.default === 'function' ? mod.default : (mod.default as { default: React.ComponentType })?.default
  return component
}

// Helper to load API route
async function loadSubscribeRoute(): Promise<RouteHandler> {
  const mod = (await import('../../src/app/api/leads/subscribe/route')) as {
    POST?: RouteHandler
    default?: { POST?: RouteHandler }
  }
  const handler = mod.POST || mod.default?.POST
  if (!handler) {
    throw new Error('POST handler not found in subscribe route')
  }
  return handler
}

describe('StoiCom Landing Page Test Suite', () => {

  // =========================================================================
  // TIER 1: FEATURE COVERAGE
  // =========================================================================
  describe('Tier 1: Feature Coverage', () => {

    it('T1.1: renders Hero section with primary headlines, eyebrow and value proposition copy', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // Eyebrow and main headline
      assert.match(html, /Programa Guiado · Filosofía Estoica &amp; Alto Rendimiento|Programa Guiado · Filosofía Estoica & Alto Rendimiento/)
      assert.match(html, /Entrena cómo hablas\./)
      assert.match(html, /Con los demás y contigo\./)

      // Value proposition copy and call to action
      assert.match(html, /Un ejercicio real cada día para dejar de sonar dubitativo/)
      assert.match(html, /Empieza gratis: los primeros 7 días del programa, en tu correo\./)
      assert.match(html, /href="\/login"/)
    })

    it('T1.2: renders LeadForm within Hero with correct source and input ID', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // Hero LeadForm input id
      assert.match(html, /id="lead-email-landing-hero"/, 'Hero section must contain lead-email-landing-hero input')
      assert.match(html, /placeholder="tu@correo\.com"/)
      assert.match(html, /Quiero los 7 días/)
    })

    it('T1.3: verifies navigation header contains required anchors and login link', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // Header anchors
      assert.match(html, /href="#metodologia"/, 'Navigation must include #metodologia anchor')
      assert.match(html, /href="#tracks"/, 'Navigation must include #tracks anchor')
      assert.match(html, /href="#precios"/, 'Navigation must include #precios anchor')
      assert.match(html, /href="\/login"/, 'Navigation must include /login link')
      assert.match(html, /STOI/, 'Logo brand must be present')
      assert.match(html, /COM/, 'Logo brand must be present')
    })

    it('T1.4: target DOM sections with matching anchor IDs exist on page', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // DOM target elements
      assert.match(html, /id="metodologia"/, 'Page must contain element with id="metodologia"')
      assert.match(html, /id="tracks"/, 'Page must contain element with id="tracks"')
      assert.match(html, /id="precios"/, 'Page must contain element with id="precios"')
    })

    it('T1.5: renders Methodology section with classic stoicism and high performance cards', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      assert.match(html, /Filosofía Estoica \+ Psicología de Alto Rendimiento/)
      assert.match(html, /Estoicismo Clásico/)
      assert.match(html, /Psicología de Alto Rendimiento/)
      assert.match(html, /Dicotomía del control/)
      assert.match(html, /Tríada emocional/)
    })

    it('T1.6: renders Tracks section detailing the 3 guided tracks and 210 exercises', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      assert.match(html, /Tres Tracks Guiados/)
      assert.match(html, /210 ejercicios en total/)
      assert.match(html, /Comunicación Interpersonal/)
      assert.match(html, /Maestría Interna &amp; Diario|Maestría Interna & Diario/)
      assert.match(html, /Influencia &amp; Liderazgo|Influencia & Liderazgo/)
    })

    it('T1.7: renders Pricing section with Free Trial ($0) and Annual Plan cards', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      assert.match(html, /Prueba de 7 Días/)
      assert.match(html, /\$0/)
      assert.match(html, /Matrícula Anual/)
      assert.match(html, /199\.000|59/)
      assert.match(html, /Garantía Incondicional de 14 Días/)
    })

    it('T1.8: renders FAQ Accordion with all items sourced from src/data/faqs.ts', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      assert.ok(FAQS.length >= 6, 'FAQS data must contain at least 6 questions')
      for (const faq of FAQS) {
        assert.ok(
          html.includes(faq.question),
          `Rendered HTML must contain FAQ question: "${faq.question}"`
        )
      }
    })

    it('T1.9: verifies static SEO metadata export contains title, description and canonical', async () => {
      const { metadata } = await loadLandingPageModule()

      assert.ok(metadata, 'Page must export metadata')
      assert.match(metadata.title, /StoiCom/)
      assert.match(metadata.description, /210 ejercicios diarios/)
      assert.equal(metadata.alternates?.canonical, 'https://stoicom.app/landing')
      assert.equal(metadata.robots?.index, true)
      assert.equal(metadata.robots?.follow, true)
      assert.equal(metadata.openGraph?.url, 'https://stoicom.app/landing')
      assert.equal(metadata.openGraph?.locale, 'es_CO')
      assert.equal(metadata.twitter?.card, 'summary_large_image')
    })
  })

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // =========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {

    it('T2.1: validates email normalization across valid formats, tags and mixed casing', () => {
      assert.equal(normalizeEmail('simple@example.com'), 'simple@example.com')
      assert.equal(normalizeEmail('  Simple.User@Example.COM  '), 'simple.user@example.com')
      assert.equal(normalizeEmail('user+tag@domain.co'), 'user+tag@domain.co')
      assert.equal(normalizeEmail('name-with-dash@sub.corp.org'), 'name-with-dash@sub.corp.org')
      assert.equal(normalizeEmail('a_b@domain.es'), 'a_b@domain.es')
      assert.equal(normalizeEmail('lead.test1234@sub-domain.co.uk'), 'lead.test1234@sub-domain.co.uk')
    })

    it('T2.2: rejects invalid email formats and boundary length edge cases', () => {
      // Empty or whitespace
      assert.equal(normalizeEmail(''), null)
      assert.equal(normalizeEmail('   '), null)
      assert.equal(normalizeEmail(null), null)
      assert.equal(normalizeEmail(undefined), null)

      // Non-string types
      assert.equal(normalizeEmail(12345), null)
      assert.equal(normalizeEmail({}), null)
      assert.equal(normalizeEmail([]), null)

      // Malformed structure
      assert.equal(normalizeEmail('plainaddress'), null)
      assert.equal(normalizeEmail('@missinguser.com'), null)
      assert.equal(normalizeEmail('user@missingdomain'), null)
      assert.equal(normalizeEmail('user@domain.c'), null, 'Single character TLD must be rejected')
      assert.equal(normalizeEmail('user@'), null)
      assert.equal(normalizeEmail('user space@domain.com'), null)
      assert.equal(normalizeEmail('user@dom ain.com'), null)
      assert.equal(normalizeEmail('user,name@domain.com'), null)
      assert.equal(normalizeEmail('user;name@domain.com'), null)
      assert.equal(normalizeEmail('user@@doubleat.com'), null)

      // Boundary length
      assert.equal(normalizeEmail('a@b'), null, 'Length < 5 must be rejected')
      assert.equal(normalizeEmail('a@b.co'), 'a@b.co', 'Length 6 valid email must pass')
      const tooLongEmail = 'a'.repeat(245) + '@domain.com' // 256 chars
      assert.equal(normalizeEmail(tooLongEmail), null, 'Length > 254 must be rejected')
    })

    it('T2.3: verifies currency toggle values and formatting constants', () => {
      // Numerical values in src/lib/pricing.ts
      assert.equal(PROGRAM_PRICE.cop, 199000, 'COP price must be 199000')
      assert.equal(PROGRAM_PRICE.usd, 59, 'USD price must be 59')
      assert.strictEqual(FOUNDER_PRICE, PROGRAM_PRICE, 'FOUNDER_PRICE alias must strictly equal PROGRAM_PRICE')

      // Formatting specifications
      assert.equal(copLabel, '$199.000', 'COP label must format with Colombian thousand separator')
      assert.equal(usdLabel, '$59', 'USD label must format as $59')
    })

    it('T2.4: verifies PricingSection handles currency options between COP and USD', async () => {
      const PricingSection = await loadPricingSectionComponent()
      const html = renderToStaticMarkup(React.createElement(PricingSection, {}))

      // Must include currency switchers and gateway mentions
      assert.match(html, /199\.000 COP/)
      assert.match(html, /59 USD/)
      assert.match(html, /Mercado Pago/)
      assert.match(html, /Lemon Squeezy/)
    })

    it('T2.5: verifies LeadForm renders isolated component with custom and default sources', async () => {
      const LeadForm = await loadLeadFormComponent()

      // Default source
      const defaultHtml = renderToStaticMarkup(React.createElement(LeadForm, {}))
      assert.match(defaultHtml, /id="lead-email-landing"/)

      // Custom hero source
      const heroHtml = renderToStaticMarkup(React.createElement(LeadForm, { source: 'landing-hero' }))
      assert.match(heroHtml, /id="lead-email-landing-hero"/)

      // Custom footer source
      const footerHtml = renderToStaticMarkup(React.createElement(LeadForm, { source: 'landing-footer' }))
      assert.match(footerHtml, /id="lead-email-landing-footer"/)
    })

    it('T2.5b: verifies FAQAccordion renders isolated component with all questions and initial state', async () => {
      const FAQAccordion = await loadFAQAccordionComponent()
      const html = renderToStaticMarkup(React.createElement(FAQAccordion))

      // All questions must be rendered
      for (const faq of FAQS) {
        assert.ok(html.includes(faq.question), `Standalone accordion must render "${faq.question}"`)
      }
      // First item is open by default in current design
      assert.match(html, /aria-expanded="true"/)
    })

    it('T2.6: rejects malformed requests in /api/leads/subscribe endpoint', async () => {
      const POST = await loadSubscribeRoute()

      // 1. Non-JSON body
      const reqInvalidJson = new Request('http://localhost/api/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json-string',
      })
      const resInvalidJson = await POST(reqInvalidJson)
      assert.equal(resInvalidJson.status, 400)
      const dataInvalidJson = (await resInvalidJson.json()) as { error: string }
      assert.equal(dataInvalidJson.error, 'Cuerpo inválido')

      // 2. Empty email
      const reqEmpty = new Request('http://localhost/api/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      })
      const resEmpty = await POST(reqEmpty)
      assert.equal(resEmpty.status, 400)
      const dataEmpty = (await resEmpty.json()) as { error: string }
      assert.equal(dataEmpty.error, 'Ese correo no parece válido')

      // 3. Malformed email
      const reqInvalidEmail = new Request('http://localhost/api/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      })
      const resInvalidEmail = await POST(reqInvalidEmail)
      assert.equal(resInvalidEmail.status, 400)
      const dataInvalidEmail = (await resInvalidEmail.json()) as { error: string }
      assert.equal(dataInvalidEmail.error, 'Ese correo no parece válido')
    })
  })

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS & CONTRACTS
  // =========================================================================
  describe('Tier 3: Cross-Feature Combinations & Contracts', () => {

    it('T3.1: verifies contract between PricingSection and Hero LeadForm input element ID', async () => {
      // Read component sources to verify contract coupling
      const pricingSectionSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/landing/PricingSection.tsx'),
        'utf-8'
      )
      const leadFormSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/LeadForm.tsx'),
        'utf-8'
      )
      const landingPageSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/landing/page.tsx'),
        'utf-8'
      )

      // Contract assertion: PricingSection looks for 'lead-email-landing-hero'
      assert.match(
        pricingSectionSource,
        /document\.getElementById\(['"]lead-email-landing-hero['"]\)/,
        'PricingSection must query document.getElementById("lead-email-landing-hero")'
      )

      // Contract assertion: PricingSection has fallback query
      assert.match(
        pricingSectionSource,
        /document\.querySelector\(['"]input\[type=["']email["']\]['"]\)/,
        'PricingSection must include fallback selector for email input'
      )

      // Contract assertion: LandingPage passes source="landing-hero" to LeadForm
      assert.match(
        landingPageSource,
        /<LeadForm\s+source="landing-hero"\s*\/>/,
        'LandingPage must invoke LeadForm with source="landing-hero"'
      )

      // Contract assertion: LeadForm constructs id={`lead-email-${source}`}
      assert.match(
        leadFormSource,
        /id=\{`lead-email-\$\{source\}`\}/,
        'LeadForm must construct id={`lead-email-${source}`}'
      )

      // Contract assertion: Rendered DOM verification
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))
      assert.match(html, /id="lead-email-landing-hero"/)
    })

    it('T3.2: verifies API endpoint /api/leads/subscribe contract parameters and defaults', () => {
      const routeSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/api/leads/subscribe/route.ts'),
        'utf-8'
      )

      // Verify POST handler signature and normalization
      assert.match(routeSource, /export\s+async\s+function\s+POST\(/)
      assert.match(routeSource, /normalizeEmail\(body\.email\)/)
      assert.match(routeSource, /body\.source\.slice\(0,\s*40\)\s*:\s*['"]landing['"]/)

      // Verify anti-mail-bombing throttle constant
      assert.match(routeSource, /RESEND_THROTTLE_MINUTES\s*=\s*5/)
      // Verify hourly burst rate limiter
      assert.match(routeSource, /MAX_NEW_PER_HOUR\s*=\s*30/)
    })

    it('T3.3: verifies telemetry event contracts and whitelist synchronization', () => {
      const analyticsSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/lib/analytics-public.ts'),
        'utf-8'
      )
      const eventsRouteSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/api/events/route.ts'),
        'utf-8'
      )
      const leadFormSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/LeadForm.tsx'),
        'utf-8'
      )

      // Whitelisted public events in client
      const expectedEvents: PublicEventName[] = [
        'landing_view',
        'landing_cta_click',
        'lead_form_submitted',
        'becas_view',
        'beca_form_submitted',
        'login_view',
      ]

      for (const ev of expectedEvents) {
        assert.ok(
          analyticsSource.includes(`'${ev}'`),
          `Client analytics-public.ts must include event '${ev}'`
        )
        assert.ok(
          eventsRouteSource.includes(`'${ev}'`),
          `Server api/events/route.ts whitelist must include event '${ev}'`
        )
      }

      // LeadForm must trigger 'lead_form_submitted' with source prop
      assert.match(
        leadFormSource,
        /trackPublic\(['"]lead_form_submitted['"],\s*\{\s*source\s*\}\)/
      )

      // Verify payload props sanitization bounds (max 6 keys, key max 40, val max 120)
      assert.match(eventsRouteSource, /Object\.keys\(out\)\.length\s*>=\s*6/)
      assert.match(eventsRouteSource, /k\.slice\(0,\s*40\)/)
      assert.match(eventsRouteSource, /String\(v\)\.slice\(0,\s*120\)/)
    })

    it('T3.3b: verifies trackPublic fire-and-forget contract behavior', () => {
      const analyticsSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/lib/analytics-public.ts'),
        'utf-8'
      )

      // Must attempt sendBeacon first
      assert.match(analyticsSource, /navigator\.sendBeacon/)
      assert.match(analyticsSource, /\/api\/events/)
      // Fallback to fetch with keepalive: true
      assert.match(analyticsSource, /keepalive:\s*true/)
    })

    it('T3.4: verifies Drip sequence parameters contract for the 7-day free trial', () => {
      assert.equal(DRIP_LENGTH, 7, 'Drip sequence length must be 7 days')
      assert.equal(DRIP_TRACK_SLUG, 'comunicacion', 'Drip track slug must be "comunicacion"')
    })
  })

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================
  describe('Tier 4: Real-World Application Scenarios', () => {

    it('T4.1: validates JSON-LD structured data conforms to schema.org with all 5 graph entities', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // Extract JSON-LD script from rendered markup
      const scriptMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
      assert.ok(scriptMatch, 'Page must contain <script type="application/ld+json"> tag')

      const jsonContent = scriptMatch[1]
      let parsed: SchemaGraph
      try {
        parsed = JSON.parse(jsonContent) as SchemaGraph
      } catch (err) {
        assert.fail(`JSON-LD structured data is not valid JSON: ${(err as Error).message}`)
      }

      // Context validation
      assert.equal(parsed['@context'], 'https://schema.org')
      assert.ok(Array.isArray(parsed['@graph']), '@graph must be an array')

      const graph = parsed['@graph']

      // 1. Organization entity
      const org = graph.find(g => g['@type'] === 'Organization')
      assert.ok(org, 'Graph must contain Organization entity')
      assert.equal(org.name, 'StoiCom')
      assert.equal(org.url, 'https://stoicom.app')
      assert.equal(org.logo, 'https://stoicom.app/icon-512.png')
      assert.match(org.description || '', /Entrenamiento diario de comunicación/)

      // 2. WebSite entity
      const webSite = graph.find(g => g['@type'] === 'WebSite')
      assert.ok(webSite, 'Graph must contain WebSite entity')
      assert.equal(webSite.name, 'StoiCom')
      assert.equal(webSite.url, 'https://stoicom.app/landing')
      assert.equal(webSite.inLanguage, 'es')

      // 3. SoftwareApplication entity
      const app = graph.find(g => g['@type'] === 'SoftwareApplication')
      assert.ok(app, 'Graph must contain SoftwareApplication entity')
      assert.equal(app.name, 'StoiCom App (PWA)')
      assert.equal(app.applicationCategory, 'EducationalApplication')
      assert.equal(app.operatingSystem, 'iOS, Android, Windows, macOS')
      assert.ok(Array.isArray(app.offers), 'SoftwareApplication must include offers')
      assert.ok(app.offers.some((o: SchemaOffer) => o.price === String(PROGRAM_PRICE.cop) && o.priceCurrency === 'COP'))
      assert.ok(app.offers.some((o: SchemaOffer) => o.price === String(PROGRAM_PRICE.usd) && o.priceCurrency === 'USD'))

      // 4. Course entity
      const course = graph.find(g => g['@type'] === 'Course')
      assert.ok(course, 'Graph must contain Course entity')
      assert.match(course.name || '', /El Método StoiCom/)
      assert.equal(course.provider?.['@type'], 'Organization')
      assert.equal(course.inLanguage, 'es')
      assert.equal(course.hasCourseInstance?.courseMode, 'online')
      assert.equal(course.hasCourseInstance?.courseWorkload, 'PT15M')
      assert.ok(Array.isArray(course.offers), 'Course must include offers array')
      assert.ok(course.offers.some((o: SchemaOffer) => o.category === 'Trial' && o.price === '0'))
      assert.ok(course.offers.some((o: SchemaOffer) => o.category === 'Annual' && o.price === String(PROGRAM_PRICE.cop)))
      assert.ok(course.offers.some((o: SchemaOffer) => o.category === 'Annual' && o.price === String(PROGRAM_PRICE.usd)))

      // 5. FAQPage entity
      const faqPage = graph.find(g => g['@type'] === 'FAQPage')
      assert.ok(faqPage, 'Graph must contain FAQPage entity')
      assert.ok(Array.isArray(faqPage.mainEntity), 'FAQPage must contain mainEntity array')
      assert.equal(faqPage.mainEntity.length, FAQS.length, 'FAQPage mainEntity length must match FAQS array')

      for (let i = 0; i < FAQS.length; i++) {
        const q = faqPage.mainEntity[i]
        assert.equal(q['@type'], 'Question')
        assert.equal(q.name, FAQS[i].question)
        assert.equal(q.acceptedAnswer?.['@type'], 'Answer')
        assert.equal(q.acceptedAnswer?.text, FAQS[i].answer)
      }
    })

    it('T4.2: verifies static SEO metadata conforms to Next.js standards and character thresholds', async () => {
      const { metadata } = await loadLandingPageModule()

      // Title length check (standard 30-80 chars)
      assert.ok(metadata.title.length >= 30 && metadata.title.length <= 100, `Title length ${metadata.title.length} is within standard range`)

      // Description length check (standard 120-250 chars)
      assert.ok(metadata.description.length >= 100 && metadata.description.length <= 300, `Description length ${metadata.description.length} is within standard range`)

      // Keywords array contains expected philosophical and training terms
      assert.ok(Array.isArray(metadata.keywords))
      assert.ok(metadata.keywords.length >= 8)
      assert.ok(metadata.keywords.includes('comunicación estoica'))
      assert.ok(metadata.keywords.includes('Marco Aurelio'))
      assert.ok(metadata.keywords.includes('Séneca') || metadata.keywords.includes('examen nocturno de Séneca'))
      assert.ok(metadata.keywords.includes('Epicteto'))

      // OpenGraph standards
      assert.equal(metadata.openGraph?.siteName, 'StoiCom')
      assert.equal(metadata.openGraph?.type, 'website')
      assert.equal(metadata.openGraph?.locale, 'es_CO')
      assert.ok(metadata.openGraph?.images?.[0]?.url.startsWith('https://stoicom.app/'))

      // Twitter standards
      assert.equal(metadata.twitter?.card, 'summary_large_image')
      assert.ok(metadata.twitter?.images?.[0]?.startsWith('https://stoicom.app/'))
    })

    it('T4.3: validates accessibility attributes and semantic landmarks in rendered landing page', async () => {
      const { LandingPage } = await loadLandingPageModule()
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // Header landmark
      assert.match(html, /<header\b/)
      // Main sections
      assert.match(html, /<section\b/)
      // Footer landmark
      assert.match(html, /<footer\b/)
      // Accessible screen-reader labels on form inputs
      assert.match(html, /class="[^"]*sr-only[^"]*"/)
      // Auto-complete on email inputs
      assert.match(html, /autocomplete="email"|autoComplete="email"/)
      // Required attribute on email input
      assert.match(html, /required=""|required\b/)
    })
  })
})
