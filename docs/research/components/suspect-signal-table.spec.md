# SuspectSignalTable Specification

## Overview
- **Target file:** `src/components/fingerprint-demo/suspect-signal-table.tsx`
- **Source screenshot:** `docs/design-references/fingerprint.com/calculation-source.png`
- **Interaction model:** static data table revealed after the page scrolls to the existing Overview tab
- **Theme override:** retain the local navy/cyan UI; preserve Fingerprint's structure, row density and safe/error semantics

## Source Measurements
- Source section width: `518px`; content width: `494px`; height: `695px`.
- Header title: `16px/20px`, weight `500`.
- Each source row: three-column grid `213px 213px 48px`, gap `10px`.
- Rows are `49px` tall (`53px` for the first), padding `8px 0`, with a bottom divider.
- Weight cell is fixed at `48px`.

## DOM Structure
- Root section: `.suspect-signal-table`.
- Header: title `How is this calculated?` and an external `See Documentation` link.
- Column header and every result row use the same three-column grid.
- Columns: `Signal`, `Response`, `Weight`.

## Signals and Dynamic Mapping
- Bot detection: automation, WebDriver or bot/headless signal; detected weight `7`.
- Incognito detection: headless or WebDriver signal; detected weight `4`.
- VPN detection: network VPN flag; detected weight `8`.
- Tampering detection: consistency below `80`; detected weight `8`.
- Virtual machine detection: GPU/CPU contains VM, VMware, VirtualBox, VBox, Parallels or virtual; detected weight `14`.
- Developer tools detection: local collector has no direct signal; `Not Detected`, weight `0`.
- Privacy-focused settings: cookies/storage blocked or Do Not Track enabled; detected weight `2`.
- IP blocklist: reputation contains bad, blocked, malicious, suspicious or high risk; detected weight `12`.
- Tor exit node: network Tor flag; detected weight `20`.
- Data center proxy: network hosting flag; detected weight `8`.
- Residential proxy: proxy true while hosting is false; detected weight `6`.
- High-Activity Device: risk score at least `60`; detected weight `6`.

## Local Computed Styles
- Root border-top: `1px solid #163654`; background `rgb(5 19 35 / 45%)`.
- Header: flex, justify-between, padding `14px 16px`.
- Title: `15px`, weight `650`, color `#eef5ff`.
- Documentation link: `11px`, border `#244767`, background `#07182b`, cyan hover.
- Column header: uppercase mono `9px`, color `#66839e`.
- Row: grid `minmax(0, 1fr) minmax(120px, 1fr) 52px`; min-height `46px`; gap `10px`; divider `rgb(25 55 83 / 65%)`.
- Signal: `11px`, color `#c4d2e2`.
- Response: `11px`, safe `var(--green)`, detected `#ff8195`.
- Weight: centered, mono `11px`, rounded `4px`, tinted safe/error background and dashed border.

## States & Behaviors
- Empty snapshot is handled by the parent and is not rendered.
- Safe result: `Not Detected`, green response, weight `0`.
- Error result: `Detected`, red response, positive weight.
- No external request is made by the table.

## Responsive Behavior
- Desktop/tablet: preserve three columns.
- Mobile (`<=540px`): columns become `minmax(0, 1.2fr) minmax(92px, .85fr) 42px`; padding reduces to `10px`; text is `10px`; long signal names can wrap.

## Assets
- No image assets.
- No icon required.

## Text Content
- `How is this calculated?`, `See Documentation`, `Signal`, `Response`, `Weight`.
- Signal names listed above, matching Fingerprint's current drawer.
