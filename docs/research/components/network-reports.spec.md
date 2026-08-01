# NetworkReports specification

## Overview
- **Target file:** `src/components/fingerprint/network-reports.tsx`
- **Interaction model:** live data and click-to-restart WebRTC

## Structure and styles
- Contains separate TCP/IP and WebRTC sections with mono values and compact state tags.
- Desktop technical grids use two columns and switch to one below 900px.
- Candidate details use a green-tinted bordered disclosure.

## States
- WebRTC cycles through checking, complete, and unavailable.
- Restart runs a new ICE session; server-inaccessible SYN/TLS fields remain explicitly unavailable.
