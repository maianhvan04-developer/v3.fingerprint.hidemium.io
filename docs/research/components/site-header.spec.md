# SiteHeader specification

## Overview
- **Target file:** `src/components/layout/site-header.tsx`
- **Screenshot:** `docs/design-references/fingerprint-target-desktop.png`
- **Interaction model:** click-driven language menu; static navigation

## Structure and styles
- Header height is 72px desktop with `padding: 16px 36px`.
- Brand uses a 28px rounded purple-gradient logo, 10px gap, and 18px display text.
- Navigation uses 28px gap, 16.5px text, and hides at 900px.
- Header actions contain language, login, and purple signup controls.

## States
- Navigation links brighten to white in 150ms on hover.
- Signup brightens to `filter: brightness(1.1)`.
- Language menu exposes English, Tiếng Việt, 中文, and Русский from `locales/*.json`; selection persists to `fpc.lang`.

## Responsive
- Desktop: one horizontal row.
- Tablet: navigation hidden.
- Mobile: header wraps with `padding: 14px 18px`, producing a 106px header.
