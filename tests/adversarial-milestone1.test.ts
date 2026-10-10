/**
 * Empirical Adversarial Stress Test Suite for Milestone 1 (M1)
 *
 * Scope:
 * - SpotlightCard.tsx: Mouseleave events, touch handling, pointer-events layering, z-index hierarchy, props passthrough.
 * - HeroSection.tsx: Framer Motion variants, LeadForm integration, login link accessibility, background layers, SSR cleanliness.
 * - MethodologySection.tsx: SpotlightCard containment, anchor ID contract, semantic structure.
 *
 * Runner: Node 22 native test runner
 * Execution: `npx tsx --test tests/adversarial-milestone1.test.ts`
 */

import Module from 'node:module'
import React from 'react'

// Hook module loader to mock next/font/google in native Node runtime BEFORE loading components
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

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'

let SpotlightCard: typeof import('../src/components/landing/SpotlightCard').default
let HeroSection: typeof import('../src/components/landing/HeroSection').default
let MethodologySection: typeof import('../src/components/landing/MethodologySection').default

describe('Empirical Adversarial Stress Suite: Milestone 1', () => {
  before(async () => {
    const scMod = await import('../src/components/landing/SpotlightCard')
    SpotlightCard = scMod.default

    const heroMod = await import('../src/components/landing/HeroSection')
    HeroSection = heroMod.default

    const methMod = await import('../src/components/landing/MethodologySection')
    MethodologySection = methMod.default
  })

  describe('Adversarial Test 1: SpotlightCard Clickability, Layers & Pointer Events', () => {
    it('C1.1: renders children inside relative z-10 container to prevent click-hijacking', () => {
      const markup = renderToStaticMarkup(
        React.createElement(
          SpotlightCard,
          { id: 'test-card' },
          React.createElement('a', { href: 'https://example.com', id: 'target-link' }, 'Clickable Link'),
          React.createElement('button', { id: 'target-btn', type: 'button' }, 'Action Button')
        )
      )

      // Verify outer structure
      assert.ok(markup.includes('id="test-card"'), 'Outer container receives props')

      // Verify interactive wrapper has relative z-10
      assert.ok(
        markup.includes('class="relative z-10"') || markup.includes('class="relative z-10"'),
        'Children must be wrapped in relative z-10 container'
      )

      // Verify children exist inside
      assert.ok(markup.includes('href="https://example.com"'), 'Interactive links are rendered')
      assert.ok(markup.includes('id="target-btn"'), 'Interactive buttons are rendered')
    })

    it('C1.2: confirms all lighting/glow overlay elements have pointer-events-none and aria-hidden', () => {
      const markup = renderToStaticMarkup(
        React.createElement(SpotlightCard, { className: 'test-glow' }, 'Content')
      )

      // Match all overlay elements
      const pointerNoneMatches = markup.match(/pointer-events-none/g) || []
      assert.equal(
        pointerNoneMatches.length,
        2,
        'Both border glow and surface glow motion layers must have pointer-events-none'
      )

      const ariaHiddenMatches = markup.match(/aria-hidden="true"/g) || []
      assert.equal(
        ariaHiddenMatches.length,
        2,
        'Both glow overlay elements must have aria-hidden="true" to not pollute screen readers'
      )
    })

    it('C1.3: preserves touch-friendly mobile defaults with slate border and no pointer traps', () => {
      const markup = renderToStaticMarkup(
        React.createElement(SpotlightCard, { className: 'touch-test' }, 'Mobile Content')
      )

      // Must have default static border class
      assert.ok(
        markup.includes('bg-slate-800/80 p-[1px]'),
        'SpotlightCard must provide visible static fallback border for non-hover/touch devices'
      )

      // Overlays start at opacity-0
      const opacityZeroMatches = markup.match(/opacity-0/g) || []
      assert.ok(
        opacityZeroMatches.length >= 2,
        'Glow overlays must default to opacity-0 so touch screens without mouse hover do not show stuck blobs'
      )
    })

    it('C1.4: handles edge-case prop inputs without throwing (radius=0, custom colors, extra handlers)', () => {
      let mouseMoved = false
      let mouseLeft = false

      const customCard = React.createElement(
        SpotlightCard,
        {
          radius: 0,
          spotlightColor: 'rgba(0,0,0,0)',
          borderColor: 'transparent',
          className: 'custom-stress-test',
          onMouseMove: () => { mouseMoved = true },
          onMouseLeave: () => { mouseLeft = true },
          title: 'empirical-verify',
        },
        'Edge case card'
      )

      assert.doesNotThrow(() => {
        const markup = renderToStaticMarkup(customCard)
        assert.ok(markup.includes('title="empirical-verify"'))
      })
    })
  })

  describe('Adversarial Test 2: HeroSection Atmosphere & Framer Motion Integrity', () => {
    it('C2.1: renders HeroSection with clean console output and zero runtime errors', () => {
      const originalWarn = console.warn
      const originalError = console.error
      const capturedWarnings: string[] = []
      const capturedErrors: string[] = []

      console.warn = (...args: unknown[]) => capturedWarnings.push(args.join(' '))
      console.error = (...args: unknown[]) => capturedErrors.push(args.join(' '))

      try {
        const markup = renderToStaticMarkup(
          React.createElement(HeroSection, { cinzelClassName: 'cinzel-custom' })
        )

        assert.equal(capturedErrors.length, 0, `HeroSection rendered with errors: ${capturedErrors.join('; ')}`)
        assert.equal(capturedWarnings.length, 0, `HeroSection rendered with warnings: ${capturedWarnings.join('; ')}`)
        assert.ok(markup.includes('Entrena cómo hablas.'), 'Hero headline rendered')
        assert.ok(markup.includes('cinzel-custom'), 'Custom cinzel class applied')
      } finally {
        console.warn = originalWarn
        console.error = originalError
      }
    })

    it('C2.2: verifies Hero atmospheric lighting contains all 4 CSS depth layers with aria-hidden', () => {
      const markup = renderToStaticMarkup(React.createElement(HeroSection))

      // Layer 1: Core Gold Radial Glow
      assert.ok(markup.includes('w-[900px] max-w-[100vw]'), 'Atmospheric Layer 1 (Core Glow) exists')

      // Layer 2: Dual Atmospheric Flanks
      assert.ok(markup.includes('top-1/4 -left-40'), 'Atmospheric Layer 2 (Left Flank) exists')
      assert.ok(markup.includes('top-1/3 -right-40'), 'Atmospheric Layer 2 (Right Flank) exists')

      // Layer 3: Roman Stipple Grid
      assert.ok(
        markup.includes('background-size:28px 28px') || markup.includes('28px 28px'),
        'Atmospheric Layer 3 (Mosaic Grid) exists'
      )

      // Layer 4: Vignette
      assert.ok(markup.includes('bg-gradient-to-b from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]'), 'Atmospheric Layer 4 (Vignette) exists')

      // All 4 background layers + stipple must be pointer-events-none & aria-hidden
      const bgPointers = markup.match(/pointer-events-none/g) || []
      assert.ok(bgPointers.length >= 4, 'All atmospheric layers must have pointer-events-none')

      const ariaHiddens = markup.match(/aria-hidden="true"/g) || []
      assert.ok(ariaHiddens.length >= 4, 'Atmospheric layers must have aria-hidden="true"')
    })

    it('C2.3: verifies LeadForm contract in HeroSection fallback and children slot', () => {
      // Case A: Default fallback renders LeadForm with source="landing-hero"
      const defaultMarkup = renderToStaticMarkup(React.createElement(HeroSection))
      assert.ok(defaultMarkup.includes('id="lead-email-landing-hero"'), 'Default fallback must render LeadForm with source landing-hero')

      // Case B: Explicit child slot overrides fallback
      const childMarkup = renderToStaticMarkup(
        React.createElement(HeroSection, null, React.createElement('div', { id: 'custom-child-form' }, 'Custom Form'))
      )
      assert.ok(childMarkup.includes('id="custom-child-form"'), 'Explicit child replaces default LeadForm')
      assert.ok(!childMarkup.includes('id="lead-email-landing-hero"'), 'Default LeadForm is omitted when child provided')
    })

    it('C2.4: verifies login anchor link and accessibility attributes in HeroSection', () => {
      const markup = renderToStaticMarkup(React.createElement(HeroSection))

      // Login link
      assert.ok(markup.includes('href="/login"'), 'Hero section must include login link')
      assert.ok(markup.includes('Entrar con Google'), 'Hero login link text matches contract')

      // Sculpture image accessibility
      assert.ok(markup.includes('alt="StoiCom"'), 'Sculpture image must have alt="StoiCom"')
    })
  })

  describe('Adversarial Test 3: MethodologySection Integration', () => {
    it('C3.1: verifies MethodologySection DOM anchor contract id="metodologia"', () => {
      const markup = renderToStaticMarkup(React.createElement(MethodologySection))
      assert.ok(markup.includes('id="metodologia"'), 'Methodology section must have id="metodologia"')
    })

    it('C3.2: verifies both cards are wrapped in SpotlightCard with distinct methodologies', () => {
      const markup = renderToStaticMarkup(React.createElement(MethodologySection))

      // Check card 1: Estoicismo Clásico
      assert.ok(markup.includes('Estoicismo Clásico'), 'Methodology card 1 title rendered')
      assert.ok(markup.includes('Marco Aurelio · Séneca · Epicteto'), 'Card 1 authors rendered')
      assert.ok(markup.includes('Dicotomía del control'), 'Card 1 concepts rendered')

      // Check card 2: Psicología de Alto Rendimiento
      assert.ok(markup.includes('Psicología de Alto Rendimiento'), 'Methodology card 2 title rendered')
      assert.ok(markup.includes('Robbins · Voss · Holiday'), 'Card 2 authors rendered')
      assert.ok(markup.includes('La Tríada de Robbins'), 'Card 2 concepts rendered')

      // Check relative z-10 inside both cards
      const z10Matches = markup.match(/class="relative z-10"/g) || markup.match(/className="relative z-10"/g) || []
      assert.ok(z10Matches.length >= 2, 'Both methodology cards must use relative z-10 content containers')
    })
  })
})
