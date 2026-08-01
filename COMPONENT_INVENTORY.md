# Component inventory

- `SiteHeader`: brand, navigation, language selector, auth CTAs
- `IpHero`: public IP, address-family chips, location, score, risk
- `InfoCard` / `InfoSection`: four repeated two-column information groups
- `DiagnosticsGrid` / `DiagnosticCard`: nine signal categories with expandable trouble content
- `CdiValidator` / `CdiCheck`: summary, filters, invariant rows
- `NetworkReports`: TCP/IP and WebRTC blocks
- `FingerprintModules` / `FingerprintModule`: accordion rows, hashes, JSON result
- `JsonExport`: copy and download controls
- `FinalCta`: proxy call-to-action

All components consume locally collected browser data. Public IP/geolocation is best-effort and displays a graceful unavailable state.

