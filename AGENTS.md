<!-- BEGIN:nextjs-agent-rules -->
# Next.js App Router, TypeScript, and Tailwind CSS Rules

- **Framework**: Next.js App Router (React Server Components by default; use `"use client"` only when interactive state or lifecycle hooks are needed).
- **Language**: TypeScript (strict mode enabled).
- **Styling**: Tailwind CSS v4 & Vanilla CSS.
- **Documentation**: Refer to `node_modules/next/dist/docs/` for API conventions and deprecations.
<!-- END:nextjs-agent-rules -->

# Aqua Vitaeum — Project Context & Agent Guidelines

## 🥃 Application Overview
**Aqua Vitaeum** is an offline-first web journal designed for fine spirits connoisseurs (Scotch Whisky, Bourbon, Irish Whiskey, Japanese Whisky, Rum, Tequila, Mezcal, Cognac, etc.). It combines a dark vintage iron pub aesthetic with interactive sensory analytics, dual-layer radar profiling, and spirit collection management.

---

## 🏗️ Architecture & Directory Structure
- **`src/app/`**: Next.js App Router pages, layout, and global styling (`globals.css`).
- **`src/components/features/`**: Feature components (Tasting Ledger, Radar Profile, Collection Sidebar, Photo Carousel, Color/Mouthfeel Selectors).
- **`src/components/ui/`**: Reusable primitive UI components (`RatingStars`, `ConfirmDialog`, modal/dialog wrappers).
- **`src/hooks/`**: Custom React hooks handling domain logic (`useSpiritCollection`, `useTastingCardForm`, `usePhotoUpload`).
- **`src/lib/`**: Helpers (`spirit-utils.ts`, `utils.ts`) and validation schemas (`src/lib/schemas/spirit.schema.ts`).
- **`src/types/`**: Domain type definitions (`spirit.types.ts`).

---

## 🎨 Design & Aesthetic Rules
- **Aesthetic**: Dark vintage iron pub aesthetic (warm amber accents, deep slate/charcoal darks, metallic highlights).
- **Sensory Profiling**: 11-dimension dual-layer radar chart comparing **Nose** and **Taste** intensity profiles (*Fruity*, *Floral*, *Spicy*, *Cereal*, *Peaty*, *Sulphury*, *Feinty*, *Nutty*, *Woody*, *Winey*, *Chocolate*).
- **State & Storage**: Offline-first via browser DataURL and local persistence.

---

## 🧪 Testing & Code Verification
Before declaring any task complete, always verify quality using:
- `npm run type-check` — Type checking via TypeScript compiler (`tsc --noEmit`).
- `npm run lint` — Code linting via ESLint.
- `npm run test` — Unit and component testing via Vitest + `@testing-library/react`.
- `npm run build` — Next.js production build verification.
