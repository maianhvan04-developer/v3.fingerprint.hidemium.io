# RedesignFingerprintOverview specification

## Overview
- **Target:** `src/components/landing/fingerprint-overview.tsx`
- **Reference:** user-supplied screenshot
- **Interaction model:** click-to-select category, live data updates

## Structure and image-derived styles
- Outer max-width 1536px, white, 12px radius, 1px `#d5e1f0`, subtle shadow.
- Desktop height about 264px; grid columns 200px and 1fr.
- Rail active item has pale blue background and primary blue label; item height 27px.
- Workspace header is 36px; title 15px/700 and description 11px.
- Metric row: analysis ID chip plus four equal 40px cards for uniqueness, stability, fraud risk and status.
- Table header is 22px and table rows are 16–19px, with faint horizontal grid lines.
- Columns: Attribute 19%, Category 12%, Value 45%, Similarity/Result 24%.

## Data
- Rows combine live IP, IP location, ISP, WebRTC IPs, TCP/IP/OS heuristic, browser, OS, device type, screen, audio, canvas, platform, GPU, timezone and fonts.
- Fingerprint ID is the first 14 characters of the live canvas SHA-256 hash.
- Result status is derived from collector readiness and signal availability.

## Responsive
- Below 980px rail becomes a horizontal scroller above the workspace.
- Below 700px metric cards form two columns; table rows become stacked records with Category rendered as muted metadata.
