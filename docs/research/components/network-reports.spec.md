# NetworkReports specification

## Overview
- **Target files:** `src/components/fingerprint/network-reports.tsx`, `src/components/fingerprint/network-reports.module.css`, `src/components/fingerprint-dashboard.tsx`
- **Interaction model:** live data and click-to-restart WebRTC
- **Customization:** keep the current light-blue UI; use the source section's content and behavior, not its purple styling

## Structure and styles
- Contains separate TCP/IP and WebRTC sections with mono values and compact state tags.
- Desktop technical grids use two columns and switch to one below 900px.
- Candidate details use a green-tinted bordered disclosure.

## States
- WebRTC cycles through checking, complete, and unavailable.
- Restart runs a new ICE session; server-inaccessible SYN/TLS fields remain explicitly unavailable.
