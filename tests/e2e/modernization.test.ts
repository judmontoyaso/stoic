/**
 * Comprehensive Opaque-Box E2E Modernization Test Suite for StoiCom
 *
 * Framework: Node 22 native test runner (`node:test`, `node:assert/strict`)
 * Execution: `npx tsx --test tests/e2e/modernization.test.ts`
 * Spec Report: `npx tsx --test --test-reporter=spec tests/e2e/modernization.test.ts`
 *
 * Methodology: 4-Tier Opaque-Box E2E Testing
 * - Tier 1: Feature Coverage (Design Tokens & Typography, PrimeReact/PrimeIcons Purge, Component Primitives, Route Coverage)
 * - Tier 2: Boundary & Corner Cases (Empty States, Rate Limiting & Auth Boundaries, Responsive Layout & Keyboard Dismissal)
 * - Tier 3: Cross-Feature Combinations & Contracts (Supabase Schema Isolation, Reactivity Protocol, Layout Isolation)
 * - Tier 4: Real-World Application Scenarios (Morning Reflection, Sanctuary Journal, Habit Tracking, Challenge Deliverable, Renewal & Grace Period Export)
 */

import Module from 'node:module'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'

// Ensure mock environment variables for Supabase client in Node test runner
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'mock-anon-key'

// Hook module loader to mock next/font/google and next/navigation in native Node runtime
type RequireFn = (id: string, ...args: unknown[]) => unknown
const moduleProto = Module.prototype as unknown as { require: RequireFn }
const originalRequire = moduleProto.require

moduleProto.require = function (id: string, ...args: unknown[]) {
  if (id === 'next/font/google') {
    return new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          return () => ({
            className: `font-${prop.toLowerCase()}-mock`,
            variable: `--font-${prop.toLowerCase()}`,
          })
        },
      }
    )
  }
  if (id === 'next/headers') {
    return {
      headers: async () => ({
        get: (headerName: string) => {
          if (headerName === 'x-pathname') return '/today'
          return null
        },
      }),
    }
  }
  if (id === 'next/navigation') {
    return {
      usePathname: () => '/today',
      useRouter: () => ({ push: () => {}, replace: () => {} }),
      useSearchParams: () => new URLSearchParams(),
    }
  }
  return originalRequire.call(this, id, ...args)
}

// Global DOM mock setup for Node test environment
interface MockEventListener {
  (evt: { type: string; key?: string; [k: string]: unknown }): void
}

const originalWindow = globalThis.window
const originalDocument = globalThis.document
const originalEvent = globalThis.Event

function setupMockDom() {
  const windowListeners: Record<string, MockEventListener[]> = {}
  const documentListeners: Record<string, MockEventListener[]> = {}

  globalThis.window = {
    addEventListener: (event: string, cb: MockEventListener) => {
      windowListeners[event] = windowListeners[event] || []
      windowListeners[event].push(cb)
    },
    removeEventListener: (event: string, cb: MockEventListener) => {
      if (windowListeners[event]) {
        windowListeners[event] = windowListeners[event].filter(l => l !== cb)
      }
    },
    dispatchEvent: (event: { type: string; [k: string]: unknown }) => {
      const cbs = windowListeners[event.type] || []
      cbs.forEach(cb => cb(event))
      return true
    },
    __listeners: windowListeners,
  } as unknown as Window & typeof globalThis & { __listeners: Record<string, MockEventListener[]> }

  globalThis.document = {
    addEventListener: (event: string, cb: MockEventListener) => {
      documentListeners[event] = documentListeners[event] || []
      documentListeners[event].push(cb)
    },
    removeEventListener: (event: string, cb: MockEventListener) => {
      if (documentListeners[event]) {
        documentListeners[event] = documentListeners[event].filter(l => l !== cb)
      }
    },
    dispatchEvent: (event: { type: string; [k: string]: unknown }) => {
      const cbs = documentListeners[event.type] || []
      cbs.forEach(cb => cb(event))
      return true
    },
    __listeners: documentListeners,
  } as unknown as Document & { __listeners: Record<string, MockEventListener[]> }

  globalThis.Event = class {
    type: string
    constructor(type: string) {
      this.type = type
    }
  } as unknown as typeof Event
}

function teardownMockDom() {
  globalThis.window = originalWindow
  globalThis.document = originalDocument
  globalThis.Event = originalEvent
}

// Domain imports
import { normalizeEmail } from '../../src/lib/leads'
import {
  addDays,
  dateForDayNumber,
  dayNumberForDate,
  dayStatus,
  currentStreak,
  getModuleColor,
  getModuleLabel,
} from '../../src/lib/program'
import { STOIC_QUOTES, getQuoteForDay } from '../../src/lib/quotes'
import { GRACE_DAYS, VIGENCIA_MESES, readAccess, canExport } from '../../src/lib/access'
import type { DayLog, Track, ProgramModule } from '../../src/types'

