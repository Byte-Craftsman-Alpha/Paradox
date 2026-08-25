# Team Paradox — Studio Portfolio

A quiet, precise, expensive-feeling portfolio for TEAM PARADOX, a five-member student tech team in Gorakhpur, India.

> We design and build thoughtful digital systems across product, web, mobile, AI and security.

## Stack

- **Next.js App Router** style routes via a lightweight in-app router (`pushState`) — actual scaffold is **Vite + React 19 + TypeScript** so it stays snappy and the deploy target is static.
- Strict **TypeScript**, typed content in `src/data/team.ts`.
- **Tailwind CSS v4** (the same utility language, no `@apply` noise).
- **Framer Motion** for every movement (alignment reveal, manifesto masks, layout morph, dialog scrim).
- **Lenis + RAF** for desktop scroll smoothing; Lenis is disabled for reduced motion, coarse pointers and short viewports.
- **Public Sans** via Google Fonts.
- **lucide-react** for iconography only.
- Accessible headless primitives: focus trap (`src/lib/useFocusTrap.ts`), `IntersectionObserver`–driven active nav, Escape/outside-click + restore focus on the team dialog.

No CSS `transition`, `animation`, `@keyframes`, or Tailwind `transition-*`/`animate-*` utilities anywhere. No GSAP. No WebGL. No custom cursor.

## Visual system

Warm monochrome only. Tokens are in `src/index.css`:

| Role | Token | Hex |
|------|-------|-----|
| Milk (bg) | `--bg` | `#FCFBF7` |
| Milk 2 | `--bg-2` | `#F5F2EA` |
| Milk 3 | `--bg-3` | `#ECE8DE` |
| Charcoal | `--charcoal` | `#191A18` |
| Ink | `--ink` | `#292A27` |
| Muted | `--muted` | `#68665F` |
| Metadata | `--meta` | `#9B978D` |
| Hairline | `--line` | `#DDD9CF` |
| Hairline · dark | `--line-dark` | `#3B3C38` |
| Taupe | `--taupe` | `#A59C8C` |

No pure black, no pure white, no blue/cyan/purple/neon, no saturated gradients, no glass, no blobs. Dark mode is charcoal + warm milk.

Type scale: hero `clamp(3.5rem, 10vw, 8.5rem)`, body 16–19px, 12-column grid, 20–24px mobile gutters.

## Structure

1. Persistent quiet header (`src/components/Header.tsx`) with wordmark, primary nav, theme (Milk / Charcoal / System), accessible mobile sheet, and skip link.
2. Near-full-screen hero (`src/components/Hero.tsx`) with the PARA/DOX alignment motif that animates from subtle misalignment into exact alignment.
3. Manifesto strip (`src/components/Manifesto.tsx`) with mask-reveal lines.
4. Selected Work (`src/components/Work.tsx`) — expandable index/cards; desktop rows expand with motion morph (`AnimatePresence` + `LayoutGroup`), mobile uses vertical cards. Each project has problem, owner, status (Prototype / Active / Archived), stack, architecture, decisions, limitations and evidence links.
5. Capability ledger (`src/components/Capabilities.tsx`) — click to filter projects + members via `AnimatePresence` and `role="status"` aria-live region; accessible reset button.
6. Team (`src/components/Team.tsx`) — five editorial rows morph into route-backed accessible profile dialogs (`#team/<id>` deep links, focus trap, Escape/outside close, focus restoration). Disclosure statement included.
7. Operating system strip (`src/components/OperatingSystem.tsx`) — Frame → Prototype → Challenge → Refine → Ship.
8. Principles (`src/components/Principles.tsx`) — commitments, not claims.
9. Contact (`src/components/Contact.tsx`) — mailto fallback with idle / focus / invalid / loading / rate-limit / server-error / success states. Footer + `/system` state gallery at the bottom.

## Scroll + motion

- Lenis + RAF on desktop (disabled under reduced motion / coarse pointer / short viewport). Smooth, buttery wheel/touch scrolling without trapping users — no auto-snap to sections.
- Native scroll on touch and short viewports. `PageUp`/`PageDown`, `Space`, `Home`/`End` stay predictable. No interception of dialogs, form inputs or nested scrollers.
- IntersectionObserver drives the active section indicator; no unthrottled `scroll` listeners.

### Motion tokens (`src/lib/motion.ts`)

| Token | Duration |
|-------|----------|
| micro | 0.18s |
| ui | 0.32s |
| section | 0.66s |

Easing `[0.22, 1, 0.36, 1]`. Spring: stiffness 380, damping 32, mass 0.8. Stagger 35–70ms. Always transform + opacity.

## States + accessibility

- Default / hover / focus / active / pressed / selected / expanded / disabled for nav, buttons, cards, filters, tabs.
- Inputs also expose: filled / invalid / valid / read-only / autofill / server-error.
- Dialog/menu: focus trap (`src/lib/useFocusTrap.ts`), Escape + outside close, scroll lock, focus restoration.
- All interactive elements have 44px minimum targets.
- Semantic landmarks, strong focus rings, `aria-live` status regions, `aria-expanded`, `aria-haspopup`, `aria-modal`.
- Reduced motion disables layout travel, snap settling, scroll-driven motion (Lenis bypassed) and parallax where applied.
- Tested mentally at 360–1600+, landscape, and 200% zoom.

## Performance / SEO / QA

- Targets: Lighthouse mobile **Performance ≥ 90**, **Accessibility / SEO ≥ 95**. No layout shift, dynamically imported dialog, lazy route registration.
- OG / Twitter metadata, canonical, sitemap, robots, verified JSON-LD `Organization`.
- `/system` route exposes a state gallery for QA.
- **Vitest** unit tests for capability/team filter and easing curve.
- **Playwright** smoke tests for keyboard focus, route switching, contact form (idle → invalid → mailto draft) and reduced motion fallback.

## Scripts

```bash
npm run dev       # vite dev server
npm run build     # tsc -b && vite build (static)
npm run preview   # preview built bundle
npm run lint      # eslint
npm run test      # vitest run (unit)
npm run test:e2e  # playwright test (requires `npx playwright install chromium`)
```

## Deploy

The output is a static `dist/` folder. Run `npm run build`, then deploy the folder (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.). All routes fall back to `index.html` — the in-app router rewrites `/system` and `/team/<id>` from client state.

## Limitations (honest)

- Lenis is disabled on touch devices and reduced motion; mobile scroll is native. We do not pretend RAF scroll is "WebGL smooth".
- The contact form opens the user's mail client (`mailto:`). We do not invent a backend or claim a successful server round-trip.
- We label rules-based scoring as heuristic. Nothing here is presented as a trained ML model.
- We did not invent LinkedIn history, testimonials, client logos, awards or metrics. Anything we can't evidence is omitted.

## File layout

```
src/
  components/        section-level components
  data/team.ts       typed content — one place to edit copy
  lib/               scroll.ts, motion.ts, useFocusTrap.ts, useTheme.ts, useActiveSection.ts
  index.css          design tokens + a couple of base rules
  App.tsx            router + composition
```
