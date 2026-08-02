# RedesignPageAssembly specification

## Overview
- **Targets:** `src/components/fingerprint-dashboard.tsx`, `src/app/page.tsx`
- **Reference:** user-supplied 1680×940 screenshot
- **Interaction model:** client data hydration with section-local interactions

## DOM order
1. `SiteHeader`
2. `main`
   - `HeroAnalysis`
   - `TrustFeatures`
   - `FingerprintOverview`
3. `SiteFooter`

## Data wiring
- Call `useFingerprintDashboard()` exactly once in the client assembly.
- Pass explicit IP, browser, WebRTC, score, loading, diagnostics, and copy props to the two data-driven sections.
- Keep static marketing sections server-compatible even though they sit under the client assembly boundary.

## Page styles
- White base with no global max-width around the hero background.
- Trust, overview and footer sections keep their own frame widths from their specs.
- Desktop target is a compact one-screen-like composition at 1680×940; content may naturally exceed the viewport at smaller heights.
- No horizontal overflow at 390px, 768px, 1440px or 1680px.

## States
- Initial server render uses stable detecting placeholders.
- Hydration updates fingerprint values without moving section boundaries substantially.
- Reduced-motion preference is inherited from global CSS.
