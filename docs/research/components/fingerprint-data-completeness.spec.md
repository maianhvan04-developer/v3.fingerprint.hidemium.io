# Fingerprint Data Completeness Specification

## Overview
- **Target files:** `src/types/fingerprint.ts`, `src/lib/fingerprint/browser.ts`, `src/lib/fingerprint/modules.ts`, `src/hooks/use-browser-profile.ts`, `src/hooks/use-fingerprint-dashboard.ts`, `src/components/landing/fingerprint-overview.tsx`, `src/components/landing/hero-analysis.tsx`, `src/components/fingerprint-dashboard.tsx`, `src/app/api/headers/route.ts`.
- **Reference:** Live inspection of `https://fingerprint.hidemium.io/` on 2026-08-03 (Asia/Saigon) plus its user-triggered Full Fingerprint JSON download.
- **Interaction model:** Time-driven browser/network collection with click-driven category tabs. Existing tabs must remain interactive and each tab must render its own rows.
- **User request:** Review and fill the missing live data; do not replace unavailable signals with invented values.

## Reference Sources Discovered
- `https://ipgeo.iphey.com/`: public IP plus ASN, organization, country, region, city, postal code, coordinates, timezone, and languages.
- `https://p0f-checker.proxyshard.com/p0f`: IPv4 plus server-side SYN/TCP fingerprint. Its CORS policy allows only the original Hidemium origin, so the clone must not claim this result when it cannot collect it honestly.
- `https://ip234.in/fraud_check?ip=<IPv4>`: live IP risk score and text verdict; CORS permits the clone to request it directly.
- Target-side browser APIs: Navigator, UA-CH, Screen, CSS media queries, Canvas, WebGL, Fonts, Audio, Media, Speech Synthesis, StorageManager, Battery, NetworkInformation, Intl, Permissions, automation indicators, window and HTMLElement surfaces.
- Local request reflection: a no-store Route Handler may expose an allowlisted set of the current request headers. Cookies and authorization headers must never be returned.

## Gap Audit

### Network and risk
- Current primary IP can be IPv6, while IPv4 is absent and the hero labels a single address ambiguously.
- Current risk score falls back to a local constant/heuristic instead of the live score used by the reference.
- Current network table omits postal code, coordinates, browser timezone, NetworkInformation fields, candidate counts, and separate WebRTC IPv4/IPv6 rows.
- TCP/SYN fields must display `Unavailable — requires origin-authorized server inspection` unless a real result exists.

### HTTP headers
- Current rows are browser-side equivalents rather than the actual request headers.
- Add actual `Accept`, `Accept-Encoding`, `Accept-Language`, `User-Agent`, `Sec-CH-UA`, `Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`, `Upgrade-Insecure-Requests`, `Sec-Fetch-*`, `Connection`, and `Host` values from `/api/headers`.

### Browser and runtime
- Add App Version, vendor, PDF viewer, online state, plugin names/count, MIME types, Navigator property count, UA-CH brands/full versions, platform version, architecture/bitness, permissions summary, WebGPU status, and headless/automation signals.

### Screen and CSS media
- Add available screen, viewport, outer window, pixel depth, orientation, color scheme, reduced motion, forced colors, hover/pointer, color gamut, and display mode.

### Hardware and graphics
- Add WebGL/WebGL2 versions, shading language, antialias, extensions count, max texture size, max renderbuffer size, max viewport dimensions, WebGPU, battery status, and CPU/device signals.

### Canvas, fonts, media, and storage
- Canvas: add data URL length, repeated-render stability, 2D availability, and client-rect signature.
- Fonts: use pixel-measurement detection against a broader cross-platform candidate set; show count and detected names.
- Media: add supported audio/video formats, MIME types, speech voice languages/default, audio sample rate, OfflineAudioContext signature, and media device availability.
- Storage: add sessionStorage, CacheStorage, Service Worker, StorageManager estimate, quota, usage, usage percentage, and persisted status.

## Data Model and Collection Rules
- Keep browser-only collection inside the existing Client Component boundary.
- Advanced module results remain serializable `Record<string, unknown>` objects and are hashed with SHA-256.
- A module may complete later than the base profile; `browserReady` means base profile ready while module rows may continue to show `Collecting…`.
- Every browser API call must be isolated with a safe fallback so one blocked API cannot fail the complete fingerprint.
- Never request user permission merely to populate the table; query permission state only.
- Never store the collected fingerprint automatically. Copy/download remains user-triggered.
- IPv4, IPv6, and risk requests must have timeouts and graceful fallback labels.

## Table Targets
- Overview: at least 16 high-value rows, including separate IPv4 and IPv6 plus the live risk score.
- HTTP Headers: at least 12 actual/equivalent rows.
- Browser: at least 18 rows.
- Screen: at least 14 rows.
- Hardware: at least 14 rows.
- Canvas: at least 9 rows.
- WebGL: at least 14 rows.
- Fonts: summary rows plus one row per detected font.
- Media: at least 12 rows.
- Storage: at least 10 rows.
- Network: at least 20 rows when live network intelligence is available.

## Responsive and Table Behavior
- Preserve the existing category rail, metric cards, row columns, status colors, and row key stability.
- Desktop `1440px`: table remains four columns and grows vertically for the richer data.
- Tablet `768px`: category rail stays horizontally scrollable and values wrap without overlapping result cells.
- Mobile `390px`: existing card-row layout remains; long headers, hashes, IPs, extensions, and font names wrap with no page overflow.
- Clicking every category must change the title and row set; no tab may keep rendering Overview rows.

## Verification
- Validate the new `/api/headers` output contains only allowlisted headers and `cache-control: no-store`.
- Confirm primary IP, IPv4, IPv6, and risk values are live or explicitly unavailable.
- Confirm all 11 tabs render distinct data sets and meet their minimum row counts where APIs are available.
- Confirm Full Fingerprint JSON contains the enriched module objects.
- Run lint, strict typecheck, and production build.
- QA at `1440×900`, `768×900`, and `390×844`, including click-through of every tab and zero horizontal overflow.
