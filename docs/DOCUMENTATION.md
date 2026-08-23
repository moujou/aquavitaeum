# 📚 Aqua Vitaeum — Technical Documentation & Developer Guide

This document contains the complete technical documentation, developer setup guide, CLI script references, static export deployment workflow, AI assistant specifications, human-instinctive flavor taxonomy, and system architecture for **Aqua Vitaeum**.

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

# 5. Run test coverage audit
npm run test:coverage

# 6. Build production static export bundle
npm run build
```

---

## 💻 Available CLI Scripts

| Script Command | Description | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | Starts Next.js development server with Turbopack | Local interactive development with hot module replacement |
| `npm run build` | Compiles production static export (`./out`) | Generates standalone static HTML/CSS/JS export with Turbopack |
| `npm run start` | Serves compiled Next.js application | Production server environment preview |
| `npm run lint` | Executes ESLint checks | Code style, React hooks rules, and syntax validation |
| `npm run type-check` | Runs TypeScript compiler (`tsc --noEmit`) | Strict mode type verification across entire codebase |
| `npm run test` | Executes Vitest test suite once | Runs all 306 unit tests across 53 test files (100% pass rate) |
| `npm run test:watch` | Runs Vitest in interactive watch mode | Real-time test-driven development (TDD) |
| `npm run test:coverage` | Generates Vitest coverage reports via v8 | Comprehensive code coverage auditing (>65% coverage) |

---

## 🚀 Deployment & Static Export Architecture

Aqua Vitaeum is configured for **Static HTML Export Mode** (`output: "export"` in `next.config.ts`), allowing zero-overhead, serverless hosting on **GitHub Pages**, Cloudflare Pages, or static CDNs:

- **Static Bundle Generation**: `npm run build` outputs pure static HTML, CSS, and JavaScript into the `./out` directory.
- **Client Storage Resilience**: Data persistence uses a high-capacity client-side **IndexedDB database (managed via Dexie.js)**, eliminating browser `localStorage` size limits and allowing unlimited photos and tasting notes.
- **Canvas Image Compression**: When bottle images are uploaded or captured via camera, the application dynamically scales and compresses them on the client side using a `<canvas>` element (down to a max boundary of 1000px, 85% JPEG quality), shrinking raw 3–5MB uploads down to ~80–150KB before IndexedDB serialization.
- **Multi-Journal Architecture**: Tasting notes are partitioned by `journalId` and stored in a dedicated `journals` table. A custom `useJournals.ts` React hook coordinates Dexie database transactions to compute aggregated metrics (bottle counts, average ratings, latest tasted timestamps) per journal in real time.
- **Automated CI/CD Workflows**:
  - `.github/workflows/ci.yml`: `Build & Code Quality` — Runs ESLint, `tsc --noEmit`, Vitest test suite, and static build validation on every Pull Request.
  - `.github/workflows/deploy.yml`: `Production Deployment` — Deploys static build artifact to GitHub Pages on every push to `main`.

---

## 🧠 Cask & Spirit AI Assistant & Scanner (Google Gemini 2.5)

Aqua Vitaeum includes a powerful, **100% free and serverless AI Assistant** powered by Google Gemini:

### 1. 100% Client-Side BYOK (Bring Your Own Key) Security Model
- **Direct Browser-to-Google Communication**: The API key is stored strictly in the user's browser `localStorage` (`aqua-vitaeum-gemini-key`).
- **Zero Intermediary Servers**: No developer or proxy servers ever intercept API keys, images, or tasting notes.
- **Free Tier Compatible**: Users obtain a free personal API key directly from Google AI Studio.

### 2. Multimodal Label & Barcode Scanner
- **Dual Recognition Pipeline**:
  - **Barcode Scanning**: Reads UPC-A, EAN-13, and QR codes directly in-browser using native `BarcodeDetector` (with automatic fallback to `zxing-wasm`).
  - **Bottle Photo & Label OCR**: Analyzes label photos via Google Gemini 2.5 Flash Vision.
- **Automated Domain Autopopulation**:
  - Automatically identifies spirit name, distillery, country/region, spirit category, ABV, age statement, and cask maturation types.
  - Generates structured 11-dimension sensory radar scores (Nose and Palate) and extracts curated flavor tags from the 8 SWRI taxonomy categories.
- **Model Flexibility**:
  - Defaults to **Gemini 2.5 Flash** for rapid (~1.5s) analysis and minimal token consumption.
  - Supports switching to **Gemini 2.5 Pro** for complex vintage bottlings and deep historical provenance lookups.

---

## 🎴 Responsive Layouts & UX Ergonomics

The application provides two complementary viewing modes tailored for different usage contexts:

### 1. 🎴 Kartenansicht (Card / Magazine Feed View)
- **Smartphone (`< 640px`)**: Single-column full-width card feed (`grid-cols-1`). Jede Tasting-Karte wird als vollwertiger, magazinartiger Steckbrief mit Flaschenbild, Sommelier-Siegel, Fassreifung, Aromen-Kategorie-Icons und Sternen dargestellt.
- **Tablet (`sm:grid-cols-2`)**: 2 Spalten für optimale Raumnutzung auf Tablets.
- **Desktop (`lg:grid-cols-3`)**: 3 Spalten im harmonischen Atelier-Raster.

### 2. 📋 Kompaktliste (List View)
- Flache, platzsparende Tabellenansicht mit Schnellübersicht (Flaschen-Thumbnail, Name, Destillerie, Region, ABV, Aromen-Tags und Score-Medaille).
- Ideal für schnelles Überfliegen und Suchen in umfangreichen Sammlungen.

### 3. 👆 Gesten & Multi-Select (`useMultiSelect.ts`)
- **Long-Press Selektionsmodus**: Durch langes Drücken (500ms Timer mit haptischem Vibrations-Feedback `navigator.vibrate(40)`) wird der Mehrfachauswahl-Modus aktiviert.
- **Bulk Actions**: Ermöglicht das gemeinsame Exportieren oder Löschen mehrerer ausgewählter Tasting-Notizen über das Aktionen-Menü.
- **Swipe-Back Navigation (`useSwipeBack.ts`)**: Natürliche Wischgeste vom rechten Bildschirmrand zur schnellen Navigation zurück zur Übersicht.

---

## ☁️ Google Drive Cloud Sync & Datensouveränität

Aqua Vitaeum bietet eine **100% serverlose, datenschutzfreundliche Cloud-Synchronisation**:

- **Serverloser Zero-Footprint**: Synchronisiert direkt zwischen IndexedDB und dem privaten Google Drive des Nutzers.
- **Ordnerstruktur im Google Drive**:
  ```
  Google Drive /
  └── Aqua Vitaeum/
      ├── Islay Single Malts/
      │   ├── _journal.json                 (ID, Name, Color, CreatedAt, UpdatedAt)
      │   ├── Ardbeg 10 Years Old.json      (Full Spirit Record)
      │   └── Laphroaig Cask Strength.json  (Full Spirit Record)
      └── Speyside Collection/
          ├── _journal.json
          └── Macallan 12 Sherry Oak.json
  ```
- **Tombstone-Löschungsverwaltung (`tombstones.ts`)**:
  - Gelöschte Notizen hinterlassen lokale Tombstones mit Löschzeitstempel, sodass gelöschte Einträge bei der nächsten Synchronisation auch remote sauber entfernt werden, ohne versehentlich wiederhergestellt zu werden.
- **Rogue-File Guard & Validierung**:
  - Alle Dateien werden über domain-spezifische Zod-Schemas validiert (`validateSpirit()`). Fremddateien werden übersprungen, ohne den Sync-Vorgang zu unterbrechen.
- **Offline-Export & Import**:
  - **Gesamt-Backup**: Vollständiges `.json` Backup aller Notizen und Journals (`downloadLocalBackupFile`).
  - **Journal-Export/Import**: Einzelne Journals exportieren und importieren.
  - **Einzelnotiz-Export/Import**: Spezifische Tastings als `.json` Datei teilen.

---

## 🎨 Design System & Visual Specification

Aqua Vitaeum basiert auf einer Designsprache im Stil eines **historischen irischen Destillerie-Ateliers** (Warm Vintage Linen Canvas, Letterpress Walnut Ink, Irish Clover Green Accents, pot-still Amber-Copper Highlights).

Für die vollständige Design-Spezifikation, Farbtoken-Tabellen und WCAG AAA Kontrastwerte:
👉 **[`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)**

---

## 🥃 Human-Instinctive Flavor Palette Matrix

Aqua Vitaeum bildet Aromen deskriptiv über 8 SWRI-Kategorien auf natürliche Farbtöne ab:

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

Unit- und Integrationstests werden mit **Vitest 4** und **`@testing-library/react`** durchgeführt:

```bash
# Gesamte Testsuite ausführen
npm run test

# Testabdeckung analysieren
npm run test:coverage
```

Vor dem Mergen von Änderungen:
1. `npm run type-check` (0 Fehler)
2. `npm run lint` (0 Fehler, 0 Warnungen)
3. `npm run test` (306 Tests / 53 Suiten bestanden)
4. `npm run build` (Statischer Export erfolgreich)
