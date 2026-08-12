# 📚 Aqua Vitaeum — Technical Documentation & Developer Guide

This document contains the complete technical documentation, developer setup guide, CLI script references, static export deployment workflow, human-instinctive flavor color specifications, and system architecture for **Aqua Vitaeum**.

---

## 🛠️ Quick Start for Developers

**Prerequisites**: Node.js v20.0.0 or higher (v24 recommended) and npm v10+.

To run Aqua Vitaeum locally on your machine:

```bash
# 1. Install project dependencies
npm install

# 2. Start local development server (http://localhost:3000)
npm run dev

# 3. Run TypeScript type checking
npm run type-check

# 4. Run unit test suite via Vitest
npm run test

# 5. Build production static export bundle
npm run build
```

---

## 💻 Available CLI Scripts

| Script Command | Description | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | Starts Next.js development server | Local interactive development with hot reload |
| `npm run build` | Compiles production static export (`./out`) | Generates standalone static HTML/CSS/JS export |
| `npm run start` | Serves compiled Next.js application | Production server environment |
| `npm run lint` | Executes ESLint flat config checks | Code style, React hooks rules, and syntax validation |
| `npm run type-check` | Runs TypeScript compiler (`tsc --noEmit`) | Strict mode type verification across codebase |
| `npm run test` | Executes Vitest test suite once | Runs all 147 unit tests across 25 test files |
| `npm run test:watch` | Runs Vitest in interactive watch mode | Real-time test-driven development (TDD) |
| `npm run test:coverage` | Generates Vitest coverage reports | Code coverage auditing |

---

## 🚀 Deployment & Static Export Architecture

Aqua Vitaeum is configured for **Static HTML Export Mode** (`output: "export"` in `next.config.ts`), allowing zero-overhead hosting on **GitHub Pages**, Cloudflare Pages, or static CDNs:

- **Static Bundle Generation**: `npm run build` outputs pure static HTML, CSS, and JS into the `./out` directory.
- **Client Storage Resilience**: Data persistence uses a high-capacity client-side **IndexedDB database (managed via Dexie.js)**, eliminating the 5MB localStorage limits and allowing unlimited photos and notes.
- **Canvas Image Compression**: When bottle images are uploaded, the application dynamically scales and compresses them on the client side using a `<canvas>` element (down to a max boundary of 1000px, 85% JPEG quality), shrinking raw 3-5MB uploads down to ~80-150KB before IndexedDB serialization.
- **Multi-Journal Architecture**: Schema version 2 divides tasting notes by `journalId` and stores journal metadata in a dedicated `journals` table. A custom `useJournals.ts` React hook coordinates Dexie database transactions to compute aggregated metrics (spirit counts, average ratings, latest tasted timestamps) per journal in real time.
- **Automated CI/CD Workflows**:
  - `.github/workflows/ci.yml`: `Build & Code Quality` — Runs ESLint, `tsc --noEmit`, Vitest test suite, and static build validation on every Pull Request.
  - `.github/workflows/deploy.yml`: `Production Deployment` — Deploys static build artifact to GitHub Pages on every push to `main` or `master`.

---

## 📱 Progressive Web App (PWA) & Navigation Architecture

Aqua Vitaeum is configured as a fully installable PWA for mobile and desktop systems:

