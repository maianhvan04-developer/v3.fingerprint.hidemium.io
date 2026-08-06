# VisitSummary Specification

## Overview
- **Target file:** `src/components/fingerprint-demo/visit-summary.tsx`
- **Screenshot:** `docs/design-references/fingerprint.com/demo-desktop.png`
- **Interaction model:** click-driven visit navigation; data-driven summary
- **Theme override:** preserve the product's navy/cyan/purple UI; copy Fingerprint's structure and spacing, not its brown/red palette.

## DOM Structure
- Visitor header: greeting, stable visitor ID, compact suspect-score slot below 900px.
- Four weekly summary cells.
- Recent-visits header.
- Visit carousel with previous/next controls.
- Active visit: time/location/map, then IP/incognito and browser/VPN rows.

## Computed Styles

### Desktop container
- width: `489.5px` of a `795.5px` demo row
- height: `302px`
- header: `49px`, padding `10px 12px`
- summary: `53px`, four grid columns; cells use `10px 12px`
- history: `202px`; title area `38px`; active slide `163px`
- detail rows: two equal columns, about `39px` each
- title labels: `9px/14.4px`, weight `500`, letter spacing `0.72px`
- values: `11px/17.6px`, weight `500`
- visit detail labels: `12px/17.4px`, weight `600`

### Product-theme mapping
- panel background: `#061425` / `#081b30`
- dividers: `#153655`
- body text: `#d8e7f7`
- muted text: `#7893ad`
- accent: `#00d9ff`
- flagged value background: translucent red; safe value background: translucent green

## States & Behaviors
- Previous/next buttons select a real visit from newest to oldest and disable at either end.
- “Now” is used for the newest visit; older visits use a compact local date/time.
- Incognito and VPN values switch between safe and flagged color treatments.
- Hover: navigation icon changes to cyan and gains a faint glow over `160ms ease`.

## Assets
- Source map DOM extracted from Fingerprint: Mapbox `navigation-night-v1` static image, natural request size `350×200`, rendered at `229×84px` with `object-fit: cover`; parent is `position: relative` and the location marker is centered above the image.
- Local implementation uses a map-only crop extracted from the target reference as a bundled local asset. It preserves the exact `navigation-night-v1` visual without exposing Fingerprint's Mapbox token or sending the visitor's coordinates to a third-party tile service at runtime.
- No map caption or coordinate badge is drawn over the source map.
- Navigation icons come from `lucide-react`.

## Text Content
- `Hello, visitor ID`
- `WEEKLY VISIT SUMMARY` / `You visited {n} time(s)`
- `INCOGNITO` / `{n} session(s)`
- `IP ADDRESS` / `{n} IP(s)`
- `GEOLOCATION` / `{n} location(s)`
- `YOUR RECENT VISITS`
- `Now`, `IP Address`, `Incognito mode`, `Browser`, `VPN`

## Responsive Behavior
- **Desktop (>=900px):** fixed 61.5/38.5 split with the score panel; summary is 4 columns.
- **Tablet (540–899px):** VisitSummary becomes full width; compact score badge appears in visitor header; summary stays 4 columns.
- **Mobile (<540px):** summary becomes 2 columns × 2 rows; visitor ID wraps under greeting; active visit uses a horizontal carousel; map is hidden like the source mobile state; detail grid remains 2 columns where space permits.
