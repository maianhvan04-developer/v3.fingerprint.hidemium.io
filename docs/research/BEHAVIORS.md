# Behaviors — light redesign

Source behavior was inspected with Playwright MCP at 1440px, 768px, and 390px. The user-provided screenshot is the visual authority.

- Header stays in document flow and does not transform on scroll.
- Product, Use Cases, and Company expose small click/hover dropdowns on desktop. The mobile header uses one menu toggle.
- `Copy IP` writes the live address and temporarily changes to `Copied`.
- IP, browser, OS, device, WebRTC, security and location values are collected after hydration; loading placeholders preserve layout.
- The risk rail and metric values animate only their width/count on first load.
- Overview lists all collected CreepJS modules. Category buttons filter the same live module collection without changing the current light table UI; the former HTTP Headers category is Runtime because CreepJS exposes no HTTP Headers module.
- CreepJS JSON result cells show the complete serialized module result and wrap long values onto additional lines; no ellipsis or line clamp hides module data.
- TCP/IP Fingerprint shows the live public IP and browser OS. Network OS and SYN packet fields remain explicitly server-required because browser JavaScript cannot observe TTL, MSS, TCP flags, window scale, or IP ID.
- WebRTC Check runs browser-side ICE collection on load and when Restart check is clicked. The verdict compares any public candidate address with the current public IP lookup, while local and mDNS candidates are not treated as leaks.
- Primary buttons brighten and lift 1px on hover; outline buttons tint blue. Cards get a subtle blue border/shadow on hover.
- Footer newsletter submit prevents navigation and changes the button label to `Subscribed` locally.
- Reduced-motion preference disables transitions and the initial metric animation.

## Full Fingerprint JSON extension

- Source inspected with Playwright MCP on 2026-08-03 at 1440px and 390px.
- The source defines 30 ordered fingerprint modules and aggregates them under stable camelCase keys from `workerScope` through `automation`.
- Each module payload contains its live result plus a `$hash` SHA-256 field.
- The source exposes click-driven Copy JSON and Download actions. Its visible `<pre>` remained `aria-busy="true"` during inspection even though all 30 individual modules completed, so the clone must derive the aggregate from its collected module state instead of copying the source's broken loading state.
- In the current light UI, Full JSON is a standalone section immediately above the footer, separate from the overview category workspace.
- Copy writes the exact visible aggregate and changes its label to Copied briefly. Download saves the same payload as a dated `.json` file.

## Responsive behavior

- Desktop ≥ 1100px: exact two-column hero, four-column feature row, overview rail + table, and separated footer.
- Tablet 768–1099px: hero stacks, feature cards form a 2×2 grid, overview rail becomes horizontal, footer becomes two rows.
- Mobile < 768px: navigation collapses; all cards stack; dense overview rows expose Attribute, Value, and Result while Category is secondary text; CTA and newsletter controls become full width.
- Full JSON keeps the current page container width. Its action bar wraps on narrow screens and the code viewer keeps horizontal scrolling rather than wrapping JSON values.

