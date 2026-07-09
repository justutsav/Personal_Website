# Project media

Two uses now:

## 1. Homepage "Selected work" stacked cards

Each featured project card shows one big cover + three small shots. Names
are fixed per folder:

    <slug>/cover.webp   big media, right side of the card
    <slug>/01.webp      small shot 1  (bottom-left row)
    <slug>/02.webp      small shot 2
    <slug>/03.webp      small shot 3

Missing files show a colored placeholder, so partial uploads are safe.
If you use another extension, update the paths in
`components/WorkShowcase.tsx` (currently `.webp`). Set `shotOrientation`
in `data/projects.ts` ("portrait" for phone screenshots, "landscape" for
web) so the small tiles get the right shape.

Slugs: atul-finance, justtrade, justfinance, grit, splitfree, astro-ai,
zentry-clone, justwhisper, wpm-overlay.

## 2. Case-study pages

Any additional images dropped in a project's folder also appear on its
`/work/<slug>` case study, sorted by filename. Use numeric prefixes to
control order:

    01-dashboard.png
    02-investor-view.png

Suggested shots per project:

- atul-finance/  — investor dashboard, returns view, admin side (blur names/amounts if needed)
- justtrade/     — unified trade dashboard, account breakdown (sanitised)
- justfinance/   — anything shareable; even one abstract/cropped shot works
- grit/          — Play Store listing, task view, Mental Reservoir timer, theme system
- splitfree/     — group view, expense add flow, settlement screen
- astro-ai/      — kundli view, chat screen
- zentry-clone/  — hero, bento grid, story section (site is public — anything goes)
- justwhisper/   — terminal with timing output, or a short GIF of dictation
- wpm-overlay/   — overlay in action over a typing test

Landscape ~16:10 looks best for covers; ~4:3 for the small shots.
