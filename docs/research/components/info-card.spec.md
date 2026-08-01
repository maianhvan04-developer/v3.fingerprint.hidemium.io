# InfoCard specification

## Overview
- **Target file:** `src/components/fingerprint/info-card.tsx`
- **Interaction model:** live data; warning surface has hover animation

## Structure and styles
- Gradient surface, `#1d1336` border, 18px radius, and `28px 30px` padding.
- Repeated rows use `280px 1fr`; values use two equal columns with `14px 36px` gaps.
- UA spans both value columns and uses mono text.

## States
- Headless/mismatch state adds a red inset ring and 2.8s pulse without shifting layout.

## Responsive
- Both grids become one column below 900px.
- Measured heights: 908px desktop and 2005px mobile.
