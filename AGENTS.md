# 🤖 Aqua Vitaeum — AI Agent Steering Directives

## 🎯 Project Scope & Architecture
- **Domain**: Fine spirits tasting journal & sensory analytics suite.
- **Framework**: Next.js 16 App Router (React Server Components by default; `"use client"` only for stateful/interactive UI).
- **Language**: TypeScript 5 in strict mode.
- **Styling**: Tailwind CSS v4 & Vanilla CSS.
- **Testing**: Vitest 4 & `@testing-library/react`.

---

## 🎨 Aesthetic & Design System
- **Theme**: Warm Vintage Linen & Calibrated Clover Green (warm linen canvas `#ECE5D8`, crisp ivory cards `#FDFBF7`, deep letterpress walnut ink `#2B1E14`, calibrated clover green `#237347`, vibrant Irish clover `#2E945D`, warm honey oak selection `#B3895D`, amber-copper `#C97A1E` / `#FFD166`) with optional vintage dark pub mode (`[data-theme="pub-dark"]`).
- **Design System Spec**: Refer to [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) for full color theory, contrast ratios, and typography rules.
- **Sensory Profiling**: Dual-layer 11-dimension radar chart (Nose vs. Taste) and 60-second finish time-intensity Bezier spline graph.
- **Instinctive Palette**: Flavor descriptors map to natural human-associated hex colors (e.g., Peat Smoke `#655A52`, Sea Salt `#2B788B`, Green Apple `#3E8E41`).

---

## 📁 Key File Locations
- **Pages**: `src/app/`
- **Features**: `src/components/features/`
- **Primitives**: `src/components/ui/`
- **Hooks**: `src/hooks/`
- **Taxonomy (SSOT)**: `src/data/spirit-flavor-taxonomy.ts`
- **Design System Spec**: `docs/DESIGN_SYSTEM.md`
- **Domain Contracts**: `src/types/spirit.types.ts`
- **Schemas**: `src/lib/schemas/spirit.schema.ts`

---

## 📚 Documentation Synchronization Rule
Whenever introducing a new feature, architecture change, or CLI script:
1. Evaluate if `docs/DOCUMENTATION.md` needs technical/developer updates.
2. Evaluate if `README.md` needs high-level capability updates.
3. Evaluate if `docs/DESIGN_SYSTEM.md` needs updates when UI tokens or styling changes.

---

## 🧪 Quality & Verification Gate
Before declaring ANY task complete:
1. Always execute `npm run type-check` (TypeScript strict check) and `npm run lint` (ESLint).
2. For tests (`npm run test`) and production builds (`npm run build`), check with the user or determine if code edits justify skipping them to conserve tokens (e.g., if changes are purely vector graphics, configs, or minor styling). Run them if logic changes have occurred or upon user request.

---

## 🚫 Artifact Restrictions
- **NEVER create `walkthrough.md` files or artifacts.** Provide concise in-chat walkthrough summaries instead.

---

## 🎨 Color Usage Rules — MANDATORY

> **NEVER use raw hex codes in `className` strings or `style` props for UI chrome, surfaces, or interactive states.**
> All colors MUST reference a named CSS custom property from `src/app/globals.css`.
> Token definitions live in `:root` / `[data-theme="pub-dark"]` in `globals.css`.

### Token Quick Reference

| Token | Role / Surface |
|---|---|
| `--pub-bg` | App root bg, all scrollable area backgrounds (`#ECE5D8`) |
| `--pub-bg-alt` | Secondary depth, table headers, tags (`#E2D9C8`) |
| `--pub-bg-panel` | Dialogs, elevated panels, card canvas (`#FDFBF7`) |
| `--nav-bg` | Seamless floating navigation bar surface (`#ECE5D8`) |
| `--nav-active` | High-contrast amber-gold active tab indicator (`#C97A1E`) |
| `--nav-inactive` | Muted warm sepia slate inactive tab icon (`#8A7360`) |
| `--wood-accent` | Clover green primary secondary and structural accent (`#2E945D`) |
| `--wood-dark` | Deep clover green tone (`#237347`) |
| `--wood-selection` | Active selection bg on cards and active toggle pills (`#2E945D`) |
| `--sensory-nose` | Luminous Amber-Gold for Nose aroma radar layers (`#C97A1E`) |
| `--sensory-taste` | Maritime Coastal Teal for Taste palate radar layers (`#1C6B7D`) |
| `--brass-accent` | Active borders, focus rings, stars, ratings (`#C97A1E`) |
| `--brass-muted` | Secondary brass and subtitles (`#A66519`) |
| `--parchment-bg` | Tasting card body, light canvas (`#FDFBF7`) |
| `--parchment-border` | Hairline rules, card borders (`#D8CCB8`) |
| `--parchment-divider` | Section divider lines (`rgba(35, 115, 71, 0.22)`) |
| `--sepia-text` | Primary ink text (`#2B1E14`) |
| `--sepia-muted` | Placeholders, muted labels (`#6D5949`) |
| `--sepia-light` | Section headers, subheadings (`#8A6E55`) |
| `--foreground` | Primary text across app (`#2B1E14`) |
| `--fab-bg` | Primary CTA and action trigger bg (`#2E945D`) |
| `--fab-text` | FAB icon and label color (`#FDFBF7`) |
| `--forest-green` | Vibrant Irish Clover green accents (`#2E945D`) |

