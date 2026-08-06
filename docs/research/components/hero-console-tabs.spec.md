# HeroConsoleTabs Specification

## Overview
- **Target files:** `src/app/page.tsx`, `src/components/fingerprint-demo/signal-panels.tsx`, `src/app/globals.css`
- **Reference:** user-provided three-segment console title bar
- **Interaction model:** click-to-switch tabs; no route change
- **Theme:** retain the existing navy/cyan/purple console UI

## DOM Structure
- `tablist` contains three real `button[role="tab"]` controls.
- Each tab includes its existing two-digit index and sentence-case label.
- The workspace header changes its label to match the selected view.
- The workspace body renders exactly one `tabpanel`:
  - Identification signals
  - Browser smart signals
  - Live identity (existing `FingerprintLiveDemo`)

## Tab Styles
- Use the existing three equal columns in `.hero-console__modes`.
- Tab height fills the `42px` title bar.
- Inactive text: `#58748f`; active text: `#d8e8f8`.
- Active underline: cyan-to-purple gradient, `1px` high, with cyan glow.
- Hover/focus: text becomes `#b8d8ef`, background `rgb(0 217 255 / 4%)`.
- Transition: color/background `160ms ease`.
- Preserve sentence-case labels; `text-transform: none`.

## Identification Signals State
- **Purpose:** summarize how the current visitor is recognized.
- Desktop layout: two columns, left `1.15fr`, right `0.85fr`, gap `8px`, height `302px`.
- Left card title: `Identity overview`.
- Rows: IP address, Location, ISP, Timezone, VPN, WebRTC.
- Right card title: `Recognition profile`.
- Rows: Visitor hash, Uniqueness, Consistency, Risk score, Browser, Operating system.
- Values are read from `FingerprintSnapshot`; loading fallbacks are concise.
- Safe values use `var(--green)`; risky values use `#ff8195`; identity/hash values use `var(--cyan)`.

## Browser Smart Signals State
- **Purpose:** expose browser/device/privacy integrity data from the current scan.
- Desktop layout: three equal cards, gap `8px`, height `302px`.
- Card 1, `Browser`: Browser/version, Engine, Language, Cookies, Do Not Track, User Agent.
- Card 2, `Privacy`: Headless, WebDriver, Ad blocker, Automation, WebRTC, Geolocation.
- Card 3, `Device`: Operating system, Architecture, CPU, Memory, GPU, Screen.
- Long values truncate with ellipsis and retain the full value in `title`.
- Detection values use safe/risky tones from the scan instead of static colors.

## Shared Panel Styles
- Panel background: `#061425`.
- Card background: `linear-gradient(145deg, #07192b, #061321)`.
- Card border: `1px solid #153655`; radius `7px`.
- Panel padding: `10px`; card padding: `11px`.
- Title: `12px`, weight `650`, color `#d9e6f6`.
- Row label: `9.5px`, color `#6f91b2`.
- Row value: `10px`, color `#aebfd2`, right-aligned.
- Empty/loading state remains visually stable; no layout shift.

## States & Behaviors
- Default active tab is `Live identity`.
- Clicking a tab updates `aria-selected`, `tabIndex`, active underline and panel content.
- Keyboard behavior is native button focus; Left/Right arrows are optional and not required.
- Content transition: `console-panel-in`, opacity `0 → 1` and translateY `3px → 0`, `180ms ease`.
- Scanning state lowers panel opacity to `0.72`, matching the existing live view.

## Responsive Behavior
- **Desktop (>=900px):** two-column identification layout; three-column browser layout.
- **Tablet (541–899px):** same column count; tighter padding and text truncation.
- **Mobile (<=540px):** cards stack to one column; panel is vertically scrollable within `377px`; tab labels use the existing compact pseudo labels.

## Assets
- No external assets or network requests.
- Icons come from `lucide-react`.

## Accessibility
- Tabs expose `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` and stable panel IDs.
- Panel uses `role="tabpanel"` and `aria-labelledby`.
