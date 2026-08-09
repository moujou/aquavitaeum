# 🤖 Aqua Vitaeum — AI Agent Steering Directives

## 🎯 Project Scope & Architecture
- **Domain**: Fine spirits tasting journal & sensory analytics suite.
- **Framework**: Next.js 16 App Router (React Server Components by default; `"use client"` only for stateful/interactive UI).
- **Language**: TypeScript 5 in strict mode.
- **Styling**: Tailwind CSS v4 & Vanilla CSS.
- **Testing**: Vitest 4 & `@testing-library/react`.

---

## 🎨 Aesthetic & Design System
- **Theme**: Dark vintage iron pub aesthetic (charcoal slate darks `#121212`, warm amber accents `#C59B27`, deep forest green `#2A5E3F`, aged parchment).
- **Sensory Profiling**: Dual-layer 11-dimension radar chart (Nose vs. Taste) and 60-second finish time-intensity Bezier spline graph.
- **Instinctive Palette**: Flavor descriptors map to natural human-associated hex colors (e.g., Peat Smoke `#655A52`, Sea Salt `#2B788B`, Green Apple `#3E8E41`).

---

## 📁 Key File Locations
- **Pages**: `src/app/`
- **Features**: `src/components/features/`
- **Primitives**: `src/components/ui/`
- **Hooks**: `src/hooks/`
- **Taxonomy (SSOT)**: `src/data/spirit-flavor-taxonomy.ts`
- **Domain Contracts**: `src/types/spirit.types.ts`
- **Schemas**: `src/lib/schemas/spirit.schema.ts`

---

## 📚 Documentation Synchronization Rule
Whenever introducing a new feature, architecture change, or CLI script:
1. Evaluate if `docs/DOCUMENTATION.md` needs technical/developer updates.
2. Evaluate if `README.md` needs high-level capability updates.

---

## 🧪 Quality & Verification Gate
Before declaring ANY task complete:
1. Always execute `npm run type-check` (TypeScript strict check) and `npm run lint` (ESLint).
2. For tests (`npm run test`) and production builds (`npm run build`), check with the user or determine if code edits justify skipping them to conserve tokens (e.g., if changes are purely vector graphics, configs, or minor styling). Run them if logic changes have occurred or upon user request.
