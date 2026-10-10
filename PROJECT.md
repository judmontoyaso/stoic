# Project: StoiCom Landing Page Redesign ("Antigravity X Google Flow")

## Architecture
- **Framework & Runtime**: Next.js 16.2.10 (Turbopack, App Router), React 19.2.4, Node.js 22.14.0.
- **Styling & Motion**: Tailwind CSS v4.3.2 (`@tailwindcss/postcss`, CSS-first via `src/app/globals.css`), Framer Motion 12.42.2, Lucide React 1.23.0.
- **Server/Client Boundary Architecture**:
  - `src/app/landing/page.tsx` remains a **Server Component** orchestrating the page, exporting Next.js static `metadata` (canonical, OpenGraph, Twitter), and rendering the sanitized JSON-LD structured data (`@context: https://schema.org`).
  - Interactive and animated sections are decomposed into dedicated Client Components (`'use client'`) in `src/components/landing/`.
- **Atmospheric Neo-Stoic Theme**:
  - Palette: Deep Obsidian (`#0a0a0f`), Dark Granite (`#0d0d13`), Card Slate (`#111116`), Imperial Gold (`#c9a84c`).
  - Typography: `Cinzel` serif for titles and Roman numerals, `Inter` for crisp body copy.
  - Lighting: Layered radial gold glows (`rgba(201,168,76,0.15)`), spotlight cards with cursor-following radial borders, and spring physics.
  - Native Scroll Integrity: No scroll-jacking or gesture hijacking; desktop uses sticky pinning (`position: sticky`), mobile uses responsive vertical flow.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | E2E Test Suite & Test Runner | Automated tests covering features, edge cases, contracts, and SEO schema using Node 22 native runner (`node:test` + `tsx`) | E2E Testing Track | Survey & ORIGINAL_REQUEST |
| 2 | Component Architecture & Server Boundary | Keep `page.tsx` as Server Component, create `SpotlightCard.tsx` and modular landing section structure | M1 | Survey |
| 3 | Hero Cinemático & Neo-Stoic Atmosphere (R1) | Framer Motion staggered entrance, blur-to-focus typography, ambient gold radial glows, floating stoic emblem, replace 10MB image bottleneck | M1 | R1, ORIGINAL_REQUEST §R1 |
| 4 | Methodology Section Elevation | 2 Spotlight cards (Estoicismo Clásico vs Psicología de Alto Rendimiento) with cursor hover lighting and Lucide glow icons | M1 | Survey |
| 5 | Sticky Scroll Storytelling: "Así se ve un día" (R2) | Desktop sticky pinning + dynamic artifact morphing (06:00 Amanecer, El Día, 20:00 Examen de Séneca); mobile responsive vertical timeline | M2 | R2, ORIGINAL_REQUEST §R2 |
| 6 | Three Phases Progression ("Tres Fases de 30 Días") | Horizontal phase progression with glowing Roman numerals (`I`, `II`, `III`) and connector line | M2 | Survey |
| 7 | Sticky Scroll Storytelling: "Tres Tracks Guiados" (R2) | Guided sequential track exploration (Track 1, Track 2, Track 3) with dynamic previews, author badges, and interactive tabs | M2 | R2, ORIGINAL_REQUEST §R2 |
| 8 | Tactile Microinteractions & Spotlight Cards (R3) | Reusable `SpotlightCard` with GPU-accelerated mouse coordinates, tactile button press physics (`whileTap`/`whileHover`) | M3 | R3, ORIGINAL_REQUEST §R3 |
| 9 | FAQ Accordion Elevation (R3) | Framer Motion `AnimatePresence` smooth height expansion, spring-loaded rotating chevron, gold border active highlight | M3 | R3, ORIGINAL_REQUEST §R3 |
| 10 | Pricing Section & Currency Switcher Elevation (R3) | Framer Motion sliding pill for COP/USD toggle, breathing gold halo on featured Annual plan, preserve `#lead-email-landing-hero` jump | M3 | R3, ORIGINAL_REQUEST §R3 |
| 11 | Evaluation, PWA Grid & Video Elevation | Comparative waveform visual (Día 1 vs 86), 6 PWA cards with spotlight hover, vertical video showcase with golden borders | M3 | Survey |
| 12 | LeadForm & Business Conversion Preservation (R4) | Maintain `LeadForm` input IDs, API `/api/leads/subscribe`, analytics `trackPublic('lead_form_submitted')`, zero conversion regression | M4 | R4, ORIGINAL_REQUEST §R4 |
| 13 | Navigation, SEO & Structured Data Integrity (R4) | Anchor links (`#metodologia`, `#tracks`, `#precios`), `/login` links, JSON-LD `@graph`, canonical meta, mobile responsive <768px | M4 | R4, ORIGINAL_REQUEST §R4 |
| 14 | 60 FPS Performance & Build Polish (R4) | GPU transform-only animations, verify `npm run build` exit 0, clean typecheck `npx tsc --noEmit`, scoped eslint clean | M4 | R4, ORIGINAL_REQUEST §R4 |
| 15 | 100% E2E Verification & Forensic Audit | Run and pass 100% of E2E test suite (Tiers 1-4), complete adversarial testing, forensic integrity audit clean, and build validation | Final Milestone | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Requirement-driven test suite (Tiers 1-4) with Node 22 native runner; publishes `TEST_READY.md` | None | IN_PROGRESS |
| M1 | Cinematic Hero & Atmosphere (R1) | Component layout, `SpotlightCard`, Hero Framer Motion choreography, ambient gold glows, Methodology section | None | DONE |
| M2 | Sticky Scroll Storytelling (R2) | "Así se ve un día" and "Tres Tracks Guiados" sequential sticky scroll on desktop + mobile vertical timeline fallback | M1 | PLANNED |
| M3 | Tactile Microinteractions & Elevation (R3) | FAQ `AnimatePresence`, Pricing currency slide + breathing aura, PWA cards spotlight, Memento videos | M1 | PLANNED |
| M4 | Preservation, SEO, Responsive & Polish (R4) | LeadForm validation, anchor navigation, SEO/JSON-LD integrity, <768px mobile check, 60 FPS polish, build check | M2, M3 | PLANNED |
| M_FINAL | 100% E2E Verification & Audit | Pass 100% of E2E test suite, Reviewers, Challengers, and Forensic Auditor clean signoff, final `npm run build` | E2E, M4 | PLANNED |

