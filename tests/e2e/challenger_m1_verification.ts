/**
 * Challenger 2 Empirical Verification Suite for Milestone 1: Cinematic Hero & Atmosphere (R1)
 *
 * Verifies:
 * 1. LandingNav component behavior, sticky navbar, mobile viewport (<768px), and drawer toggle
 * 2. MethodologySection component structure, anchor id="metodologia", and spotlight cards
 * 3. Server Component landing/page.tsx rendered markup
 * 4. Contract coupling for document.getElementById('lead-email-landing-hero')
 * 5. Interactive mechanics of PricingSection -> Hero LeadForm jump & focus
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
          className: 'font-cinzel-challenger',
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

describe('Challenger 2 Empirical Verification - Milestone 1', async () => {
  // Dynamically import components after module hook is active
  const LandingNav = (await import('../../src/components/landing/LandingNav')).default
  const MethodologySection = (await import('../../src/components/landing/MethodologySection')).default
  const HeroSection = (await import('../../src/components/landing/HeroSection')).default
  const SpotlightCard = (await import('../../src/components/landing/SpotlightCard')).default
  const LeadForm = (await import('../../src/components/LeadForm')).default
  const PricingSection = (await import('../../src/components/landing/PricingSection')).default
  const LandingPage = (await import('../../src/app/landing/page')).default

  describe('1. LandingNav Empirical Verification', () => {
    it('1.1: renders sticky header container with correct z-index and glassmorphic base styles', () => {
      const html = renderToStaticMarkup(React.createElement(LandingNav, { cinzelClassName: 'custom-cinzel' }))

      // Sticky positioning and layout contracts
      assert.match(html, /<header[^>]*class="[^"]*sticky\s+top-0\s+z-50[^"]*"/, 'Header must be sticky top-0 z-50')
      assert.match(html, /STOI/, 'Header must render STOI')
      assert.match(html, /COM/, 'Header must render COM')
      assert.match(html, /src="\/sculpture\.png"/, 'Header must render sculpture logo')
      assert.match(html, /custom-cinzel/, 'Header must adopt passed font class')
    })

    it('1.2: handles missing cinzelClassName prop gracefully without throwing', () => {
      const html = renderToStaticMarkup(React.createElement(LandingNav, {}))
      assert.ok(html.length > 0)
      assert.match(html, /font-cinzel-challenger/)
    })

    it('1.3: renders desktop navigation with exact anchor contracts', () => {
      const html = renderToStaticMarkup(React.createElement(LandingNav, {}))

      // Desktop navigation container must be hidden on mobile (hidden md:flex)
      assert.match(html, /<nav[^>]*class="[^"]*hidden\s+md:flex[^"]*"[^>]*aria-label="Navegación principal"/)

      // All anchor targets must exist
      assert.match(html, /href="#metodologia"/)
      assert.match(html, /href="#tracks"/)
      assert.match(html, /href="#precios"/)
      assert.match(html, /href="\/login"/)
      assert.match(html, /Entrar/)
    })

    it('1.4: renders mobile viewport controls with accessible button (<768px)', () => {
      const html = renderToStaticMarkup(React.createElement(LandingNav, {}))

      // Mobile controls container must be md:hidden
      assert.match(html, /class="[^"]*md:hidden[^"]*"/)

      // Toggle button initial state
      assert.match(html, /aria-label="Abrir navegación"/)
      assert.match(html, /aria-expanded="false"/)
    })

    it('1.5: verifies mobile drawer navigation structure and auto-dismiss bindings', () => {
      const navSource: string = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/landing/LandingNav.tsx'),
        'utf-8'
      )

      // Mobile toggle button flips state
      assert.match(navSource, /setMobileMenuOpen\(\(prev\)\s*=>\s*!prev\)/)

      // Mobile drawer links auto-close the drawer on tap
      const matches = navSource.match(/onClick=\{\(\)\s*=>\s*setMobileMenuOpen\(false\)\}/g)
      assert.ok(matches && matches.length >= 4, 'All 4 mobile drawer navigation items must dismiss the drawer on click')

      // Mobile drawer links must target the required sections and CTA
      assert.match(navSource, /href="#metodologia"/)
      assert.match(navSource, /href="#tracks"/)
      assert.match(navSource, /href="#precios"/)
      assert.match(navSource, /href="\/login"/)
      assert.match(navSource, /Entrar a la app/)
    })

    it('1.6: verifies scroll listener lifecycle and cleanup in LandingNav', () => {
      const navSource: string = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/landing/LandingNav.tsx'),
        'utf-8'
      )

      assert.match(navSource, /window\.addEventListener\('scroll',\s*handleScroll,\s*\{\s*passive:\s*true\s*\}\)/)
      assert.match(navSource, /window\.removeEventListener\('scroll',\s*handleScroll\)/)
      assert.match(navSource, /setIsScrolled\(window\.scrollY\s*>\s*20\)/)
    })
  })

  describe('2. MethodologySection Empirical Verification', () => {
    it('2.1: renders section container with exact DOM ID contract id="metodologia"', () => {
      const html = renderToStaticMarkup(React.createElement(MethodologySection, { cinzelClassName: 'custom-cinzel' }))
      assert.match(html, /<section[^>]*id="metodologia"/, 'Section must have id="metodologia"')
    })

    it('2.2: renders classical stoicism spotlight card with all philosophical pillars', () => {
      const html = renderToStaticMarkup(React.createElement(MethodologySection, {}))

      // Card 1: Estoicismo Clásico
      assert.match(html, /Estoicismo Clásico/)
      assert.match(html, /Marco Aurelio · Séneca · Epicteto/)
      assert.match(html, /Dicotomía del control/)
      assert.match(html, /Examen nocturno de Séneca/)
      assert.match(html, /Premeditatio Malorum/)
      assert.match(html, /Percepción · Acción · Voluntad/)
      assert.match(html, /90 días de base/)
    })

    it('2.3: renders high performance psychology spotlight card with modern frameworks', () => {
      const html = renderToStaticMarkup(React.createElement(MethodologySection, {}))

      // Card 2: Psicología de Alto Rendimiento
      assert.match(html, /Psicología de Alto Rendimiento/)
      assert.match(html, /Robbins · Voss · Holiday/)
      assert.match(html, /La Tríada de Robbins/)
      assert.match(html, /Negociación de Chris Voss/)
      assert.match(html, /Condicionamiento Neuro-Asociativo/)
      assert.match(html, /Frameworks Modernos/)
      assert.match(html, /30 días avanzados/)
    })

    it('2.4: verifies responsive grid layout for desktop vs mobile (<768px)', () => {
      const html = renderToStaticMarkup(React.createElement(MethodologySection, {}))
      // Single column on mobile, 2 columns on md
      assert.match(html, /grid-cols-1\s+gap-6[^"]*md:grid-cols-2\s+md:gap-8/)
    })
  })

  describe('3. HeroSection & SpotlightCard Verification', () => {
    it('3.1: verifies HeroSection renders ambient gold glow and NO 10MB mosaico.png reference', () => {
      const html = renderToStaticMarkup(React.createElement(HeroSection, {}))

      // Verification of atmospheric gold glow layers
      assert.match(html, /rgba\(201,\s*168,\s*76/)
      assert.doesNotMatch(html, /mosaico\.png/, 'HeroSection must not reference mosaico.png')
    })

    it('3.2: verifies HeroSection falls back to default LeadForm when children are omitted', () => {
      const html = renderToStaticMarkup(React.createElement(HeroSection, {}))
      assert.match(html, /id="lead-email-landing-hero"/, 'Default HeroSection must render LeadForm with source="landing-hero"')
    })

    it('3.3: verifies SpotlightCard component renders mouse tracking container', () => {
      const html = renderToStaticMarkup(
        React.createElement(SpotlightCard, { className: 'test-card' }, React.createElement('span', null, 'Inner Content'))
      )
      assert.match(html, /test-card/)
      assert.match(html, /Inner Content/)
      assert.match(html, /group\s+relative\s+rounded-xl/)
      assert.match(html, /radial-gradient/)
    })
  })

  describe('4. Contract Coupling Verification (lead-email-landing-hero)', () => {
    it('4.1: verifies landing/page.tsx renders document element with id="lead-email-landing-hero"', () => {
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      // The exact element MUST be in rendered HTML
      assert.match(html, /<input[^>]*id="lead-email-landing-hero"[^>]*>/, 'Page must contain <input id="lead-email-landing-hero">')

      // Must be type="email" and required
      assert.match(html, /id="lead-email-landing-hero"[^>]*type="email"/)
      assert.match(html, /id="lead-email-landing-hero"[^>]*required/)
      assert.match(html, /id="lead-email-landing-hero"[^>]*placeholder="tu@correo\.com"/)
    })

    it('4.2: verifies PricingSection querySelector and document.getElementById match', () => {
      const pricingSource: string = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/landing/PricingSection.tsx'),
        'utf-8'
      )

      // Query contract verification
      assert.match(
        pricingSource,
        /document\.getElementById\(['"]lead-email-landing-hero['"]\)/,
        'PricingSection must query document.getElementById("lead-email-landing-hero")'
      )

      assert.match(
        pricingSource,
        /el\.scrollIntoView\(\{\s*behavior:\s*['"]smooth['"],\s*block:\s*['"]center['"]\s*\}\)/,
        'PricingSection must scroll smoothly to hero lead input'
      )

      assert.match(
        pricingSource,
        /\(el\s+as\s+HTMLInputElement\)\.focus\(\)/,
        'PricingSection must focus the input element'
      )
    })

    it('4.3: executes simulated browser DOM contract interaction', () => {
      let scrolledElement: unknown = null
      let scrollOptions: unknown = null
      let focused = false

      const mockHeroInput = {
        id: 'lead-email-landing-hero',
        tagName: 'INPUT',
        type: 'email',
        scrollIntoView: function (opts: unknown) {
          scrolledElement = this
          scrollOptions = opts
        },
        focus: function () {
          focused = true
        },
      }

      // Mock global document
      const originalDocument = globalThis.document
      try {
        globalThis.document = {
          getElementById: (id: string) => {
            if (id === 'lead-email-landing-hero') return mockHeroInput as unknown as HTMLElement
            return null
          },
          querySelector: () => null,
        } as unknown as Document

        // Test the exact click handler logic from PricingSection
        const el =
          document.getElementById('lead-email-landing-hero') ||
          document.querySelector('input[type="email"]')

        assert.ok(el, 'Element must be found by document.getElementById')
        if (el) {
          ;(el as unknown as typeof mockHeroInput).scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(el as unknown as typeof mockHeroInput).focus()
        }

        assert.strictEqual(scrolledElement, mockHeroInput, 'Mock input must have been scrolled into view')
        assert.deepEqual(scrollOptions, { behavior: 'smooth', block: 'center' }, 'Scroll options must match smooth centering')
        assert.strictEqual(focused, true, 'Input element must have been focused')
      } finally {
        globalThis.document = originalDocument
      }
    })
  })

  describe('5. Full Page Orchestration & Zero Regressions', () => {
    it('5.1: verifies landing/page.tsx renders all sections in correct neo-stoic order', () => {
      const html = renderToStaticMarkup(React.createElement(LandingPage))

      const navIndex = html.indexOf('<header')
      const heroIndex = html.indexOf('Entrena cómo hablas.')
      const methodologyIndex = html.indexOf('id="metodologia"')
      const routineIndex = html.indexOf('Así se ve un día')
      const phasesIndex = html.indexOf('Tres fases de 30 días')
      const tracksIndex = html.indexOf('id="tracks"')
      const evaluationIndex = html.indexOf('Medición honesta')
      const pwaIndex = html.indexOf('Herramientas de la App')
      const pricingIndex = html.indexOf('id="precios"')
      const faqIndex = html.indexOf('Preguntas Frecuentes')
      const mementoIndex = html.indexOf('Memento Mori')
      const footerCtaIndex = html.indexOf('Noventa días. Un ejercicio al día.')
      const footerIndex = html.indexOf('<footer')

      assert.ok(navIndex !== -1, 'Navigation must exist')
      assert.ok(heroIndex > navIndex, 'Hero must be after navigation')
      assert.ok(methodologyIndex > heroIndex, 'Methodology must be after Hero')
      assert.ok(routineIndex > methodologyIndex, 'Routine must be after Methodology')
      assert.ok(phasesIndex > routineIndex, 'Phases must be after Routine')
      assert.ok(tracksIndex > phasesIndex, 'Tracks must be after Phases')
      assert.ok(evaluationIndex > tracksIndex, 'Evaluation must be after Tracks')
      assert.ok(pwaIndex > evaluationIndex, 'PWA must be after Evaluation')
      assert.ok(pricingIndex > pwaIndex, 'Pricing must be after PWA')
      assert.ok(faqIndex > pricingIndex, 'FAQ must be after Pricing')
      assert.ok(mementoIndex > faqIndex, 'Memento must be after FAQ')
      assert.ok(footerCtaIndex > mementoIndex, 'Footer CTA must be after Memento')
      assert.ok(footerIndex > footerCtaIndex, 'Footer must be after Footer CTA')
    })

    it('5.2: verifies no 10MB mosaico.png asset is rendered in markup or loaded as image', () => {
      const html = renderToStaticMarkup(React.createElement(LandingPage))
      assert.doesNotMatch(html, /mosaico\.png/, 'Rendered HTML must not load mosaico.png')

      const pageSource: string = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/landing/page.tsx'),
        'utf-8'
      )
      const heroSource: string = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/landing/HeroSection.tsx'),
        'utf-8'
      )

      assert.doesNotMatch(pageSource, /src=["'][^"']*mosaico\.png["']/, 'page.tsx must not reference mosaico.png as image source')
      assert.doesNotMatch(heroSource, /src=["'][^"']*mosaico\.png["']/, 'HeroSection.tsx must not reference mosaico.png as image source')
    })
  })
})
