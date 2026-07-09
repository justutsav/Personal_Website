# Handout — session state (2026-07-08)

Paused mid-work per your request to talk one-on-one about the case-study showcase.
Everything below is uncommitted working-tree changes. All builds pass (`next build` ✓).

## Your decisions this session (re-asked after last session died at spend limit)

| Decision | Your pick |
|---|---|
| Deck image cropping fix | Fixed-aspect media slot, card height flexes (no more 78vh) |
| Mobile plan for 3 broken sections | Swipe-native mix (carousel / stacked cards / vertical spine) |
| Case-study gallery | Orientation-aware grid + tap-to-zoom lightbox |
| anime.js lab on /interests | Keep for now — you test, I strip it on your word |

## What's done (code written, builds, NOT visually verified yet)

### 1. Work-deck cards (`components/WorkShowcase.tsx`) — DONE, unverified
- New `lib/imageMeta.ts` reads real `cover.webp` pixel sizes server-side (`image-size` pkg, newly installed).
- `app/page.tsx` passes `coverAspects` (slug → width/height) into `WorkShowcase`.
- Card: `height: 78vh` → `maxHeight: 86vh`, height now content-driven.
- Cover slot locked to the image's true aspect ratio (`aspectRatio` style) + `object-contain` → zero cropping on any monitor. `maxHeight: 58vh` guard for short screens.
- Portrait covers get a narrower media column (`1.6fr/1fr`), landscape wider (`1.05fr/1.15fr`).

### 2. Case-study gallery — DONE, unverified
- `components/CaseGallery.tsx` (server) now reads every image's real dimensions.
- New `components/CaseGalleryGrid.tsx` (client): 6-col grid — landscape spans 3 (2/row), portrait spans 2 (3/row); click → full-screen lightbox with ←/→ keys, Esc, counter.

### 3. Mobile swipe-native replacements — DONE, unverified
- New `components/useMediaQuery.ts` (`MOBILE_QUERY` = <768px; SSRs desktop branch, swaps post-mount).
- 3D showcase (`ShowcaseSection.tsx`): phone gets horizontal snap-swipe cover carousel with captions + counter. WebGL untouched on desktop.
- Work deck: phone gets stacked palette cards (cover at true aspect + title + metrics), auto height, tap → case page.
- Timeline (`JourneyTimeline.tsx`): phone gets vertical spine with dots, tap opens the existing right-slide DetailPanel; closing statement as a static block.
- Nav: "Utsav" label hidden `<sm`, tighter gaps/tracking — fixes "CONTACT"→"CO" clipping.
- Hero: card `60vw`→`88vw` on phone; tagline wraps instead of clipping off-screen.
- `app/page.tsx`: the `-mt-[140vh]` / `-mt-[20vh]` overlap margins are now `md:`-only (they'd bury the mobile flow sections).

### 4. Hydration mismatch — DIAGNOSED, not fixed
- Reproduces ONLY with `prefers-reduced-motion: reduce`: React error #418.
- Suspect: framer-motion `useReducedMotion()` returns real value during first client render while SSR rendered the `false` branch — whole sections render different trees.
- Planned fix: mounted-gate the reduce checks (same pattern as `useMediaQuery`). NOT applied yet.

## Not done
- Visual verification pass (planned: puppeteer at 1080p/1440p/937px-laptop/390px-phone).
- Lint debt untouched (251 pre-existing errors, known, not regressions).
- Stale agent worktree `.claude/worktrees/agent-a12556f04197d0b3e/` — contents identical to main tree, safe to delete.
- `handout.md` (this file) — delete when done.

## The floor is yours
You said something is majorly wrong in the **case-study showcase**. Ambiguity to resolve when we talk:
- "case-study showcase" = the home-page **work deck** (stacked cards), or the **/work/[slug] case page**, or the **3D orbit showcase**?
- Is the "wrong" something from the previous session's design, or something my changes above just introduced?
