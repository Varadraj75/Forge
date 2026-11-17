# Forge

A landing page for **Forge**, a hackathon-driven platform for innovation programs, skills-based hiring, skill validation, and AI capability building.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · zero UI libraries

---

## Getting started

```bash
npm install
npm run dev      # start dev server at http://localhost:3000
```

In a separate terminal or for testing and quality checks:

```bash
npm run lint     # run ESLint
npm test         # run Vitest unit tests
```

Production build:

```bash
npm run build && npm start
```

Requires Node 18.17+ (Next 14). Fonts load via `next/font/google`, so the first build needs internet access.

---

## Project structure

```
src/
  app/
    layout.tsx              fonts + metadata
    page.tsx                composes the page sections
    globals.css             design tokens, scroll-reveal utility
    api/
      leads/
        route.ts            POST + GET handlers
  components/
    Navbar.tsx
    Hero.tsx
    Manifesto.tsx
    Features.tsx
    HowItWorks.tsx
    Faq.tsx
    Waitlist.tsx
    Footer.tsx
    Reveal.tsx              IntersectionObserver scroll-reveal wrapper
    icons.tsx               inline SVG icon set + wordmark
  lib/
    leads-store.ts          server-side validation + in-memory store
public/
next.config.mjs
tailwind.config.ts
tsconfig.json
```

---

## API

A single route handler at `src/app/api/leads/route.ts` powers the waitlist form.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/leads` | Validates name, work email, organization, and intent. De-dupes by email. Returns `201` with an id, or `422` with per-field errors. |
| `GET`  | `/api/leads` | Returns the current submission count (quick smoke test). |

Validation is in `src/lib/leads-store.ts`, separated from the transport layer. Storage is an in-memory array to keep the demo dependency-free — the file is documented to show exactly where you'd swap in Postgres/Prisma or a hosted KV without touching the route or the UI.

Quick test:

```bash
curl -X POST localhost:3000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@northbeam.com","organization":"Northbeam","intent":"company"}'
```

---

## Design notes

- **Type:** Bricolage Grotesque (display) / Hanken Grotesk (body) / JetBrains Mono (labels & code)
- **Palette:** near-black ink + warm off-white, one acid-lime accent used sparingly. CSS variables + a small Tailwind token set keep it consistent.
- **Mockups:** built in pure HTML/CSS — no screenshots, fully responsive.
- **Motion:** staggered hero reveal + subtle on-scroll fades, all disabled under `prefers-reduced-motion`.
- **No fake social proof:** no invented logos, testimonials, or fabricated stats. Placeholder UI only.
- **Accessibility:** semantic landmarks, labelled controls, visible focus rings, `aria-invalid` on errored fields, reduced-motion support.
