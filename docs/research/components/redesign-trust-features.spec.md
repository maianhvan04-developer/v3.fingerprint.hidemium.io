# RedesignTrustFeatures Specification

## Overview
- **Target files:** `src/components/landing/trust-features.tsx`, `src/components/landing/header-hero.module.css`
- **Screenshots:** `docs/design-references/trust-marquee-before.png`, `docs/design-references/trust-marquee-before-mobile.png`
- **Interaction model:** time-driven infinite marquee; hover/focus pauses the ticker; feature cards retain hover feedback.

## DOM Structure
- `section.trustSection`
  - centered trust label
  - clipped `partnerScroller`
    - animated `partnerTrack`
      - first complete seven-logo group
      - second identical seven-logo group marked `aria-hidden=true` for a seamless loop
  - four-card `featureGrid`

## Computed Styles Before Change

### Desktop at 1440px
- section: `1424.8px × 111px`
- content width: `1376.8px`, equal `24px` side margins
- partner scroller: `1376.8px × 22px`, `overflow: hidden`
- partner marks: `display: grid`, seven equal columns, no animation
- feature grid: `1376.8px × 47px`, four columns, `24px` gap
- vertical gap between the partner scroller and cards: `0px`
- card: `326.2px × 47px`, `padding: 6px 14px`, internal gap `11px`

### Mobile at 390px viewport
- measured layout viewport: `375px`
- page scroll width: `375px` (no horizontal page overflow)
- content/scroller/grid width: `343.2px`
- vertical gap between the partner scroller and cards: `0px`

## Desired States & Behaviors

### Continuous partner marquee
- **Trigger:** starts automatically after page render.
- **Direction:** right-to-left.
- **Duration:** approximately `28s` per complete seven-logo group.
- **Timing:** `linear`, infinite.
- **Loop:** duplicate the complete partner group and animate the track from `translate3d(0,0,0)` to `translate3d(-50%,0,0)` with no visible jump.
- **Performance:** animate only `transform`; apply `will-change: transform`.
- **Edges:** clipped scroller with a short transparent-to-black mask at both sides.
- **Hover/focus:** `animation-play-state: paused` so a wordmark can be read.
- **Accessibility:** the duplicate group is hidden from screen readers.
- **Reduced motion:** disable animation and show a horizontally scrollable/static row when `prefers-reduced-motion: reduce` is active.

### Spacing
- Add a clear visual break between the moving logo ticker and the cards: at least `12px` on desktop and `10px` on mobile.
- Preserve equal left/right section margins.
- Desktop feature-card gap may grow from `24px` to `28px`; tablet may remain `12px`.

### Feature-card hover
- Preserve current border, shadow, and `translateY(-1px)` behavior.

## Content
- Partner sequence: Cloudflare, Akamai, DATADOME, imperva, SEON, riskified, appfuel.
- Feature cards: Highly Accurate; Real-Time Analysis; Privacy Compliant; Developer Friendly.
- No remote assets; continue using existing text wordmarks and Lucide icons.

## Responsive Behavior
- **Desktop (1440px):** animated group spans the full content lane; four feature cards.
- **Tablet:** marquee continues; two feature-card columns below `1100px`.
- **Mobile (390px):** marquee continues inside the clipped `343.2px` lane; cards stack to one column; no page-level horizontal overflow.

## Acceptance Checks
- Partner track position changes over a 600–1000ms sample.
- Hovering the scroller freezes the transform.
- Two complete groups exist, but only the first is exposed to accessibility APIs.
- Measured scroller-to-grid gap is at least `10px`.
- Mobile `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
