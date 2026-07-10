# Interests World — Progress Log (paused 2026-07-10)

Branch: `feat/interests-world`. Plan: `docs/interests-world-plan.md`
(superseded in scope: now desktop-only FULL world — character, physics,
WASD, camera tilt; mobile gets a "heavy GPU work, open on desktop" gate).

## Built and working

- `components/interests/worldData.ts` — 4 stations (typing/music/edits/gaming),
  positions, colours, NEAR_RADIUS.
- `components/interests/WorldScene.tsx` — R3F Canvas: rapier physics
  (`@react-three/rapier@2.2.0`, installed), 24×24 arena with grid canvas
  texture + invisible walls + neon rim, cream robot character (capsule
  RigidBody, WASD/arrows + shift run + space jump, faces travel direction,
  leans, bobs), follow camera with screen-tilt roll from lateral velocity,
  5 kickable glow cubes, 4 station pylons with breathing floor rings +
  billboard canvas-texture signs, dust points, fog. No shadows (removed —
  needless and heavy).
- `components/interests/InterestsWorld.tsx` — desktop gate
  (pointer:fine + ≥1024px + WebGL check), mobile gate page with live
  Monkeytype stats (verified in probe — renders beautifully), enter overlay
  with controls legend, [E] station prompt, ESC-closable right panel
  (typing panel embeds Heatmap + stats), world chunk only downloads after
  ENTER click.
- `app/interests/page.tsx` — rewired to the world, old DOM page replaced
  (recoverable from git history).
- Typecheck clean throughout.

## THE BLOCKER — WebGL context lost, canvas black

Symptom: HUD/overlays all work, canvas stays background-colour black.
`canvas.isContextLost() === true` in dev on BOTH software GL (headless) and
the real NVIDIA GPU (headed probe).

**Smoking gun** (instrumented probe, dev server):

```
WORLD onCreated 4692ms     ← Canvas mounted
WORLD onCreated 5154ms     ← Canvas mounted AGAIN (double mount)
WORLD contextlost 5605ms   ← both contexts die ~450ms later
WORLD contextlost 5605ms
```

Double mount → React StrictMode (dev) double-mounts the dynamic WorldScene;
three's `WebGLRenderer.dispose()` (run on the first copy's unmount) calls
`forceContextLoss()`, and the loss lands on the surviving canvas too (same
DOM element reused). Plain ShowcaseArc survives StrictMode fine, so the
rapier `<Physics>` (WASM world init/dispose across the double mount) is
likely what defers the first unmount long enough to kill the second mount.

## Next steps (in order)

1. `npm run build && npm start`, probe prod — StrictMode double-mount is
   dev-only; prod may already work. If so, this is a dev-only annoyance —
   decide whether to tolerate or fix.
2. If fixing: mount WorldScene once via a module-level singleton guard, or
   delay `<Physics>` mount one tick (`useEffect` flag) so StrictMode's
   throwaway mount never initialises rapier, or try `frameloop="demand"`
   during the first frames.
3. Also check @react-three/rapier GitHub issues for React 19 StrictMode
   context-loss reports.
4. After canvas renders: playtest movement/jump feel, panel flow, then
   phases 4-5 of the plan (polish + perf).

## Probe recipe (headless Chrome can't see the world's gate)

Gate requires `(pointer: fine)` — headless Chrome reports none. Probe must
inject a matchMedia override before load; see the pattern in this session's
`probe9-12.tmp.mjs` (deleted, easy to rebuild): `evaluateOnNewDocument` that
returns `matches: true` for `pointer: fine` queries. Headed Chrome
(`headless: false`, DISPLAY=:1, real GPU) also available on this machine.
