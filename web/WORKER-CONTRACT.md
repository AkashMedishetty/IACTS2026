# WORKER CONTRACT — IACTS Technocollege CME 2026 site

Read this fully before writing code. Your brief names only your paths and your
section's intent; every general rule lives here.

## The concept you are executing — THE OPERATIVE FIELD

The site is a surgical field under theatre light. Bone-white, brilliantly lit,
instruments laid out with obsessive precision. The scroll IS the operation:
**Approach → Exposure → Repair → Closure**. Light, not dark. Every competing
"future of medicine" site is dark navy with a glowing blue organ; we are the
opposite, and that is deliberate.

Audience: practising cardiothoracic surgeons in India (senior, credential-driven,
zero tolerance for anything unserious or anatomically wrong) plus residents who
judge this like any consumer product on a mid-range Android.

Bar: Awwwards / FWA tier. Dense and intentional, never minimal-and-timid.
"Minimalistic" here means *disciplined and uncluttered*, NOT sparse or empty.

## Hard rules

1. **NEVER invent facts.** All content comes from `src/data/conference.ts`.
   Anything in the `pending` export is unknown — render an explicit
   "announced soon" state with intent capture. Never a placeholder price,
   date, deadline, credit-hour count or phone number.
2. **Tokens only.** Use the Tailwind theme colours (`crimson`, `maroon`, `gold`,
   `gold-lift`, `bone`, `bone-deep`, `bone-sink`, `ink`, `ink-soft`, `ink-faint`,
   `venous`) and the `--hair` / `--hair-gold` vars. Never a raw hex, never a
   Tailwind default palette colour (`text-red-600`, `bg-slate-50`, etc).
3. **Reuse the primitives.** `@/components/ui/Rules` gives `DiamondRule`, `Hair`,
   `SectionLabel`, `Callout`, `SectionHead`. `@/components/ui/motion-ui` gives
   `Reveal`, `Marquee`, `Magnetic`, `WipeLink`. `@/lib/motion` gives `gsap`,
   `ScrollTrigger`, `registerGsap`, `useReveal`, `useParallax`,
   `useSplitReveal`, `prefersReducedMotion`, `EASE`. Do NOT re-implement these
   and do NOT install packages.
4. **STAY IN YOUR PATHS.** Create/edit only the files your brief lists. Never
   touch `globals.css`, `layout.tsx`, `conference.ts`, `page.tsx`, `lib/motion.ts`,
   or another lane's folder. Path collisions destroy the parallel build.
5. **Do NOT call `spawn_run` or `spawn_sub_agents`.** You are a leaf worker. If
   your scope feels large, narrow it and work sequentially.
6. **No placeholder images.** No `unsplash`, no `via.placeholder`, no `<img>` with
   a fake src. Leadership portraits are `null` on purpose — design a typographic
   or monogram treatment instead. Build atmosphere with CSS/SVG/canvas.

## Motion standards

- GSAP + ScrollTrigger for scroll-driven work; `motion/react` only for small
  component state transitions. Always register via `registerGsap()`.
- **Always** wrap GSAP in `gsap.context()` and `revert()` on cleanup, so Fast
  Refresh and unmount do not leak tweens.
- Transform + opacity only on the animation hot path. Never animate
  `width`/`height`/`top`/`left`/`box-shadow`.
- Bespoke easing. Use `EASE.expo` / `EASE.field` or a real cubic-bezier — never
  a bare `ease` or `linear` for entrances.
- Every scroll animation must have `once: true` unless it genuinely needs to
  re-run, and must not fight Lenis (already synced globally).
- **`prefers-reduced-motion` is mandatory.** Guard with `prefersReducedMotion()`
  and ship a still, beautiful final state — not a broken-looking page.
- Hover states must be real: a wipe, a mask, a counter-rotation, a magnetic
  lean. Not `opacity: 0.8`.

## Typography standards

- Display: `font-display` (Archivo) via `.u-display` for big headings.
- The theme line "The Future Is Now !" uses `.u-theme-line` (Instrument Serif
  italic). Use it sparingly — it is a signature, not a body style.
- Labels, codes, data, numerals: `font-mono` (IBM Plex Mono), uppercase,
  `tracking-[0.2em]`, small. Use `.u-eyebrow`.
- Tabular numerals (`.u-tabular`) for any number in a column.
- `clamp()` for every display size. Design at 360px first, then scale up.

## Accessibility (blocking)

- Semantic landmarks and a correct heading order — exactly one `<h1>` on the
  page (it lives in the hero; every other section starts at `<h2>`).
- AA contrast. `ink-faint` on `bone` fails for body copy — labels only.
- Keyboard reachable, visible focus (global `:focus-visible` already styled).
- Decorative canvas/SVG gets `aria-hidden="true"`; meaningful ones get a label.
- Interactive targets ≥ 44px on touch.

## Performance budget (India-first, non-negotiable)

Lighthouse mobile ≥ 90 · LCP < 2.5s · CLS < 0.1 · initial JS < 200KB gzipped.

- Section components are client components ONLY where they need to be. Prefer a
  server component that renders a small client island for the motion.
- Anything heavy (canvas, R3F, big data) loads via `next/dynamic` with
  `{ ssr: false }` behind an in-view trigger.
- No new dependencies. No web fonts beyond the three already configured.

## Harvested technique standard (added after the component review)

The client supplied two reference components and approved this class of craft.
Every animated surface should reach this bar, and these are the techniques to
reach for. Re-author them on our tokens — never paste a library component.

- **Projected 3D fibre/ring fields.** Stacked loops projected with
  `scale = FOV/(CAM + z)`, per-point velocity + excitation, a pointer field
  lerped (`p += (target-p)*0.1`) so response glides. Morph between
  configurations with an eased transition, not a hard swap.
- **Outlined display type.** `-webkit-text-stroke` alternating with solid words
  in a marquee band. The only reliable cross-browser text outline.
- **Marquee obligations.** Duplicate children once and translate exactly -50%
  for a seamless loop; pause on hover; stand still under reduced motion.
- **Magnetic hover + elastic return** (`elastic.out(1, 0.42)`), pointer-fine only.
- **Travelling indicators** along a path that inverse-highlight near the pointer.

**Two rules that come with canvas work, and are the ones people skip:**
1. Text drawn into a canvas is NOT text. The real string must exist in the DOM
   underneath, or the most important words on the page are invisible to
   screen readers and to Google.
2. Pause the frame loop when the surface is offscreen (IntersectionObserver)
   and when the tab is hidden. An always-on RAF loop is a battery bug.

## Definition of done

- `pnpm build` passes from `/Users/akash/CTX/Websites/IACTS 2026/web` with zero
  type errors and zero ESLint errors in YOUR files.
- Renders correctly at 360px, 768px and 1440px.
- Reduced-motion path verified by reading your own guards.
- Write a short report to the path your brief gives you: what you built, the
  motion techniques used, anything you deliberately left as "announced soon",
  and anything you could NOT verify.
