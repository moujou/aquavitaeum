# Walkthrough — PWA Transformation, IndexedDB Migration & Navigation Upgrades

We have successfully completed the navigation restructure, decluttered the local sidebar, globalized the search input, added a collapsible sidebar workspace on desktop, and built a centered context-aware Creation button on mobile. 

We have also addressed critical UX and system findings:
- **Client-Side Image Compression** has been integrated to keep the database size minimal.
- **Scroll Jitter Bug** was fixed.
- **Mobile Drawer Trapping** was resolved with backdrop dismissal.
- **Onboarding loops** were eliminated.
- **All 147 unit tests** pass cleanly.

In this session, we added advanced layout tuning, touch size guidelines, and automated savings:
- **Premium Off-Canvas Drawer & Sidebar Header (Mobile/Desktop)**: Redesigned the sidebar header to be center-aligned, displaying the active journal name in a larger font and the description in italic text below it. Replaced parenthetical counters with an enlarged right-aligned pill containing a gold note icon (`FileText`, size 14) and raw note counts. Redesigned collection list cards with a clean white/gray text color scheme to improve visual harmony. Clicking the backdrop closes the mobile drawer overlay instantly.
- **Zero-Shift Scroll Layout (Mobile)**: Hiding the mobile header on scroll-down pushes the tasting card cleanly to `top-0` under the hidden bar, utilizing 100% viewport space. Small font sizes (9px/10px) across cards, statistics, and profile screens were bumped to 11px/12px to guarantee comfortable legibility.
- **Enlarged Touch Targets (Mobile)**: Toggle buttons, color checkboxes, glance selectors, and flavor tags are expanded to use a comfortable `text-sm sm:text-xs` (14px on mobile, 12px on desktop). Slider rows have `py-2.5` margins for finger-tip ease.
- **Unified 1-Second Autosaving Pipeline**: Replaced individual save timings with a unified 1000ms debounced saving loop using a pending reference, preventing IndexedDB write spams and API request flooding on rapid tag clicks or range sliding. Added unmount flush triggers to save changes instantly upon card switches or tab closes.
- **Auto-Thumbnail Selection**: Uploading a single image automatically sets it as the active thumbnail. Deleting the thumbnail image automatically selects the next available image in the list.
- **Flicker-Free Image Deletions**: Solved the state-batching race condition by calculating `safeActiveIndex` dynamically during render, preventing the carousel from displaying `undefined` image paths during item removals.
- **Premium Widescreen Stacked Cards with 1/10 Fluid Accent Column**: Redesigned collection items in `SpiritCard.tsx` to stack a 16:9 widescreen cover on top of details. The bottom details section features a solid, 1/10 width (`w-[10%]`) vertical accent column on the right edge painted in the spirit's canonical color. To prevent obscuring the cover photo, the rating score badge sits inside the details section, positioned at the top-right corner directly to the left of the fluid accent column. Detail typography sizes were upgraded to heavy, extra-legible weights.
- **Redesigned Journal Cards with Split-Pane Widescreen Cover**: Redesigned the bookshelf cards in `JournalsOverview.tsx` to stack a 16:9 widescreen cover on top of details. The cover dynamically splits into a multi-column grid displaying up to 3 of the last added spirit bottle preview photos (1 image = 1 full-cover, 2 images = 2 columns, 3+ images = 3 columns). When no images are present, a waldgrün radial gradient placeholder is displayed. Title and descriptions are centered, and descriptions are styled in italic text.
- **Upgraded Statistics Iconography**: Removed the vertical color band from the journal details section. Replaced the "Bottles" label with "Notizen" / "Notes" and placed a gold `FileText` icon next to the number. Upgraded the "Rating" label to "Durchschnitt" / "Average Rating". Added a gold `Calendar` icon next to the latest tasting date, formatting the date to always output the full 4-digit year in both DE (`DD.MM.YYYY`) and EN (`MM/DD/YYYY`).
- **Mobile Navigation Drawer Redirection Fix**: Corrected mobile Tab 2 (Collection Drawer) behavior. Tapping it from the Profile view now correctly redirects back to the journal detail view and slides the drawer open. Fixed the double highlighter issue so that Tab 2 is only active when the collection drawer is open on the journal detail screen.

---

## 📷 Client-Side Image Compression
- **Canvas Resizing Utility**: Added inside `src/hooks/usePhotoUpload.ts` to automatically resize uploaded images to a maximum dimension of 1000px and compress them to JPEG format at `0.85` quality.
- **Performance Impact**: Reduces photo storage size inside Dexie IndexedDB from ~3-5MB per image down to ~80-150KB, preventing storage exhaustion and boosting rendering speeds.

---

