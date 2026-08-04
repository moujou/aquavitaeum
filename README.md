# Aqua Vitaeum

> **Fine Spirits Journal & Interactive Tasting Notes Web Application**

**Aqua Vitaeum** is an offline-first web journal designed for fine spirits connoisseurs (Scotch Whisky, Bourbon, Irish Whiskey, Japanese Whisky, Rum, Gin, Tequila, Mezcal, Cognac, and more). It combines a dark vintage iron pub aesthetic with interactive sensory analytics, dual-layer radar profiling, and spirit collection management.

Built with Next.js 16 (App Router), React 19, TypeScript 5 (Strict Mode), Tailwind CSS v4, Recharts, Vitest 4, and GitHub Actions CI.

---

## Key Features & Capabilities

### Interactive Tasting Ledger
- Record comprehensive spirit metadata: Distillery, Name, Region, Age, Cask/Batch No., ABV %, Date Tasted, and Finish (wood/cask finish description).
- **Locale-aware Date Tasted field** with a fully custom calendar popup (no native browser picker) — month names and weekday grids switch automatically between English (Sunday-first) and German (Monday-first) to match the active language setting.
- Quick-toggle tasting checkboxes: **Cask Strength**, **Added Colour**, **Chill Filtered**, **Added Water**, **On the Rocks**, and **With Chocolate**.
- Dynamic score rating (1–100) with automatic 1–5 gold star calculation and visual quality category rating.
- Destructive note deletion with an interactive confirmation modal dialog.

### Dual-Layer Sensory Radar Profile
- Interactive 11-dimension radar chart comparing **Nose** and **Taste** intensity profiles (*Fruity*, *Floral*, *Spicy*, *Cereal*, *Peaty*, *Sulphury*, *Feinty*, *Nutty*, *Woody*, *Winey*, *Chocolate*).
- Compact 0–10 intensity range sliders for real-time sensory profile updates.

### Spirit Color & Mouthfeel Selectors
- Visual spirit color scale featuring defined color swatches (Clear, White Wine, Straw, Honey, Gold, Amber, Copper, Mahogany, Dark Oak).
- Texture and mouthfeel selectors (Watery, Oily, Creamy, Smooth).

### Categorized Flavor Tag Selector
- Interactive flavor wheel tags categorized by profile (Peat & Smoke, Cask & Wood, Fruity & Floral, etc.) with an active flavor summary chip view.
- Dual-mode selector for **Nose** and **Taste** flavor tags independently.

### Bottle & Label Photo Carousel
- Upload, preview, navigate, and delete bottle label, spirit color, or tasting setup photos via browser DataURL storage.

### Spirit Collection Management
- Sidebar collection grid displaying spirit cards with ABV, color swatch, star rating, and region badge.
- Real-time search filter by distillery, name, region, or spirit type.
- Spirit type filter dropdown supporting all fine spirit categories.
- One-click creation of new tasting notes with auto-selection handling.

### Language Switcher (EN / DE)
- Full bilingual support: English and German UI throughout all labels, form fields, radar chart axes, and flavor tags.
- Language preference is persisted via the `/api/settings` endpoint and localStorage fallback.
- All locale-sensitive components (calendar popup, date formatting, weekday layout) react instantly to language changes without a page reload.

### Decoupled Domain Architecture & Testing
- Clean separation of concerns utilizing custom React hooks (`useSpiritCollection`, `useTastingCardForm`, `usePhotoUpload`) and primitive UI components (`RatingStars`, `ConfirmDialog`, `CalendarPopup`).
- Strict domain schema validation (`spirit.schema.ts`).
- Colocated Vitest testing suite with `@testing-library/react` running in a `jsdom` environment — **117 tests** across 16 test files.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) — App Router, React Server Components |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) — Strict Mode |
| **Styling** | Tailwind CSS v4 & Vanilla CSS |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest 4](https://vitest.dev/) & [@testing-library/react](https://testing-library.com/) (`jsdom`) |
| **CI/CD** | GitHub Actions (Node.js 24) |

> **No external date-picker library** — the locale-aware calendar popup is built with plain React and Tailwind CSS.

---

## Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Starts the production server locally |
| `npm run type-check` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| `npm run test` | Executes unit tests once via Vitest |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:coverage` | Generates code coverage report in terminal and `./coverage/index.html` |
| `npm run lint` | Runs ESLint analysis |

---

## Running Unit Tests

Run all unit tests once:
```bash
npm run test
```

Generate full code coverage report:
```bash
npm run test:coverage
```
> Open `./coverage/index.html` in your browser for an interactive line-by-line coverage view.

Run unit tests in interactive watch mode:
```bash
npm run test:watch
```

---

## Continuous Integration (CI)

The project includes an automated GitHub Actions workflow (`.github/workflows/ci.yml`) triggered on `push` and `pull_request` to `main` or `master` branches running on **Node.js 24**:

1. **`lint-and-typecheck`**: Runs `npm run lint` and `npm run type-check` concurrently.
2. **`unit-tests`**: Runs `npm run test:coverage` in parallel to generate test coverage.
3. **`production-build`**: Executes `npm run build` only after linting, typechecking, and unit tests pass.
