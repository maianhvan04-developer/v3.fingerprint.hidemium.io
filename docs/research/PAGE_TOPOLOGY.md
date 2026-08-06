# Page topology — light redesign

Primary UI reference: user-supplied 1680×940 screenshot. Live data/content source: `https://fingerprint.hidemium.io/`.

1. Static white site header (48px desktop)
   - Fingerprint shield brand
   - Product, Use Cases, Docs, Pricing, Company navigation
   - Log in and Sign up actions
2. Hero / live analysis band (about 292px desktop)
   - Left: analysis eyebrow, marketing headline, supporting copy, two CTAs, four benefit notes
   - Right: live IP, location, risk score, browser score, and two-column connection summary
   - Decorative pale-blue wave background is CSS-only
3. Trust band (about 92px desktop)
   - Security-team logo row
4. Fingerprint overview workspace (about 268px desktop)
   - Vertical category rail that filters the 30 CreepJS modules by runtime, browser, screen, hardware, canvas, WebGL, fonts, media, storage, and network
   - Compact Fingerprint ID at the end of the category rail
   - Dense module/category/JSON/SHA-256 table populated from live CreepJS module results
5. Network fingerprint reports
   - TCP/IP Fingerprint (p0f) report with explicit server-required SYN fields
   - Restartable browser-side WebRTC check, observed addresses, leak verdict, and ICE candidate disclosure
6. Four product-value cards
7. Standalone `Full Fingerprint JSON` section immediately above the footer
   - Aggregated 30-module payload with readiness metrics
   - Scrollable JSON viewer with Copy and Download actions
8. White footer, separated from page content by a full-width horizontal rule
   - Brand statement
   - Product, Resources, Company link groups
   - Newsletter field and social links
   - Bottom legal bar

The reference is a single compact desktop landing page. No sticky regions, modal flows, carousel, or video are visible. On mobile all two-column regions stack; the overview category rail becomes a horizontal scroller and the table becomes card-like rows.

## Fingerprint live demo replacement (2026-08-06)

The current request targets only the live identity console inside the existing hero. The rest of the product page remains unchanged.

1. `HeroConsole` terminal frame
   - Static titlebar with three modes
   - Analyze-again action
   - Live workspace label
2. `FingerprintLiveDemo`
   - `VisitSummary`
     - Visitor ID header
     - Weekly 4-metric summary
     - Recent-visit navigator
     - Location/map and two-row signal grid
   - `SuspectScore`
     - Live/fake-data eyebrow
     - Semicircle gauge
     - Risk assessment copy
     - Current/trusted-device tabs
3. Terminal statusbar
   - Local-history disclosure
   - Current browser/system summary

Responsive ownership:

- Desktop: demo wrapper owns the 61.5/38.5 two-column split.
- Tablet: `VisitSummary` owns the full row and receives the compact score badge.
- Mobile: `VisitSummary` owns the 2×2 metric grid and horizontal-style visit navigation.
