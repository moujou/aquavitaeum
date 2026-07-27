# Aqua Vitaeum 🥃
> Personal Scotch Whisky Collection & Interactive Tasting Ledger

Aqua Vitaeum is an offline-first, state-of-the-art Scotch Whisky personal ledger featuring a dark vintage pub aesthetic and rich sensory analytics. Built with Next.js App Router, strict TypeScript domain types, local mock datasets, unit test coverage with Vitest, and automated GitHub Actions CI.

---

## 🚀 Key Features

- **Feature-Driven Architecture**: Modular, scalable folder structure grouping domain types, data models, utilities, and components by feature.
- **100% Local Mock Data**: Zero external or paid API dependencies; fully typed local dataset with realistic Scotch Whiskies (Laphroaig 10, Lagavulin 16, Glenfiddich 12).
- **Strict Domain Modeling**: Comprehensive TypeScript interfaces for ABV, ratings, 11-dimension sensory radar profiles (Nose & Taste), color designations, and sensory flavor tags.
- **Unit Testing**: Vitest testing suite covering utility functions and validating dataset integrity.
- **Automated CI/CD**: GitHub Actions workflow automatically validating type safety, unit tests, and production builds on every push and pull request.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: Tailwind CSS v4 & Vanilla CSS
- **Testing**: [Vitest](https://vitest.dev/)
- **CI/CD**: GitHub Actions (Node.js 22)
- **Data Visualization**: Recharts
- **Icons**: Lucide React

---

## 📁 Repository Structure

```text
aquavitaeum-whisky-app/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── src/
│   ├── app/                       # Next.js App Router pages and layout
│   ├── types/
│   │   └── whisky.types.ts        # Core Whisky domain interfaces & types
│   ├── data/
│   │   └── mock-whiskies.ts       # Strongly-typed sample Scotch Whisky dataset
│   ├── lib/
│   │   ├── whisky-utils.ts        # ABV, rating, & tag helper utilities
│   │   ├── schemas/               # Validation schemas placeholder
│   │   └── __tests__/             # Unit tests (colocated Vitest suite)
│   │       └── whisky-utils.test.ts
│   └── components/
│       ├── ui/                    # Reusable primitive UI components
│       └── features/              # Feature-driven UI components
│           ├── tasting-card/
│           ├── tasting-wheel/
│           ├── radar-chart/
│           └── collection/
├── vitest.config.ts               # Vitest configuration & alias path mapping (@/*)
├── package.json                   # Project dependencies and npm scripts
└── tsconfig.json                  # TypeScript compiler settings
```

---

## 📋 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Starts the production server locally |
| `npm run type-check` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| `npm run test` | Executes unit tests once via Vitest |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:coverage` | Generates a 100% code coverage report in terminal and `./coverage/index.html` |
| `npm run lint` | Runs ESLint analysis |

---

## 🧪 Running Unit Tests & Coverage Locally

Run all unit tests once:
```bash
npm run test
```

Generate full code coverage report:
```bash
npm run test:coverage
```
> Open `./coverage/index.html` in your browser for an interactive line-by-line coverage view.

Run unit tests with detailed verbose output:
```bash
npx vitest run --reporter=verbose
```

Run unit tests in interactive watch mode:
```bash
npm run test:watch
```

Launch the interactive Vitest browser dashboard:
```bash
npx vitest --ui
```

---

## ⚙️ Continuous Integration (CI)

The project includes a lightweight GitHub Actions workflow (`.github/workflows/ci.yml`) triggered on `push` and `pull_request` to `main` or `master` branches:

1. **Checkout Code**: Retrieves latest commit code.
2. **Setup Node.js**: Installs Node.js v22 with npm caching.
3. **Install Dependencies**: Runs `npm ci`.
4. **Type Check**: Runs `npm run type-check`.
5. **Unit Tests**: Runs `npm run test`.
6. **Production Build**: Executes `npm run build`.

---

## 🗺️ Project Roadmap

- [x] **Phase 1: Repo Cleanup & Setup**
- [x] **Phase 2: Feature-Driven Folder Structure, Local Mock Architecture & Vitest CI Pipeline**
- [ ] **Phase 3: Vintage Pub UI Theme, Tasting Cards, Radar Charts & Interactive Wheel Components**
