# DiagnosticsGrid specification

## Overview
- **Target file:** `src/components/fingerprint/diagnostics-grid.tsx`
- **Interaction model:** click-to-expand issue cards

## Structure and styles
- Section margin top is 60px with centered heading and subtitle.
- Grid is 3/2/1 columns at desktop/tablet/mobile with 16px gaps.
- Cards use 18px padding, 14px radius, and content-sized expansion.

## States
- Clean cards are green, warnings amber, errors red.
- Issue button toggles inline trouble content and `aria-expanded`.
- Verified label occupies the same bottom slot as issue buttons.
