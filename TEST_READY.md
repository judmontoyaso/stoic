# TEST_READY: StoiCom Automated Test Suites & Modernization Verification

This document is the authoritative test status and execution registry for the StoiCom platform.

---

## 1. Quick Test Execution Commands

```bash
# 1. Comprehensive Modernization E2E Suite (61 tests across Tiers 1-4)
npx tsx --test tests/e2e/modernization.test.ts

# Human-readable hierarchical spec output:
npx tsx --test --test-reporter=spec tests/e2e/modernization.test.ts

# 2. Landing Page E2E Suite (24 tests)
npx tsx --test tests/e2e/landing.test.ts

# 3. Adversarial Stress Suite (10 tests)
npx tsx --test tests/adversarial-milestone1.test.ts
```

---

## 2. Test Suite Inventory

| Suite | File Path | Focus | Tests | Status | Execution Time |
|---|---|---|---|---|---|
| **Modernization E2E** | `tests/e2e/modernization.test.ts` | Complete 4-Tier modernization, tokens, purge, primitives, contracts & user journeys | 61 | 47 PASS / 14 GATED | ~310 ms |
| **Landing Page E2E** | `tests/e2e/landing.test.ts` | Hero, LeadForm, pricing, FAQ, SEO metadata, JSON-LD Schema.org | 24 | 24 PASS (100%) | ~1,100 ms |
| **Adversarial M1** | `tests/adversarial-milestone1.test.ts` | Layering, pointer-events, z-index hierarchy, clickability, prop edges | 10 | 10 PASS (100%) | ~220 ms |
| **TOTAL** | | | **95** | **81 PASS / 14 GATED** | **~1.6 s** |

---

## 3. Comprehensive Modernization Suite Details (`modernization.test.ts`)

### 3.1 Overview
- **Runner**: Node 22 native test runner (`node:test`, `node:assert/strict`) via TypeScript executor (`tsx`).
- **Suites**: 15 sub-suites (4 Tier suites, 11 Area suites).
- **Total Tests**: 61 tests.
- **Passing**: 47 (77%).
- **Failing (Gated)**: 14 (23%) — gated tests awaiting M1 and M3 implementation.

### 3.2 4-Tier Coverage Matrix

| Tier | Name | Target Areas | Tests | Passed | Gated / Pending | Milestone Gate |
|---|---|---|---|---|---|---|
| **Tier 1** | Feature Coverage | Visual Tokens & Typography, PrimeReact/PrimeIcons Purge, UI Primitives, Route Coverage | 26 | 15 | 11 | Milestone 1 (M1) |
| **Tier 2** | Boundary & Corner Cases | Empty States, Rate Limiting & Auth Boundaries, Responsive Layout & Drawer Keyboard Dismissal | 15 | 15 | 0 | Baseline Complete |
| **Tier 3** | Cross-Feature Contracts | Supabase Schema Isolation (`stoic`), Reactivity Protocol, Layout Isolation (`isPublicPage`) | 15 | 12 | 3 | Milestone 3 (M3) |
| **Tier 4** | Real-World Application Scenarios | Morning Reflection, Sanctuary Journal, Habit Tracking, Challenge Deliverable, Renewal & Grace Period Export | 5 | 5 | 0 | Baseline Complete |
| **TOTAL** | | | **61** | **47** | **14** | |

---

## 4. Test Case Checklist & Results (`tests/e2e/modernization.test.ts`)

### Tier 1: Feature Coverage (26 tests)

#### Area 1.1: Visual Design Tokens & Typography (6 tests)
- [x] **T1.1.1**: Tailwind v4 theme configuration in `globals.css` defines radius tokens (`--radius-sm` through `--radius-2xl`).
- [x] **T1.1.2**: Dark Obsidian color palette tokens defined in `.dark` rule (`#0a0a0f`, `#c9a84c`, `#111116`, `#1e1e28`).
- [x] **T1.1.3**: Warm Bone color palette tokens defined in `:root` rule (`#fcfbfa`, `#1c1917`, `#ab841d`, `#ffffff`, `#e7e5e4`).
- [x] **T1.1.4**: Universal Inter font loading in root layout `src/app/layout.tsx` (`--font-inter`).
- [ ] **T1.1.5**: Universal Cinzel font loading in root layout for authoritative serif typography (`--font-cinzel`) — *[Gated: M1]*
- [x] **T1.1.6**: Body typography and scrollbar tokens enforcement in `globals.css` (`var(--font-inter)`).

#### Area 1.2: PrimeReact & PrimeIcons Complete Purge (6 tests)
- [ ] **T1.2.1**: Zero imports of `primereact` in `src/app/journal/page.tsx` — *[Gated: M1]*
- [ ] **T1.2.2**: Zero imports of `primereact` in `src/app/calendar/page.tsx` — *[Gated: M1]*
- [ ] **T1.2.3**: Zero imports of `primereact` in `src/app/challenges/page.tsx` — *[Gated: M1]*
- [ ] **T1.2.4**: Zero imports of `primereact` in `src/app/auth/verify/page.tsx` — *[Gated: M1]*
- [ ] **T1.2.5**: Zero imports of `primereact` or `primeicons` across all files under `src/` — *[Gated: M1]*
- [ ] **T1.2.6**: Zero `primereact`/`primeicons` CSS imports or `.p-` override rules in `globals.css` — *[Gated: M1]*

