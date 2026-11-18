# Forge

[![CI](https://github.com/Varadraj75/Forge/actions/workflows/ci.yml/badge.svg)](https://github.com/Varadraj75/Forge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance landing page and demonstration platform for **Forge**, a hackathon-driven platform for innovation programs, skills-based hiring, skill validation, and AI capacity building.

Built for **IEEE IGDTUW Open Source Week 10.0 (Nov 13–19, 2026)**.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Vitest · Zero external UI libraries

---

## ⚡ Highlights & Architecture

- **Server Component Streaming with Suspense:** Live platform telemetry streamed per-request (`export const dynamic = "force-dynamic"`) with zero-CLS skeleton boundaries.
- **Zero-FOUC Dark Mode:** Inline blocking theme initialization script eliminating hydration mismatch, with accessible touch-target-compliant theme toggle and dynamic `<meta name="theme-color">` synchronization.
- **WCAG 2.1 AAA Accessible Form Controls:** Full WAI-ARIA radio group with arrow-key keyboard navigation, explicit `<label htmlFor>` bindings, error description associations, live regions, and programmatic focus restoration.
- **WAI-ARIA Accordion Pattern:** Fully accessible collapsible FAQ panels with `aria-controls`, `aria-expanded`, and `aria-hidden` attributes.
- **Automated Testing Suite (Vitest):** 15 automated unit and route integration tests verifying validation logic, email normalization, lead deduplication, telemetry calculations, and HTTP response contracts.
- **Continuous Integration (GitHub Actions):** Pinned CI workflow executing strict TypeScript typechecking, ESLint validation, Vitest test execution, and production Next.js builds on every push and pull request.
- **Edge OpenGraph & SEO:** Dynamic 1200x630 social share card generated at the edge via `@vercel/og`, alongside programmatic `sitemap.ts`, `robots.ts`, and `manifest.ts`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `18.17+` or `20.x`
- npm `9+` or pnpm `9+`

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Varadraj75/Forge.git
cd Forge

# Install dependencies
npm install  # or: pnpm install

# Start development server
npm run dev  # or: pnpm dev
# Open http://localhost:3000
```

---

## 🧪 Testing & Verification

```bash
# Run automated Vitest test suite
npm test  # or: pnpm test

# Run ESLint validation
npm run lint

# Strict TypeScript typechecking
npx tsc --noEmit

# Production Next.js build
npm run build
```

---

## 📁 Project Structure

```
.github/
  workflows/
    ci.yml                  Pinned GitHub Actions CI pipeline
src/
  app/
    api/
      leads/
        route.ts            POST + GET route handlers
        __tests__/          API route integration tests
    globals.css             Design tokens, dark mode, animations
    layout.tsx              Fonts, metadata, theme script, skip link
    manifest.ts             PWA web application manifest
    opengraph-image.tsx     Dynamic edge OpenGraph card (@vercel/og)
    page.tsx                Streaming SSR composition with Suspense
    robots.ts               Search engine crawler instructions
    sitemap.ts              Dynamic XML sitemap generator
  components/
    Navbar.tsx              Responsive navigation with ThemeToggle
    Hero.tsx                Hero section
    HeroPanelInteractive.tsx Interactive test-runner sandbox
    LivePlatformStats.tsx   Server Component streaming live telemetry
    LivePlatformStatsSkeleton.tsx Zero-CLS Suspense fallback
    Manifesto.tsx           Product philosophy
    Features.tsx            Platform pillars and mock cards
    HowItWorks.tsx          Three-step process
    Faq.tsx                 WAI-ARIA accessible accordion
    Waitlist.tsx            Accessible waitlist form with focus management
    Footer.tsx              Accessible navigation footer
    ThemeProvider.tsx       Resilient theme context & storage guard
    ThemeToggle.tsx         Accessible theme switch button
    Reveal.tsx              Reduced-motion-safe intersection reveal
    icons.tsx               SVG icon system & dynamic adaptive Logo
  lib/
    constants.ts            Centralized site constants & URLs
    leads-store.ts          Server-side validation & in-memory store
    telemetry.ts            Telemetry calculation service
    theme-script.ts         Server-safe inline blocking theme script
    __tests__/              Unit test suites for store & telemetry
CONTRIBUTING.md             Contributor guidelines & IEEE instructions
vitest.config.ts            Vitest test runner configuration
tailwind.config.ts          Tailwind configuration with darkMode: "class"
next.config.mjs             Next.js configuration with security headers
```

---

## 📬 API Reference

| Method | Path | Status | Description |
|---|---|---|---|
| `POST` | `/api/leads` | `201` / `422` / `400` | Validates name, email, organization, and intent. De-dupes by email. Returns lead ID or field errors. |
| `GET` | `/api/leads` | `200` | Returns current registered submission count. |

---

## 📜 Contributing & License

Please review [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting pull requests.

Distributed under the MIT License.
