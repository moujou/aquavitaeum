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
| `npm run test` | Executes Vitest test suite once | Runs all 138 unit tests across 22 test files |
| `npm run test:watch` | Runs Vitest in interactive watch mode | Real-time test-driven development (TDD) |
| `npm run test:coverage` | Generates Vitest coverage reports | Code coverage auditing |

---

## 🚀 Deployment & Static Export Architecture

Aqua Vitaeum is configured for **Static HTML Export Mode** (`output: "export"` in `next.config.ts`), allowing zero-overhead hosting on **GitHub Pages**, Cloudflare Pages, or static CDNs:

- **Static Bundle Generation**: `npm run build` outputs pure static HTML, CSS, and JS into the `./out` directory.
- **Client Storage Resilience**: Data persistence uses a high-capacity client-side **IndexedDB database (managed via Dexie.js)**, eliminating the 5MB localStorage limits and allowing unlimited photos and notes. It triggers an automatic background server API synchronization when running the Node.js development server backend.
- **Multi-Journal Architecture**: Schema version 2 divides tasting notes by `journalId` and stores journal metadata in a dedicated `journals` table. A custom `useJournals.ts` React hook coordinates Dexie database transactions to compute aggregated metrics (spirit counts, average ratings, latest tasted timestamps) per journal in real time.
- **Automated CI/CD Workflows**:
  - `.github/workflows/ci.yml`: `Build & Code Quality` — Runs ESLint, `tsc --noEmit`, Vitest test suite, and static build validation on every Pull Request.
  - `.github/workflows/deploy.yml`: `Production Deployment` — Deploys static build artifact to GitHub Pages on every push to `main` or `master`.

---

## 📱 Progressive Web App (PWA) Architecture

Aqua Vitaeum is configured as a fully installable PWA for mobile and desktop systems:

- **Web App Manifest (`src/app/manifest.ts`)**: A dynamic manifest configures standalone orientation, theme/background colors (`#2A1B12` and `#0c1a0e`), app naming, and references scalable vector and maskable SVG icons.
- **Offline Capabilities (`public/sw.js`)**: A custom network-first Service Worker script caches primary shell assets (`/`, `whisky-logo-with-circle.svg`, `whisky-logo-maskable.svg`) and caches fetched pages/bundles dynamically to enable full offline use.
- **iOS/Safari High-Fidelity**: Apple mobile-web-app-capable and status-bar-style metadata tags are injected automatically via Next.js metadata layout headers to ensure a clean browser-less look on iOS devices.


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
| **Peaty** | Sea Salt | `#2B788B` | Marine Coastal Teal | High Visibility |
| **Peaty** | Iodine | `#1C6878` | Medical Kelp Cyan | High Visibility |
| **Fruity** | Green Apple | `#3E8E41` | Crisp Apple Green | High Visibility |
| **Fruity** | Citrus Peel | `#C88210` | Citrus Amber Gold | High Visibility |
| **Fruity** | Dried Fig | `#6E2235` | Rich Burgundy Plum | High Visibility |
| **Woody** | Dark Chocolate | `#4A2E1B` | 85% Cacao Espresso | High Visibility |
| **Woody** | Vanilla & Honey | `#D49B22` | Warm Amber Honey | High Visibility |
| **Woody** | Toasted Oak | `#8B4513` | Mahogany Barrel Oak | High Visibility |

---

## 🧪 Testing Guidelines

Unit tests are written using Vitest 4 and `@testing-library/react`.

Before submitting code or merging pull requests:
1. `npm run type-check` (Must pass with 0 errors)
2. `npm run lint` (Must pass with 0 errors/warnings)
3. `npm run test` (Must pass all 138 unit tests)
4. `npm run build` (Must complete static build successfully)