#### Area 1.3: Component Primitives Existence & Interface Contracts (6 tests)
- [ ] **T1.3.1**: `Input` primitive contract: exists, renders accessible `<input>` with gold focus ring — *[Gated: M1]*
- [ ] **T1.3.2**: `Textarea` primitive contract: exists, auto-sizing / accessible styling and forwards props — *[Gated: M1]*
- [ ] **T1.3.3**: `Drawer` primitive contract: exists, implements `{ isOpen, onClose, title?, children }` — *[Gated: M1]*
- [ ] **T1.3.4**: `Button` primitive contract: provides tactile button interaction and variants — *[Gated: M1]*
- [x] **T1.3.5**: `Skeleton` primitive contract: exists, renders `animate-pulse` and accepts custom `className`.
- [x] **T1.3.6**: `Badge` primitive contract: `ModuleBadge` renders discipline styles (`percepcion`, `accion`, `voluntad`, `evaluacion`) and labels.

#### Area 1.4: Route Coverage (8 tests)
- [x] **T1.4.1**: Internal route `/today` exists and exports default component.
- [x] **T1.4.2**: Internal route `/journal` exists and exports default component.
- [x] **T1.4.3**: Internal route `/habits` exists and exports default component.
- [x] **T1.4.4**: Internal route `/challenges` exists and exports default component.
- [x] **T1.4.5**: Internal route `/calendar` exists and exports default component.
- [x] **T1.4.6**: Internal route `/evaluation` exists and exports default component.
- [x] **T1.4.7**: Internal route `/settings` exists and exports default component.
- [x] **T1.4.8**: Public and Auth routes exist and export default components (`/login`, `/welcome`, `/auth/verify`, `/suscripcion`, `/becas`, `/renovar`).

---

### Tier 2: Boundary & Corner Cases (15 tests)

#### Area 2.1: Empty States Across Core Modules (5 tests)
- [x] **T2.1.1**: `EmptyState` primitive renders fallback icon, text, and container styling.
- [x] **T2.1.2**: Journal empty state handles null/empty entries array gracefully with prompt.
- [x] **T2.1.3**: Habits curriculum unstarted/empty boundary handles zero completed days safely (0% and 0 streak).
- [x] **T2.1.4**: Challenges empty state handles missing submissions for inactive weeks gracefully.
- [x] **T2.1.5**: Calendar empty day boundary: `dayStatus` classifies past unlogged days as `'missed'`, current as `'today'`, future as `'future'`.

#### Area 2.2: Rate Limiting, Access Code Boundaries, Email Validations (5 tests)
- [x] **T2.2.1**: Email normalization trims whitespace, converts lowercase, preserves sub-addressing (`+`).
- [x] **T2.2.2**: Email validation boundary checks: rejects empty string, missing domain, missing `@`, double dot, overlength (>254 chars).
- [x] **T2.2.3**: Access code verification boundary: sanitizes codes and rejects invalid lengths and non-alphanumeric chars.
- [x] **T2.2.4**: Rate limiting simulation: throttles rapid requests exceeding threshold window.
- [x] **T2.2.5**: Lead submission boundary validation: `/api/leads/subscribe` contract rejects missing payload or empty email (HTTP 400).

#### Area 2.3: Responsive Layout & Drawer Keyboard Dismissal (5 tests)
- [x] **T2.3.1**: Drawer Escape key dismissal: triggers `onClose` when Escape is pressed.
- [x] **T2.3.2**: Drawer keyboard isolation: does NOT trigger `onClose` on non-Escape keys (`Enter`, `Tab`, `Space`, `ArrowDown`).
- [x] **T2.3.3**: Drawer backdrop dismissal: clicking backdrop outside panel triggers `onClose`.
- [x] **T2.3.4**: Drawer panel event isolation: clicking inside panel stops event propagation and does NOT dismiss drawer.
- [x] **T2.3.5**: Responsive layout breakpoint contracts: `MobileTabBar` has `md:hidden` and `fixed bottom-0`.

---

### Tier 3: Cross-Feature Combinations & Contracts (15 tests)

#### Area 3.1: Supabase Schema Contract (5 tests)
- [x] **T3.1.1**: `src/utils/supabase/client.ts` strictly enforces `{ db: { schema: 'stoic' } }`.
- [x] **T3.1.2**: `src/utils/supabase/server.ts` strictly enforces `{ db: { schema: 'stoic' } }`.
- [x] **T3.1.3**: `src/lib/supabase.ts` strictly enforces `{ db: { schema: 'stoic' } }`.
- [x] **T3.1.4**: Server API routes enforce `{ db: { schema: 'stoic' } }` on direct client instantiations.
- [x] **T3.1.5**: Database client abstraction in `src/lib/db/client.ts` exposes schema-configured client.

