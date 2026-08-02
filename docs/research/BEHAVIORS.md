# Behaviors — light redesign

Source behavior was inspected with Playwright MCP at 1440px, 768px, and 390px. The user-provided screenshot is the visual authority.

- Header stays in document flow and does not transform on scroll.
- Product, Use Cases, and Company expose small click/hover dropdowns on desktop. The mobile header uses one menu toggle.
- `Copy IP` writes the live address and temporarily changes to `Copied`.
- IP, browser, OS, device, WebRTC, security and location values are collected after hydration; loading placeholders preserve layout.
- The risk rail and metric values animate only their width/count on first load.
- Overview category buttons update the active label. The visible summary remains a compact cross-category table, matching the screenshot.
- Primary buttons brighten and lift 1px on hover; outline buttons tint blue. Cards get a subtle blue border/shadow on hover.
- Footer newsletter submit prevents navigation and changes the button label to `Subscribed` locally.
- Reduced-motion preference disables transitions and the initial metric animation.

## Responsive behavior

- Desktop ≥ 1100px: exact two-column hero, four-column feature row, overview rail + table, and separated footer.
- Tablet 768–1099px: hero stacks, feature cards form a 2×2 grid, overview rail becomes horizontal, footer becomes two rows.
- Mobile < 768px: navigation collapses; all cards stack; dense overview rows expose Attribute, Value, and Result while Category is secondary text; CTA and newsletter controls become full width.

