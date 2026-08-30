# Architecture, Stack & Plan

## Proposed stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 with CSS-variable
tokens · `motion/react` for component motion · GSAP ScrollTrigger + Lenis for the
scroll narrative · React Three Fiber for the one signature canvas.

Rationale: we own 100% of the code, no Framer/Spline runtime lock-in, and the
heavy WebGL can be code-split behind `next/dynamic` + an in-view trigger so it
never blocks first paint. Hosting target assumed Vercel — **confirm.**

## Performance budget (India-first, non-negotiable)
Lighthouse mobile ≥ 90 · LCP < 2.5s · TTI < 3.5s · CLS < 0.1 · INP < 200ms ·
initial JS < 200 KB gzipped · initial route < 1.5 MB · ≤ 2 font families,
self-hosted and subsetted · AVIF imagery.

The real test is a mid-range Android on Jio data, not an M-series laptop. The 3D
budget: one visible canvas, ≤ 6 real-time lights (prefer baked + env map),
≤ ~120 draw calls, `dpr={[1,2]}`, Draco/meshopt compression, KTX2 textures.

## Sitemap
- `/` — the signature scroll narrative; ends in registration intent capture
- `/programme` — day-by-day; workshop day vs scientific days as distinct surfaces
- `/workshops` — the five hands-on tracks, each with capacity + separate ticket
- `/faculty` — leadership, committee, invited and international faculty
- `/abstracts` — submission rules, categories, deadlines, e-poster + video specs
- `/register` — delegate categories and tiers
- `/awards` — Best Paper, E-Poster, Young Surgeons Forum
- `/sponsors` — trade exhibition + sponsorship prospectus, tiered
- `/venue` — both venues, travel, accommodation, Hyderabad delegate layer
- `/contact` — secretariat

## Content entities (for the CMS / data layer)
`Session` · `Speaker` · `Workshop` (with capacity) · `Venue` · `RegistrationTier`
· `Abstract` · `Sponsor` · `Award` · `FaqItem` · `Announcement`

## Phasing (registrations are "opening soon" and the brochure has no URL yet)
- **Phase 1 — Announce.** Signature hero, theme, dates, venues, the eight
  highlights, committee, notify-me capture. Ships without programme detail.
- **Phase 2 — Participate.** Registration tiers + payment, abstract submission,
  workshop ticketing with capacity.
- **Phase 3 — Attend.** Full timetable, faculty bios, personal agenda, travel.
- **Phase 4 — Archive.** Post-event content, award winners, e-poster gallery.

## Honesty rule
Nothing in the "unknown" list may be invented on the site. Where layout needs a
number we do not have, the site shows an explicit "announced soon" state with
intent capture — never a placeholder price or a fake deadline.

## Open questions for the committee
1. Domain name, and hosting preference (Vercel assumed)
2. Registration prices + full delegate category list
3. CME credit hours and the accrediting council (NMC / Telangana State Medical
   Council) — and whether to publish as "applied for" until granted
4. Abstract submission window, word limit, categories
5. Payment gateway (Razorpay / CCAvenue / PayU) and GST invoicing needs
6. Sponsorship tiers and rates; is there a prospectus PDF?
7. Both secretariat phone numbers (blank in the brochure)
8. Vector logos for IACTS and NIMS CVTS; high-res headshots
9. Accommodation block, shuttle plan, banquet venue
10. Is registration bespoke, or a third-party portal we link out to?