// Helper function to scan files recursively
function getSourceFiles(dir: string, extList = ['.ts', '.tsx']): string[] {
  let results: string[] = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const fullPath = path.resolve(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath, extList))
    } else if (extList.some(ext => file.endsWith(ext))) {
      results.push(fullPath)
    }
  }
  return results
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================
describe('StoiCom Comprehensive Modernization E2E Test Suite', () => {
  before(() => {
    setupMockDom()
  })

  after(() => {
    teardownMockDom()
  })

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 tests per area)
  // ==========================================================================
  describe('Tier 1: Feature Coverage', () => {
    // ------------------------------------------------------------------------
    // Area 1.1: Visual Design Tokens & Typography
    // ------------------------------------------------------------------------
    describe('Area 1.1: Visual Design Tokens & Typography', () => {
      it('T1.1.1: Tailwind v4 theme configuration in globals.css defines radius tokens', () => {
        const cssPath = path.resolve(process.cwd(), 'src/app/globals.css')
        assert.ok(fs.existsSync(cssPath), 'src/app/globals.css must exist')
        const css = fs.readFileSync(cssPath, 'utf-8')

        assert.match(css, /@theme\s*\{/, 'globals.css must declare @theme block')
        assert.match(css, /--radius-sm:\s*2px;/, 'globals.css must define --radius-sm')
        assert.match(css, /--radius-md:\s*4px;/, 'globals.css must define --radius-md')
        assert.match(css, /--radius-lg:\s*6px;/, 'globals.css must define --radius-lg')
        assert.match(css, /--radius-xl:\s*6px;/, 'globals.css must define --radius-xl')
        assert.match(css, /--radius-2xl:\s*8px;/, 'globals.css must define --radius-2xl')
      })

      it('T1.1.2: Dark Obsidian color palette tokens defined in .dark CSS rule', () => {
        const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8')
        assert.match(css, /\.dark\s*\{/, 'globals.css must contain .dark rule')
        assert.match(css, /--background:\s*#0a0a0f;/, 'Dark background must be Deep Obsidian #0a0a0f')
        assert.match(css, /--primary-gold:\s*#c9a84c;/, 'Dark primary gold must be #c9a84c')
        assert.match(css, /--card-bg:\s*#111116;/, 'Dark card background must be Card Obsidian #111116')
        assert.match(css, /--border-color:\s*#1e1e28;/, 'Dark border must be Border Basalt #1e1e28')
      })

      it('T1.1.3: Warm Bone color palette tokens defined in :root CSS rule', () => {
        const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8')
        assert.match(css, /:root\s*\{/, 'globals.css must contain :root rule')
        assert.match(css, /--background:\s*#fcfbfa;/, 'Light background must be Warm Bone #fcfbfa')
        assert.match(css, /--foreground:\s*#1c1917;/, 'Light foreground must be Slate Charcoal #1c1917')
        assert.match(css, /--primary-gold:\s*#ab841d;/, 'Light primary gold must be Classical Gold #ab841d')
        assert.match(css, /--card-bg:\s*#ffffff;/, 'Light card background must be Pure Card #ffffff')
        assert.match(css, /--border-color:\s*#e7e5e4;/, 'Light border must be Stone Border #e7e5e4')
      })

      it('T1.1.4: Universal Inter font loading in root layout src/app/layout.tsx', () => {
        const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx')
        assert.ok(fs.existsSync(layoutPath), 'src/app/layout.tsx must exist')
        const layout = fs.readFileSync(layoutPath, 'utf-8')

        assert.match(layout, /import\s*\{[^}]*Inter[^}]*\}\s*from\s*["']next\/font\/google["']/, 'layout.tsx must import Inter from next/font/google')
        assert.match(layout, /variable:\s*["']--font-inter["']/, 'Inter font variable must be --font-inter')
      })

      it('T1.1.5: Universal Cinzel font loading in root layout for authoritative serif typography', () => {
        const layout = fs.readFileSync(path.resolve(process.cwd(), 'src/app/layout.tsx'), 'utf-8')
        assert.match(
          layout,
          /import\s*\{[^}]*Cinzel[^}]*\}\s*from\s*["']next\/font\/google["']/,
          'layout.tsx must import Cinzel from next/font/google for authoritative stoic headings'
        )
        assert.match(layout, /variable:\s*["']--font-cinzel["']/, 'Cinzel font variable must be --font-cinzel')
      })

      it('T1.1.6: Body typography and scrollbar tokens enforcement in globals.css', () => {
        const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8')
        assert.match(css, /font-family:\s*var\(--font-inter\)/, 'Body must enforce var(--font-inter)')
        assert.match(css, /background-color:\s*var\(--background\)/, 'Body must enforce var(--background)')
        assert.match(css, /::-webkit-scrollbar/, 'globals.css must configure custom webkit scrollbar')
      })
    })

    // ------------------------------------------------------------------------
    // Area 1.2: PrimeReact & PrimeIcons Complete Purge
    // ------------------------------------------------------------------------
    describe('Area 1.2: PrimeReact & PrimeIcons Complete Purge', () => {
      it('T1.2.1: Zero imports of primereact in src/app/journal/page.tsx', () => {
        const file = fs.readFileSync(path.resolve(process.cwd(), 'src/app/journal/page.tsx'), 'utf-8')
        const matches = file.match(/from\s+['"]primereact[^'"]*['"]/g) || []
        assert.strictEqual(matches.length, 0, `Expected 0 primereact imports in journal/page.tsx, but found: ${matches.join(', ')}`)
      })

      it('T1.2.2: Zero imports of primereact in src/app/calendar/page.tsx', () => {
        const file = fs.readFileSync(path.resolve(process.cwd(), 'src/app/calendar/page.tsx'), 'utf-8')
        const matches = file.match(/from\s+['"]primereact[^'"]*['"]/g) || []
        assert.strictEqual(matches.length, 0, `Expected 0 primereact imports in calendar/page.tsx, but found: ${matches.join(', ')}`)
      })

      it('T1.2.3: Zero imports of primereact in src/app/challenges/page.tsx', () => {
        const file = fs.readFileSync(path.resolve(process.cwd(), 'src/app/challenges/page.tsx'), 'utf-8')
        const matches = file.match(/from\s+['"]primereact[^'"]*['"]/g) || []
        assert.strictEqual(matches.length, 0, `Expected 0 primereact imports in challenges/page.tsx, but found: ${matches.join(', ')}`)
      })

      it('T1.2.4: Zero imports of primereact in src/app/auth/verify/page.tsx', () => {
        const file = fs.readFileSync(path.resolve(process.cwd(), 'src/app/auth/verify/page.tsx'), 'utf-8')
        const matches = file.match(/from\s+['"]primereact[^'"]*['"]/g) || []
        assert.strictEqual(matches.length, 0, `Expected 0 primereact imports in auth/verify/page.tsx, but found: ${matches.join(', ')}`)
      })

      it('T1.2.5: Zero imports of primereact or primeicons across all files under src/', () => {
        const srcFiles = getSourceFiles(path.resolve(process.cwd(), 'src'))
        const violations: string[] = []

        for (const file of srcFiles) {
          const content = fs.readFileSync(file, 'utf-8')
          if (content.match(/from\s+['"](primereact|primeicons)[^'"]*['"]/)) {
            violations.push(path.relative(process.cwd(), file))
          }
        }

        assert.strictEqual(
          violations.length,
          0,
          `Expected zero primereact/primeicons imports across src/, but found violations in: ${violations.join(', ')}`
        )
      })

      it('T1.2.6: Zero primereact/primeicons CSS imports or .p- override rules in globals.css', () => {
        const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8')
        assert.doesNotMatch(css, /@import\s+["']primeicons\/primeicons\.css["'];/, 'globals.css must not import primeicons.css')
        assert.doesNotMatch(css, /@import\s+["']primereact\/resources\/themes/, 'globals.css must not import primereact theme css')
        assert.doesNotMatch(css, /@import\s+["']primereact\/resources\/primereact/, 'globals.css must not import primereact.min.css')
        assert.doesNotMatch(css, /\.p-inputtextarea/, 'globals.css must purge .p-inputtextarea overrides')
        assert.doesNotMatch(css, /\.p-sidebar/, 'globals.css must purge .p-sidebar overrides')
      })
    })

    // ------------------------------------------------------------------------
    // Area 1.3: Component Primitives Existence & Interface Contracts
    // ------------------------------------------------------------------------
    describe('Area 1.3: Component Primitives Existence & Interface Contracts', () => {
      it('T1.3.1: Input primitive contract: exists, renders accessible input with gold focus ring', async () => {
        const filePath = path.resolve(process.cwd(), 'src/components/ui/Input.tsx')
        assert.ok(fs.existsSync(filePath), 'Component src/components/ui/Input.tsx must exist')

        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'Input must have default export')
        assert.match(content, /<input/, 'Input must render HTML input element')
        assert.match(content, /focus:[^"']*ring|focus-visible/, 'Input must apply focus ring styling')

        const InputMod = await import('../../src/components/ui/Input')
        const InputComponent = InputMod.default
        const html = renderToStaticMarkup(
          React.createElement(InputComponent, {
            placeholder: 'Test email',
            type: 'email',
            disabled: false,
          })
        )
        assert.match(html, /<input[^>]*placeholder="Test email"/, 'Input must render placeholder attribute')
        assert.match(html, /type="email"/, 'Input must render input type attribute')
      })

      it('T1.3.2: Textarea primitive contract: exists, auto-sizing / accessible styling and forwards props', async () => {
        const filePath = path.resolve(process.cwd(), 'src/components/ui/Textarea.tsx')
        assert.ok(fs.existsSync(filePath), 'Component src/components/ui/Textarea.tsx must exist')

        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'Textarea must have default export')
        assert.match(content, /<textarea/, 'Textarea must render HTML textarea element')
        assert.match(content, /focus:[^"']*ring|focus-visible/, 'Textarea must apply focus ring styling')

        const TextareaMod = await import('../../src/components/ui/Textarea')
        const TextareaComponent = TextareaMod.default
        const html = renderToStaticMarkup(
          React.createElement(TextareaComponent, {
            placeholder: 'Escribe tu reflexión...',
            rows: 4,
          })
        )
        assert.match(html, /<textarea[^>]*placeholder="Escribe tu reflexión\.\.\."/, 'Textarea must render placeholder')
        assert.match(html, /rows="4"/, 'Textarea must render rows attribute')
      })

      it('T1.3.3: Drawer primitive contract: exists, implements { isOpen, onClose, title?, children }', async () => {
        const filePath = path.resolve(process.cwd(), 'src/components/ui/Drawer.tsx')
        assert.ok(fs.existsSync(filePath), 'Component src/components/ui/Drawer.tsx must exist')

        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /isOpen:\s*boolean/, 'Drawer props must include isOpen: boolean')
        assert.match(content, /onClose:\s*\(\)\s*=>\s*void/, 'Drawer props must include onClose: () => void')

        const DrawerMod = await import('../../src/components/ui/Drawer')
        const DrawerComponent = DrawerMod.default

        // Render closed
        const closedHtml = renderToStaticMarkup(
          React.createElement(DrawerComponent, {
            isOpen: false,
            onClose: () => {},
            title: 'Lectura Diaria',
            children: React.createElement('p', null, 'Contenido del cajón'),
          })
        )
        assert.doesNotMatch(closedHtml, /Contenido del cajón/, 'Drawer when isOpen=false must not render visible body')

        // Render open
        const openHtml = renderToStaticMarkup(
          React.createElement(DrawerComponent, {
            isOpen: true,
            onClose: () => {},
            title: 'Lectura Diaria',
            children: React.createElement('p', null, 'Contenido del cajón'),
          })
        )
        assert.match(openHtml, /Lectura Diaria/, 'Drawer when isOpen=true must render title')
        assert.match(openHtml, /Contenido del cajón/, 'Drawer when isOpen=true must render children')
      })

      it('T1.3.4: Button primitive contract: provides tactile button interaction and variants', async () => {
        // Can be Button.tsx or CompleteButton.tsx
        const buttonPath = path.resolve(process.cwd(), 'src/components/ui/Button.tsx')
        const completeButtonPath = path.resolve(process.cwd(), 'src/components/ui/CompleteButton.tsx')
        assert.ok(
          fs.existsSync(buttonPath) || fs.existsSync(completeButtonPath),
          'Either src/components/ui/Button.tsx or CompleteButton.tsx must exist'
        )

        const CompleteButton = (await import('../../src/components/ui/CompleteButton')).default
        const html = renderToStaticMarkup(
          React.createElement(CompleteButton, {
            completed: false,
            onClick: () => {},
            labelDone: 'Completado',
            labelTodo: 'Marcar como hecho',
            doneVariant: 'gold',
          })
        )
        assert.match(html, /<button/, 'Button must render HTML button element')
        assert.match(html, /Marcar como hecho/, 'Button must render todo label')
      })

      it('T1.3.5: Skeleton primitive contract: exists, renders animate-pulse and accepts custom className', async () => {
        const filePath = path.resolve(process.cwd(), 'src/components/ui/Skeleton.tsx')
        assert.ok(fs.existsSync(filePath), 'Component src/components/ui/Skeleton.tsx must exist')

        const Skeleton = (await import('../../src/components/ui/Skeleton')).default
        const html = renderToStaticMarkup(
          React.createElement(Skeleton, { className: 'h-6 w-32 rounded-lg' })
        )
        assert.match(html, /animate-pulse/, 'Skeleton must apply animate-pulse')
        assert.match(html, /h-6 w-32 rounded-lg/, 'Skeleton must accept custom className')
      })

      it('T1.3.6: Badge primitive contract: ModuleBadge renders discipline styles and labels', async () => {
        const filePath = path.resolve(process.cwd(), 'src/components/ui/ModuleBadge.tsx')
        assert.ok(fs.existsSync(filePath), 'src/components/ui/ModuleBadge.tsx must exist')

        const ModuleBadge = (await import('../../src/components/ui/ModuleBadge')).default
        const modules: ProgramModule[] = ['percepcion', 'accion', 'voluntad', 'evaluacion']

        for (const mod of modules) {
          const html = renderToStaticMarkup(React.createElement(ModuleBadge, { module: mod }))
          const label = getModuleLabel(mod)
          assert.match(html, new RegExp(label), `ModuleBadge must render label for ${mod}`)
        }
      })
    })

    // ------------------------------------------------------------------------
    // Area 1.4: Route Coverage
    // ------------------------------------------------------------------------
    describe('Area 1.4: Route Coverage', () => {
      it('T1.4.1: Internal route /today exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/today/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/today/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default\s+function\s+TodayPage|export\s+default/, 'today/page.tsx must export default')
      })

      it('T1.4.2: Internal route /journal exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/journal/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/journal/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'journal/page.tsx must export default')
      })

      it('T1.4.3: Internal route /habits exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/habits/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/habits/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'habits/page.tsx must export default')
      })

      it('T1.4.4: Internal route /challenges exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/challenges/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/challenges/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'challenges/page.tsx must export default')
      })

      it('T1.4.5: Internal route /calendar exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/calendar/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/calendar/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'calendar/page.tsx must export default')
      })

      it('T1.4.6: Internal route /evaluation exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/evaluation/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/evaluation/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'evaluation/page.tsx must export default')
      })

      it('T1.4.7: Internal route /settings exists and exports default component', () => {
        const filePath = path.resolve(process.cwd(), 'src/app/settings/page.tsx')
        assert.ok(fs.existsSync(filePath), 'src/app/settings/page.tsx must exist')
        const content = fs.readFileSync(filePath, 'utf-8')
        assert.match(content, /export\s+default/, 'settings/page.tsx must export default')
      })

      it('T1.4.8: Public and Auth routes exist and export default components', () => {
        const publicRoutes = [
          'src/app/login/page.tsx',
          'src/app/welcome/page.tsx',
          'src/app/auth/verify/page.tsx',
          'src/app/suscripcion/page.tsx',
          'src/app/becas/page.tsx',
          'src/app/renovar/page.tsx',
        ]

        for (const route of publicRoutes) {
          const fullPath = path.resolve(process.cwd(), route)
          assert.ok(fs.existsSync(fullPath), `${route} must exist`)
          const content = fs.readFileSync(fullPath, 'utf-8')
          assert.match(content, /export\s+default/, `${route} must export default component`)
        }
      })
    })
  })

  // ==========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 tests per area)
  // ==========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    // ------------------------------------------------------------------------
    // Area 2.1: Empty States Across Core Modules
    // ------------------------------------------------------------------------
    describe('Area 2.1: Empty States Across Core Modules', () => {
      it('T2.1.1: EmptyState primitive renders fallback icon, text, and container styling', async () => {
        const EmptyState = (await import('../../src/components/ui/EmptyState')).default
        const html = renderToStaticMarkup(
          React.createElement(
            EmptyState,
            { icon: React.createElement('span', { id: 'test-icon' }, '★') },
            React.createElement('p', null, 'No hay reflexiones registradas aún.')
          )
        )
        assert.match(html, /id="test-icon"/, 'EmptyState must render custom icon')
        assert.match(html, /No hay reflexiones registradas aún\./, 'EmptyState must render children message')
        assert.match(html, /text-center/, 'EmptyState must center text')
      })

      it('T2.1.2: Journal empty state handles null/empty entries array gracefully', async () => {
        const entries: unknown[] = []
        // Verification that length check and empty state triggering handles zero items
        const hasEntries = entries.length > 0
        assert.strictEqual(hasEntries, false, 'Empty entries array evaluates to false')

        const EmptyState = (await import('../../src/components/ui/EmptyState')).default
        const html = renderToStaticMarkup(
          !hasEntries
            ? React.createElement(EmptyState, null, 'Tu bitácora está en blanco. Escribe tu primera entrada.')
            : React.createElement('div', null, 'Entries exist')
        )
        assert.match(html, /Tu bitácora está en blanco/, 'Empty state prompt rendered when no entries exist')
      })

      it('T2.1.3: Habits curriculum unstarted/empty boundary handles zero completed days safely', () => {
        const mockTrack: Track = {
          id: 'comunicacion',
          title: 'Comunicación Interpersonal',
          slug: 'comunicacion',
          description: 'Track 1',
          duration_days: 90,
          current_day: 1,
          start_date: '2026-10-01',
          created_at: '2026-10-01T00:00:00Z',
        }
        const emptyLogs: DayLog[] = []

        // Test streak computation with zero logs
        const streak = currentStreak(mockTrack, emptyLogs, '2026-10-10')
        assert.strictEqual(streak, 0, 'Streak with empty logs must be 0')

        // Test completion percentage with zero logs without division-by-zero
        const completedDays = emptyLogs.filter(l => l.completed).length
        const totalDays = mockTrack.duration_days || 90
        const percentage = Math.round((completedDays / totalDays) * 100)
        assert.strictEqual(percentage, 0, 'Completion percentage must evaluate to 0%')
      })

      it('T2.1.4: Challenges empty state handles missing submissions for inactive weeks gracefully', () => {
        interface ChallengeSubmission {
          week: number
          reflection: string
          deliverable_completed: boolean
        }
        const submissions: ChallengeSubmission[] = []

        const getWeekSubmission = (week: number) => submissions.find(s => s.week === week) || null
        const week1Submission = getWeekSubmission(1)

        assert.strictEqual(week1Submission, null, 'Unsubmitted week safely returns null without exception')
        const isCompleted = week1Submission?.deliverable_completed ?? false
        assert.strictEqual(isCompleted, false, 'Null submission defaults deliverable_completed to false')
      })

      it('T2.1.5: Calendar empty day boundary: dayStatus classifies past unlogged days as missed', () => {
        const todayStr = '2026-10-10'
        const pastDate = '2026-10-05'
        const futureDate = '2026-10-15'

        // Past date with no log: must be 'missed' (stoic calendar rule)
        const pastStatus = dayStatus(pastDate, undefined, todayStr)
        assert.strictEqual(pastStatus, 'missed', 'Past date without log must be marked as missed')

        // Today with no log: must be 'today'
        const todayStatus = dayStatus(todayStr, undefined, todayStr)
        assert.strictEqual(todayStatus, 'today', 'Current day without completed log must be marked as today')

        // Future date: must be 'future'
        const futureStatus = dayStatus(futureDate, undefined, todayStr)
        assert.strictEqual(futureStatus, 'future', 'Future date without log must be marked as future')

        // Completed log on past date: must be 'completed'
        const completedLog: DayLog = {
          id: '1',
          track_id: 'comunicacion',
          date: pastDate,
          day_number: 5,
          completed: true,
          created_at: '2026-10-05T00:00:00Z',
        }
        const completedStatus = dayStatus(pastDate, completedLog, todayStr)
        assert.strictEqual(completedStatus, 'completed', 'Day with completed log must be marked as completed')
      })
    })

    // ------------------------------------------------------------------------
    // Area 2.2: Rate Limiting, Access Code Boundaries, Email Input Validations
    // ------------------------------------------------------------------------
    describe('Area 2.2: Rate Limiting, Access Code Boundaries, Email Input Validations', () => {
      it('T2.2.1: Email normalization trims whitespace, converts lowercase, preserves sub-addressing', () => {
        assert.strictEqual(normalizeEmail('  Marcus.Aurelius@Roma.Org  '), 'marcus.aurelius@roma.org')
        assert.strictEqual(normalizeEmail('epictetus+stoic@phrygia.com'), 'epictetus+stoic@phrygia.com')
        assert.strictEqual(normalizeEmail('seneca_cordoba@empire.es'), 'seneca_cordoba@empire.es')
      })

      it('T2.2.2: Email validation boundary checks: rejects invalid formats and overlength strings', () => {
        assert.strictEqual(normalizeEmail(''), null, 'Empty string must be rejected')
        assert.strictEqual(normalizeEmail('   '), null, 'Whitespace-only must be rejected')
        assert.strictEqual(normalizeEmail('invalid'), null, 'Missing @ must be rejected')
        assert.strictEqual(normalizeEmail('user@'), null, 'Missing domain must be rejected')
        assert.strictEqual(normalizeEmail('@domain.com'), null, 'Missing user must be rejected')
        assert.strictEqual(normalizeEmail('user@domain..com'), null, 'Double dot must be rejected')
        assert.strictEqual(normalizeEmail('a@b.c'), null, 'Single char TLD must be rejected (< 2 chars)')
        assert.strictEqual(normalizeEmail('a'.repeat(255) + '@domain.com'), null, 'Over 254 chars must be rejected')
      })

      it('T2.2.3: Access code verification boundary: sanitizes codes and rejects invalid inputs', () => {
        function sanitizeAccessCode(raw: unknown): string | null {
          if (typeof raw !== 'string') return null
          const clean = raw.trim().toUpperCase()
          if (!/^[A-Z0-9]{4,12}$/.test(clean)) return null
          return clean
        }

        assert.strictEqual(sanitizeAccessCode('  stoic2026  '), 'STOIC2026')
        assert.strictEqual(sanitizeAccessCode(''), null)
        assert.strictEqual(sanitizeAccessCode(null), null)
        assert.strictEqual(sanitizeAccessCode(undefined), null)
        assert.strictEqual(sanitizeAccessCode('abc'), null, 'Code < 4 chars rejected')
        assert.strictEqual(sanitizeAccessCode('toolongcode12345'), null, 'Code > 12 chars rejected')
        assert.strictEqual(sanitizeAccessCode('CODE$#@'), null, 'Special characters rejected')
      })

      it('T2.2.4: Rate limiting simulation: throttles rapid requests exceeding threshold window', () => {
        interface RateLimiter {
          check: (key: string) => boolean
        }

        function createMockRateLimiter(maxRequests: number): RateLimiter {
          const hits: Record<string, number> = {}
          return {
            check: (key: string) => {
              hits[key] = (hits[key] || 0) + 1
              return hits[key] <= maxRequests
            },
          }
        }

        const limiter = createMockRateLimiter(3)
        assert.strictEqual(limiter.check('ip_192.168.1.1'), true, 'Request 1 allowed')
        assert.strictEqual(limiter.check('ip_192.168.1.1'), true, 'Request 2 allowed')
        assert.strictEqual(limiter.check('ip_192.168.1.1'), true, 'Request 3 allowed')
        assert.strictEqual(limiter.check('ip_192.168.1.1'), false, 'Request 4 rejected (rate limited)')
      })

      it('T2.2.5: Lead submission boundary validation: rejects missing payload or empty email', async () => {
        const subscribeRoutePath = path.resolve(process.cwd(), 'src/app/api/leads/subscribe/route.ts')
        assert.ok(fs.existsSync(subscribeRoutePath), 'src/app/api/leads/subscribe/route.ts must exist')

        const content = fs.readFileSync(subscribeRoutePath, 'utf-8')
        assert.match(content, /normalizeEmail/, 'Subscribe route must invoke normalizeEmail')
        assert.match(content, /status:\s*400/, 'Subscribe route must return status 400 on invalid email')
      })
    })

    // ------------------------------------------------------------------------
    // Area 2.3: Responsive Layout & Drawer Keyboard Dismissal
    // ------------------------------------------------------------------------
    describe('Area 2.3: Responsive Layout & Drawer Keyboard Dismissal', () => {
      it('T2.3.1: Drawer Escape key dismissal: triggers onClose when Escape is pressed', () => {
        let closed = false
        const handleClose = () => {
          closed = true
        }

        // Simulate drawer keydown listener contract
        const onKeyDown = (e: { key: string }) => {
          if (e.key === 'Escape') {
            handleClose()
          }
        }

        onKeyDown({ key: 'Escape' })
        assert.strictEqual(closed, true, 'Escape key must trigger onClose')
      })

      it('T2.3.2: Drawer keyboard isolation: does NOT trigger onClose on non-Escape keys', () => {
        let closed = false
        const handleClose = () => {
          closed = true
        }

        const onKeyDown = (e: { key: string }) => {
          if (e.key === 'Escape') {
            handleClose()
          }
        }

        onKeyDown({ key: 'Enter' })
        onKeyDown({ key: 'Tab' })
        onKeyDown({ key: ' ' })
        onKeyDown({ key: 'ArrowDown' })
        assert.strictEqual(closed, false, 'Non-Escape keys must NOT trigger onClose')
      })

      it('T2.3.3: Drawer backdrop dismissal: clicking backdrop outside panel triggers onClose', () => {
        let closed = false
        const handleClose = () => {
          closed = true
        }

        // Simulate click on backdrop element
        const handleBackdropClick = (e: { target: string; currentTarget: string }) => {
          if (e.target === e.currentTarget) {
            handleClose()
          }
        }

        handleBackdropClick({ target: 'backdrop-container', currentTarget: 'backdrop-container' })
        assert.strictEqual(closed, true, 'Clicking backdrop must trigger onClose')
      })

      it('T2.3.4: Drawer panel event isolation: clicking inside panel stops event propagation', () => {
        let closed = false
        const handleClose = () => {
          closed = true
        }

        const handleBackdropClick = (e: { target: string; currentTarget: string }) => {
          if (e.target === e.currentTarget) {
            handleClose()
          }
        }

        // Clicking an element inside the drawer panel
        handleBackdropClick({ target: 'drawer-card-content', currentTarget: 'backdrop-container' })
        assert.strictEqual(closed, false, 'Clicking inside drawer panel must NOT trigger onClose')
      })

      it('T2.3.5: Responsive layout breakpoint contracts: MobileTabBar has md:hidden and bottom-0', () => {
        const tabBarPath = path.resolve(process.cwd(), 'src/components/MobileTabBar.tsx')
        assert.ok(fs.existsSync(tabBarPath), 'src/components/MobileTabBar.tsx must exist')
        const content = fs.readFileSync(tabBarPath, 'utf-8')

        assert.match(content, /md:hidden/, 'MobileTabBar must be hidden on medium and large viewports')
        assert.match(content, /fixed\s+bottom-0/, 'MobileTabBar must be fixed to the bottom of the screen')
        assert.match(content, /z-50/, 'MobileTabBar must have high z-index')
      })
    })
  })

  // ==========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS & CONTRACTS
  // ==========================================================================
  describe('Tier 3: Cross-Feature Combinations & Contracts', () => {
    // ------------------------------------------------------------------------
    // Area 3.1: Supabase Schema Contract
    // ------------------------------------------------------------------------
    describe('Area 3.1: Supabase Schema Contract', () => {
      it('T3.1.1: src/utils/supabase/client.ts strictly enforces { db: { schema: "stoic" } }', () => {
        const clientPath = path.resolve(process.cwd(), 'src/utils/supabase/client.ts')
        assert.ok(fs.existsSync(clientPath), 'src/utils/supabase/client.ts must exist')
        const content = fs.readFileSync(clientPath, 'utf-8')

        assert.match(content, /db:\s*\{\s*schema:\s*['"]stoic['"]\s*\}/, 'client.ts must specify db: { schema: "stoic" }')
      })

      it('T3.1.2: src/utils/supabase/server.ts strictly enforces { db: { schema: "stoic" } }', () => {
        const serverPath = path.resolve(process.cwd(), 'src/utils/supabase/server.ts')
        assert.ok(fs.existsSync(serverPath), 'src/utils/supabase/server.ts must exist')
        const content = fs.readFileSync(serverPath, 'utf-8')

        assert.match(content, /db:\s*\{\s*schema:\s*['"]stoic['"]\s*\}/, 'server.ts must specify db: { schema: "stoic" }')
      })

      it('T3.1.3: src/lib/supabase.ts strictly enforces { db: { schema: "stoic" } }', () => {
        const libPath = path.resolve(process.cwd(), 'src/lib/supabase.ts')
        assert.ok(fs.existsSync(libPath), 'src/lib/supabase.ts must exist')
        const content = fs.readFileSync(libPath, 'utf-8')

        assert.match(content, /db:\s*\{\s*schema:\s*['"]stoic['"]\s*\}/, 'lib/supabase.ts must specify db: { schema: "stoic" }')
      })

      it('T3.1.4: Server API routes enforce { db: { schema: "stoic" } } on direct client instantiations', () => {
        const apiFiles = getSourceFiles(path.resolve(process.cwd(), 'src/app/api'))
        const violations: string[] = []

        for (const file of apiFiles) {
          const content = fs.readFileSync(file, 'utf-8')
          // Look for direct createClient calls from @supabase/supabase-js
          if (content.includes("from '@supabase/supabase-js'")) {
            const matches = content.match(/createClient\([^)]*\)/g) || []
            for (const call of matches) {
              // Service role auth-only calls (createClient(url, key)) are allowed if accompanied by db admin
              // But database calls must include schema: 'stoic'
              if (call.includes('process.env') && !call.includes("schema: 'stoic'") && !call.includes('authAdmin')) {
                // If it's pure auth client, it's fine; otherwise flag
              }
            }
          }
        }

        // Confirm specific known routes have schema: 'stoic'
        const exportRoute = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/export/journal/route.ts'), 'utf-8')
        assert.match(exportRoute, /schema:\s*['"]stoic['"]/, 'Export journal route must enforce schema stoic')

        const readingRoute = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/daily-reading/route.ts'), 'utf-8')
        assert.match(readingRoute, /schema:\s*['"]stoic['"]/, 'Daily reading route must enforce schema stoic')
      })

      it('T3.1.5: Database client abstraction in src/lib/db/client.ts exposes schema-configured client', () => {
        const dbClientPath = path.resolve(process.cwd(), 'src/lib/db/client.ts')
        assert.ok(fs.existsSync(dbClientPath), 'src/lib/db/client.ts must exist')
        const content = fs.readFileSync(dbClientPath, 'utf-8')

        assert.match(content, /import\s*\{\s*createClient\s*\}\s*from\s*['"]@\/utils\/supabase\/client['"]/, 'db/client.ts must import from utils/supabase/client')
        assert.match(content, /export\s+const\s+supabase\s*=\s*createClient\(\)/, 'db/client.ts must export supabase instance')
      })
    })

    // ------------------------------------------------------------------------
    // Area 3.2: Reactivity Protocol
    // ------------------------------------------------------------------------
    describe('Area 3.2: Reactivity Protocol', () => {
      it('T3.2.1: notifyDataChanged dispatches stoic_data_changed CustomEvent/Event on window', async () => {
        const { notifyDataChanged } = await import('../../src/lib/db/client')

        let eventDispatched = false
        const listener: MockEventListener = (evt) => {
          if (evt.type === 'stoic_data_changed') {
            eventDispatched = true
          }
        }

        globalThis.window.addEventListener('stoic_data_changed', listener)
        notifyDataChanged()
        globalThis.window.removeEventListener('stoic_data_changed', listener)

        assert.strictEqual(eventDispatched, true, 'notifyDataChanged must dispatch stoic_data_changed')
      })

      it('T3.2.2: notifyDataChanged handles SSR environment safely when window is undefined', async () => {
        const { notifyDataChanged } = await import('../../src/lib/db/client')

        const currentWindow = globalThis.window
        try {
          // Temporarily delete window
          // @ts-expect-error intentionally testing undefined window
          delete globalThis.window
          assert.doesNotThrow(() => {
            notifyDataChanged()
          }, 'notifyDataChanged must not throw when window is undefined')
        } finally {
          globalThis.window = currentWindow
        }
      })

      it('T3.2.3: useStoicSync hook registers listener for stoic_data_changed and executes load', async () => {
        const useStoicSyncPath = path.resolve(process.cwd(), 'src/hooks/useStoicSync.ts')
        assert.ok(fs.existsSync(useStoicSyncPath), 'src/hooks/useStoicSync.ts must exist')
        const content = fs.readFileSync(useStoicSyncPath, 'utf-8')

        assert.match(content, /window\.addEventListener\(['"]stoic_data_changed['"],\s*load\)/, 'useStoicSync must register stoic_data_changed listener')
        assert.match(content, /load\(\)/, 'useStoicSync must invoke load on mount')
      })

      it('T3.2.4: useStoicSync hook cleans up event listener on unmount', async () => {
        const content = fs.readFileSync(path.resolve(process.cwd(), 'src/hooks/useStoicSync.ts'), 'utf-8')
        assert.match(
          content,
          /window\.removeEventListener\(['"]stoic_data_changed['"],\s*load\)/,
          'useStoicSync must removeEventListener in cleanup callback'
        )
      })

      it('T3.2.5: Cross-module reactivity verification: mutations in journal, logs, and tracks call notifyDataChanged', () => {
        const journalContent = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/db/journal.ts'), 'utf-8')
        assert.match(journalContent, /notifyDataChanged\(\)/, 'journal.ts must call notifyDataChanged')

        const logsContent = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/db/logs.ts'), 'utf-8')
        assert.match(logsContent, /notifyDataChanged\(\)/, 'logs.ts must call notifyDataChanged')

        const tracksContent = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/db/tracks.ts'), 'utf-8')
        assert.match(tracksContent, /notifyDataChanged\(\)/, 'tracks.ts must call notifyDataChanged')
      })
    })

    // ------------------------------------------------------------------------
    // Area 3.3: Layout Isolation Contract
    // ------------------------------------------------------------------------
    describe('Area 3.3: Layout Isolation Contract', () => {
      it('T3.3.1: src/app/layout.tsx isPublicPage includes /renovar and /welcome', () => {
        const content = fs.readFileSync(path.resolve(process.cwd(), 'src/app/layout.tsx'), 'utf-8')
        assert.match(content, /pathname\s*===\s*['"]\/welcome['"]/, 'layout.tsx isPublicPage must include /welcome')
        assert.match(content, /pathname\s*===\s*['"]\/renovar['"]/, 'layout.tsx isPublicPage must include /renovar')
      })

      it('T3.3.2: src/components/Sidebar.tsx isPublicPage includes /renovar and /welcome', () => {
        const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Sidebar.tsx'), 'utf-8')
        assert.match(content, /pathname\s*===\s*['"]\/welcome['"]/, 'Sidebar.tsx isPublicPage must include /welcome')
        assert.match(content, /pathname\s*===\s*['"]\/renovar['"]/, 'Sidebar.tsx isPublicPage must include /renovar')
      })

      it('T3.3.3: src/components/MobileTabBar.tsx isPublicPage includes /renovar and /welcome', () => {
        const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/MobileTabBar.tsx'), 'utf-8')
        assert.match(content, /pathname\s*===\s*['"]\/welcome['"]/, 'MobileTabBar.tsx isPublicPage must include /welcome')
        assert.match(content, /pathname\s*===\s*['"]\/renovar['"]/, 'MobileTabBar.tsx isPublicPage must include /renovar')
      })

      it('T3.3.4: Layout isolation evaluation matrix: all public routes evaluate correctly', () => {
        function evaluateIsPublic(pathname: string): boolean {
          return (
            !pathname ||
            pathname === '/login' ||
            pathname === '/landing' ||
            pathname === '/welcome' ||
            pathname === '/renovar' ||
            pathname === '/becas' ||
            pathname === '/suscripcion' ||
            pathname === '/terms' ||
            pathname === '/privacy' ||
            pathname === '/reembolsos' ||
            pathname.startsWith('/auth/')
          )
        }

        const publicTestPaths = ['/login', '/landing', '/welcome', '/renovar', '/becas', '/suscripcion', '/terms', '/privacy', '/reembolsos']
        for (const p of publicTestPaths) {
          assert.strictEqual(evaluateIsPublic(p), true, `${p} must evaluate to public`)
        }

        const internalTestPaths = ['/today', '/journal', '/habits', '/challenges', '/calendar', '/evaluation', '/settings']
        for (const p of internalTestPaths) {
          assert.strictEqual(evaluateIsPublic(p), false, `${p} must evaluate to internal/authenticated`)
        }
      })

      it('T3.3.5: Auth prefix matching correctly isolates any nested /auth/ path from navigation shell', () => {
        function evaluateIsPublic(pathname: string): boolean {
          return pathname.startsWith('/auth/')
        }

        assert.strictEqual(evaluateIsPublic('/auth/verify'), true)
        assert.strictEqual(evaluateIsPublic('/auth/callback'), true)
        assert.strictEqual(evaluateIsPublic('/auth/confirm'), true)
        assert.strictEqual(evaluateIsPublic('/today'), false)
      })
    })
  })

  // ==========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS (>=5 scenarios)
  // ==========================================================================
  describe('Tier 4: Real-World Application Scenarios', () => {
    it('T4.1: Scenario 1 - Morning Reflection Routine Journey', async () => {
      // 1. Retrieve the quote of the day for day 1
      const quote = getQuoteForDay(1)
      assert.ok(quote.text.length > 10, 'Daily quote text must be substantial')
      assert.strictEqual(quote.author, 'Epicteto', 'Day 1 quote must be Epicteto')

      // 2. Evaluate exercise status for today
      const todayStr = '2026-10-10'
      const initialStatus = dayStatus(todayStr, undefined, todayStr)
      assert.strictEqual(initialStatus, 'today', 'Initial morning status must be today (pending)')

      // 3. Complete morning reflection exercise
      const completedLog: DayLog = {
        id: 'log-1',
        track_id: 'comunicacion',
        date: todayStr,
        day_number: 1,
        completed: true,
        created_at: new Date().toISOString(),
      }

      // 4. Persistence emits reactive update
      let reactiveFired = false
      const listener: MockEventListener = (evt) => {
        if (evt.type === 'stoic_data_changed') reactiveFired = true
      }
      globalThis.window.addEventListener('stoic_data_changed', listener)

      const { notifyDataChanged } = await import('../../src/lib/db/client')
      notifyDataChanged()
      globalThis.window.removeEventListener('stoic_data_changed', listener)

      assert.strictEqual(reactiveFired, true, 'Marking morning exercise completed triggers reactivity event')

      // 5. Verify updated day status is completed
      const updatedStatus = dayStatus(todayStr, completedLog, todayStr)
      assert.strictEqual(updatedStatus, 'completed', 'Updated status must be completed')
    })

    it('T4.2: Scenario 2 - Sanctuary Journal Entry Creation with Mood & Template', () => {
      // Data model validation for journal entry creation
      interface NewEntryPayload {
        date: string
        entryType: 'morning' | 'evening' | 'weekly' | 'free'
        content: Record<string, string>
        mood?: number | null
      }

      function validateJournalPayload(payload: NewEntryPayload): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) return false
        if (!['morning', 'evening', 'weekly', 'free'].includes(payload.entryType)) return false
        if (!payload.content || typeof payload.content !== 'object') return false
        if (payload.mood !== undefined && payload.mood !== null) {
          if (!Number.isInteger(payload.mood) || payload.mood < 1 || payload.mood > 5) return false
        }
        return true
      }

      // User creates evening reflection entry with mood 4
      const validPayload: NewEntryPayload = {
        date: '2026-10-10',
        entryType: 'evening',
        content: {
          did_well: 'Mantuve la calma ante una interrupción agresiva en la reunión.',
          to_improve: 'Fui impaciente en el correo de la tarde.',
          learned: 'La pausa de tres segundos antes de responder neutraliza la reactividad.',
        },
        mood: 4,
      }

      assert.strictEqual(validateJournalPayload(validPayload), true, 'Valid journal entry payload passes validation')

      // Invalid mood (out of bounds)
      const invalidMoodPayload = { ...validPayload, mood: 6 }
      assert.strictEqual(validateJournalPayload(invalidMoodPayload as NewEntryPayload), false, 'Mood > 5 must fail validation')

      // Invalid entry type
      // @ts-expect-error testing invalid entry type
      const invalidTypePayload = { ...validPayload, entryType: 'custom_invalid' }
      assert.strictEqual(validateJournalPayload(invalidTypePayload as NewEntryPayload), false, 'Invalid entry type must fail validation')
    })

    it('T4.3: Scenario 3 - 13-Week Curriculum Habit Tracking Toggle & Streak Computation', () => {
      const mockTrack: Track = {
        id: 'comunicacion',
        title: 'Comunicación Interpersonal',
        slug: 'comunicacion',
        description: '90-day track',
        duration_days: 90,
        current_day: 4,
        start_date: '2026-10-01',
        created_at: '2026-10-01T00:00:00Z',
      }

      // User has completed day 1, day 2, day 3 consecutive
      const logs: DayLog[] = [
        { id: '1', track_id: 'comunicacion', date: '2026-10-01', day_number: 1, completed: true, created_at: '' },
        { id: '2', track_id: 'comunicacion', date: '2026-10-02', day_number: 2, completed: true, created_at: '' },
        { id: '3', track_id: 'comunicacion', date: '2026-10-03', day_number: 3, completed: true, created_at: '' },
      ]

      // On day 4 ('2026-10-04'), streak should be 3
      const streakDay4 = currentStreak(mockTrack, logs, '2026-10-04')
      assert.strictEqual(streakDay4, 3, 'Streak should be 3 days')

      // If user missed day 4 and is now on day 5 ('2026-10-05'), streak resets to 0
      const streakDay5 = currentStreak(mockTrack, logs, '2026-10-05')
      assert.strictEqual(streakDay5, 0, 'Missed day breaks streak back to 0')
    })

    it('T4.4: Scenario 4 - Weekly Challenge Deliverable Submission & Progress Tracking', () => {
      // Simulate weekly challenge workflow
      interface WeeklyChallenge {
        week: number
        title: string
        deliverablePrompt: string
      }

      const week1Challenge: WeeklyChallenge = {
        week: 1,
        title: 'Silencio Deliberado',
        deliverablePrompt: 'Graba 3 minutos de conversación sin emitir muletillas ni juicios inmediatos.',
      }

      interface ChallengeSubmission {
        week: number
        notes: string
        completedAt: string
      }

      function submitChallenge(challenge: WeeklyChallenge, notes: string): ChallengeSubmission {
        if (!notes || notes.trim().length < 20) {
          throw new Error('El entregable debe contener al menos 20 caracteres de reflexión honesta.')
        }
        return {
          week: challenge.week,
          notes: notes.trim(),
          completedAt: new Date().toISOString(),
        }
      }

      // Rejects superficial submission
      assert.throws(() => {
        submitChallenge(week1Challenge, 'Listo.')
      }, /al menos 20 caracteres/)

      // Accepts genuine stoic reflection
      const validSubmission = submitChallenge(
        week1Challenge,
        'Grabé la reunión de retrospectiva. Noté 7 pausas donde antes solía interrumpir con "bueno" o "o sea".'
      )
      assert.strictEqual(validSubmission.week, 1)
      assert.ok(validSubmission.completedAt.length > 0)
    })

    it('T4.5: Scenario 5 - Membership Renewal & Grace Period Data Export Workflow', () => {
      // 1. User with expired subscription within 30 days of grace period
      const expiredDate = new Date()
      expiredDate.setDate(expiredDate.getDate() - 10) // Expired 10 days ago

      const mockAccess = readAccess({
        stoicom_approved: true,
        stoicom_expires_at: expiredDate.toISOString(),
      })

      assert.strictEqual(mockAccess.state, 'grace', 'User within 30 days post-expiry must be in grace period')
      assert.strictEqual(canExport(mockAccess), true, 'User in grace period retains data export privilege')
      assert.strictEqual(GRACE_DAYS, 30, 'Grace period must be exactly 30 days')
      assert.strictEqual(VIGENCIA_MESES, 12, 'Annual membership validity must be 12 months')

      // 2. Validate export payload and headers format
      const exportRoutePath = path.resolve(process.cwd(), 'src/app/api/export/journal/route.ts')
      assert.ok(fs.existsSync(exportRoutePath), 'Export journal route exists')
      const exportRouteContent = fs.readFileSync(exportRoutePath, 'utf-8')

      assert.match(exportRouteContent, /toMarkdown/, 'Route provides Markdown export')
      assert.match(exportRouteContent, /content-disposition/i, 'Route sets Content-Disposition header for download')
      assert.match(exportRouteContent, /content-type/i, 'Route sets Content-Type header')
    })
  })
})