### Surface to Token Mapping

| Surface | How to style it |
|---|---|
| App scrollable background | `bg-[var(--pub-bg)]` |
| Header / Bottom Nav bar | `.bg-wood` class |
| Any FAB or primary CTA button | `.btn-fab` OR `bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--fab-border)] hover:bg-[var(--fab-bg-hover)]` |
| Tasting card surface | `.parchment` class |
| Tasting card text inputs | `.input-parchment` OR `border-b border-[var(--parchment-border)] text-[var(--sepia-text)] placeholder:text-[var(--parchment-border)] focus:border-[var(--sepia-muted)] focus:outline-none` |
| Toggle / pill buttons on parchment | `.card-toggle` class |
| Active selection on parchment | `bg-[var(--wood-selection)] border-[var(--brass-accent)] text-[var(--parchment-bg)]` |
| Section dividers inside parchment card | `border-[var(--parchment-divider)]` |
| Dialogs / modals | `bg-[var(--pub-bg-panel)]` |
| Accent / focus border | `border-[var(--brass-accent)]` |
| Primary text on dark bg | `text-[var(--foreground)]` |
| Primary text on parchment | `text-[var(--sepia-text)]` |
| Muted text / placeholders | `text-[var(--sepia-muted)]` |
| Section header labels | `text-[var(--sepia-light)]` |
| Card hover title shimmer | `group-hover:text-[var(--brass-accent)]` |
| Journal card hover border | `hover:border-[var(--forest-green)]/40` |
| Destructive actions | Tailwind red scale ONLY (`red-800`, `red-900`, `red-950`, `red-500`) |

### Forbidden Patterns

```
bg-[#C59B27]        WRONG  ->  bg-[var(--brass-accent)]        CORRECT
text-[#1A120B]      WRONG  ->  text-[var(--sepia-text)]        CORRECT
border-[#C4A87A]    WRONG  ->  border-[var(--parchment-border)] CORRECT
bg-[#E8D5B7]        WRONG  ->  bg-[var(--fab-bg)]              CORRECT
text-[#311e15]      WRONG  ->  text-[var(--fab-text)]          CORRECT
text-[#e8d5b7]      WRONG  ->  text-[var(--foreground)]        CORRECT
bg-[#224229]        WRONG  ->  bg-[var(--pub-bg-panel)]        CORRECT
bg-[#122616]        WRONG  ->  bg-[var(--pub-bg)]              CORRECT
border-[#D4C3A3]    WRONG  ->  border-[var(--parchment-divider)] CORRECT
hover:bg-[#F5F2EB]  WRONG  ->  hover:bg-[var(--fab-bg-hover)]  CORRECT
text-[#5c3d22]      WRONG  ->  text-[var(--sepia-muted)]       CORRECT
text-[#755030]      WRONG  ->  text-[var(--sepia-light)]       CORRECT
bg-[#3D2616]        WRONG  ->  bg-[var(--wood-selection)]      CORRECT
border-[#2A5E3F]/40 WRONG  ->  border-[var(--forest-green)]/40 CORRECT
```

### Allowed Exceptions

These MAY remain as raw hex values — they are NOT UI design tokens:

1. **Flavor taxonomy colors** in `src/data/spirit-flavor-taxonomy.ts` (e.g. Peat Smoke `#655A52`) — data, not design.
2. **Image gradient overlays** on photo thumbnails — dark near-black stops (`#22170F`, `#0D0805`, `#122418`) are visual image treatments.
3. **Welcome page atmospheric glows** — decorative scene orb gradients (`#A05B17`, `#D48A22`, `#FFC04D`).
4. **Tailwind semantic colors** — built-in names (`red-900`, `gray-400`, `white`, `black`, `white/5`, `black/25`, etc.).
5. **Dynamic computed colors** — JS variables like `colourHex` from `SPIRIT_COLOUR_HEX` are data-driven.
6. **Inline SVG data URIs** — embedded SVG hex values in CSS strings.
7. **rgba() shadow/glow values** — box-shadow and text-shadow rgba values do not need tokenization.