#### Area 3.2: Reactivity Protocol (5 tests)
- [x] **T3.2.1**: `notifyDataChanged` dispatches `stoic_data_changed` event on `window`.
- [x] **T3.2.2**: `notifyDataChanged` handles SSR environment safely when `window` is undefined.
- [x] **T3.2.3**: `useStoicSync` hook registers listener for `stoic_data_changed` and executes `load`.
- [x] **T3.2.4**: `useStoicSync` hook cleans up event listener on unmount.
- [x] **T3.2.5**: Cross-module reactivity verification: mutations in `journal`, `logs`, and `tracks` call `notifyDataChanged`.

#### Area 3.3: Layout Isolation Contract (5 tests)
- [ ] **T3.3.1**: `src/app/layout.tsx` `isPublicPage` includes `/renovar` and `/welcome` — *[Gated: M3]*
- [ ] **T3.3.2**: `src/components/Sidebar.tsx` `isPublicPage` includes `/renovar` and `/welcome` — *[Gated: M3]*
- [ ] **T3.3.3**: `src/components/MobileTabBar.tsx` `isPublicPage` includes `/renovar` and `/welcome` — *[Gated: M3]*
- [x] **T3.3.4**: Layout isolation evaluation matrix: all public routes evaluate correctly to public, internal evaluate to protected.
- [x] **T3.3.5**: Auth prefix matching correctly isolates any nested `/auth/` path from navigation shell.

---

### Tier 4: Real-World Application Scenarios (5 scenarios)
- [x] **T4.1: Scenario 1 - Morning Reflection Routine Journey**:
  - Quote retrieval (`Epicteto`, Day 1) -> Initial status check (`today`) -> Log completion -> `notifyDataChanged` reactive broadcast verified -> Status transition to `'completed'`.
- [x] **T4.2: Scenario 2 - Sanctuary Journal Entry Creation with Mood & Template**:
  - Validates full journal entry data model: template type (`evening`), mood score (`4/5`), content object validation, and rejection of invalid types/moods.
- [x] **T4.3: Scenario 3 - 13-Week Curriculum Habit Tracking Toggle & Streak Computation**:
  - 90-day track simulation: 3 consecutive days yields streak 3; uncompleted day 4 resets streak on day 5 to 0.
- [x] **T4.4: Scenario 4 - Weekly Challenge Deliverable Submission & Progress Tracking**:
  - Challenge milestone retrieval -> deliverable text length validation (>=20 chars) -> rejection of trivial inputs -> successful submission record.
- [x] **T4.5: Scenario 5 - Membership Renewal & Grace Period Data Export Workflow**:
  - Expired access evaluation -> 30-day grace period status verification (`'grace'`) -> data export privilege check (`canExport === true`) -> export route contract validation (`Content-Disposition: attachment`, `Content-Type: text/markdown`).

---

## 5. Escalation & Milestone Gate Backlog

The following 14 tests in `tests/e2e/modernization.test.ts` represent the exact contractual deliverables to be implemented by subsequent milestones:

### Assigned to Milestone 1 (M1) — Design System & Visual Foundation
1. `T1.1.5`: Import `Cinzel` in `src/app/layout.tsx` with `--font-cinzel`.
2. `T1.2.1`: Purge `primereact` imports from `src/app/journal/page.tsx`.
3. `T1.2.2`: Purge `primereact` imports from `src/app/calendar/page.tsx`.
4. `T1.2.3`: Purge `primereact` imports from `src/app/challenges/page.tsx`.
5. `T1.2.4`: Purge `primereact` imports from `src/app/auth/verify/page.tsx`.
6. `T1.2.5`: Complete purge of `primereact` and `primeicons` across `src/`.
7. `T1.2.6`: Purge `@import "primereact...` and `@import "primeicons...` from `src/app/globals.css`.
8. `T1.3.1`: Implement `src/components/ui/Input.tsx`.
9. `T1.3.2`: Implement `src/components/ui/Textarea.tsx`.
10. `T1.3.3`: Implement `src/components/ui/Drawer.tsx`.
11. `T1.3.4`: Implement `src/components/ui/Button.tsx`.

### Assigned to Milestone 3 (M3) — Public Pages & Layout Isolation
12. `T3.3.1`: Add `/welcome` and `/renovar` to `isPublicPage` in `src/app/layout.tsx`.
13. `T3.3.2`: Add `/welcome` and `/renovar` to `isPublicPage` in `src/components/Sidebar.tsx`.
14. `T3.3.3`: Add `/welcome` and `/renovar` to `isPublicPage` in `src/components/MobileTabBar.tsx`.

Once M1 and M3 are implemented, running `npx tsx --test tests/e2e/modernization.test.ts` will achieve **61/61 PASS (100%)**.
