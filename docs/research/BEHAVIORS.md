# Observed behaviors

Source inspected with Playwright MCP on 2026-08-01 at 1440×1100, 768×1024, and 390×844.

- Header is static and transparent. It never sticks or changes while scrolling.
- Navigation links and purple action buttons brighten on hover. The primary action does not move.
- Language control cycles EN → VI → RU and persists the selection in `localStorage` under `fpc.lang`.
- `Copy IP` writes the detected address and briefly changes its label.
- Diagnostic issue cards reveal an inline trouble panel. The card grows naturally; sibling cards keep their own height.
- CDI filters show all, failed/warned, fatal, or skipped invariants without a page reload.
- Fingerprint modules are accordions. The row chevron rotates 90 degrees and a summary/JSON body is inserted beneath it.
- Issue surfaces breathe with red or amber glow; clean surfaces use green. Hover increases brightness and glow.
- Reduced-motion preference disables loops and collapses transitions to near-instant.
- No lazy image or video regions were observed. The design uses gradients, type, borders, emoji, and live text.

## Responsive behavior

- At 900px and below: center navigation is hidden, info sections become one column, diagnostics become two columns, and WebRTC becomes one column.
- At 600px and below: header wraps, diagnostics become one column, hero title drops from 35px to 27px, and CTA stacks vertically.
- At 640px and below: CDI rows become a two-column mobile layout with ID, content, and tags stacked in column two.
- The page intentionally becomes very tall on mobile; content is not horizontally clipped.

