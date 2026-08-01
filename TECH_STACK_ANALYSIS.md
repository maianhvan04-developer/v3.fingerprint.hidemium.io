# Technical stack analysis

The inspected page is a client-heavy single-screen fingerprint dashboard. It uses plain DOM sections, CSS Grid/Flexbox, browser APIs, JSON views, and server-fed IP/network data. No external image pipeline or component framework is visible in the rendered output.

The clone keeps the existing Next.js 16 App Router and React 19 setup. Browser fingerprint collection runs in a client component. Public IP lookup is best-effort; server-only TCP/TLS fields are labelled unavailable rather than fabricated. The visual implementation is local CSS with no extra runtime dependency.

