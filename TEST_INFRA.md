# StoiCom Testing Infrastructure & E2E Verification Guide

This document describes the testing architecture, runner mechanics, 4-tier methodology, and execution instructions for the StoiCom modern web application (`stoicomunication`).

---

## 1. Architecture & Test Framework Overview

StoiCom utilizes the **Node.js 22 native test runner** (`node:test`, `node:assert/strict`) combined with the TypeScript executor `tsx` (`npx tsx --test`).

### Architectural Benefits
- **Zero Heavy Test Dependencies**: Eliminates the overhead, browser binaries, and slow startup times of heavy E2E frameworks (Jest, Playwright, Puppeteer).
- **Sub-Second Execution**: The entire 61-test modernization suite executes in ~300ms–800ms.
- **Native TypeScript Execution**: Zero pre-compilation step; `.ts` and `.tsx` files execute directly with native ESM/CJS interop.
- **Hermetic Runtime Hooks**: Custom `Module.prototype.require` interceptors gracefully mock Next.js server primitives (`next/font/google`, `next/headers`, `next/navigation`) inside the native Node process.

---

## 2. Test Execution Commands

### Modernization E2E Suite (Tiers 1–4)
```bash
# TAP output format (standard CI runner)
npx tsx --test tests/e2e/modernization.test.ts

# Hierarchical Human-Readable Spec Reporter
npx tsx --test --test-reporter=spec tests/e2e/modernization.test.ts
```

### Landing Page E2E Suite
```bash
npx tsx --test tests/e2e/landing.test.ts
```

### Adversarial Stress Suite (Milestone 1)
```bash
npx tsx --test tests/adversarial-milestone1.test.ts
```

### Full Project Verification
```bash
# Run all suites
npx tsx --test tests/e2e/modernization.test.ts tests/e2e/landing.test.ts tests/adversarial-milestone1.test.ts
```

---

## 3. The 4-Tier Opaque-Box Methodology

The test suite in `tests/e2e/modernization.test.ts` is structured under a 4-tier opaque-box methodology with >=5 tests per target area:

```
tests/e2e/modernization.test.ts
├── Tier 1: Feature Coverage (26 tests)
│   ├── Area 1.1: Visual Design Tokens & Typography (6 tests)
│   ├── Area 1.2: PrimeReact & PrimeIcons Complete Purge (6 tests)
│   ├── Area 1.3: Component Primitives Existence & Interface Contracts (6 tests)
│   └── Area 1.4: Route Coverage (8 tests)
├── Tier 2: Boundary & Corner Cases (15 tests)
│   ├── Area 2.1: Empty States Across Core Modules (5 tests)
│   ├── Area 2.2: Rate Limiting, Access Code Boundaries, Email Validations (5 tests)
│   └── Area 2.3: Responsive Layout & Drawer Keyboard Dismissal (5 tests)
├── Tier 3: Cross-Feature Combinations & Contracts (15 tests)
│   ├── Area 3.1: Supabase Schema Contract (5 tests)
│   ├── Area 3.2: Reactivity Protocol (5 tests)
│   └── Area 3.3: Layout Isolation Contract (5 tests)
└── Tier 4: Real-World Application Scenarios (5 scenarios)
    ├── Scenario 4.1: Morning Reflection Routine Journey
    ├── Scenario 4.2: Sanctuary Journal Entry Creation with Mood & Template
    ├── Scenario 4.3: 13-Week Curriculum Habit Tracking Toggle & Streak Computation
    ├── Scenario 4.4: Weekly Challenge Deliverable Submission & Progress Tracking
    └── Scenario 4.5: Membership Renewal & Grace Period Data Export Workflow
```

---

## 4. Test Harness Mechanics

### 4.1 Native Next.js Interceptors
The test runner intercepts calls to Next.js font and navigation modules before components are loaded:
```typescript
// Intercept next/font/google to provide deterministic CSS font variables
moduleProto.require = function (id: string, ...args: unknown[]) {
  if (id === 'next/font/google') {
    return new Proxy({}, {
      get: (_target, prop: string) => () => ({
        className: `font-${prop.toLowerCase()}-mock`,
        variable: `--font-${prop.toLowerCase()}`,
      })
    })
  }
  // Intercept next/headers and next/navigation
  ...
}
```

### 4.2 Lightweight DOM Environment
For SSR and event-based tests (`notifyDataChanged`, `useStoicSync`, `Drawer`), a clean event-dispatching DOM mock is injected at test setup (`before`) and torn down cleanly (`after`):
- `globalThis.window.addEventListener`, `removeEventListener`, `dispatchEvent`
- `globalThis.document.addEventListener`, `removeEventListener`, `dispatchEvent`
- `globalThis.Event` constructor

---

## 5. Milestone Gating & Verification Status

The test suite acts as an authoritative progressive gate across project milestones:

| Milestone | Target Features | Tests in Suite | Current Status |
|---|---|---|---|
| **Pre-Modernization Baseline** | Existing routes, email validation, rate limits, Supabase schema `{ db: { schema: 'stoic' } }`, reactivity protocol, application scenarios | 47 tests | **PASS (100%)** |
| **Milestone 1 (M1)** | Cinzel font loading in `layout.tsx`, PrimeReact/PrimeIcons complete purge, UI primitives (`Input`, `Textarea`, `Drawer`, `Button`) | 11 tests | **GATED (Failing by design until M1 completes)** |
| **Milestone 2 (M2)** | Internal route modernization (`/today`, `/journal`, `/habits`, etc.) | Tested in T1.4 & T4 | **PASS** |
| **Milestone 3 (M3)** | Layout isolation (`/welcome` & `/renovar` in `isPublicPage` in `layout.tsx`, `Sidebar.tsx`, `MobileTabBar.tsx`) | 3 tests | **GATED (Failing by design until M3 completes)** |
| **Milestone 4 (M4)** | Microinteractions & responsive polish | Tested in T2.3 | **PASS** |
| **Milestone Final (M_FINAL)**| 100% Pass across all 61 tests | 61 tests | Target: 61/61 PASS |
