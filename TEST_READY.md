# TEST_READY: StoiCom Landing Page Automated Test Suite

## Test Runner Command
```bash
npx tsx --test tests/e2e/landing.test.ts
```

For human-readable hierarchical spec output:
```bash
npx tsx --test --test-reporter=spec tests/e2e/landing.test.ts
```

---

## Suite Summary
- **Test Runner**: Node 22 native test runner (`node:test`, `node:assert/strict`) via TypeScript executor (`tsx`)
- **Total Test Suites**: 5 (1 Root, 4 Tier Suites)
- **Total Tests**: 24 tests
- **Passing**: 24 (100%)
- **Failing**: 0 (0%)
- **Execution Time**: ~1.1 seconds
- **Production Build Status**: `npm run build` exits 0 (Next.js 16.2.10 Turbopack + TypeScript check clean)

---

## Coverage Summary Table across Tiers 1–4

| Tier | Name | Target Areas | Tests | Status |
|---|---|---|---|---|
| **Tier 1** | Feature Coverage | Hero Section copy & typography, Hero `LeadForm` integration, Navigation Anchors (`#metodologia`, `#tracks`, `#precios`), DOM Target Sections, Methodology Section, Curriculum Tracks (210 exercises), Pricing Section, FAQ Accordion data sourcing from `src/data/faqs.ts`, and Static Next.js SEO Metadata export | 9 | PASS (100%) |
| **Tier 2** | Boundary & Corner Cases | `normalizeEmail` validation across RFC & custom boundary cases (empty, whitespace, missing domain/TLD, single-char TLD, illegal chars, >254 / <5 length thresholds), Pricing model numeric constants (COP 199,000 / USD 59), formatting with Colombian thousand separators (`$199.000`), Isolated `LeadForm` and `FAQAccordion` component rendering, and `/api/leads/subscribe` malformed payload handling | 7 | PASS (100%) |
| **Tier 3** | Cross-Feature Combinations & Contracts | Contract between `PricingSection` Free Trial CTA and Hero `LeadForm` (`document.getElementById('lead-email-landing-hero')`), API endpoint `/api/leads/subscribe` contracts (burst throttle `MAX_NEW_PER_HOUR = 30`, re-send delay `RESEND_THROTTLE_MINUTES = 5`), Telemetry whitelist synchronization (`PublicEventName` in `analytics-public.ts` vs `api/events/route.ts`), payload sanitization, and 7-day Drip sequence constants | 5 | PASS (100%) |
| **Tier 4** | Real-World Application Scenarios | Schema.org JSON-LD structured data conformance (`@context: https://schema.org` with 5 `@graph` entities: `Organization`, `WebSite`, `SoftwareApplication`, `Course`, `FAQPage`), Next.js static SEO metadata standards (title/desc length thresholds, keywords, OpenGraph `es_CO`, Twitter summary cards), and semantic HTML accessibility attributes (`sr-only`, `autocomplete`, `required`) | 3 | PASS (100%) |

---

## Detailed Test Case Checklist

### Tier 1: Feature Coverage
- [x] **T1.1**: Renders Hero section with primary headlines (`Entrena cómo hablas. Con los demás y contigo.`), eyebrow (`Programa Guiado · Filosofía Estoica & Alto Rendimiento`), and value proposition copy.
- [x] **T1.2**: Renders `LeadForm` within Hero with `source="landing-hero"` and input ID `id="lead-email-landing-hero"`.
- [x] **T1.3**: Verifies header navigation contains internal anchor links (`#metodologia`, `#tracks`, `#precios`), `/login` link, and brand mark (`STOI` / `COM`).
- [x] **T1.4**: Target DOM section elements with matching anchor IDs exist on page (`id="metodologia"`, `id="tracks"`, `id="precios"`).
- [x] **T1.5**: Renders Methodology section with Estoicismo Clásico (Dicotomía del control) and Psicología de Alto Rendimiento (Tríada emocional).
- [x] **T1.6**: Renders Curriculum Tracks section with 3 guided tracks (Comunicación Interpersonal, Maestría Interna & Diario, Influencia & Liderazgo) and 210 exercises.
- [x] **T1.7**: Renders Pricing section with Free Trial card ($0 / 7 días), Annual plan card, and 14-day unconditional guarantee.
- [x] **T1.8**: Renders FAQ Accordion with all items dynamically sourced from `src/data/faqs.ts` (all questions and answers verified).
- [x] **T1.9**: Verifies static SEO `metadata` export contains title, description, canonical (`https://stoicom.app/landing`), OpenGraph and Twitter cards.

### Tier 2: Boundary & Corner Cases
- [x] **T2.1**: Validates email normalization across standard formats, plus-tagging, hyphens, and mixed casing (trims & lowercases).
- [x] **T2.2**: Rejects invalid email formats and boundary length edge cases (empty string, whitespace, missing `@`, missing domain, missing user, single-char TLD, illegal punctuation, spaces inside email, length > 254 chars, length < 5 chars, non-string types).
- [x] **T2.3**: Verifies pricing model constants: `PROGRAM_PRICE.cop === 199000`, `PROGRAM_PRICE.usd === 59`, `FOUNDER_PRICE === PROGRAM_PRICE`, `copLabel === '$199.000'`, `usdLabel === '$59'`.
- [x] **T2.4**: Verifies `PricingSection` handles currency options between COP (`Mercado Pago / PSE`) and USD (`Lemon Squeezy`).
- [x] **T2.5**: Verifies `LeadForm` renders as an isolated component supporting custom and default sources (`landing`, `landing-hero`, `landing-footer`).
- [x] **T2.5b**: Verifies `FAQAccordion` renders as an isolated component with initial open state and full question catalog.
- [x] **T2.6**: Rejects malformed requests in `/api/leads/subscribe` endpoint (invalid JSON body -> 400, empty email -> 400, invalid email -> 400).

