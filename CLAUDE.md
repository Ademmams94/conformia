# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@docs/spec-produit-conformia_1.md

## Project

ConformIA: a self-service AI Act compliance tool for French SMEs (10-100 employees) — maps AI tools in use (declared + "Shadow AI" detected via a browser extension) and generates baseline compliance documentation. Full product spec is imported above from `docs/spec-produit-conformia_1.md` (French) — read it for market context, scope, and rationale before making product decisions; it is the source of truth, not this summary.

Non-negotiable constraints from that spec (section 8) that apply to any feature work:
- No personalized legal advice or "guaranteed compliant" claims — generated documents must carry a disclaimer until a legal partner has reviewed the classification grid.
- The browser extension must never capture page content, only domain + timestamp; employee identifiers are hashed client-side before being sent to the backend.
- Visibility only, no active blocking of detected AI tools.
- French-only, no mobile app, in V1.

## Next.js version note

This repo pins a Next.js 16.2+ canary that bundles version-matched docs at `node_modules/next/dist/docs/` and expects agents to consult them instead of training data (mechanism documented in `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`). Breaking changes vs. older Next.js are real here — check the relevant bundled doc before using an API you remember from training.

## Commands

- `npm run dev` — start dev server on localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript rule sets)

No test runner is configured yet — there are no test files or test scripts in `package.json`.

## Current state vs. planned architecture

The app is still the unmodified `create-next-app` scaffold (`app/layout.tsx`, `app/page.tsx`, Tailwind v4 via `postcss.config.mjs`) — none of the product features below exist yet. Spec sections 7 and 9 are the architecture and week-by-week build reference.

Planned stack (not yet implemented):
- Frontend: this Next.js App Router project (TypeScript + Tailwind)
- Backend/DB: Supabase — Postgres with Row-Level Security for per-company data isolation, Auth, Storage
- Chrome extension: Manifest V3, `chrome.webNavigation` only (no `webRequest`) for domain detection
- Classification engine: fixed rules keyed on AI Act Annexe III, falling back to the Claude API for tools not in the curated list — must stay auditable/reproducible since it's a compliance-facing decision
- PDF generation: headless Chromium (Puppeteer/Playwright) rendering HTML
- Payments: Stripe. Email: Resend. Hosting: Vercel (frontend) + Supabase Cloud (backend)

Data model sketch (spec section 7.2): `companies`, `users`, `detected_tools`, `declared_tools`, `risk_classifications`, `compliance_documents`, `extension_events` (raw extension log, anonymized, 90-day purge).