## Interface Contracts
### `src/components/LeadForm.tsx` Contract
- Input element must retain id: `lead-email-${source}` (specifically `lead-email-landing-hero` for Hero, `lead-email-landing-footer` for Footer).
- Props: `{ source?: string }`.
- API target: `POST /api/leads/subscribe` with payload `{ email: string, source: string }`.
- Telemetry: `trackPublic('lead_form_submitted', { source })`.

### `src/components/landing/PricingSection.tsx` Contract
- Currency state toggle: `'COP' | 'USD'` using data from `src/lib/pricing.ts`.
- Free trial button must query and focus `document.getElementById('lead-email-landing-hero')`.
- Checkout button routes to `/login` for COP or Lemon Squeezy URL for USD.

### `src/app/landing/page.tsx` Server Component Contract
- Must export static Next.js `metadata: Metadata`.
- Must render `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />`.
- Section anchor IDs must exist in DOM: `id="metodologia"`, `id="tracks"`, `id="precios"`.

## Code Layout
- `src/app/landing/page.tsx` — Server Component orchestrating the landing page layout and SEO metadata.
- `src/components/landing/` — Dedicated Client Components for each animated section:
  - `LandingNav.tsx` — Sticky glassmorphic navigation header.
  - `HeroSection.tsx` — Cinematic hero with Framer Motion staggered entrance, ambient gold glow, and LeadForm.
  - `SpotlightCard.tsx` — Reusable tactile card with cursor-following radial gold glow.
  - `MethodologySection.tsx` — 2 spotlight cards for Stoicism + Performance Psychology.
  - `StickyRoutine.tsx` — Sticky scroll narrative for "Así se ve un día".
  - `PhasesSection.tsx` — 3-phase journey progression cards.
  - `StickyTracks.tsx` — Sticky scroll / tabbed narrative for "Tres Tracks Guiados".
  - `EvaluationSection.tsx` — Comparative diagnosis and quote card.
  - `PlatformFeaturesSection.tsx` — 6 PWA feature cards with spotlight hover.
  - `PricingSection.tsx` — Elevated pricing cards, currency toggle, and breathing halo.
  - `FAQAccordion.tsx` — Elevated FAQ accordion with Framer Motion `AnimatePresence`.
  - `MementoSection.tsx` — Video showcase and philosophical quotes.
  - `FooterCTASection.tsx` — Final CTA with LeadForm and legal links.
- `tests/e2e/landing.test.ts` — E2E test suite running via `npx tsx --test tests/e2e/landing.test.ts`.