## 📱 Symmetrical Centered Bottom-Nav FAB Action (Mobile)
- **TikTok-Style Highlighted FAB**: Renders a visually prominent circular action button (`bg-[#E8D5B7] text-[#311e15]`) with a gold shadow glow in the exact center of the bottom navigation bar.
- **Centering Guard**: Implemented a 3-group split flex layout (`Left Group flex-1`, `Center Group flex-shrink-0`, `Right Group flex-1`) with inner spacers that guarantees the primary action button remains mathematically centered on all mobile screen widths under all views.
- **Context-Aware Dynamic Behavior**:
  - **Bookshelf Overview**: Clicking the FAB opens the **Create Journal** modal.
  - **Journal Detail**: Clicking the FAB creates a **New Tasting Note**.
  - **Profile Page**: Automatically checks the last active view context (redirects to Bookshelf + modal, or redirects to Journal + tasting note).

---

## 🔍 Global Header Search (Spirits & Journals)
- **Integrated Dark Theme**: Styled the search input container with a semi-transparent dark panel (`bg-black/35 border-white/10`) to match the dark wood header and results dropdown.
- **Text-Overlap Prevention**: Extended input padding to `pr-32` to fit category filters safely. Focus outline rings are completely disabled.
- **Enlarged Search Dimensions**: Search input wrapper expanded on desktop to `max-w-3xl` and on mobile to `max-w-sm mx-auto` to center it symmetrically inside the header.
- **Cross-Journal Querying**: Removed local search inputs from the sidebar. Renders a permanent search bar in the global header, querying matching **Journals** and **Spirits** (across *all* journals) simultaneously.
- **Interactive Results Dropdown**: Tapping a search result instantly switches the active journal, loads the selected card, and closes the search dropdown.
- **Click-Away Listener**: Clicking anywhere outside the search input automatically collapses the dropdown overlay.
- **Mobile Scroll-Hide & Padding Transition**: Hides both the header and bottom navigation bar on scroll down. Page views utilize static `pt-17 sm:pt-20 lg:pt-0` layout heights, allowing the mobile scroll-hide header transitions to execute cleanly without dynamic padding shifting or scroll jitter loops.
- **Persistent Welcome state**: Onboarding visibility checks compare both `localStorage` welcome keys and session markers, bypassing the launch screen for returning users.
- **Collapsible Sidebar (Desktop)**: The sidebar collection panel collapses to a thin `16px` rail line. Content is hidden via a smooth `opacity-0 -translate-x-4` CSS transition wrapper, while the circular `Menu` action toggle stays centered on the vertical line.

---

## 📐 Collapsible Sidebar with Reddit-Style Menu Toggle (Desktop)
- **Reddit-Style Collapse**: When collapsed, the sidebar folds to a compact width of `16px` (`w-[16px]`). This hides all inner list text while keeping the vertical divider rail line visible on the screen.
- **Smooth Sidebar Transition**: Keeps the sidebar grid mounted in the DOM. Transitions opacity and transform (`-translate-x-4` when collapsed) on an inner wrapper to prevent sudden visual snapping during collapse and expansion.
- **Upper-Third Menu Toggle**: Replaced the chess board / chevron arrows with the standard **Burger Menu (`Menu`)** icon.
- **Position & Size**: Relocated the toggle button to the upper third of the rail (`absolute top-28 w-8 h-8`) and kept it perfectly centered on the divider line (`left-1/2 -translate-x-1/2`). Because the rail sits at `16px` offset, the button touches the left boundary of the screen without being clipped, creating a beautifully integrated floating burger toggle.

---

## 👤 Symmetrical Workspace FABs (Desktop)
- **Bookshelf Overview FAB**: Added a floating `[+]` button in the bottom-right corner of the bookshelf overview page (`absolute bottom-6 right-6 w-12 h-12 bg-[#E8D5B7] text-[#311e15]`) to trigger new journal creation.
- **Redundancy Cleanup**: Removed the dashed placeholder card from the `JournalsOverview` grid to make the layout clean and modern.
- **Journal Detail FABs**: Placed inside a relative wrapper holding the Tasting Card workspace container:
  - **Bottom-Left Corner (`absolute bottom-6 left-6`)**: Renders a circular **Back to Bookshelf** button (`BookOpen` icon) styled with Tasting Card parchment white (`bg-[#E8D5B7] text-[#311e15] w-12 h-12`).
  - **Bottom-Right Corner (`absolute bottom-6 right-6`)**: Renders a circular **New Tasting Note** button (`Plus` icon) styled with Tasting Card parchment white (`bg-[#E8D5B7] text-[#311e15] w-12 h-12`).
- **Dynamic Shifting**: Because they are positioned absolutely inside the relative content wrapper, they automatically shift left/right in response to the sidebar's collapse and expand states.
- **Dedicated Profile View (`ProfileView.tsx`)**: Renders settings rows (Language, Sync, App version `Beta v0.1.0`) under the "You" / "Du" profile.

---

## 👤 Persistent Onboarding State
- **Persistent Welcome state**: Checks both `localStorage.getItem('aqua-vitaeum-welcome-completed')` and test session fallbacks during layout mounting to avoid forcing returning users back into the full-screen onboarding walkthrough.