- **Web App Manifest (`src/app/manifest.ts`)**: A dynamic manifest configures standalone orientation, theme/background colors (`#311e15` and `#0c1a0e`), app naming, and references scalable vector and maskable SVG icons.
- **Offline Capabilities (`public/sw.js`)**: A custom network-first Service Worker script caches primary shell assets (`/`, `whisky-logo-with-circle-v4.svg`, `whisky-logo-maskable-v4.svg`) and caches fetched pages/bundles dynamically to enable full offline use.
- **iOS/Safari High-Fidelity**: Apple mobile-web-app-capable and status-bar-style metadata tags are injected automatically via Next.js metadata layout headers to ensure a clean browser-less look on iOS devices.
- **Mobile Usability & Tab Navigation (`src/app/page.tsx`)**:
  - **Bottom Navigation Bar**: Displays a compact 48px (`h-12`) bar at `z-50` with a solid wood texture (`bg-wood`). Provides icon-only buttons for Bookshelf (Exit) and Collection (Toggle). Active tabs display an Amazon-style gold top line (`border-t-4 border-[#C59B27]`) casting a tiny 6px drop shadow gradient (`bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%]`) downwards.
  - **Off-Canvas Sidebar Drawer**: Toggling the Collection drawer opens an overlay drawer (`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] h-full`) positioned above the bottom bar with safe-area padding offsets. Closes via backdrop click or the Escape key.
  - **Responsive Spacing**: Page switcher views utilize static padding top `pt-17 sm:pt-20 lg:pt-0` layout heights, allowing the mobile scroll-hide header transitions to execute cleanly without dynamic padding shifting or scroll jitter loops.
  - **Persistent Welcome state**: Onboarding visibility checks compare both `localStorage` welcome keys and session markers, bypassing the launch screen for returning users.
  - **Collapsible Sidebar (Desktop)**: The sidebar collection panel collapses to a thin `16px` rail line. Content is hidden via a smooth `opacity-0 -translate-x-4` CSS transition wrapper, while the circular `Menu` action toggle stays centered on the vertical line.
  - **Swipe-Back Gesture (`src/hooks/useSwipeBack.ts`)**: A passive `touchstart` / `touchend` listener registered on `document` detects a right-edge → left swipe. Detection parameters: start zone within the last `44px` of screen width, minimum horizontal displacement `60px` leftward, maximum vertical drift `80px`. When all conditions are met, an `onBack` callback owned by `page.tsx` fires and performs the appropriate view transition. The browser/OS native left-edge swipe is preserved alongside it. The hook is zero-coupling: it knows nothing about view state — navigation semantics live entirely in the caller.
  - **Long-Press Select Mode** (`JournalsOverview.tsx`, `SpiritCollectionGrid.tsx`): A 500 ms `setTimeout` ref (`longPressTimer`) starts on `onTouchStart`. If it fires before being cancelled, `longPressActive.current` is set to `true` and `enterSelectMode(id)` is called with haptic feedback (`navigator.vibrate(40)`). On `onTouchEnd`, the timer is cancelled if still pending; if `longPressActive.current` is `true`, `e.preventDefault()` suppresses the synthetic click and the ref resets to `false`. Subsequent taps in select mode call `toggleSelection(id)` via `onClick` — the ref guard is always `false` in select mode, so clicks pass through cleanly. `SpiritCollectionGrid` accepts an optional `isVisible` prop; a `useEffect` auto-exits select mode when `isVisible` becomes `false` (e.g. mobile drawer closes), preventing stale selection state on re-open. The full-screen `bg-black/25` scrim and per-card scale transitions (`scale-[1.02]` selected / `scale-[0.97]` unselected) are driven by `isSelectMode` state.


---

## 🔒 File Storage Safety & Windows Support

For local Node.js development servers, file system operations in `src/lib/server-storage.ts` and `src/lib/settings-storage.ts` use atomic file writes (`settings.json.tmp` -> `settings.json`).

To prevent Windows `EBUSY` file-locking crashes during concurrent access, atomic renames include automatic `fs.copyFile` and `fs.unlink` fallback mechanisms.

---

## 🎨 Human-Instinctive Flavor Palette Matrix

Aqua Vitaeum features a human-instinctive color system where flavor descriptors within the 8 SWRI taxonomy categories map to natural hex colors:

| Category | Descriptor | Hex Code | Color Description | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- |
| **Peaty** | Peat Smoke | `#655A52` | Smoky Grey-Brown | High Visibility |
| **Peaty** | Ash / Soot | `#4F565C` | Ash Slate Grey | High Visibility |
| **Maritime & Mineral** | Sea Salt | `#2B788B` | Marine Coastal Teal | High Visibility |
| **Peaty** | Iodine | `#1C6878` | Medical Kelp Cyan | High Visibility |
| **Fruity** | Green Apple | `#3E8E41` | Crisp Apple Green | High Visibility |
| **Fruity** | Citrus Peel | `#C88210` | Citrus Amber Gold | High Visibility |
| **Winey & Dried Fruit** | Dried Fig | `#6E2235` | Rich Burgundy Plum | High Visibility |
| **Sweetness & Bakery** | Dark Chocolate | `#4A2E1B` | 85% Cacao Espresso | High Visibility |
| **Sweetness & Bakery** | Vanilla & Honey | `#D49B22` | Warm Amber Honey | High Visibility |
| **Woody** | Toasted Oak | `#8B4513` | Mahogany Barrel Oak | High Visibility |

---

## 🧪 Testing Guidelines

Unit tests are written using Vitest 4 and `@testing-library/react`.

Before submitting code or merging pull requests:
1. `npm run type-check` (Must pass with 0 errors)
2. `npm run lint` (Must pass with 0 errors/warnings)
3. `npm run test` (Must pass all 147 unit tests)
4. `npm run build` (Must complete static build successfully)
