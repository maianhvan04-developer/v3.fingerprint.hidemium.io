# Feature Cards Footer Placement Specification

## Overview
- **Target files:** `src/components/fingerprint-dashboard.tsx`, `src/components/landing/trust-features.tsx`, `src/components/landing/header-hero.module.css`
- **Interaction model:** Static page-order change; preserve the existing card hover states and partner marquee animation.
- **User request:** Move the four product feature cards to immediately above the footer.

## Current Desktop Measurements
- Feature grid: `1376.8px × 98px`, left offset `24px`, four `323.2px` columns, `28px` gap.
- Fingerprint overview: left offset `24px`, width `1376.8px`.
- Footer: full-width section with its inner content aligned to the same `24px` desktop gutter.
- Current page order: hero → trusted partner marquee and feature cards → fingerprint overview → footer.

## Target DOM Order
1. `HeroAnalysis`
2. `TrustFeatures` containing only the trusted heading and animated partner marquee
3. `FingerprintOverview`
4. `ProductFeatures` containing the existing four cards
5. `SiteFooter`

## Layout
- Keep the four cards, icons, copy, hover treatment, desktop columns, and responsive column breakpoints unchanged.
- Wrap the relocated grid in its own semantic section.
- Desktop/tablet width: `min(1536px, calc(100% - 48px))`, centered, matching the overview and footer inner gutters.
- Place the grid `28px` below the overview; preserve the footer's existing `22px` top separation and border divider.
- Remove the now-unused bottom margin from the partner scroller so the marquee section has no empty card gap.

## Responsive Behavior
- Desktop `1440px`: four columns with equal `24px` viewport gutters.
- Tablet below `1100px`: preserve the existing two-column grid.
- Mobile below `640px`: preserve the existing one-column grid and card minimum height; use equal side gutters with no horizontal overflow.

## States and Accessibility
- Partner marquee animation, hover pause, and reduced-motion handling remain unchanged.
- Card hover styles remain unchanged.
- The new card wrapper uses an accessible section label; card content remains verbatim.
