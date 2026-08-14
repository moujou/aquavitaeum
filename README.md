<div align="center">

<img src="./public/whisky-logo-with-circle-v4.svg" width="96" height="96" alt="Aqua Vitaeum Logo" />

# Aqua Vitaeum

### *A Fine Spirits Tasting Journal & Interactive Sensory Suite*

> **Aqua Vitae-um**: *A digital compendium forged from Medieval Latin "Aqua Vitae" (Water of Life) for fine spirits connoisseurs.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=progressive-web-apps)](https://web.dev/progressive-web-apps/)
[![Vitest](https://img.shields.io/badge/Vitest-147_Tests_Passing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

---

<p align="center">
  <b>Dark Vintage Iron Pub Aesthetic</b> • <b>Dual-Layer Radar Profiling</b> • <b>60s Finish Timeline</b> • <b>Bilingual EN/DE</b> • <b>PWA Standalone</b>
</p>

</div>

---

## Overview

**Aqua Vitaeum** is a web application designed for Single Malt Scotch, Bourbon, Irish Whiskey, and fine spirits tasting. Designed around a warm **dark vintage iron pub aesthetic**, the application translates tasting notes into interactive sensory analytics and visual evaluation tools.

The name subtly fuses the historical Medieval Latin **"Aqua Vitae"** (*Water of Life*, the etymological root of Gaelic *Uisge Beatha* and modern *Whisky*) with the Latin compendium suffix **"-um"**, creating a digital sanctuary and tasting codex for spirit appreciation.

---

## Core Capabilities & Features

- **Interactive Tasting Ledger**: Record comprehensive production metadata, distillery details, region, age statements, cask configurations, and alcohol strength. Track production attributes such as cask strength or non-chill filtration, alongside serving methods and tasting dates via a custom locale-aware calendar.
- **Multi-Journal & Compendium Folders**: Organize and partition tasting notes into separate, distinct journals. Each journal is represented by a stacked bookshelf card displaying a split widescreen cover grid showcasing up to 3 of the last added bottle photos, complete with integrated note indicators, average ratings, and calendar timestamps.
- **Premium Tasting Card List Preview**: The tasting list sidebar features aspect-video widescreen thumbnails with rating badges placed next to a 10% custom vertical color indicator representing the spirit's natural color, featuring an accelerated internal fluid flow shimmer animation.
- **Immersive Onboarding & Welcome Screen**: Introduces new users to the app with a dark vintage pub splash screen featuring smooth, CSS-animated fluid amber background waves and high-fidelity typography, saved persistently in local storage.
- **Global Header Search**: Search for spirits and journals across your entire collection simultaneously using an enlarged, dark-themed, and responsive search bar placed in the central header.
- **Collapsible Sidebar & Symmetrical FABs**:
  - Fold the desktop list panel to a clean `16px` rail line with a contextual toggle button showing smooth opacity transition animations.
  - Symmetrical floating action buttons (FABs) automatically shift dynamically to give you quick access to bookshelf routing and note creation.
- **Long-Press Multi-Select & Bulk Delete**: On mobile, long-pressing any journal card or tasting note card (500 ms) enters a tactile select mode with haptic feedback. Selected items scale up with an amber highlight; unselected items recede behind a dark overlay. A persistent header action bar provides Edit, Delete, and Cancel icon buttons — always visible above the navigation bar. Bulk deletion requires confirmation before permanently removing items.
- **Dual-Layer Sensory Radar Analytics**: Evaluate and visualize spirit profiles through an interactive 11-dimension sensory radar chart. The dual-layer design enables direct side-by-side comparison between Nose aromas and Palate flavors in real time.
- **60-Second Finish Time-Intensity Curve**: Map the temporal evolution of a spirit's finish using custom SVG cubic Bezier spline graphs. Track flavor onset, peak intensity, and extinction across a 60-second timeline, complete with dynamic flavor-matched accent colors.
- **Human-Instinctive Color System**: Every flavor descriptor within the SWRI-aligned taxonomy is mapped to a natural, human-associated color palette carefully tuned for high visual contrast and sensory recognition.
- **Canvas-Compressed Label Photo Uploads**: Persist custom label photos and notes in high-capacity local browser storage via **IndexedDB (powered by Dexie.js)**. Camera uploads are compressed on-the-fly to tiny JPEG sizes (~80-150KB) using canvas resizing to preserve memory and speed.
- **Installable Progressive Web App (PWA)**: Install Aqua Vitaeum as a standalone application on mobile or desktop devices. Configured with a network-first offline service worker, Web App manifest, and a custom maskable icon matching the Irish wood brown aesthetic for a premium, browser-less app experience.

---

## Technical Documentation & Design System

- **Developer Setup & Architecture Guide**: [`docs/DOCUMENTATION.md`](./docs/DOCUMENTATION.md)
- **Visual Design System & Color Tokens**: [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md)

---

## License

Copyright © 2026 Aqua Vitaeum. All Rights Reserved.  
Refer to [`LICENSE`](./LICENSE) for full proprietary copyright terms and conditions.