### Tier 3: Cross-Feature Combinations & Contracts
- [x] **T3.1**: Verifies architectural coupling contract between `PricingSection` Free Trial button and Hero `LeadForm` input element ID (`lead-email-landing-hero`).
- [x] **T3.2**: Verifies `/api/leads/subscribe` API contract parameters, source sanitization (slice 40, fallback 'landing'), and anti-abuse limits (`MAX_NEW_PER_HOUR = 30`, `RESEND_THROTTLE_MINUTES = 5`).
- [x] **T3.3**: Verifies telemetry event whitelist synchronization between client `analytics-public.ts` and server `api/events/route.ts` (`landing_view`, `landing_cta_click`, `lead_form_submitted`, `becas_view`, `beca_form_submitted`, `login_view`).
- [x] **T3.3b**: Verifies `trackPublic` fire-and-forget contract behavior (attempts `navigator.sendBeacon` first, fallbacks to `fetch` with `keepalive: true`).
- [x] **T3.4**: Verifies 7-day Drip sequence parameters contract (`DRIP_LENGTH = 7`, `DRIP_TRACK_SLUG = 'comunicacion'`).

### Tier 4: Real-World Application Scenarios
- [x] **T4.1**: Validates JSON-LD structured data conforms to schema.org with all 5 `@graph` entities:
  - `Organization`: name StoiCom, url, logo 512px, description.
  - `WebSite`: url `https://stoicom.app/landing`, inLanguage `es`.
  - `SoftwareApplication`: PWA multi-device with COP and USD price offers.
  - `Course`: El Método StoiCom, online mode, workload PT15M, Trial ($0) and Annual offers.
  - `FAQPage`: `mainEntity` mapping 1-to-1 with `FAQS` array.
- [x] **T4.2**: Verifies static SEO metadata conforms to Next.js standards, title length (30–80 chars), description length (120–250 chars), keywords array, and OpenGraph/Twitter card specifications.
- [x] **T4.3**: Validates semantic HTML landmarks (`<header>`, `<section>`, `<footer>`) and accessibility attributes (`sr-only` labels, `autocomplete="email"`, `required`).

---

## Verification Execution Output

```
▶ StoiCom Landing Page Test Suite
  ▶ Tier 1: Feature Coverage
    ✔ T1.1: renders Hero section with primary headlines, eyebrow and value proposition copy
    ✔ T1.2: renders LeadForm within Hero with correct source and input ID
    ✔ T1.3: verifies navigation header contains required anchors and login link
    ✔ T1.4: target DOM sections with matching anchor IDs exist on page
    ✔ T1.5: renders Methodology section with classic stoicism and high performance cards
    ✔ T1.6: renders Tracks section detailing the 3 guided tracks and 210 exercises
    ✔ T1.7: renders Pricing section with Free Trial ($0) and Annual Plan cards
    ✔ T1.8: renders FAQ Accordion with all items sourced from src/data/faqs.ts
    ✔ T1.9: verifies static SEO metadata export contains title, description and canonical
  ✔ Tier 1: Feature Coverage (354.35ms)
  ▶ Tier 2: Boundary & Corner Cases
    ✔ T2.1: validates email normalization across valid formats, tags and mixed casing
    ✔ T2.2: rejects invalid email formats and boundary length edge cases
    ✔ T2.3: verifies currency toggle values and formatting constants
    ✔ T2.4: verifies PricingSection handles currency options between COP and USD
    ✔ T2.5: verifies LeadForm renders isolated component with custom and default sources
    ✔ T2.5b: verifies FAQAccordion renders isolated component with all questions and initial state
    ✔ T2.6: rejects malformed requests in /api/leads/subscribe endpoint
  ✔ Tier 2: Boundary & Corner Cases (123.72ms)
  ▶ Tier 3: Cross-Feature Combinations & Contracts
    ✔ T3.1: verifies contract between PricingSection and Hero LeadForm input element ID
    ✔ T3.2: verifies API endpoint /api/leads/subscribe contract parameters and defaults
    ✔ T3.3: verifies telemetry event contracts and whitelist synchronization
    ✔ T3.3b: verifies trackPublic fire-and-forget contract behavior
    ✔ T3.4: verifies Drip sequence parameters contract for the 7-day free trial
  ✔ Tier 3: Cross-Feature Combinations & Contracts (27.29ms)
  ▶ Tier 4: Real-World Application Scenarios
    ✔ T4.1: validates JSON-LD structured data conforms to schema.org with all 5 graph entities
    ✔ T4.2: verifies static SEO metadata conforms to Next.js standards and character thresholds
    ✔ T4.3: validates accessibility attributes and semantic landmarks in rendered landing page
  ✔ Tier 4: Real-World Application Scenarios (57.46ms)
✔ StoiCom Landing Page Test Suite (563.65ms)
ℹ tests 24
ℹ suites 5
ℹ pass 24
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1133.65ms
```

---

## Implementation Guidelines for Implementing Agents
1. When refactoring `src/app/landing/page.tsx` or decomposing it into client components (`HeroSection.tsx`, `LandingNav.tsx`, etc.), ensure:
   - `id="metodologia"`, `id="tracks"`, and `id="precios"` remain on the section containers.
   - The Hero `LeadForm` retains `source="landing-hero"` so that `id="lead-email-landing-hero"` is preserved.
   - In `PricingSection`, the free trial button continues querying `document.getElementById('lead-email-landing-hero')`.
   - `metadata` static export and `<script type="application/ld+json">` are maintained in `src/app/landing/page.tsx`.
2. Run `npx tsx --test tests/e2e/landing.test.ts` at any time to verify zero regressions.
