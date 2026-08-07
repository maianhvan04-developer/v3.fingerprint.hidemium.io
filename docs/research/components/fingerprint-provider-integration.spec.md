# Fingerprint Provider Integration Specification

## Goal

- Replace synthetic visitor identity and heuristic Smart Signal values with official Fingerprint data when credentials are configured.
- Keep the existing browser collector available as an honest fallback so the page still works without a paid account or during a provider outage.
- Never reuse the private demo proxy, environment ID, or request headers observed on `fingerprint.com`.

## Observed Data Flow

- The Fingerprint browser agent creates an identification event and returns a stable `visitorId`, per-request `requestId`, and confidence metadata.
- Full Smart Signals are resolved server-side from that `requestId` through the Fingerprint Server API.
- The live Fingerprint demo uses the same two-stage shape: browser identification first, then a server-side event lookup for suspect score, VPN, proxy, bot, incognito, tampering, virtual machine, developer tools, IP intelligence, browser, and geolocation data.

## Local Architecture

1. `collectOfficialFingerprint()` tries Fingerprint Pro when `NEXT_PUBLIC_FINGERPRINT_API_KEY` exists.
2. The Pro result supplies visitor identity and extended browser/IP fields.
3. `/api/fingerprint/event?requestId=...` performs the secret-key event lookup and returns only the normalized fields used by this UI.
4. If Pro is not configured or fails, the open-source FingerprintJS agent supplies a real locally computed visitor ID and confidence score.
5. If both agents fail, the existing local composite hash remains the final fallback.

## Configuration

- `NEXT_PUBLIC_FINGERPRINT_API_KEY`: public browser-agent key.
- `NEXT_PUBLIC_FINGERPRINT_REGION`: `us`, `eu`, or `ap` (defaults to `us`).
- `FINGERPRINT_SECRET_API_KEY`: secret Server API key; server-only and never serialized to the browser.

## Data Mapping

- Identity: provider, visitor ID, request ID, confidence, returning-visitor state.
- Browser/system: browser name/version, OS/version, device.
- Network: IP, city/country, coordinates, timezone, ASN/ISP, VPN, proxy, Tor, hosting.
- Smart Signals: bot, incognito, tampering, virtual machine, developer tools, privacy-focused settings, IP blocklist, high-activity device, rare device.
- Risk: Fingerprint suspect score overrides the local heuristic when returned by the Server API.

## Failure and Privacy Rules

- All provider calls are time-bounded and may not fail the complete scan.
- The event endpoint validates `requestId`, uses `no-store`, and returns a normalized allowlist instead of the raw event payload.
- A missing secret returns `configured: false`; it is not presented as a negative Smart Signal.
- Unknown signals remain `null` and the UI falls back to local evidence instead of inventing provider results.

## Verification

- Without keys: the open-source SDK supplies the visitor ID and the page completes normally.
- With public key only: Pro extended identity fields are visible; Smart Signals remain on documented fallback behavior.
- With public and secret keys: the displayed visitor ID, suspect score, browser/IP metadata, and signal table use the current Fingerprint event.
- Run ESLint, strict TypeScript, and production build.
