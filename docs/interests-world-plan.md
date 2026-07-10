# Interests World — Plan

A small-scale, samsy.ninja-inspired explorable 3D scene for `/interests`.
Branch: `feat/interests-world`.

## What samsy.ninja (Gen-02) actually is

Samuel "Samsy" Honigstein's portfolio — Awwwards Site of the Day + Developer
Award (Oct 2025). An immersive multiplayer cyberpunk city you physically walk
through; projects live on a central billboard, visitors see each other live.

Component breakdown of the original:

| Piece | Their build |
|---|---|
| 3D engine | three.js with TSL (Three Shading Language) — compiles to WebGPU, falls back to WebGL |
| UI shell | Vue.js over the canvas |
| Animation | GSAP timelines |
| Multiplayer | PartyKit WebSockets — avatars, skins, music sync at 60fps |
| Look | Custom post-processing: bloom + wet-street reflections (their hardest part) |
| Navigation | Character controller walking a city; menu can teleport you |
| Extras | Character customization, per-player DJ/music system |

## Our small-scale translation

One **neon diorama room** — a floating island/room in the site's warm-black
paper world, coral/blue neon accents (existing theme tokens). Interests are
**glowing objects in the room**; approach + click one and a DOM panel slides
in with the real content (the heatmaps and stats the page already has).

Deliberate scope cuts vs Gen-02: no multiplayer, no WebGPU/TSL, no character
mesh, no custom reflection pipeline. Keep: the *feeling* of exploring a lit
3D space, hover glow, object-anchored content, one bloom pass.

### Scene concept

- Static low-poly diorama (~a room-sized island): floor slab, a few props,
  2-3 neon tube lights (emissive planes — cheap, no real lights needed).
- One interactive object per interest, e.g.:
  - **torii gate / katana stand** → anime (existing AnimeLab content)
  - **spinning vinyl on a deck** → music (ties into the site's MusicProvider)
  - **floating keyboard** → typing (Monkeytype heatmap + WPM stats)
  - **monitor with commit graph glow** → coding (GitHub heatmap)
  - room for 1-2 more later (F1? games?) — object slots are data-driven
- Navigation small-scale: **drag-to-orbit between fixed camera anchors**
  (click object → camera lerps to its anchor, GSAP-style spring via framer's
  `animate`). No free-walk controller — keeps it phone-friendly and
  motion-sickness-safe.
- Idle life: slow float of the island, dust particles (one instanced points
  cloud), object emissive pulse on hover, pointer parallax like the hero.

### Tech (all already in the repo — zero new heavy deps)

- **R3F + three** (same stack as ShowcaseArc) in a **dynamic ssr:false
  module** so `/interests` only ships three.js chunk when the scene mounts.
- **framer-motion** for camera anchor tweens + DOM panels (no GSAP needed).
- **@react-three/drei** helpers already installed (`Float`, `Html` if needed).
- Post-processing: single selective-bloom-ish pass — if `@react-three/postprocessing`
  is deemed too heavy, fake bloom with emissive sprites/halo textures like the
  showcase halo (proven cheap). Decide in Phase 4 by measuring.
- Models: keep it primitive-based (boxes/cylinders/lathes + canvas textures,
  same technique as ShowcaseArc cards). No GLTF downloads unless a prop
  really needs it; if so, one draco-compressed GLTF < 300KB total.

### Device safety (lessons already applied elsewhere in the repo)

- `dpr={[1, 1.75]}` clamp, `frameloop` frozen when tab/section not visible.
- Dispose every texture/material/geometry on unmount (ShowcaseArc pattern).
- `webglcontextlost` handled.
- **Mobile**: same scene but tighter camera + touch-drag orbit; if GPU is
  weak (fail a quick `MAX_TEXTURE_SIZE`/renderer check) or WebGL unavailable
  → fall back to the current DOM card layout (which also stays as the
  reduced-motion path).
- Budget targets: < 60 draw calls, < 40MB GPU memory, 60fps on a mid phone.

### Phases

1. **Shell** — route scaffolding, dynamic canvas module, island + lighting,
   orbit-anchor camera rig, mobile/reduced-motion fallbacks. (the skeleton)
2. **Objects** — data-driven interest objects with hover glow + click focus.
3. **Panels** — DOM overlay panels per interest wired to existing content
   (Monkeytype/GitHub heatmaps, anime list, music). Deep-linkable
   (`/interests#typing`).
4. **Polish** — bloom-or-halo decision, dust particles, entrance choreography
   synced like the hero, sound hooks into MusicProvider (optional).
5. **Perf pass** — profile on throttled CPU/GPU, draw-call audit, then merge.

### Open decisions (for later, don't block Phase 1)

- Bloom: real postprocessing pass vs halo-texture fake. Measure first.
- Whether the vinyl deck should actually control the site music (fun, but
  MusicProvider coupling needs care).
- Copy tone for panels — keep the sparse-by-design voice or go fuller.
