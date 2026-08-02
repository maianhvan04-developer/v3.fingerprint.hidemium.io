# RedesignHero specification

## Overview
- **Target:** `src/components/landing/hero-analysis.tsx`
- **Reference:** user-supplied 1680×940 screenshot
- **Interaction model:** live/time-driven data plus click-to-copy

## Structure and image-derived styles
- Section background white to `#eef5ff` with two pale-blue wave polygons; desktop height about 292px.
- Inner max-width 1480px; left/right ratio about 48/52, 36px gap.
- Eyebrow is a 236×20px pale-blue pill, 11px/700 blue.
- Headline is 39px/750, 1.05 line-height; `Confidence.` uses `#2468ee`.
- Body is 15px/1.45 muted navy; CTAs are 232×34px primary and 236×34px outline.
- Live card: white translucent surface, 14px radius, border `#d7e2f2`, soft shadow, padding 20px.
- IP value 24px/750; risk score 22px/750; risk rail 8px high with green/yellow/red gradient.
- Summary grid uses two columns separated by a 1px divider; labels 11px, values 12px/650.

## Data
- IP, country flag, city/region/country, ISP/org and security flags from `/api/ip`.
- Browser, OS, device, platform, WebRTC and score values from the live browser collectors.

## States and responsive
- `Copy IP` → `Copied` for 1.6s.
- Detecting/unavailable states never collapse rows.
- Below 1100px hero stacks; below 640px headline is 38px and summary grid becomes one column.
